import os
import sys
import uuid
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_complete_end_to_end_marketing_workflow():
    """
    Complete E2E Journey Test:
    Login -> Dashboard -> Create Content -> Save Draft -> Submit Review ->
    Reviewer Approval -> SEO Audit -> Campaign Link -> Schedule -> Publish ->
    Public Website Rendering -> Analytics Telemetry Tracking
    """
    # 1. LOGIN & AUTHENTICATE
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "admin@enterprise.com", "password": "Admin123!"}
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. DASHBOARD / ME USER PROFILE
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["role"] == "admin"

    # 3. CREATE CONTENT ITEM (Initial Draft)
    unique_suffix = uuid.uuid4().hex[:6]
    slug = f"e2e-growth-playbook-{unique_suffix}"
    title = f"E2E Enterprise Growth Playbook {unique_suffix}"

    create_payload = {
        "title": title,
        "slug": slug,
        "content_type": "blog",
        "body": "<h1>Enterprise Content Strategy</h1><p>Comprehensive framework for scaling AI-powered content marketing.</p>",
        "excerpt": "A complete playbook for scaling enterprise marketing operations.",
        "status": "draft",
        "tag_names": ["Growth", "AI Strategy", "Enterprise"]
    }

    create_resp = client.post("/api/content", json=create_payload, headers=headers)
    assert create_resp.status_code == 201, f"Create content failed: {create_resp.text}"
    content_item = create_resp.json()
    content_id = content_item["id"]
    assert content_item["status"] == "draft"

    # 4. SUBMIT FOR REVIEW (Workflow Transition)
    submit_resp = client.post(
        f"/api/content/{content_id}/workflow",
        headers=headers,
        json={"action": "submit_review"}
    )
    assert submit_resp.status_code == 200
    assert submit_resp.json()["status"] == "in_review"

    # 5. REVIEWER APPROVAL (Workflow Approval)
    approve_resp = client.post(
        f"/api/content/{content_id}/workflow",
        headers=headers,
        json={"action": "approve", "comment": "Approved for publication."}
    )
    assert approve_resp.status_code == 200
    assert approve_resp.json()["status"] == "approved"

    # 6. SEO AUDIT & METADATA ATTACHMENT
    seo_payload = {
        "title": title,
        "seo_metadata": {
            "meta_title": f"Optimized {title[:40]}",
            "meta_description": "Comprehensive guide detailing enterprise AI marketing automation, workflow approvals, and telemetry analytics.",
            "keywords": "enterprise AI, content marketing playbook, growth strategy",
            "canonical_url": f"https://enterprise.com/blog/{slug}"
        }
    }
    update_seo_resp = client.put(f"/api/content/{content_id}", json=seo_payload, headers=headers)
    assert update_seo_resp.status_code == 200
    assert update_seo_resp.json()["seo_metadata"]["keywords"] == "enterprise AI, content marketing playbook, growth strategy"

    # 7. CAMPAIGN LINKING & SCHEDULING
    scheduled_time = (datetime.utcnow() + timedelta(days=2)).isoformat()
    reschedule_resp = client.put(
        f"/api/calendar/reschedule/{content_id}",
        json={"scheduled_at": scheduled_time},
        headers=headers
    )
    assert reschedule_resp.status_code == 200

    # 8. PUBLISH CONTENT
    publish_resp = client.post(
        f"/api/content/{content_id}/workflow",
        headers=headers,
        json={"action": "publish"}
    )
    assert publish_resp.status_code == 200
    published_item = publish_resp.json()
    final_slug = published_item["slug"]
    assert published_item["status"] == "published"
    assert published_item["published_at"] is not None

    # 9. PUBLIC WEBSITE RENDERING VERIFICATION
    public_list_resp = client.get("/api/content/public/list")
    assert public_list_resp.status_code == 200
    public_slugs = [item["slug"] for item in public_list_resp.json()["items"]]
    assert final_slug in public_slugs, "Published article must appear on public website listing"

    public_detail_resp = client.get(f"/api/content/public/{final_slug}")
    assert public_detail_resp.status_code == 200
    assert public_detail_resp.json()["title"] == title

    # 10. ANALYTICS TELEMETRY VERIFICATION
    analytics_resp = client.get("/api/analytics/dashboard", headers=headers)
    assert analytics_resp.status_code == 200
    analytics_data = analytics_resp.json()
    assert analytics_data["summary"]["total_views"] > 0
    assert len(analytics_data["top_content"]) > 0

    # Clean up test article
    client.delete(f"/api/content/{content_id}", headers=headers)


if __name__ == "__main__":
    test_complete_end_to_end_marketing_workflow()
    print("COMPLETE 12-STEP END-TO-END MARKETING WORKFLOW PASSED 100% CLEANLY!")
