"""
SKILLORBIT - Resume Parsing & Extraction Engine
Extracts raw text from PDF and DOCX documents, decomposes structured sections,
and identifies candidate skills with context snippets.
"""

import re
import os
from typing import Dict, Any, List

# Common skill keywords lexicon for fuzzy pattern discovery
TECH_KEYWORDS = [
    "Python", "JavaScript", "TypeScript", "React", "React.js", "Vue.js", "Angular", "Node.js", 
    "Express.js", "Next.js", "HTML", "HTML5", "CSS", "CSS3", "Tailwind CSS", "Bootstrap", 
    "SASS", "Redux", "Zustand", "GraphQL", "REST APIs", "RESTful", "PostgreSQL", "MySQL", 
    "SQLite", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "Google Cloud", "GCP", 
    "Azure", "Git", "GitHub", "GitLab", "CI/CD", "Linux", "Bash", "Shell", "Terraform", 
    "Jest", "Cypress", "Pytest", "Selenium", "PyTorch", "TensorFlow", "Scikit-Learn", 
    "Pandas", "NumPy", "OpenCV", "Machine Learning", "Deep Learning", "NLP", "LLM", 
    "RAG", "Data Analysis", "Power BI", "Tableau", "SQL", "Cyber Security", "OWASP", 
    "Penetration Testing", "Wireshark", "Network Security", "Agile", "Scrum", "Jira",
    "Figma", "UI/UX", "Product Management", "A/B Testing", "Web Performance", "Accessibility", "WCAG"
]

def extract_text_from_pdf(file_path_or_stream) -> str:
    """Extracts text from a PDF file using pdfplumber."""
    import pdfplumber
    text_parts = []
    with pdfplumber.open(file_path_or_stream) as pdf:
        for page in pdf.pages:
            extract = page.extract_text()
            if extract:
                text_parts.append(extract)
    return "\n".join(text_parts).strip()

def extract_text_from_docx(file_path_or_stream) -> str:
    """Extracts text from a DOCX file using python-docx."""
    import docx
    doc = docx.Document(file_path_or_stream)
    text_parts = [p.text for p in doc.paragraphs if p.text.strip()]
    for table in doc.tables:
        for row in table.rows:
            row_text = [cell.text.strip() for cell in row.cells if cell.text.strip()]
            if row_text:
                text_parts.append(" | ".join(row_text))
    return "\n".join(text_parts).strip()

def extract_candidate_info(text: str) -> Dict[str, Any]:
    """Extracts email, phone, links, and candidate name heuristically."""
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    name = "Candidate"
    
    # Try finding first strong line that looks like a person's name (not 'Resume' or 'Curriculum Vitae')
    for line in lines[:5]:
        clean_line = re.sub(r'[^a-zA-Z\s]', '', line).strip()
        words = clean_line.split()
        if 2 <= len(words) <= 4 and not any(w.lower() in ['resume', 'curriculum', 'vitae', 'portfolio', 'page', 'profile', 'contact'] for w in words):
            name = clean_line
            break

    # Email
    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    email = email_match.group(0) if email_match else ""

    # Phone
    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_match.group(0) if phone_match else ""

    # Links (GitHub, LinkedIn, Portfolio)
    github_match = re.search(r'(https?://)?(www\.)?github\.com/[a-zA-Z0-9_-]+', text, re.IGNORECASE)
    github = github_match.group(0) if github_match else ""

    linkedin_match = re.search(r'(https?://)?(www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+', text, re.IGNORECASE)
    linkedin = linkedin_match.group(0) if linkedin_match else ""

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "github": github,
        "linkedin": linkedin
    }

def segment_sections(text: str) -> Dict[str, str]:
    """Segments the resume text into standard resume sections."""
    section_patterns = {
        "summary": r'(?:summary|objective|about\s*me|profile)\b',
        "education": r'(?:education|academic\s*background|academics|qualifications)\b',
        "experience": r'(?:experience|work\s*experience|employment|work\s*history|internships)\b',
        "projects": r'(?:projects|academic\s*projects|personal\s*projects|key\s*projects)\b',
        "skills": r'(?:technical\s*skills|skills|technologies|competencies|tools\s*&\s*technologies)\b',
        "certifications": r'(?:certifications|certificates|licenses|achievements|awards)\b'
    }

    # Find headers and indices
    found_headers = []
    lower_text = text.lower()
    for sec_name, pattern in section_patterns.items():
        for match in re.finditer(pattern, lower_text):
            # Verify the header is isolated or at start of a line
            start = match.start()
            found_headers.append((start, sec_name))

    found_headers.sort(key=lambda x: x[0])

    sections = {
        "summary": "",
        "education": "",
        "experience": "",
        "projects": "",
        "skills": "",
        "certifications": ""
    }

    if not found_headers:
        # Fallback if no explicit headers found
        sections["experience"] = text[:len(text)//2]
        sections["projects"] = text[len(text)//2:]
        return sections

    for i, (start_pos, sec_name) in enumerate(found_headers):
        end_pos = found_headers[i + 1][0] if i + 1 < len(found_headers) else len(text)
        content = text[start_pos:end_pos].strip()
        # Clean off the matched header line
        lines = content.splitlines()
        clean_content = "\n".join(lines[1:]).strip() if len(lines) > 1 else content
        if not sections[sec_name]:
            sections[sec_name] = clean_content
        else:
            sections[sec_name] += "\n" + clean_content

    return sections

def extract_skills_from_text(text: str) -> List[Dict[str, Any]]:
    """Discovers recognized technical skills with snippet context and confidence score."""
    detected = []
    text_lower = text.lower()
    seen = set()

    for skill in TECH_KEYWORDS:
        # Use boundary matching for words like "C", "R", "SQL", "Git"
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        match = re.search(pattern, text_lower)
        if match:
            norm_name = skill
            if norm_name.lower() in seen:
                continue
            seen.add(norm_name.lower())

            # Find snippet around match
            start = max(0, match.start() - 40)
            end = min(len(text), match.end() + 60)
            snippet = text[start:end].replace('\n', ' ').strip()
            snippet = f"...{snippet}..." if start > 0 else f"{snippet}..."

            detected.append({
                "name": norm_name,
                "evidence_snippet": snippet,
                "confidence": 75,
                "source": "resume"
            })

    return detected

def parse_resume_document(file_storage_or_path, filename: str) -> Dict[str, Any]:
    """Coordinates file ingestion and structured decomposition."""
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    
    if ext == 'pdf':
        raw_text = extract_text_from_pdf(file_storage_or_path)
    elif ext in ['docx', 'doc']:
        raw_text = extract_text_from_docx(file_storage_or_path)
    elif ext in ['txt', 'md']:
        if hasattr(file_storage_or_path, 'read'):
            raw_text = file_storage_or_path.read().decode('utf-8', errors='ignore')
        else:
            with open(file_storage_or_path, 'r', encoding='utf-8', errors='ignore') as f:
                raw_text = f.read()
    else:
        raise ValueError(f"Unsupported file format: '.{ext}'. Supported formats are PDF, DOCX, and TXT.")

    if not raw_text.strip():
        raise ValueError("The uploaded document contains no readable text. Ensure it is not an image-only scan.")

    info = extract_candidate_info(raw_text)
    sections = segment_sections(raw_text)
    detected_skills = extract_skills_from_text(raw_text)

    return {
        "filename": filename,
        "file_type": ext,
        "raw_text": raw_text,
        "candidate": info,
        "sections": sections,
        "detected_skills": detected_skills,
        "word_count": len(raw_text.split()),
        "parsed_successfully": True
    }
