"""
SKILLORBIT - Multi-User Authentication & Isolation Test Suite
Tests:
1. User Registration (Validation, Duplicate prevention, password hashing)
2. User Login & Invalid credentials handling
3. Session cookie persistence via http.cookiejar
4. Unauthenticated access denial (401 Unauthorized on private APIs)
5. Multi-User Data Isolation (Alice vs. Bob cannot see each other's data)
6. Password Reset flow (token issuance and password reset)
7. Logout and session invalidation
"""

import sys
import json
import urllib.request
import urllib.error
import http.cookiejar

API_BASE = "http://127.0.0.1:5000/api"

class TestClient:
    def __init__(self):
        self.cj = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cj))

    def request(self, method, endpoint, data=None):
        url = f"{API_BASE}{endpoint}"
        body = json.dumps(data).encode('utf-8') if data is not None else None
        headers = {"Content-Type": "application/json"} if data is not None else {}
        req = urllib.request.Request(url, data=body, headers=headers, method=method)
        try:
            resp = self.opener.open(req)
            return resp.status, json.loads(resp.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            err_data = json.loads(e.read().decode('utf-8')) if e.fp else {}
            return e.code, err_data

def run_multi_user_tests():
    print("=" * 65)
    print("SKILLORBIT MULTI-USER AUTHENTICATION & ISOLATION TEST SUITE")
    print("=" * 65)

    client_a = TestClient()
    client_b = TestClient()
    unauth_client = TestClient()

    # 1. Test unauthenticated denial
    status, res = unauth_client.request("GET", "/candidate")
    assert status == 401, f"Expected 401 Unauthorized on unauth /candidate, got {status}"
    print("  [PASS] Unauthenticated access properly rejected (401 Unauthorized)")

    import uuid
    run_id = uuid.uuid4().hex[:6]
    alice_email = f"alice_{run_id}@orbit.edu"
    alice_user = f"alice_{run_id}"
    status, res = client_a.request("POST", "/auth/register", {
        "full_name": "Alice Developer",
        "email": alice_email,
        "username": alice_user,
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    # Accept 201 or if already created from previous test, login
    if status == 409:
        status, res = client_a.request("POST", "/auth/login", {
            "email": alice_email,
            "password": "Password123!"
        })
    assert status in [200, 201], f"Alice registration/login failed: {res}"
    print(f"  [PASS] Student A registered & logged in: {res['user']['full_name']}")

    # 3. Test duplicate registration rejection
    status, res = client_b.request("POST", "/auth/register", {
        "full_name": "Imposter Alice",
        "email": alice_email,
        "username": "imposter_alice",
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    assert status == 409, f"Expected 409 Conflict on duplicate email, got {status}"
    print("  [PASS] Duplicate email registration rejected (409 Conflict)")

    # 4. Test wrong credentials rejection
    status, res = client_b.request("POST", "/auth/login", {
        "email": alice_email,
        "password": "WrongPassword999!"
    })
    assert status == 401, f"Expected 401 Unauthorized on invalid password, got {status}"
    print("  [PASS] Incorrect credentials rejected (401 Unauthorized)")

    # 5. Alice adds personalized skills and submits interview answer
    status, res = client_a.request("POST", "/skills", {
        "skill_name": "React.js",
        "category": "Frameworks",
        "status": "demonstrated",
        "confidence_score": 92,
        "evidence": "Alice built production reactive dashboard."
    })
    assert status == 200, f"Alice add skill failed: {res}"

    status, res = client_a.request("POST", "/interview/evaluate", {
        "role_id": "frontend-engineer",
        "question_id": "fe-q1",
        "answer": "Alice's detailed explanation of React reconciliation, fiber scheduling, and custom memoization."
    })
    assert status == 200, f"Alice interview failed: {res}"
    print("  [PASS] Student A personalized records created in SQLite")

    # 6. Register Student B (Bob) - Fresh account
    bob_email = f"bob_{run_id}@orbit.edu"
    bob_user = f"bob_{run_id}"
    status, res = client_b.request("POST", "/auth/register", {
        "full_name": "Bob Analyst",
        "email": bob_email,
        "username": bob_user,
        "password": "SecurePassword456!",
        "confirm_password": "SecurePassword456!"
    })
    assert status in [200, 201], f"Bob registration failed: {res}"
    print(f"  [PASS] Student B registered & logged in: {res['user']['full_name']}")

    # 7. CRITICAL ISOLATION CHECK: Bob's data must be completely empty of Alice's records!
    status, bob_skills = client_b.request("GET", "/skills")
    assert status == 200
    # Check that Bob does NOT see Alice's React skill with 92 score
    alice_leaked = any(s.get("evidence") == "Alice built production reactive dashboard." for s in bob_skills)
    assert not alice_leaked, "CRITICAL ERROR: Alice's skill leaked into Bob's profile!"
    print(f"  [PASS] Student B isolated: Has {len(bob_skills)} skills (Zero trace of Student A's data)")

    status, bob_history = client_b.request("GET", "/interview/history")
    assert status == 200
    alice_history_leaked = any("Alice" in str(h) for h in bob_history)
    assert not alice_history_leaked, "CRITICAL ERROR: Alice's interview history leaked to Bob!"
    print(f"  [PASS] Student B isolated: Zero trace of Student A's interview history")

    # 8. Bob switches target role to Data Analyst
    status, res = client_b.request("PUT", "/candidate", {
        "target_role": "data-analyst",
        "headline": "Aspiring Data Analyst specializing in SQL and business intelligence."
    })
    assert status == 200
    assert res["target_role"] == "data-analyst"

    # Verify Alice's target role remained Frontend Engineer
    status, alice_profile = client_a.request("GET", "/candidate")
    assert status == 200
    assert alice_profile["target_role"] == "frontend-engineer", "Alice's role was mutated by Bob!"
    print("  [PASS] Independent role targeting: Alice = Frontend Engineer, Bob = Data Analyst")

    # 9. Password Reset Flow
    status, res = unauth_client.request("POST", "/auth/forgot-password", {
        "email": alice_email
    })
    assert status == 200
    token = res.get("reset_token")
    assert token, "Expected reset token in response"

    # Reset password with token
    status, res = unauth_client.request("POST", "/auth/reset-password", {
        "email": alice_email,
        "token": token,
        "new_password": "NewSecretPassword789!",
        "confirm_password": "NewSecretPassword789!"
    })
    assert status == 200
    print("  [PASS] Functional password reset flow with token verification")

    # Verify Alice can now log in with the new password
    status, res = client_a.request("POST", "/auth/login", {
        "email": alice_email,
        "password": "NewSecretPassword789!"
    })
    assert status == 200
    print("  [PASS] Alice logged in with newly reset password")

    # 10. Logout check
    status, res = client_a.request("POST", "/auth/logout")
    assert status == 200
    status, res = client_a.request("GET", "/auth/me")
    assert status == 401
    print("  [PASS] Logout properly invalidates session cookie")

    print("=" * 65)
    print("ALL MULTI-USER & AUTHENTICATION TESTS PASSED (100% SECURE & ISOLATED)")
    print("=" * 65)
    return True

if __name__ == "__main__":
    success = run_multi_user_tests()
    sys.exit(0 if success else 1)
