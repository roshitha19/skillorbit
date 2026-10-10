"""
SKILLORBIT - Persistent Database Module (SQLite)
Supports multi-user authentication, secure credentials, personalized career profiles,
extracted resumes, verified skills, interview sessions, and individual roadmaps.
"""

import sqlite3
import json
import os
import uuid
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "skillorbit.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users table (Authentication & identity)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # 2. Password Resets table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS password_resets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        reset_token TEXT UNIQUE NOT NULL,
        expires_at TEXT NOT NULL,
        used INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)

    # 3. Candidates / Career Profiles table (1:1 with users)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS candidates (
        id TEXT PRIMARY KEY, -- maps 1:1 to users.id
        name TEXT NOT NULL,
        email TEXT,
        target_role TEXT DEFAULT 'frontend-engineer',
        target_level TEXT DEFAULT 'Associate / Mid-Level',
        headline TEXT,
        bio TEXT,
        created_at TEXT,
        FOREIGN KEY (id) REFERENCES users(id)
    )
    """)

    # 4. Resumes table (partitioned by candidate_id = user_id)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL,
        filename TEXT,
        file_type TEXT,
        raw_text TEXT,
        parsed_data TEXT,
        uploaded_at TEXT,
        FOREIGN KEY (candidate_id) REFERENCES users(id)
    )
    """)

    # 5. Candidate Skills table (partitioned by candidate_id = user_id)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS candidate_skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        candidate_id TEXT NOT NULL,
        skill_name TEXT NOT NULL,
        category TEXT,
        status TEXT DEFAULT 'listed', -- 'demonstrated', 'listed', 'gap'
        source TEXT DEFAULT 'resume',  -- 'resume', 'interview', 'manual'
        confidence_score INTEGER DEFAULT 70,
        evidence TEXT,
        updated_at TEXT,
        FOREIGN KEY (candidate_id) REFERENCES users(id)
    )
    """)

    # 6. Interview Sessions & Evaluations table (partitioned by candidate_id = user_id)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS interview_sessions (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL,
        target_role TEXT,
        question_id TEXT,
        question_title TEXT,
        question_category TEXT,
        question_prompt TEXT,
        user_answer TEXT,
        evaluation TEXT,
        score INTEGER,
        evaluator_engine TEXT,
        created_at TEXT,
        FOREIGN KEY (candidate_id) REFERENCES users(id)
    )
    """)

    # 7. Roadmap Tasks table (partitioned by candidate_id = user_id)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS roadmap_tasks (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL,
        milestone_phase TEXT,
        skill_name TEXT,
        task_title TEXT,
        description TEXT,
        why_it_matters TEXT,
        resource_url TEXT,
        resource_title TEXT,
        estimated_hours INTEGER DEFAULT 4,
        is_completed INTEGER DEFAULT 0,
        completed_at TEXT,
        FOREIGN KEY (candidate_id) REFERENCES users(id)
    )
    """)

    # 8. Activity Log table (partitioned by candidate_id = user_id)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        candidate_id TEXT NOT NULL,
        activity_type TEXT,
        title TEXT,
        details TEXT,
        timestamp TEXT,
        FOREIGN KEY (candidate_id) REFERENCES users(id)
    )
    """)

    conn.commit()
    conn.close()

# ----------------- USER HELPER FUNCTIONS -----------------

def get_user_by_id(user_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT id, full_name, email, username, created_at, updated_at FROM users WHERE id = ?", (user_id,))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_email_or_username(identifier):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("""
    SELECT * FROM users 
    WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)
    """, (identifier, identifier))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None

def create_user(full_name, email, username, password_hash):
    user_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute("""
    INSERT INTO users (id, full_name, email, username, password_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (user_id, full_name.strip(), email.strip().lower(), username.strip().lower(), password_hash, now, now))

    # Also create initial candidate profile tied to this user
    c.execute("""
    INSERT INTO candidates (id, name, email, target_role, target_level, headline, bio, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        full_name.strip(),
        email.strip().lower(),
        'frontend-engineer',
        'Associate / Mid-Level',
        f'Aspiring {full_name.strip()}',
        '',
        now
    ))

    # Log initial registration activity
    c.execute("""
    INSERT INTO activity_log (candidate_id, activity_type, title, details, timestamp)
    VALUES (?, ?, ?, ?, ?)
    """, (user_id, 'account', 'Account Created', 'Successfully registered on SKILLORBIT.', now))

    conn.commit()
    conn.close()
    return user_id

def create_password_reset_token(user_id):
    reset_id = str(uuid.uuid4())
    token = str(uuid.uuid4())[:8].upper() # 8-character verification token
    now = datetime.utcnow().isoformat()
    # Expire in 1 hour
    expires = datetime.fromtimestamp(datetime.utcnow().timestamp() + 3600).isoformat()

    conn = get_db_connection()
    c = conn.cursor()
    c.execute("""
    INSERT INTO password_resets (id, user_id, reset_token, expires_at, used, created_at)
    VALUES (?, ?, ?, ?, 0, ?)
    """, (reset_id, user_id, token, expires, now))
    conn.commit()
    conn.close()
    return token

def verify_and_use_reset_token(email, token, new_password_hash):
    user = get_user_by_email_or_username(email)
    if not user:
        return False, "User not found with this email."

    conn = get_db_connection()
    c = conn.cursor()
    c.execute("""
    SELECT * FROM password_resets 
    WHERE user_id = ? AND reset_token = ? AND used = 0
    ORDER BY created_at DESC LIMIT 1
    """, (user['id'], token.strip().upper()))
    reset_row = c.fetchone()

    if not reset_row:
        conn.close()
        return False, "Invalid or expired reset token."

    now = datetime.utcnow().isoformat()
    if reset_row['expires_at'] < now:
        conn.close()
        return False, "This reset token has expired. Please request a new one."

    # Mark token used
    c.execute("UPDATE password_resets SET used = 1 WHERE id = ?", (reset_row['id'],))
    # Update user password
    c.execute("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?", (new_password_hash, now, user['id']))
    
    # Log activity
    c.execute("""
    INSERT INTO activity_log (candidate_id, activity_type, title, details, timestamp)
    VALUES (?, ?, ?, ?, ?)
    """, (user['id'], 'security', 'Password Reset Completed', 'User updated account credentials via reset token.', now))

    conn.commit()
    conn.close()
    return True, "Password reset successfully."

if __name__ == "__main__":
    init_db()
    print("Database schemas initialized successfully.")
