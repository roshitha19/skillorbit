"""
SKILLORBIT - Career Roles & Benchmarks Database
Defines industry-standard competencies, skill requirements, importance weights,
and structured question banks for modern tech roles.
"""

ROLES_CATALOG = {
    "frontend-engineer": {
        "id": "frontend-engineer",
        "title": "Frontend Engineer",
        "category": "Software Engineering",
        "level": "Associate to Mid-Level",
        "tagline": "Architect fluid, accessible, and high-performance user interfaces.",
        "description": "Responsible for designing and implementing responsive web client architectures, complex state flows, design systems, and web performance optimization.",
        "median_salary": "$115,000",
        "market_demand": "High (94th percentile)",
        "skills": [
            {"name": "JavaScript (ES6+)", "category": "Languages", "weight": "essential", "benchmark": 90, "description": "Prototypes, closures, event loops, async/await, memory management"},
            {"name": "TypeScript", "category": "Languages", "weight": "essential", "benchmark": 85, "description": "Generics, union types, strict null checks, utility types, declaration files"},
            {"name": "React.js", "category": "Frameworks", "weight": "essential", "benchmark": 90, "description": "Hooks, concurrent rendering, context API, custom hooks, reconciliation"},
            {"name": "HTML5 & Semantic Web", "category": "Foundations", "weight": "essential", "benchmark": 95, "description": "ARIA roles, accessibility (a11y), semantic markup, DOM traversal"},
            {"name": "CSS3 & Modern Layouts", "category": "Foundations", "weight": "essential", "benchmark": 90, "description": "Flexbox, CSS Grid, custom properties, responsive design, animations"},
            {"name": "Tailwind CSS", "category": "Frameworks", "weight": "recommended", "benchmark": 80, "description": "Utility-first design systems, configuration, JIT compiler, responsive modifiers"},
            {"name": "State Management (Redux/Zustand)", "category": "Architecture", "weight": "recommended", "benchmark": 80, "description": "Immutable state flow, selectors, middleware, async thunks"},
            {"name": "Web Performance Optimization", "category": "Architecture", "weight": "essential", "benchmark": 85, "description": "Core Web Vitals, code splitting, memoization, lazy loading, bundle analysis"},
            {"name": "REST & GraphQL APIs", "category": "Integration", "weight": "essential", "benchmark": 85, "description": "HTTP status codes, caching (TanStack Query/SWR), pagination, optimistic UI"},
            {"name": "Client-Side Testing (Jest/RTL)", "category": "Testing", "weight": "recommended", "benchmark": 75, "description": "Unit testing, integration testing, mocking network requests, user-event"},
            {"name": "Build Tools (Vite/Webpack)", "category": "Tooling", "weight": "recommended", "benchmark": 75, "description": "Bundling, hot module replacement, environment configs, tree-shaking"},
            {"name": "Git & Collaborative CI/CD", "category": "Tooling", "weight": "essential", "benchmark": 85, "description": "Branching strategies, PR reviews, merge conflict resolution, CI workflows"}
        ],
        "questions": [
            {
                "id": "fe-q1",
                "title": "React Re-rendering & Performance Optimization",
                "category": "Technical",
                "difficulty": "Intermediate",
                "target_skill": "React.js",
                "prompt": "How does React's reconciliation algorithm work, and what specific techniques would you employ to identify and eliminate unnecessary re-renders in a high-frequency dashboard application?",
                "rubric_keywords": ["virtual dom", "reconciliation", "fiber", "usememo", "usecallback", "react.memo", "keys", "profiler", "render phase", "commit phase"],
                "ideal_answer_points": [
                    "Explain the Virtual DOM diffing heuristic (O(n) assumptions: different types produce different trees, keys identify child uniqueness across renders).",
                    "Detail profiling strategies using React DevTools Profiler to locate re-render bottlenecks and flamegraphs.",
                    "Explain proper state collocation, pushing state down to prevent lifting re-renders to the entire tree.",
                    "Discuss targeted memoization with React.memo, useMemo, and useCallback, highlighting the overhead cost and when NOT to overuse them."
                ]
            },
            {
                "id": "fe-q2",
                "title": "JavaScript Event Loop & Concurrency",
                "category": "Technical",
                "difficulty": "Intermediate",
                "target_skill": "JavaScript (ES6+)",
                "prompt": "Explain how the JavaScript Event Loop coordinates execution between the Call Stack, Web APIs, Microtask Queue, and Macrotask Queue. What happens when a Promise resolves versus a setTimeout callback?",
                "rubric_keywords": ["call stack", "event loop", "microtask", "macrotask", "promise", "settimeout", "queue", "single-threaded", "non-blocking"],
                "ideal_answer_points": [
                    "Clarify that JavaScript is single-threaded; asynchronous behavior is powered by runtime APIs and queues.",
                    "Contrast Microtask queue (Promises, queueMicrotask, MutationObserver) with Macrotask queue (setTimeout, setInterval, I/O, UI rendering).",
                    "Emphasize priority: the microtask queue is drained completely before the event loop pulls the next macrotask or paints.",
                    "Demonstrate how an infinite microtask recursion will starve rendering and freeze the browser window."
                ]
            },
            {
                "id": "fe-q3",
                "title": "Web Accessibility & Inclusive Architecture",
                "category": "Architecture",
                "difficulty": "Foundational",
                "target_skill": "HTML5 & Semantic Web",
                "prompt": "Walk through how you design an accessible modal dialog from scratch. What keyboard interaction patterns, ARIA attributes, and focus traps are necessary to comply with WCAG 2.1 AA?",
                "rubric_keywords": ["aria-modal", "role=\"dialog\"", "focus trap", "tabindex", "escape key", "aria-labelledby", "screen reader", "wcag", "restoring focus"],
                "ideal_answer_points": [
                    "Identify semantic containers with role='dialog' or <dialog>, aria-modal='true', aria-labelledby, and aria-describedby.",
                    "Detail keyboard traps: cycling Tab and Shift+Tab within modal boundaries and listening for the Escape key to close.",
                    "Explain focus management: shifting focus to first interactive element upon open, and restoring focus to the triggering button upon close.",
                    "Address background inertia with aria-hidden='true' or inert attribute on non-active root elements."
                ]
            },
            {
                "id": "fe-q4",
                "title": "Production Incident & Cross-Browser Bug Resolution",
                "category": "Behavioral",
                "difficulty": "Applied",
                "target_skill": "Git & Collaborative CI/CD",
                "prompt": "Tell me about a time a frontend release introduced an unexpected bug in production or had severe performance degradation on mobile devices. How did you diagnose, communicate, and resolve it?",
                "rubric_keywords": ["sentry", "monitoring", "root cause", "telemetry", "rollback", "post-mortem", "mobile", "regression", "communication"],
                "ideal_answer_points": [
                    "Structured STAR method (Situation, Task, Action, Result).",
                    "Immediate triage steps: telemetry checking (Sentry/Datadog), assessing severity, and executing an emergency rollback or feature flag kill-switch.",
                    "Root-cause reproduction using network throttling, mobile remote debugging, or device emulation.",
                    "Post-incident remediation: regression testing, automated bundle budget check in CI, and transparent blameless post-mortem."
                ]
            }
        ]
    },
    "backend-engineer": {
        "id": "backend-engineer",
        "title": "Backend Engineer",
        "category": "Software Engineering",
        "level": "Associate to Mid-Level",
        "tagline": "Build resilient APIs, distributed transactional pipelines, and reliable microservices.",
        "description": "Responsible for designing scalable server applications, relational & document datastores, concurrency handling, API contracts, caching layers, and security.",
        "median_salary": "$122,000",
        "market_demand": "Very High (96th percentile)",
        "skills": [
            {"name": "Python / Node.js / Go", "category": "Languages", "weight": "essential", "benchmark": 90, "description": "Core paradigms, concurrency models, memory profiling, package ecosystems"},
            {"name": "RESTful API Design", "category": "Architecture", "weight": "essential", "benchmark": 90, "description": "HTTP semantics, idempotency, OpenAPI specifications, rate limiting, versioning"},
            {"name": "Relational Databases (PostgreSQL/MySQL)", "category": "Data", "weight": "essential", "benchmark": 90, "description": "ACID transactions, indexing strategies (B-tree), EXPLAIN query plans, migrations"},
            {"name": "NoSQL Systems (MongoDB/Redis)", "category": "Data", "weight": "recommended", "benchmark": 80, "description": "Key-value caching, document models, TTL expiry, pub/sub, cache invalidation"},
            {"name": "Data Modeling & Normalization", "category": "Data", "weight": "essential", "benchmark": 85, "description": "1NF to 3NF, denormalization tradeoffs, foreign key constraints, ER diagrams"},
            {"name": "Authentication & Authorization (OAuth/JWT)", "category": "Security", "weight": "essential", "benchmark": 85, "description": "Token rotation, RBAC, HMAC signatures, salted hashing (bcrypt), CSRF protection"},
            {"name": "Asynchronous Processing & Message Queues", "category": "Architecture", "weight": "recommended", "benchmark": 80, "description": "RabbitMQ, Kafka, Celery, dead letter queues, at-least-once delivery"},
            {"name": "System Scalability & Caching", "category": "Architecture", "weight": "recommended", "benchmark": 80, "description": "Cache-aside pattern, CDN caching, horizontal scaling, load balancers"},
            {"name": "Automated Unit & Integration Testing", "category": "Testing", "weight": "essential", "benchmark": 80, "description": "Pytest/Mocha, database fixtures, mock services, test coverage, test-driven dev"},
            {"name": "Docker & Containerization", "category": "DevOps", "weight": "recommended", "benchmark": 75, "description": "Dockerfile optimization, multi-stage builds, docker-compose orchestration"},
            {"name": "Observability (Logging & Metrics)", "category": "DevOps", "weight": "recommended", "benchmark": 75, "description": "Structured JSON logging, Prometheus metrics, distributed tracing, latency p99"},
            {"name": "Git & Linux CLI", "category": "Tooling", "weight": "essential", "benchmark": 85, "description": "Shell scripting, process management (systemd/pm2), SSH, permissions, piping"}
        ],
        "questions": [
            {
                "id": "be-q1",
                "title": "Database Indexing & Query Latency Optimization",
                "category": "Technical",
                "difficulty": "Intermediate",
                "target_skill": "Relational Databases (PostgreSQL/MySQL)",
                "prompt": "An endpoint that filters transactions by user ID and date range has degraded from 30ms to 4.5 seconds under load. How would you analyze the query plan with EXPLAIN ANALYZE and design an optimal compound index?",
                "rubric_keywords": ["explain analyze", "sequential scan", "index scan", "composite index", "b-tree", "cardinality", "selectivity", "execution plan"],
                "ideal_answer_points": [
                    "Explain inspecting EXPLAIN (ANALYZE, BUFFERS) to detect Seq Scans, temporary disk spills, or high buffer reads.",
                    "Explain compound index ordering: equality predicates first (user_id) followed by range predicates (date_range) based on selectivity.",
                    "Discuss index maintenance tradeoffs: write overhead on inserts/updates and index size in memory.",
                    "Mention covering indexes (INCLUDE clause) to avoid heap fetches altogether when necessary."
                ]
            },
            {
                "id": "be-q2",
                "title": "Cache Invalidation & Distributed Consistency",
                "category": "Architecture",
                "difficulty": "Intermediate",
                "target_skill": "NoSQL Systems (MongoDB/Redis)",
                "prompt": "Explain the Cache-Aside pattern. How do you prevent cache thundering herd (stampede), handle cache penetration with bloom filters, and ensure stale data is not served when concurrent updates occur?",
                "rubric_keywords": ["cache-aside", "cache stampede", "mutex lock", "bloom filter", "ttl", "stale data", "concurrency", "redis", "invalidation"],
                "ideal_answer_points": [
                    "Walk through Cache-Aside workflow: read cache -> on miss, read DB -> populate cache -> return.",
                    "Mitigating cache stampede with distributed mutex/locks or probabilistic early expiration (XFetch).",
                    "Defending against cache penetration (querying non-existent IDs) using Bloom filters or caching null results with short TTL.",
                    "Handling race conditions on concurrent writes: delete cache after DB commit rather than updating cache directly."
                ]
            },
            {
                "id": "be-q3",
                "title": "Idempotency & Safe Distributed API Payments",
                "category": "Technical",
                "difficulty": "Advanced",
                "target_skill": "RESTful API Design",
                "prompt": "How do you design a payment or billing endpoint to guarantee idempotency in the face of mobile network timeouts, client retries, and double submissions?",
                "rubric_keywords": ["idempotency key", "header", "database transaction", "unique constraint", "distributed lock", "retry", "in-flight", "200 vs 409"],
                "ideal_answer_points": [
                    "Introduce Idempotency-Key headers generated by client (UUID v4).",
                    "Atomic reservation in store: check if key exists; if processed, return cached payload; if in-progress, return 409 Conflict.",
                    "Execute business logic inside a strict database transaction with unique idempotency_key constraint.",
                    "Save result payload upon successful completion and release in-flight state with appropriate TTL."
                ]
            }
        ]
    },
    "fullstack-engineer": {
        "id": "fullstack-engineer",
        "title": "Full Stack Engineer",
        "category": "Software Engineering",
        "level": "Associate to Mid-Level",
        "tagline": "Connect seamless frontend user experiences with robust backend architectures.",
        "description": "Bridges end-to-end software development from interactive client interfaces to server APIs, databases, authentication, and continuous deployment.",
        "median_salary": "$120,000",
        "market_demand": "Extremely High (98th percentile)",
        "skills": [
            {"name": "TypeScript / Modern JS", "category": "Languages", "weight": "essential", "benchmark": 90, "description": "End-to-end type safety, shared DTOs, interfaces, asynchronous programming"},
            {"name": "React.js / Next.js", "category": "Frontend", "weight": "essential", "benchmark": 90, "description": "SSR, SSG, client components, routing, responsive design, state management"},
            {"name": "Node.js / Express / Python", "category": "Backend", "weight": "essential", "benchmark": 85, "description": "REST endpoints, middleware chains, async handlers, stream processing"},
            {"name": "SQL & Relational Databases", "category": "Data", "weight": "essential", "benchmark": 85, "description": "Schema design, joins, migrations, Prisma/SQLAlchemy ORMs, transactions"},
            {"name": "API Design & Integration", "category": "Architecture", "weight": "essential", "benchmark": 85, "description": "REST principles, OpenAPI/Swagger, webhook integration, error normalization"},
            {"name": "Authentication (JWT & Sessions)", "category": "Security", "weight": "essential", "benchmark": 80, "description": "HttpOnly cookies, bearer tokens, OAuth social logins, session management"},
            {"name": "Tailwind CSS & Component UI", "category": "Frontend", "weight": "recommended", "benchmark": 85, "description": "Responsive layout, accessibility, design tokens, micro-interactions"},
            {"name": "Docker & Basic Deployment", "category": "DevOps", "weight": "recommended", "benchmark": 75, "description": "Containerizing apps, environment variables, cloud deployment (Vercel/Render/AWS)"},
            {"name": "End-to-End & Unit Testing", "category": "Testing", "weight": "recommended", "benchmark": 75, "description": "Testing frontend components and backend endpoints, mocks, integration tests"},
            {"name": "Git & CI/CD Pipelines", "category": "Tooling", "weight": "essential", "benchmark": 85, "description": "GitHub Actions, automated test suites, pull request workflows, semver"}
        ],
        "questions": [
            {
                "id": "fs-q1",
                "title": "End-to-End Type Safety & Data Synchronization",
                "category": "Architecture",
                "difficulty": "Intermediate",
                "target_skill": "TypeScript / Modern JS",
                "prompt": "How do you enforce type safety across the boundary between frontend and backend in a modern web application? How do you prevent frontend breaking when backend contracts change?",
                "rubric_keywords": ["contract", "openapi", "trpc", "zod", "dto", "type generation", "validation", "schema", "versioning"],
                "ideal_answer_points": [
                    "Discuss contract sharing methods: tRPC monorepos, OpenAPI schema generation, or shared npm packages containing Zod/Pydantic schemas.",
                    "Explain runtime schema validation on both incoming requests and outgoing payloads to avoid trusting unknown external data.",
                    "Address versioning strategies (URI versioning or backward-compatible additive changes) to avoid breaking existing clients.",
                    "Highlight CI checks that catch API contract drift before merges."
                ]
            },
            {
                "id": "fs-q2",
                "title": "Optimistic UI Updates & Error Rollbacks",
                "category": "Technical",
                "difficulty": "Intermediate",
                "target_skill": "React.js / Next.js",
                "prompt": "Describe how you implement an optimistic UI update for an interactive feature like a 'Like' button or a kanban board drag-and-drop, including error recovery if the server request fails.",
                "rubric_keywords": ["optimistic ui", "tanstack query", "cache rollback", "snapshot", "reconciliation", "user feedback", "toast error"],
                "ideal_answer_points": [
                    "Explain the concept of updating local UI immediately before server acknowledgment to deliver zero perceived latency.",
                    "Snapshot previous state before mutation.",
                    "On server error, roll back local cache state to snapshot and notify user via subtle feedback/toast.",
                    "Explain onSettled re-fetching to guarantee authoritative synchronization with server state."
                ]
            }
        ]
    },
    "machine-learning-engineer": {
        "id": "machine-learning-engineer",
        "title": "Machine Learning & AI Engineer",
        "category": "Data & AI",
        "level": "Associate to Mid-Level",
        "tagline": "Develop predictive models, fine-tune neural architectures, and deploy LLM applications.",
        "description": "Designs, trains, evaluates, and productionizes machine learning pipelines, NLP/CV models, and generative AI agents with strict quality and latency benchmarks.",
        "median_salary": "$135,000",
        "market_demand": "Extremely High (97th percentile)",
        "skills": [
            {"name": "Python & Scientific Stack", "category": "Languages", "weight": "essential", "benchmark": 95, "description": "NumPy array vectorization, Pandas dataframes, SciPy numerical analysis"},
            {"name": "PyTorch / TensorFlow", "category": "Deep Learning", "weight": "essential", "benchmark": 90, "description": "Autograd, tensor transformations, custom loss functions, training loops"},
            {"name": "Machine Learning Fundamentals", "category": "Foundations", "weight": "essential", "benchmark": 90, "description": "Bias-variance tradeoff, cross-validation, regularization, loss optimization"},
            {"name": "LLMs & RAG Architectures", "category": "GenAI", "weight": "essential", "benchmark": 85, "description": "Vector embeddings, chunking strategies, hybrid search, prompt engineering"},
            {"name": "Feature Engineering & Preprocessing", "category": "Data", "weight": "essential", "benchmark": 85, "description": "Normalization, encoding, imputation, dimensionality reduction (PCA)"},
            {"name": "Model Evaluation & Metrics", "category": "Validation", "weight": "essential", "benchmark": 90, "description": "ROC-AUC, precision-recall curve, F1-score, perplexity, BLEU/ROUGE"},
            {"name": "Vector Databases (Milvus/Pinecone/Chroma)", "category": "GenAI", "weight": "recommended", "benchmark": 80, "description": "HNSW indexing, cosine similarity, metadata filtering, chunk retrieval"},
            {"name": "Model Deployment & Serving", "category": "MLOps", "weight": "recommended", "benchmark": 75, "description": "ONNX runtime, FastAPI inference endpoints, batching, GPU latency tuning"},
            {"name": "Git & Experiment Tracking", "category": "MLOps", "weight": "recommended", "benchmark": 80, "description": "Weights & Biases, MLflow, reproducibility, dataset versioning"}
        ],
        "questions": [
            {
                "id": "ml-q1",
                "title": "RAG Chunking & Retrieval Precision Optimization",
                "category": "Technical",
                "difficulty": "Intermediate",
                "target_skill": "LLMs & RAG Architectures",
                "prompt": "How do you evaluate and optimize a Retrieval-Augmented Generation (RAG) system when the model returns hallucinations due to poor context retrieval? Detail your chunking, re-ranking, and retrieval strategy.",
                "rubric_keywords": ["rag", "chunk size", "overlap", "hybrid search", "bm25", "dense embeddings", "re-ranking", "cross-encoder", "hallucination", "ragas"],
                "ideal_answer_points": [
                    "Identify failure modes: retrieval recall failure vs generation hallucination using frameworks like RAGAS (faithfulness, answer relevancy).",
                    "Optimize chunking strategy: contextual chunking, sliding windows with 10-20% overlap, or semantic chunking.",
                    "Implement Hybrid Search: combining sparse lexical search (BM25) with dense semantic embeddings to catch exact product IDs and conceptual matches.",
                    "Apply a cross-encoder Re-ranker (Cohere/BGE-Reranker) on top-k candidates to maximize precision before feeding prompt context."
                ]
            },
            {
                "id": "ml-q2",
                "title": "Imbalanced Data & Metric Selection",
                "category": "Foundations",
                "difficulty": "Intermediate",
                "target_skill": "Model Evaluation & Metrics",
                "prompt": "You are building a fraud detection model where only 0.2% of transactions are fraudulent. Why is accuracy a misleading metric, and how would you tune decision thresholds using Precision-Recall curves?",
                "rubric_keywords": ["class imbalance", "accuracy paradox", "precision-recall", "f1-score", "pr-auc", "threshold tuning", "cost matrix", "smote", "focal loss"],
                "ideal_answer_points": [
                    "Explain the Accuracy Paradox (a dummy model predicting negative achieves 99.8% accuracy while failing entirely).",
                    "Argue why PR-AUC is superior to ROC-AUC on heavy class imbalances because true negatives don't inflate the denominator.",
                    "Discuss business cost matrix: weighing False Positives (user friction) against False Negatives (fraud losses).",
                    "Explain algorithmic mitigations: class-weighted loss, Focal Loss, or stratified cross-validation."
                ]
            }
        ]
    },
    "data-analyst": {
        "id": "data-analyst",
        "title": "Data Analyst",
        "category": "Data & Analytics",
        "level": "Associate to Mid-Level",
        "tagline": "Extract actionable business intelligence from complex corporate datasets.",
        "description": "Translates raw tabular data into intuitive visual dashboards, executive summaries, predictive trends, and data-driven business decisions.",
        "median_salary": "$88,000",
        "market_demand": "High (89th percentile)",
        "skills": [
            {"name": "Advanced SQL", "category": "Data", "weight": "essential", "benchmark": 90, "description": "Window functions (ROW_NUMBER, LAG), CTEs, aggregations, joins, subqueries"},
            {"name": "Python / Pandas", "category": "Analysis", "weight": "essential", "benchmark": 85, "description": "Data wrangling, cleaning, pivot tables, exploratory data analysis"},
            {"name": "Data Visualization & Storytelling", "category": "BI", "weight": "essential", "benchmark": 90, "description": "Chart selection, cognitive load minimization, visual hierarchy, dashboard design"},
            {"name": "Business Intelligence (Power BI/Tableau)", "category": "BI", "weight": "recommended", "benchmark": 85, "description": "DAX calculations, calculated fields, dashboard interactivity, automated refreshes"},
            {"name": "Statistical Analysis & A/B Testing", "category": "Statistics", "weight": "essential", "benchmark": 80, "description": "Hypothesis testing, p-values, sample size determination, confidence intervals"},
            {"name": "Spreadsheet Modeling (Excel/Sheets)", "category": "Tools", "weight": "essential", "benchmark": 85, "description": "VLOOKUP/XLOOKUP, INDEX-MATCH, scenario analysis, pivot tables"}
        ],
        "questions": [
            {
                "id": "da-q1",
                "title": "SQL Window Functions & Cohort Retention",
                "category": "Technical",
                "difficulty": "Intermediate",
                "target_skill": "Advanced SQL",
                "prompt": "Write or explain the SQL logic required to calculate user retention by monthly cohort. How do you use Window Functions like LAG or ROW_NUMBER to calculate month-over-month revenue growth?",
                "rubric_keywords": ["window function", "lag", "row_number", "over partition by", "cohort", "retention", "date_trunc", "cte"],
                "ideal_answer_points": [
                    "Define user acquisition month using DATE_TRUNC('month', first_activity_date) as cohort base.",
                    "Join subsequent activity months to count distinct active users in month 1, month 2, etc.",
                    "Explain LAG(revenue, 1) OVER (ORDER BY month) to compute relative percentage delta for growth.",
                    "Emphasize clear CTE structuring for readability and auditability."
                ]
            }
        ]
    },
    "cloud-devops-engineer": {
        "id": "cloud-devops-engineer",
        "title": "Cloud & DevOps Engineer",
        "category": "Infrastructure & Cloud",
        "level": "Associate to Mid-Level",
        "tagline": "Automate cloud infrastructure, ensure zero-downtime deployments, and maintain 99.99% uptime.",
        "description": "Oversees continuous integration, infrastructure as code (IaC), container orchestration, cloud security, and cluster observability.",
        "median_salary": "$128,000",
        "market_demand": "High (92nd percentile)",
        "skills": [
            {"name": "Linux & Bash Scripting", "category": "Foundations", "weight": "essential", "benchmark": 90, "description": "Kernel parameters, cron jobs, file systems, network inspection (curl/netstat)"},
            {"name": "Cloud Providers (AWS / GCP / Azure)", "category": "Cloud", "weight": "essential", "benchmark": 85, "description": "VPCs, IAM policies, security groups, S3, compute instances, serverless"},
            {"name": "Docker & Container Orchestration", "category": "Containers", "weight": "essential", "benchmark": 90, "description": "Dockerfiles, layer caching, Kubernetes pods/deployments/services/ingress"},
            {"name": "Infrastructure as Code (Terraform)", "category": "IaC", "weight": "essential", "benchmark": 85, "description": "State management, modules, declarative HCL, remote backends, drift detection"},
            {"name": "CI/CD Pipelines (GitHub Actions/GitLab)", "category": "Automation", "weight": "essential", "benchmark": 85, "description": "Automated linting, testing, semantic tagging, artifact promotion, rollbacks"},
            {"name": "Monitoring & Incident Response", "category": "Observability", "weight": "recommended", "benchmark": 80, "description": "Grafana, Prometheus alertmanager, log aggregation, SLOs/SLAs"}
        ],
        "questions": [
            {
                "id": "devops-q1",
                "title": "Zero-Downtime Deployment & Kubernetes Rollouts",
                "category": "Architecture",
                "difficulty": "Intermediate",
                "target_skill": "Docker & Container Orchestration",
                "prompt": "Compare Rolling Updates, Blue/Green Deployments, and Canary Deployments. How do you configure readiness probes in Kubernetes to avoid traffic hitting uninitialized containers?",
                "rubric_keywords": ["rolling update", "blue green", "canary", "readiness probe", "liveness probe", "service mesh", "traffic splitting", "zero downtime"],
                "ideal_answer_points": [
                    "Compare tradeoff: Blue/Green (instant rollback, 2x resource cost) vs Canary (low risk traffic sampling, complex routing) vs Rolling (gradual pod replacement).",
                    "Explain Kubernetes readiness probes: Kubernetes routes traffic only after the probe returns HTTP 200.",
                    "Differentiate readiness probe (traffic routing) from liveness probe (pod restart on deadlock).",
                    "Explain termination lifecycle: SIGTERM handling and preStop hooks to drain in-flight connections gracefully."
                ]
            }
        ]
    },
    "product-manager": {
        "id": "product-manager",
        "title": "Technical Product Manager",
        "category": "Product & Strategy",
        "level": "Associate to Mid-Level",
        "tagline": "Define product strategy, translate user needs into technical roadmaps, and ship high-impact features.",
        "description": "Aligns cross-functional engineering, design, and business teams to discover high-value problems, define PRDs, and guide iterative delivery.",
        "median_salary": "$125,000",
        "market_demand": "High (90th percentile)",
        "skills": [
            {"name": "Product Strategy & Vision", "category": "Strategy", "weight": "essential", "benchmark": 85, "description": "Value proposition, market analysis, competitor differentiation, roadmaps"},
            {"name": "PRD Writing & User Stories", "category": "Execution", "weight": "essential", "benchmark": 90, "description": "Acceptance criteria, edge cases, scope definition, non-functional requirements"},
            {"name": "Product Analytics & Metric Design", "category": "Analytics", "weight": "essential", "benchmark": 85, "description": "North Star metric, funnel drop-off, cohort retention, leading vs lagging KPIs"},
            {"name": "User Research & Discovery", "category": "Design", "weight": "recommended", "benchmark": 80, "description": "Customer interviews, usability tests, persona synthesis, problem validation"},
            {"name": "Technical Fluency & Architecture Awareness", "category": "Technical", "weight": "recommended", "benchmark": 75, "description": "Understanding APIs, database constraints, technical debt, engineering tradeoffs"}
        ],
        "questions": [
            {
                "id": "pm-q1",
                "title": "Product Metrics & Drop-off Triage",
                "category": "Analytical",
                "difficulty": "Intermediate",
                "target_skill": "Product Analytics & Metric Design",
                "prompt": "The onboarding conversion rate for our mobile application dropped by 18% over the past two weeks after a release. Walk me through your step-by-step investigation and prioritization process.",
                "rubric_keywords": ["funnel drop-off", "segmentation", "cohorts", "telemetry", "release notes", "reproduction", "stakeholders", "prioritization"],
                "ideal_answer_points": [
                    "Step 1: Metric validation & sanity check (is telemetry broken vs real drop-off).",
                    "Step 2: Segmentation analysis (isolate by OS version, app build, geography, traffic acquisition source, device model).",
                    "Step 3: Funnel stage pinpointing (identify exact onboarding screen where drop-off accelerated).",
                    "Step 4: Coordinate with engineering on crash logs and UX heatmaps, roll back if critical, or deploy hotfix."
                ]
            }
        ]
    },
    "cyber-security-analyst": {
        "id": "cyber-security-analyst",
        "title": "Cyber Security Analyst",
        "category": "Security & Defense",
        "level": "Associate to Mid-Level",
        "tagline": "Defend networks, detect vulnerabilities, and safeguard confidential data from threats.",
        "description": "Focuses on threat detection, vulnerability assessments, security compliance, incident triage, and secure software development practices.",
        "median_salary": "$110,000",
        "market_demand": "High (93rd percentile)",
        "skills": [
            {"name": "Network Security & Protocols", "category": "Foundations", "weight": "essential", "benchmark": 85, "description": "TCP/IP stack, DNS, SSL/TLS handshakes, packet analysis with Wireshark"},
            {"name": "Application Security (OWASP Top 10)", "category": "AppSec", "weight": "essential", "benchmark": 90, "description": "SQL injection, XSS, CSRF, SSRF, broken access control, secure headers"},
            {"name": "Vulnerability Assessment & Pen Testing", "category": "Defense", "weight": "essential", "benchmark": 80, "description": "Nmap scanning, Burp Suite, vulnerability scanners, CVSS scoring"},
            {"name": "Incident Response & SIEM", "category": "Operations", "weight": "recommended", "benchmark": 80, "description": "Log correlation, SOC triage workflows, threat hunting, IOC indicators"},
            {"name": "Identity & Access Management (IAM)", "category": "Operations", "weight": "essential", "benchmark": 85, "description": "Principle of least privilege, MFA, role-based access, credential hygiene"}
        ],
        "questions": [
            {
                "id": "sec-q1",
                "title": "OWASP Top 10 & Server-Side Request Forgery (SSRF)",
                "category": "Technical",
                "difficulty": "Intermediate",
                "target_skill": "Application Security (OWASP Top 10)",
                "prompt": "Explain what a Server-Side Request Forgery (SSRF) vulnerability is, how an attacker can leverage it against cloud metadata endpoints (like AWS 169.254.169.254), and how you defend against it.",
                "rubric_keywords": ["ssrf", "cloud metadata", "169.254.169.254", "internal network", "allowlist", "imdsv2", "egress filtering", "defense in depth"],
                "ideal_answer_points": [
                    "Define SSRF: attacker coerces server into sending crafted HTTP requests to unintended destinations (internal services, loopback, or metadata services).",
                    "Explain cloud risk: querying 169.254.169.254 to retrieve temporary IAM role credentials and security tokens.",
                    "Mitigation 1: Enforce IMDSv2 (requires session token via PUT before token retrieval, preventing SSRF).",
                    "Mitigation 2: Strict URL allowlisting, rejecting private IP ranges (RFC 1918), and egress firewall restrictions."
                ]
            }
        ]
    }
}

def get_role(role_id):
    return ROLES_CATALOG.get(role_id)

def list_roles():
    return [
        {
            "id": r["id"],
            "title": r["title"],
            "category": r["category"],
            "level": r["level"],
            "tagline": r["tagline"],
            "description": r["description"],
            "median_salary": r["median_salary"],
            "market_demand": r["market_demand"],
            "skill_count": len(r["skills"]),
            "question_count": len(r["questions"])
        }
        for r in ROLES_CATALOG.values()
    ]
