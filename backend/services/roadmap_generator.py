"""
SKILLORBIT - Personalized Career Roadmap Generator
Synthesizes target role competencies and assessed candidate skill gaps into
a multi-phase, actionable learning & practice roadmap.
"""

from typing import List, Dict, Any
from .roles import get_role

CURATED_RESOURCES = {
    "JavaScript (ES6+)": {
        "title": "MDN Web Docs: JavaScript Deep Dive",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript"
    },
    "TypeScript": {
        "title": "Official TypeScript Handbook: Generics & Types",
        "url": "https://www.typescriptlang.org/docs/handbook/2/generics.html"
    },
    "React.js": {
        "title": "React.dev: Escape Hatches & State Synchronization",
        "url": "https://react.dev/learn/escape-hatches"
    },
    "HTML5 & Semantic Web": {
        "title": "W3C WAI: Accessible Rich Internet Applications (WAI-ARIA)",
        "url": "https://www.w3.org/WAI/standards-guidelines/aria/"
    },
    "CSS3 & Modern Layouts": {
        "title": "CSS-Tricks: Complete Guide to Flexbox & Grid",
        "url": "https://css-tricks.com/snippets/css/a-guide-to-flexbox/"
    },
    "Tailwind CSS": {
        "title": "Tailwind CSS Official Documentation & Design Systems",
        "url": "https://tailwindcss.com/docs"
    },
    "Web Performance Optimization": {
        "title": "web.dev: Core Web Vitals & Performance Engineering",
        "url": "https://web.dev/explore/fast"
    },
    "State Management (Redux/Zustand)": {
        "title": "Zustand State Architecture & Selectors",
        "url": "https://docs.pmnd.rs/zustand/getting-started/introduction"
    },
    "REST & GraphQL APIs": {
        "title": "TanStack Query Architecture & Optimistic Mutations",
        "url": "https://tanstack.com/query/latest/docs/framework/react/overview"
    },
    "Client-Side Testing (Jest/RTL)": {
        "title": "React Testing Library Guiding Principles",
        "url": "https://testing-library.com/docs/react-testing-library/intro/"
    },
    "Relational Databases (PostgreSQL/MySQL)": {
        "title": "Use The Index, Luke: SQL Indexing Guide",
        "url": "https://use-the-index-luke.com/"
    },
    "RESTful API Design": {
        "title": "Microsoft REST API Guidelines & Idempotency",
        "url": "https://github.com/microsoft/api-guidelines"
    },
    "NoSQL Systems (MongoDB/Redis)": {
        "title": "Redis Documentation: Caching Patterns & Pub/Sub",
        "url": "https://redis.io/docs/manual/client-side-caching/"
    },
    "Docker & Containerization": {
        "title": "Docker Best Practices: Multi-stage Builds",
        "url": "https://docs.docker.com/build/building/multi-stage/"
    },
    "PyTorch / TensorFlow": {
        "title": "PyTorch Official Tutorials: Autograd & Tensors",
        "url": "https://pytorch.org/tutorials/"
    },
    "LLMs & RAG Architectures": {
        "title": "LangChain & Ragas: RAG Triad Evaluation",
        "url": "https://docs.ragas.io/en/stable/"
    },
    "Advanced SQL": {
        "title": "PostgreSQL Window Functions Documentation",
        "url": "https://www.postgresql.org/docs/current/tutorial-window.html"
    },
    "Application Security (OWASP Top 10)": {
        "title": "OWASP Top 10 Security Risks",
        "url": "https://owasp.org/www-project-top-ten/"
    }
}

DEFAULT_RESOURCE = {
    "title": "Standard Industry Documentation & Specifications",
    "url": "https://developer.mozilla.org"
}

def generate_roadmap_for_role(role_id: str, candidate_skills: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Generates tailored roadmap tasks mapping assessed gaps to progressive milestones.
    """
    role = get_role(role_id)
    if not role:
        return []

    # Map candidate skills by lower name
    cand_skill_map = {s["skill_name"].lower(): s for s in candidate_skills}

    gaps = []
    low_confidence = []
    
    for req_skill in role["skills"]:
        s_name = req_skill["name"]
        match = cand_skill_map.get(s_name.lower())
        
        if not match or match.get("status") == "gap":
            gaps.append(req_skill)
        elif match.get("confidence_score", 0) < req_skill.get("benchmark", 80):
            low_confidence.append(req_skill)

    # Sort gaps: essential weights first
    gaps.sort(key=lambda x: 0 if x.get("weight") == "essential" else 1)
    low_confidence.sort(key=lambda x: 0 if x.get("weight") == "essential" else 1)

    tasks = []
    task_idx = 1

    # Phase 1: Immediate Bridge Gaps (Essential missing skills)
    phase1_skills = gaps[:3] if gaps else role["skills"][:2]
    for skill in phase1_skills:
        res = CURATED_RESOURCES.get(skill["name"], DEFAULT_RESOURCE)
        tasks.append({
            "id": f"road-{task_idx}",
            "milestone_phase": "Phase 1: Immediate Bridge Gaps",
            "skill_name": skill["name"],
            "task_title": f"Core Competency Diagnostic: {skill['name']}",
            "description": f"Master fundamental patterns and resolve high-priority gaps in {skill['name']}. Practice key scenarios required for {role['title']}.",
            "why_it_matters": f"Rated as '{skill.get('weight', 'essential').upper()}' by employers for this role. Closing this gap directly boosts role-fit confidence.",
            "resource_title": res["title"],
            "resource_url": res["url"],
            "estimated_hours": 6,
            "is_completed": 0
        })
        task_idx += 1

    # Phase 2: Core Engineering Depth (Low confidence or secondary gaps)
    phase2_skills = low_confidence[:3] if low_confidence else gaps[3:6]
    if not phase2_skills:
        phase2_skills = role["skills"][2:5]

    for skill in phase2_skills:
        res = CURATED_RESOURCES.get(skill["name"], DEFAULT_RESOURCE)
        tasks.append({
            "id": f"road-{task_idx}",
            "milestone_phase": "Phase 2: Core Engineering Depth",
            "skill_name": skill["name"],
            "task_title": f"Production Implementation & Edge Cases: {skill['name']}",
            "description": f"Deepen architectural execution. Implement unit tests, boundary condition handling, and performance considerations for {skill['name']}.",
            "why_it_matters": f"Elevates candidate from academic comprehension to production reliability benchmark ({skill.get('benchmark', 85)}%).",
            "resource_title": res["title"],
            "resource_url": res["url"],
            "estimated_hours": 8,
            "is_completed": 0
        })
        task_idx += 1

    # Phase 3: Portfolio & Applied Architecture (Comprehensive integration)
    capstone_skill = role["skills"][-1]
    res_cap = CURATED_RESOURCES.get(capstone_skill["name"], DEFAULT_RESOURCE)
    tasks.append({
        "id": f"road-{task_idx}",
        "milestone_phase": "Phase 3: Portfolio & Applied Architecture",
        "skill_name": capstone_skill["name"],
        "task_title": f"End-to-End System Integration: {role['title']} Capstone",
        "description": "Construct an end-to-end applied proof of work featuring verified automated tests, documentation, and continuous deployment pipeline.",
        "why_it_matters": "Provides undeniable tangible proof of work during senior interview rounds and technical portfolio reviews.",
        "resource_title": res_cap["title"],
        "resource_url": res_cap["url"],
        "estimated_hours": 12,
        "is_completed": 0
    })

    return tasks
