"""
SKILLORBIT - AI Career Intelligence & Adaptive Interview Copilot
Flask REST API Server with Multi-User Authentication & Data Isolation
"""

import os
import re
import json
import uuid
from datetime import datetime
from functools import wraps

from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

from database import (
    init_db,
    get_db_connection,
    get_user_by_id,
    get_user_by_email_or_username,
    create_user,
    create_password_reset_token,
    verify_and_use_reset_token
)
from services.roles import ROLES_CATALOG, list_roles, get_role
from services.parser import parse_resume_document, extract_skills_from_text, segment_sections, extract_candidate_info
from services.evaluator import evaluate_interview_response
from services.roadmap_generator import generate_roadmap_for_role

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "skillorbit_production_auth_key_2026_secure")

# Security and Session Cookie Configuration
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False # True in production HTTPS
app.config['PERMANENT_SESSION_LIFETIME'] = 7 * 24 * 3600 # 7 days

CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5000",
    "http://127.0.0.1:5000"
])

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB limit

# Initialize DB on boot
init_db()

# ----------------- AUTHENTICATION DECORATOR -----------------

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = session.get('user_id')
        
        # Also allow Bearer token in Authorization header for API clients or fallback
        if not user_id:
            auth_header = request.headers.get('Authorization', '')
            if auth_header.startswith('Bearer '):
                token_val = auth_header.split(' ', 1)[1].strip()
                user = get_user_by_id(token_val)
                if user:
                    user_id = user['id']

        if not user_id:
            return jsonify({
                "error": "Authentication required. Please log in to access this resource.",
                "code": "UNAUTHORIZED"
            }), 401

        # Verify user still exists in database
        user = get_user_by_id(user_id)
        if not user:
            session.pop('user_id', None)
            return jsonify({"error": "User account no longer exists.", "code": "UNAUTHORIZED"}), 401

        return f(user_id, *args, **kwargs)
    return decorated

# ----------------- SYSTEM HEALTH -----------------

@app.route('/api/health', methods=['GET'])
def health():
    gemini_configured = bool(os.environ.get("GEMINI_API_KEY"))
    openai_configured = bool(os.environ.get("OPENAI_API_KEY"))
    
    active_engine = "Deterministic Semantic Rubric Engine"
    if gemini_configured:
        active_engine = "Gemini 1.5 Flash (Active API Key)"
    elif openai_configured:
        active_engine = "OpenAI GPT-4o-mini (Active API Key)"

    return jsonify({
        "status": "healthy",
        "service": "SkillOrbit Backend API",
        "version": "2.0.0 (Multi-User)",
        "active_evaluation_engine": active_engine,
        "external_ai_configured": gemini_configured or openai_configured
    })

# ----------------- AUTHENTICATION ENDPOINTS -----------------

@app.route('/api/auth/register', methods=['POST'])
def auth_register():
    data = request.json or {}
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    username = data.get('username', '').strip().lower()
    password = data.get('password', '')
    confirm_password = data.get('confirm_password', '')

    # 1. Validation
    if not full_name or not email or not username or not password:
        return jsonify({"error": "All fields are required."}), 400

    # Email format validation
    if not re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email):
        return jsonify({"error": "Invalid email address format."}), 400

    # Username format validation
    if not re.match(r'^[a-zA-Z0-9_]{3,24}$', username):
        return jsonify({"error": "Username must be 3-24 characters containing only letters, numbers, and underscores."}), 400

    # Password complexity validation
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters long."}), 400

    if not any(char.isdigit() or not char.isalnum() for char in password):
        return jsonify({"error": "Password must contain at least one number or special symbol."}), 400

    # Password confirmation
    if password != confirm_password:
        return jsonify({"error": "Passwords do not match."}), 400

    # Uniqueness checks
    existing_user = get_user_by_email_or_username(email)
    if existing_user:
        return jsonify({"error": "An account with this email address already exists."}), 409

    existing_username = get_user_by_email_or_username(username)
    if existing_username:
        return jsonify({"error": "This username is already taken. Please choose another."}), 409

    # 2. Hash password & create user
    password_hash = generate_password_hash(password)
    user_id = create_user(full_name, email, username, password_hash)

    # 3. Establish session
    session['user_id'] = user_id
    session.permanent = True

    user = get_user_by_id(user_id)
    return jsonify({
        "success": True,
        "message": "Account created successfully.",
        "user": user,
        "auth_token": user_id
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    data = request.json or {}
    identifier = data.get('email', data.get('identifier', '')).strip().lower()
    password = data.get('password', '')

    if not identifier or not password:
        return jsonify({"error": "Email/Username and password are required."}), 400

    user = get_user_by_email_or_username(identifier)
    if not user:
        return jsonify({"error": "Invalid credentials. Please verify your email and password."}), 401

    if not check_password_hash(user['password_hash'], password):
        return jsonify({"error": "Invalid credentials. Please verify your email and password."}), 401

    # Establish session
    session['user_id'] = user['id']
    session.permanent = True

    sanitized_user = {
        "id": user['id'],
        "full_name": user['full_name'],
        "email": user['email'],
        "username": user['username'],
        "created_at": user['created_at']
    }

    return jsonify({
        "success": True,
        "message": f"Welcome back, {user['full_name']}!",
        "user": sanitized_user,
        "auth_token": user['id']
    })

@app.route('/api/auth/logout', methods=['POST'])
def auth_logout():
    session.pop('user_id', None)
    return jsonify({"success": True, "message": "Signed out successfully."})

@app.route('/api/auth/me', methods=['GET'])
def auth_me():
    user_id = session.get('user_id')
    
    # Check Authorization header fallback
    if not user_id:
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token_val = auth_header.split(' ', 1)[1].strip()
            user = get_user_by_id(token_val)
            if user:
                user_id = user['id']

    if not user_id:
        return jsonify({"authenticated": False}), 401

    user = get_user_by_id(user_id)
    if not user:
        session.pop('user_id', None)
        return jsonify({"authenticated": False}), 401

    # Get associated candidate profile
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM candidates WHERE id = ?", (user_id,))
    cand_row = c.fetchone()
    conn.close()

    candidate_profile = dict(cand_row) if cand_row else {
        "id": user_id,
        "name": user["full_name"],
        "email": user["email"],
        "target_role": "frontend-engineer",
        "target_level": "Associate / Mid-Level"
    }

    return jsonify({
        "authenticated": True,
        "user": user,
        "candidate": candidate_profile,
        "auth_token": user_id
    })

@app.route('/api/auth/forgot-password', methods=['POST'])
def auth_forgot_password():
    data = request.json or {}
    email = data.get('email', '').strip().lower()

    if not email:
        return jsonify({"error": "Please enter your email address."}), 400

    user = get_user_by_email_or_username(email)
    if not user:
        # Prevent account enumeration in public responses
        return jsonify({
            "success": True,
            "message": "If an account exists with this email address, password reset instructions have been generated."
        })

    token = create_password_reset_token(user['id'])

    # Transparent & honest handling of unconfigured email delivery
    return jsonify({
        "success": True,
        "email_delivery_configured": False,
        "message": "External email delivery (SMTP) is not configured in this local environment. For evaluation, use the one-time reset token provided below to update your password.",
        "reset_token": token,
        "email": email
    })

@app.route('/api/auth/reset-password', methods=['POST'])
def auth_reset_password():
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    token = data.get('token', '').strip().upper()
    new_password = data.get('new_password', '')
    confirm_password = data.get('confirm_password', '')

    if not email or not token or not new_password:
        return jsonify({"error": "Email, reset token, and new password are required."}), 400

    if len(new_password) < 8:
        return jsonify({"error": "New password must be at least 8 characters long."}), 400

    if not any(char.isdigit() or not char.isalnum() for char in new_password):
        return jsonify({"error": "Password must contain at least one number or special symbol."}), 400

    if new_password != confirm_password:
        return jsonify({"error": "Passwords do not match."}), 400

    new_hash = generate_password_hash(new_password)
    success, message = verify_and_use_reset_token(email, token, new_hash)

    if not success:
        return jsonify({"error": message}), 400

    return jsonify({"success": True, "message": message})

# ----------------- ROLES (PUBLIC BENCHMARK CATALOG) -----------------

@app.route('/api/roles', methods=['GET'])
def get_roles():
    return jsonify(list_roles())

@app.route('/api/roles/<role_id>', methods=['GET'])
def get_single_role(role_id):
    role = get_role(role_id)
    if not role:
        return jsonify({"error": "Role not found"}), 404
    return jsonify(role)

# ----------------- USER PROFILE (PROTECTED) -----------------

@app.route('/api/candidate', methods=['GET'])
@require_auth
def get_candidate(user_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM candidates WHERE id = ?", (user_id,))
    row = c.fetchone()
    conn.close()
    
    if not row:
        user = get_user_by_id(user_id)
        return jsonify({
            "id": user_id,
            "name": user["full_name"],
            "email": user["email"],
            "target_role": "frontend-engineer",
            "target_level": "Associate / Mid-Level",
            "headline": "",
            "bio": ""
        })

    return jsonify(dict(row))

@app.route('/api/candidate', methods=['PUT'])
@require_auth
def update_candidate(user_id):
    data = request.json or {}
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("""
    UPDATE candidates 
    SET name = COALESCE(?, name),
        email = COALESCE(?, email),
        target_role = COALESCE(?, target_role),
        target_level = COALESCE(?, target_level),
        headline = COALESCE(?, headline),
        bio = COALESCE(?, bio)
    WHERE id = ?
    """, (
        data.get('name'),
        data.get('email'),
        data.get('target_role'),
        data.get('target_level'),
        data.get('headline'),
        data.get('bio'),
        user_id
    ))
    conn.commit()

    c.execute("SELECT * FROM candidates WHERE id = ?", (user_id,))
    row = c.fetchone()
    conn.close()

    return jsonify(dict(row))

# ----------------- RESUME INTELLIGENCE (PROTECTED) -----------------

@app.route('/api/resume/upload', methods=['POST'])
@require_auth
def upload_resume(user_id):
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded. Please select a resume file.", "code": "NO_FILE"}), 400
    
    file = request.files['file']
    if not file or file.filename == '':
        return jsonify({"error": "Empty filename provided. Please select a valid file.", "code": "EMPTY_FILENAME"}), 400

    filename = secure_filename(file.filename)
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    if ext not in ['pdf', 'docx', 'doc', 'txt']:
        return jsonify({
            "error": f"Unsupported file format '.{ext}'. SkillOrbit supports PDF and DOCX documents.",
            "code": "UNSUPPORTED_MEDIA_TYPE"
        }), 415

    save_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{uuid.uuid4()}_{filename}")
    file.save(save_path)

    try:
        parsed_res = parse_resume_document(save_path, filename)
        parsed_res["user_id"] = user_id
        return jsonify(parsed_res)
    except ValueError as e:
        return jsonify({"error": str(e), "code": "UNPROCESSABLE_ENTITY"}), 422
    except Exception as e:
        return jsonify({"error": "Failed to parse resume document. Please verify the file is not corrupted or password-protected.", "code": "PARSING_FAILED"}), 422
    finally:
        if os.path.exists(save_path):
            try:
                os.remove(save_path)
            except:
                pass

@app.route('/api/resume/parse-text', methods=['POST'])
@require_auth
def parse_resume_text(user_id):
    data = request.json or {}
    raw_text = data.get('text', '').strip()
    if not raw_text:
        return jsonify({"error": "Empty text provided"}), 400

    info = extract_candidate_info(raw_text)
    sections = segment_sections(raw_text)
    detected_skills = extract_skills_from_text(raw_text)

    return jsonify({
        "filename": "pasted_text_resume.txt",
        "file_type": "text",
        "raw_text": raw_text,
        "candidate": info,
        "sections": sections,
        "detected_skills": detected_skills,
        "word_count": len(raw_text.split()),
        "parsed_successfully": True
    })

@app.route('/api/resume/commit', methods=['POST'])
@require_auth
def commit_resume(user_id):
    """Commits extracted or edited resume info into database for the authenticated user."""
    data = request.json or {}
    candidate_info = data.get('candidate', {})
    sections = data.get('sections', {})
    skills = data.get('skills', [])
    target_role = data.get('target_role')

    now = datetime.utcnow().isoformat()
    conn = get_db_connection()
    c = conn.cursor()

    # Update candidate profile info
    if candidate_info.get('name'):
        c.execute("UPDATE candidates SET name = ? WHERE id = ?", (candidate_info['name'], user_id))
    if candidate_info.get('email'):
        c.execute("UPDATE candidates SET email = ? WHERE id = ?", (candidate_info['email'], user_id))
    if target_role:
        c.execute("UPDATE candidates SET target_role = ? WHERE id = ?", (target_role, user_id))

    # Record resume entry for this user
    resume_id = str(uuid.uuid4())
    c.execute("""
    INSERT INTO resumes (id, candidate_id, filename, file_type, raw_text, parsed_data, uploaded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        resume_id,
        user_id,
        data.get('filename', 'resume_upload.pdf'),
        data.get('file_type', 'pdf'),
        data.get('raw_text', ''),
        json.dumps(data),
        now
    ))

    # Add or update skills in candidate_skills strictly for this user
    for sk in skills:
        s_name = sk.get('name')
        if not s_name:
            continue
        c.execute("SELECT id, status, confidence_score FROM candidate_skills WHERE candidate_id = ? AND LOWER(skill_name) = LOWER(?)", (user_id, s_name))
        existing = c.fetchone()
        
        confidence = sk.get('confidence', 75)
        evidence = sk.get('evidence_snippet', f"Mentioned in resume under extracted sections.")
        
        if existing:
            new_status = existing['status'] if existing['status'] == 'demonstrated' else 'listed'
            c.execute("""
            UPDATE candidate_skills 
            SET status = ?, source = 'resume', evidence = ?, updated_at = ?
            WHERE id = ?
            """, (new_status, evidence, now, existing['id']))
        else:
            c.execute("""
            INSERT INTO candidate_skills (candidate_id, skill_name, category, status, source, confidence_score, evidence, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (user_id, s_name, "Technical", "listed", "resume", confidence, evidence, now))

    # Log activity
    c.execute("""
    INSERT INTO activity_log (candidate_id, activity_type, title, details, timestamp)
    VALUES (?, ?, ?, ?, ?)
    """, (user_id, "resume", "Resume Ingested & Synchronized", f"Extracted {len(skills)} skills and updated candidate profile.", now))

    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Resume intelligence synchronized."})

# ----------------- SKILLS & ATLAS (PROTECTED) -----------------

@app.route('/api/skills', methods=['GET'])
@require_auth
def get_candidate_skills(user_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM candidate_skills WHERE candidate_id = ? ORDER BY status ASC, confidence_score DESC", (user_id,))
    rows = c.fetchall()
    conn.close()
    
    return jsonify([dict(r) for r in rows])

@app.route('/api/skills', methods=['POST'])
@require_auth
def add_candidate_skill(user_id):
    data = request.json or {}
    skill_name = data.get('skill_name', '').strip()
    category = data.get('category', 'Technical')
    status = data.get('status', 'listed')
    confidence = data.get('confidence_score', 70)
    evidence = data.get('evidence', 'Manually added by candidate.')

    if not skill_name:
        return jsonify({"error": "Skill name is required"}), 400

    now = datetime.utcnow().isoformat()
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT id FROM candidate_skills WHERE candidate_id = ? AND LOWER(skill_name) = LOWER(?)", (user_id, skill_name))
    existing = c.fetchone()

    if existing:
        c.execute("""
        UPDATE candidate_skills
        SET category = ?, status = ?, confidence_score = ?, evidence = ?, updated_at = ?
        WHERE id = ?
        """, (category, status, confidence, evidence, now, existing['id']))
    else:
        c.execute("""
        INSERT INTO candidate_skills (candidate_id, skill_name, category, status, source, confidence_score, evidence, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, skill_name, category, status, "manual", confidence, evidence, now))

    conn.commit()
    conn.close()

    return jsonify({"success": True})

# ----------------- JOB MATCH & GAP ANALYSIS (PROTECTED) -----------------

@app.route('/api/match', methods=['GET'])
@require_auth
def get_job_match(user_id):
    role_id = request.args.get('role')

    conn = get_db_connection()
    c = conn.cursor()
    
    if not role_id:
        c.execute("SELECT target_role FROM candidates WHERE id = ?", (user_id,))
        cand_row = c.fetchone()
        role_id = cand_row['target_role'] if cand_row and cand_row['target_role'] else 'frontend-engineer'

    role = get_role(role_id)
    if not role:
        conn.close()
        return jsonify({"error": f"Role '{role_id}' not found"}), 404

    # Fetch this candidate's personal skills
    c.execute("SELECT * FROM candidate_skills WHERE candidate_id = ?", (user_id,))
    cand_skills = [dict(r) for r in c.fetchall()]
    conn.close()

    cand_map = {s['skill_name'].lower(): s for s in cand_skills}

    requirements_analysis = []
    total_weight = 0
    earned_weight = 0

    demonstrated_count = 0
    listed_count = 0
    gap_count = 0

    for req in role['skills']:
        s_name = req['name']
        match = cand_map.get(s_name.lower())
        weight_mult = 1.5 if req['weight'] == 'essential' else 1.0
        total_weight += (req['benchmark'] * weight_mult)

        if match:
            c_score = match.get('confidence_score', 60)
            status = match.get('status', 'listed')
            source = match.get('source', 'resume')
            evidence = match.get('evidence', '')
            
            if status == 'demonstrated':
                demonstrated_count += 1
                earned_weight += (c_score * weight_mult)
            elif status == 'listed':
                listed_count += 1
                earned_weight += (c_score * 0.75 * weight_mult)
            else:
                gap_count += 1
                earned_weight += (c_score * 0.4 * weight_mult)

            requirements_analysis.append({
                "skill_name": s_name,
                "category": req['category'],
                "weight": req['weight'],
                "benchmark": req['benchmark'],
                "candidate_score": c_score,
                "status": status,
                "source": source,
                "evidence": evidence or ("Observed in practice session" if status == "demonstrated" else "Listed on candidate profile")
            })
        else:
            gap_count += 1
            requirements_analysis.append({
                "skill_name": s_name,
                "category": req['category'],
                "weight": req['weight'],
                "benchmark": req['benchmark'],
                "candidate_score": 10 if cand_skills else 0, # zero if fresh account
                "status": "gap",
                "source": "unassessed",
                "evidence": "No evidence found on resume or in interview practice sessions."
            })

    # If completely fresh account with 0 skills on record, show clean starting baseline
    if not cand_skills:
        raw_fit_score = 0
    else:
        raw_fit_score = int(round((earned_weight / max(total_weight, 1)) * 100))
    
    fit_score = min(98, max(0, raw_fit_score))

    # Formulate next best action based on user's actual gaps
    essential_gaps = [r for r in requirements_analysis if r['status'] == 'gap' and r['weight'] == 'essential']
    recommended_gaps = [r for r in requirements_analysis if r['status'] == 'gap']
    listed_to_verify = [r for r in requirements_analysis if r['status'] == 'listed' and r['weight'] == 'essential']

    if not cand_skills:
        next_action = {
            "title": "Ingest Resume or Take First Diagnostic",
            "description": f"Upload your resume to extract skills or practice your first technical scenario for {role['title']}.",
            "skill_name": role['skills'][0]['name'],
            "action_type": "resume"
        }
    elif essential_gaps:
        top_focus = essential_gaps[0]
        next_action = {
            "title": f"Bridge Priority Gap: {top_focus['skill_name']}",
            "description": f"Essential competency for {role['title']}. Completing a practice assessment here will directly increase role readiness.",
            "skill_name": top_focus['skill_name'],
            "action_type": "interview_lab"
        }
    elif listed_to_verify:
        top_focus = listed_to_verify[0]
        next_action = {
            "title": f"Verify Resume Skill: {top_focus['skill_name']}",
            "description": f"Currently listed on resume but unverified. Complete a practice question in the Interview Lab to prove this skill.",
            "skill_name": top_focus['skill_name'],
            "action_type": "interview_lab"
        }
    else:
        next_action = {
            "title": "Maintain Mock Interview Readiness",
            "description": "All core competencies demonstrated. Practice timed behavioral and system architecture questions.",
            "skill_name": role['skills'][0]['name'],
            "action_type": "interview_lab"
        }

    return jsonify({
        "role_id": role['id'],
        "role_title": role['title'],
        "role_category": role['category'],
        "role_tagline": role['tagline'],
        "median_salary": role['median_salary'],
        "fit_score": fit_score,
        "demonstrated_count": demonstrated_count,
        "listed_count": listed_count,
        "gap_count": gap_count,
        "total_analyzed": len(role['skills']),
        "requirements": requirements_analysis,
        "next_best_action": next_action
    })

# ----------------- ADAPTIVE INTERVIEW LAB (PROTECTED) -----------------

@app.route('/api/interview/questions', methods=['GET'])
@require_auth
def get_interview_questions(user_id):
    role_id = request.args.get('role', 'frontend-engineer')
    category = request.args.get('category')
    
    role = get_role(role_id)
    if not role:
        role = get_role('frontend-engineer')

    questions = role.get('questions', [])
    if category:
        questions = [q for q in questions if q.get('category', '').lower() == category.lower()]

    return jsonify({
        "role_id": role['id'],
        "role_title": role['title'],
        "questions": questions
    })

@app.route('/api/interview/evaluate', methods=['POST'])
@require_auth
def evaluate_interview(user_id):
    data = request.json or {}
    role_id = data.get('role_id', 'frontend-engineer')
    question_id = data.get('question_id')
    user_answer = data.get('answer', '')

    role = get_role(role_id)
    target_q = None
    if role:
        for q in role.get('questions', []):
            if q['id'] == question_id:
                target_q = q
                break

    if not target_q:
        target_q = {
            "id": question_id or "custom-q",
            "title": data.get("question_title", "Technical Assessment"),
            "category": data.get("question_category", "Technical"),
            "target_skill": data.get("target_skill", "Core Competency"),
            "prompt": data.get("prompt", "Explain your technical approach and architectural trade-offs."),
            "rubric_keywords": ["architecture", "performance", "trade-off", "error handling", "testing", "scalability"],
            "ideal_answer_points": [
                "Clearly outline problem definition and constraints.",
                "Detail architecture pattern and algorithmic choice.",
                "Discuss edge cases, error resilience, and monitoring."
            ]
        }

    eval_result = evaluate_interview_response(target_q, user_answer, role['title'] if role else "")
    now = datetime.utcnow().isoformat()
    session_id = str(uuid.uuid4())

    conn = get_db_connection()
    c = conn.cursor()

    # Save to interview_sessions strictly for this user
    c.execute("""
    INSERT INTO interview_sessions (
        id, candidate_id, target_role, question_id, question_title,
        question_category, question_prompt, user_answer, evaluation,
        score, evaluator_engine, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        session_id, user_id, role_id, target_q['id'], target_q['title'],
        target_q.get('category', 'Technical'), target_q.get('prompt', ''),
        user_answer, json.dumps(eval_result), eval_result['overall_score'],
        eval_result['evaluator_engine'], now
    ))

    # Upgrade skill to demonstrated if score >= 70
    target_skill_name = target_q.get('target_skill')
    if target_skill_name and eval_result['overall_score'] >= 70:
        c.execute("SELECT id, status, confidence_score FROM candidate_skills WHERE candidate_id = ? AND LOWER(skill_name) = LOWER(?)", (user_id, target_skill_name))
        existing_skill = c.fetchone()
        
        new_confidence = max(existing_skill['confidence_score'] if existing_skill else 0, eval_result['overall_score'])
        evidence_text = f"Demonstrated in practice session '{target_q['title']}' with score {eval_result['overall_score']}%."

        if existing_skill:
            c.execute("""
            UPDATE candidate_skills
            SET status = 'demonstrated', source = 'interview', confidence_score = ?, evidence = ?, updated_at = ?
            WHERE id = ?
            """, (new_confidence, evidence_text, now, existing_skill['id']))
        else:
            c.execute("""
            INSERT INTO candidate_skills (candidate_id, skill_name, category, status, source, confidence_score, evidence, updated_at)
            VALUES (?, ?, ?, 'demonstrated', 'interview', ?, ?, ?)
            """, (user_id, target_skill_name, target_q.get('category', 'Technical'), new_confidence, evidence_text, now))

    # Log activity
    c.execute("""
    INSERT INTO activity_log (candidate_id, activity_type, title, details, timestamp)
    VALUES (?, ?, ?, ?, ?)
    """, (user_id, "interview", f"Completed: {target_q['title']}", f"Scored {eval_result['overall_score']}% evaluated via {eval_result['evaluator_engine']}.", now))

    conn.commit()
    conn.close()

    eval_result['session_id'] = session_id
    return jsonify(eval_result)

@app.route('/api/interview/history', methods=['GET'])
@require_auth
def get_interview_history(user_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM interview_sessions WHERE candidate_id = ? ORDER BY created_at DESC LIMIT 20", (user_id,))
    rows = c.fetchall()
    conn.close()

    history = []
    for r in rows:
        item = dict(r)
        if item.get('evaluation'):
            try:
                item['evaluation'] = json.loads(item['evaluation'])
            except:
                pass
        history.append(item)

    return jsonify(history)

# ----------------- PERSONALIZED ROADMAP (PROTECTED) -----------------

@app.route('/api/roadmap', methods=['GET'])
@require_auth
def get_roadmap(user_id):
    role_id = request.args.get('role')

    conn = get_db_connection()
    c = conn.cursor()

    if not role_id:
        c.execute("SELECT target_role FROM candidates WHERE id = ?", (user_id,))
        cand_row = c.fetchone()
        role_id = cand_row['target_role'] if cand_row and cand_row['target_role'] else 'frontend-engineer'

    # Check if tasks exist in DB for this authenticated user
    c.execute("SELECT * FROM roadmap_tasks WHERE candidate_id = ? ORDER BY id ASC", (user_id,))
    rows = c.fetchall()

    if not rows:
        c.execute("SELECT * FROM candidate_skills WHERE candidate_id = ?", (user_id,))
        cand_skills = [dict(s) for s in c.fetchall()]
        generated_tasks = generate_roadmap_for_role(role_id, cand_skills)
        
        now = datetime.utcnow().isoformat()
        for t in generated_tasks:
            c.execute("""
            INSERT INTO roadmap_tasks (
                id, candidate_id, milestone_phase, skill_name, task_title,
                description, why_it_matters, resource_url, resource_title,
                estimated_hours, is_completed, completed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL)
            """, (
                f"{user_id[:8]}_{t['id']}", user_id, t['milestone_phase'], t['skill_name'],
                t['task_title'], t['description'], t['why_it_matters'],
                t['resource_url'], t['resource_title'], t['estimated_hours']
            ))
        conn.commit()

        c.execute("SELECT * FROM roadmap_tasks WHERE candidate_id = ? ORDER BY id ASC", (user_id,))
        rows = c.fetchall()

    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/roadmap/toggle', methods=['POST'])
@require_auth
def toggle_roadmap_task(user_id):
    data = request.json or {}
    task_id = data.get('task_id')

    if not task_id:
        return jsonify({"error": "task_id is required"}), 400

    now = datetime.utcnow().isoformat()
    conn = get_db_connection()
    c = conn.cursor()

    c.execute("SELECT * FROM roadmap_tasks WHERE id = ? AND candidate_id = ?", (task_id, user_id))
    task = c.fetchone()
    if not task:
        conn.close()
        return jsonify({"error": "Task not found"}), 404

    new_status = 0 if task['is_completed'] else 1
    completed_time = now if new_status == 1 else None

    c.execute("""
    UPDATE roadmap_tasks
    SET is_completed = ?, completed_at = ?
    WHERE id = ? AND candidate_id = ?
    """, (new_status, completed_time, task_id, user_id))

    if new_status == 1:
        c.execute("""
        INSERT INTO activity_log (candidate_id, activity_type, title, details, timestamp)
        VALUES (?, ?, ?, ?, ?)
        """, (user_id, "roadmap", f"Completed: {task['task_title']}", f"Finished {task['estimated_hours']}h sprint for {task['skill_name']}.", now))

    conn.commit()
    conn.close()

    return jsonify({"success": True, "task_id": task_id, "is_completed": new_status})

@app.route('/api/roadmap/regenerate', methods=['POST'])
@require_auth
def regenerate_roadmap(user_id):
    data = request.json or {}
    role_id = data.get('role_id', 'frontend-engineer')

    conn = get_db_connection()
    c = conn.cursor()

    # Clear existing tasks for this user only
    c.execute("DELETE FROM roadmap_tasks WHERE candidate_id = ?", (user_id,))
    
    # Fetch candidate skills and regenerate
    c.execute("SELECT * FROM candidate_skills WHERE candidate_id = ?", (user_id,))
    cand_skills = [dict(s) for s in c.fetchall()]
    generated_tasks = generate_roadmap_for_role(role_id, cand_skills)

    for t in generated_tasks:
        c.execute("""
        INSERT INTO roadmap_tasks (
            id, candidate_id, milestone_phase, skill_name, task_title,
            description, why_it_matters, resource_url, resource_title,
            estimated_hours, is_completed, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL)
        """, (
            f"{user_id[:8]}_{t['id']}", user_id, t['milestone_phase'], t['skill_name'],
            t['task_title'], t['description'], t['why_it_matters'],
            t['resource_url'], t['resource_title'], t['estimated_hours']
        ))

    conn.commit()
    c.execute("SELECT * FROM roadmap_tasks WHERE candidate_id = ? ORDER BY id ASC", (user_id,))
    rows = c.fetchall()
    conn.close()

    return jsonify([dict(r) for r in rows])

# ----------------- PROGRESS ANALYTICS (PROTECTED) -----------------

@app.route('/api/analytics', methods=['GET'])
@require_auth
def get_analytics(user_id):
    conn = get_db_connection()
    c = conn.cursor()

    c.execute("SELECT status, count(*) as cnt FROM candidate_skills WHERE candidate_id = ? GROUP BY status", (user_id,))
    status_counts = {r['status']: r['cnt'] for r in c.fetchall()}

    c.execute("SELECT count(*) as total, sum(is_completed) as completed FROM roadmap_tasks WHERE candidate_id = ?", (user_id,))
    road_row = c.fetchone()
    total_tasks = road_row['total'] or 0
    completed_tasks = road_row['completed'] or 0
    roadmap_percent = int(round((completed_tasks / max(total_tasks, 1)) * 100)) if total_tasks else 0

    c.execute("""
    SELECT id, question_title, question_category, score, created_at, evaluator_engine
    FROM interview_sessions
    WHERE candidate_id = ?
    ORDER BY created_at ASC
    """, (user_id,))
    interview_rows = [dict(r) for r in c.fetchall()]

    avg_interview_score = int(round(sum(r['score'] for r in interview_rows) / max(len(interview_rows), 1))) if interview_rows else 0

    c.execute("SELECT * FROM activity_log WHERE candidate_id = ? ORDER BY timestamp DESC LIMIT 10", (user_id,))
    activities = [dict(r) for r in c.fetchall()]

    conn.close()

    return jsonify({
        "skills_summary": {
            "demonstrated": status_counts.get("demonstrated", 0),
            "listed": status_counts.get("listed", 0),
            "gaps": status_counts.get("gap", 0),
            "total": sum(status_counts.values())
        },
        "roadmap_summary": {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "completion_percentage": roadmap_percent
        },
        "interview_summary": {
            "sessions_completed": len(interview_rows),
            "average_score": avg_interview_score,
            "session_history": interview_rows
        },
        "recent_activities": activities
    })

# ----------------- ACTIVITY AUDIT (PROTECTED) -----------------

@app.route('/api/activity', methods=['GET'])
@require_auth
def get_activity(user_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM activity_log WHERE candidate_id = ? ORDER BY timestamp DESC LIMIT 20", (user_id,))
    rows = c.fetchall()
    conn.close()
# ----------------- GLOBAL ERROR HANDLERS -----------------

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({
        "error": "The uploaded file exceeds the 10MB limit. Please upload a smaller resume.",
        "code": "PAYLOAD_TOO_LARGE"
    }), 413

@app.errorhandler(403)
def forbidden(error):
    return jsonify({
        "error": "Access forbidden. You do not have permission to access this resource.",
        "code": "FORBIDDEN"
    }), 403

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        "error": "An internal server error occurred while processing the request. Please try again.",
        "code": "INTERNAL_SERVER_ERROR"
    }), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"SkillOrbit Multi-User backend starting on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
