import sys
import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api"
FRONTEND_URL = "http://localhost:5173"

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    
    req_data = None
    if data:
        req_data = json.dumps(data).encode('utf-8')
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode('utf-8')
            return resp.status, json.loads(body) if body and "json" in resp.headers.get_content_type() else (resp.status, body)
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, body
    except Exception as e:
        return 500, str(e)

def run_qa():
    print("====================================================")
    print("         KALAM CMS - LIVE E2E QA TEST SUITE         ")
    print("====================================================\n")

    passed_tests = 0
    total_tests = 0

    def assert_test(name, condition, details=""):
        nonlocal passed_tests, total_tests
        total_tests += 1
        if condition:
            passed_tests += 1
            print(f"[PASS] {name}")
        else:
            print(f"[FAIL] {name} - {details}")

    # 1. Health & Frontend Root check
    status, res = make_request(f"{BASE_URL}/health")
    assert_test("API Health Endpoint", status == 200 and res.get("status") == "ok", f"Status: {status}, Response: {res}")

    status, html = make_request(FRONTEND_URL)
    assert_test("Frontend Server Loading", status == 200 and "KALAM" in str(html), f"Status: {status}")

    # 2. Authentication Tests
    # Invalid password login
    status, res = make_request(f"{BASE_URL}/auth/login", method="POST", data={"email": "admin@enterprise.com", "password": "WrongPassword!"})
    assert_test("Auth - Reject Invalid Password", status == 401, f"Status: {status}")

    # Admin Login
    status, admin_auth = make_request(f"{BASE_URL}/auth/login", method="POST", data={"email": "admin@enterprise.com", "password": "Admin123!"})
    assert_test("Auth - Admin Login", status == 200 and "access_token" in admin_auth, f"Status: {status}, Res: {admin_auth}")
    admin_token = admin_auth.get("access_token") if isinstance(admin_auth, dict) else None
    admin_headers = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}

    # Unauthenticated Protected Access Reject
    status, res = make_request(f"{BASE_URL}/auth/me")
    assert_test("Auth - Reject Unauthenticated Access", status == 401, f"Status: {status}")

    # Authenticated Profile Retrieve
    status, user_info = make_request(f"{BASE_URL}/auth/me", headers=admin_headers)
    assert_test("Auth - Get User Profile & Roles", status == 200 and user_info.get("role") == "admin", f"Status: {status}")

    # 3. Content Management & Workflow Tests
    create_data = {
        "title": "QA Test Article on Enterprise AI Copywriting",
        "slug": "qa-test-article-enterprise-ai-copywriting",
        "content_type": "blog",
        "body": "# QA Heading\n\nThis is a QA test content body evaluating KALAM editorial features.",
        "excerpt": "Evaluating KALAM editorial workflow.",
        "meta_title": "QA Test Article on Enterprise AI Copywriting",
        "meta_description": "Comprehensive QA test content evaluating KALAM editorial workflow.",
        "keywords": "AI, Copywriting, Marketing"
    }
    status, content_res = make_request(f"{BASE_URL}/content", method="POST", data=create_data, headers=admin_headers)
    assert_test("Content - Create Article", status in (200, 201) and "id" in content_res, f"Status: {status}, Res: {content_res}")
    content_id = content_res.get("id") if isinstance(content_res, dict) else None

    if content_id:
        # Workflow transition: Submit for Review
        status, wf_res = make_request(f"{BASE_URL}/content/{content_id}/workflow", method="POST", data={"action": "submit_for_review", "comment": "Submitting QA draft for editorial review."}, headers=admin_headers)
        assert_test("Workflow - Submit for Review", status == 200 and wf_res.get("status") == "in_review", f"Status: {status}")

        # Workflow transition: Approve
        status, wf_res = make_request(f"{BASE_URL}/content/{content_id}/workflow", method="POST", data={"action": "approve", "comment": "Approved by QA reviewer."}, headers=admin_headers)
        assert_test("Workflow - Approve Content", status == 200 and wf_res.get("status") == "approved", f"Status: {status}")

        # Workflow transition: Publish
        status, wf_res = make_request(f"{BASE_URL}/content/{content_id}/workflow", method="POST", data={"action": "publish"}, headers=admin_headers)
        assert_test("Workflow - Publish Content", status == 200 and wf_res.get("status") == "published", f"Status: {status}")

        # Clean up test content item
        status, del_res = make_request(f"{BASE_URL}/content/{content_id}", method="DELETE", headers=admin_headers)
        assert_test("Content - Delete QA Test Asset", status == 200, f"Status: {status}")

    # Verify Public Content Endpoint
    status, pub_list = make_request(f"{BASE_URL}/content/public/list")
    assert_test("Public Site - Content API Visibility", status == 200 and "items" in pub_list, f"Status: {status}")

    # 4. KALAM AI Studio Features (all 10 actions)
    for ai_act in ["generate_headlines", "generate_meta_description", "rewrite", "change_tone", "summarize", "social_caption", "suggest_keywords", "generate_outline", "generate_cta", "readability_analysis"]:
        ai_data = {"action": ai_act, "prompt": "Optimize this marketing content.", "content": "KALAM provides enterprise marketing teams with AI copywriting tools.", "tone": "Professional"}
        status, ai_res = make_request(f"{BASE_URL}/ai/generate", method="POST", data=ai_data, headers=admin_headers)
        assert_test(f"AI Studio - Action '{ai_act}'", status == 200 and "result" in ai_res, f"Status: {status}, Res: {ai_res}")

    # 5. Marketing Analytics & Calendar
    status, analytics_res = make_request(f"{BASE_URL}/analytics/dashboard", headers=admin_headers)
    assert_test("Analytics - Dashboard Telemetry", status == 200 and "summary" in analytics_res, f"Status: {status}")

    status, cal_events = make_request(f"{BASE_URL}/calendar/events", headers=admin_headers)
    assert_test("Calendar - Publishing Timeline Events", status == 200 and isinstance(cal_events, list), f"Status: {status}")

    print("\n====================================================")
    print(f"       QA SUMMARY: {passed_tests}/{total_tests} TESTS PASSED        ")
    print("====================================================\n")

    if passed_tests == total_tests:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    run_qa()
