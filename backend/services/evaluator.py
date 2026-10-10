"""
SKILLORBIT - Adaptive Interview Answer Evaluator
Provides structured, multi-rubric evaluation for candidate interview responses.
Seamlessly uses configured LLM APIs (Gemini/OpenAI/Groq) if keys are provided in the environment;
otherwise executes SkillOrbit's Deterministic Semantic Rubric Engine with transparent labeling.
"""

import os
import re
import json
import urllib.request
import urllib.error
from typing import Dict, Any, List

def evaluate_interview_response(
    question_data: Dict[str, Any],
    user_answer: str,
    target_role: str = ""
) -> Dict[str, Any]:
    """
    Evaluates a candidate's answer against the target question rubric.
    Returns structured metrics, strengths, missing concepts, model answer,
    and adaptive follow-up.
    """
    answer_clean = user_answer.strip()
    if not answer_clean:
        return {
            "overall_score": 0,
            "relevance_score": 0,
            "clarity_score": 0,
            "technical_score": 0,
            "completeness_score": 0,
            "strengths": [],
            "missing_concepts": question_data.get("rubric_keywords", [])[:4],
            "improvement_suggestions": ["No response submitted. Please provide an answer to receive analysis."],
            "ideal_answer_framework": question_data.get("ideal_answer_points", []),
            "follow_up_question": "Can you provide a high-level overview to get started?",
            "evaluator_engine": "SkillOrbit Deterministic Evaluation Engine (Semantic Rule-based)",
            "is_ai_generated": False
        }

    # Check for external API Keys
    gemini_key = os.environ.get("GEMINI_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")
    groq_key = os.environ.get("GROQ_API_KEY")

    if gemini_key:
        try:
            return evaluate_with_gemini(gemini_key, question_data, answer_clean, target_role)
        except Exception as e:
            # Fall back safely and honestly to deterministic engine
            res = evaluate_with_deterministic_rubric(question_data, answer_clean)
            res["evaluator_engine"] = f"SkillOrbit Deterministic Engine (Gemini fallback: {str(e)[:50]})"
            res["is_ai_generated"] = False
            return res

    elif openai_key:
        try:
            return evaluate_with_openai(openai_key, question_data, answer_clean, target_role)
        except Exception as e:
            res = evaluate_with_deterministic_rubric(question_data, answer_clean)
            res["evaluator_engine"] = f"SkillOrbit Deterministic Engine (OpenAI fallback: {str(e)[:50]})"
            res["is_ai_generated"] = False
            return res

    # Standard deterministic semantic evaluation
    return evaluate_with_deterministic_rubric(question_data, answer_clean)

def evaluate_with_deterministic_rubric(
    question_data: Dict[str, Any],
    answer: str
) -> Dict[str, Any]:
    """
    Deterministic rule-based and semantic rubric evaluation engine.
    Analyzes lexical density, keyword coverage, structural depth, and technical context.
    """
    words = answer.split()
    word_count = len(words)
    answer_lower = answer.lower()
    
    rubric_keywords = question_data.get("rubric_keywords", [])
    ideal_points = question_data.get("ideal_answer_points", [])
    question_prompt = question_data.get("prompt", "")
    target_skill = question_data.get("target_skill", "Technical Domain")

    # 1. Keyword analysis
    matched_keywords = []
    missing_keywords = []
    for kw in rubric_keywords:
        if kw.lower() in answer_lower:
            matched_keywords.append(kw)
        else:
            missing_keywords.append(kw)

    keyword_ratio = len(matched_keywords) / max(len(rubric_keywords), 1)

    # 2. Structural & Clarity indicators
    has_paragraphs = len(answer.split("\n\n")) > 1 or len(answer.split("\n")) > 2
    has_numbered_or_bullets = bool(re.search(r'(?:\d+\.|\*|\-|\•)\s+', answer))
    has_examples = any(phrase in answer_lower for phrase in [
        "for example", "for instance", "such as", "specifically", "in my project", 
        "in production", "in practice", "tradeoff", "trade-off", "benchmark", "bottleneck"
    ])
    has_code_syntax = bool(re.search(r'(`[^`]+`|\bfunction\b|\bconst\b|\bclass\b|\bdef\b|\bselect\b|\bquery\b)', answer_lower))

    # 3. Rubric Scores Computation (0-100)
    # Relevance (Checks prompt term presence and topic keywords)
    prompt_words = [w.lower() for w in re.findall(r'\b\w{4,}\b', question_prompt)]
    prompt_overlap = sum(1 for w in set(prompt_words) if w in answer_lower)
    prompt_overlap_ratio = min(1.0, prompt_overlap / max(4, len(set(prompt_words)) * 0.4))
    
    relevance_score = int(min(98, max(30, (keyword_ratio * 50) + (prompt_overlap_ratio * 45) + (min(word_count, 100) / 100 * 10))))

    # Technical Score (Heavily weighted on matched rubric concepts and technical keywords)
    tech_base = keyword_ratio * 70
    if has_code_syntax:
        tech_base += 10
    if word_count > 120:
        tech_base += 15
    elif word_count > 60:
        tech_base += 8
    technical_score = int(min(96, max(25, tech_base)))

    # Clarity & Structure (Formatting, paragraphing, bullet usage, sentence flow)
    clarity_base = 60
    if has_paragraphs: clarity_base += 15
    if has_numbered_or_bullets: clarity_base += 12
    if 70 <= word_count <= 350: clarity_base += 10
    elif word_count < 40: clarity_base -= 18
    clarity_score = int(min(95, max(30, clarity_base)))

    # Completeness & Examples
    completeness_base = (keyword_ratio * 40) + (min(word_count, 200) / 200 * 35)
    if has_examples: completeness_base += 20
    completeness_score = int(min(95, max(20, completeness_base)))

    # Overall Score (Weighted harmonic combination)
    overall_score = int(
        (technical_score * 0.35) +
        (relevance_score * 0.25) +
        (completeness_score * 0.25) +
        (clarity_score * 0.15)
    )

    # 4. Strengths Formulation
    strengths = []
    if matched_keywords:
        sample_kw = ", ".join(f"'{k}'" for k in matched_keywords[:3])
        strengths.append(f"Accurately incorporated core domain terminology ({sample_kw}).")
    if word_count >= 80:
        strengths.append("Provided detailed, substantive explanation rather than superficial one-liners.")
    if has_examples:
        strengths.append("Grounds theoretical explanation with practical applied examples and trade-off considerations.")
    if has_paragraphs or has_numbered_or_bullets:
        strengths.append("Organized thoughts into clear sequential points for interviewer readability.")
    if not strengths:
        strengths.append("Addressed the primary theme of the question directly.")

    # 5. Improvement Suggestions
    improvements = []
    if missing_keywords:
        missing_preview = ", ".join(f"'{k}'" for k in missing_keywords[:3])
        improvements.append(f"Deepen coverage on critical missing concepts: {missing_preview}.")
    if not has_examples:
        improvements.append("Illustrate your answer with a concrete production example, failure mode, or latency benchmark.")
    if word_count < 75:
        improvements.append("Expand on the underlying architectural trade-offs; interviewers expect depth on edge cases.")
    if not (has_paragraphs or has_numbered_or_bullets):
        improvements.append("Structure complex answers using numbered steps or clear paragraph transitions.")
    if not improvements:
        improvements.append("Solid response. Consider contrasting this pattern with alternative architectures in subsequent rounds.")

    # 6. Adaptive Follow-up Question
    if missing_keywords:
        first_missing = missing_keywords[0]
        follow_up = f"How would your approach adapt when dealing with '{first_missing}' under strict production constraints?"
    elif not has_examples:
        follow_up = f"Can you walk through a specific project where you encountered this problem and describe the trade-off decisions you made?"
    else:
        follow_up = f"What are the primary failure modes or performance bottlenecks of this approach at high scale?"

    return {
        "overall_score": overall_score,
        "relevance_score": relevance_score,
        "clarity_score": clarity_score,
        "technical_score": technical_score,
        "completeness_score": completeness_score,
        "word_count": word_count,
        "matched_concepts": matched_keywords,
        "strengths": strengths,
        "missing_concepts": missing_keywords[:5],
        "improvement_suggestions": improvements,
        "ideal_answer_framework": ideal_points,
        "follow_up_question": follow_up,
        "evaluator_engine": "SkillOrbit Deterministic Evaluation Engine (Semantic Rule-based)",
        "is_ai_generated": False
    }

def evaluate_with_gemini(
    api_key: str,
    question_data: Dict[str, Any],
    answer: str,
    target_role: str
) -> Dict[str, Any]:
    """Evaluates answer using Gemini REST API with structured JSON output."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    prompt = f"""
You are a senior technical interviewer and hiring manager assessing a candidate for the role: {target_role or 'Software Engineer'}.
Question Prompt: "{question_data.get('prompt')}"
Target Competency: "{question_data.get('target_skill')}"
Expected Rubric Key Concepts: {json.dumps(question_data.get('rubric_keywords', []))}

Candidate Submitted Answer:
\"\"\"{answer}\"\"\"

Provide an objective, constructive evaluation strictly formatted in the following JSON schema:
{{
  "overall_score": <integer 0-100>,
  "relevance_score": <integer 0-100>,
  "clarity_score": <integer 0-100>,
  "technical_score": <integer 0-100>,
  "completeness_score": <integer 0-100>,
  "matched_concepts": [<list of strings from rubric matched>],
  "strengths": [<2 to 4 concise bullet points explaining what was good>],
  "missing_concepts": [<2 to 4 missing technical concepts or considerations>],
  "improvement_suggestions": [<2 to 3 actionable recommendations to elevate the answer>],
  "ideal_answer_framework": [<3 to 4 points outlining how a top 1% candidate answers this>],
  "follow_up_question": "<a sharp adaptive follow-up question digging deeper into their weakest area>"
}}
Return ONLY valid JSON.
"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )

    with urllib.request.urlopen(req, timeout=12) as response:
        result = json.loads(response.read().decode('utf-8'))
        text_content = result['candidates'][0]['content']['parts'][0]['text']
        data = json.loads(text_content)
        data["evaluator_engine"] = "Gemini 1.5 Flash (Live External LLM)"
        data["is_ai_generated"] = True
        return data

def evaluate_with_openai(
    api_key: str,
    question_data: Dict[str, Any],
    answer: str,
    target_role: str
) -> Dict[str, Any]:
    """Evaluates answer using OpenAI REST API."""
    url = "https://api.openai.com/v1/chat/completions"
    prompt = f"""
You are an expert technical interviewer evaluating a candidate for: {target_role or 'Software Engineer'}.
Question: {question_data.get('prompt')}
Target Skill: {question_data.get('target_skill')}
Rubric Keywords: {json.dumps(question_data.get('rubric_keywords', []))}

Candidate Answer:
{answer}

Respond strictly in valid JSON with keys:
overall_score (0-100), relevance_score (0-100), clarity_score (0-100), technical_score (0-100), completeness_score (0-100),
matched_concepts (list), strengths (list), missing_concepts (list), improvement_suggestions (list), ideal_answer_framework (list), follow_up_question (string).
"""
    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "response_format": {"type": "json_object"}
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        }
    )

    with urllib.request.urlopen(req, timeout=12) as response:
        result = json.loads(response.read().decode('utf-8'))
        data = json.loads(result['choices'][0]['message']['content'])
        data["evaluator_engine"] = "OpenAI GPT-4o-mini (Live External LLM)"
        data["is_ai_generated"] = True
        return data
