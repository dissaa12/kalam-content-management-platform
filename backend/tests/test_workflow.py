import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token(email: str, password: str):
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200
    return res.json()["access_token"]

def test_workflow_permissions_and_state_transitions():
    author_token = get_token("author@enterprise.com", "Author123!")
    reviewer_token = get_token("reviewer@enterprise.com", "Reviewer123!")
    admin_token = get_token("admin@enterprise.com", "Admin123!")

    headers_author = {"Authorization": f"Bearer {author_token}"}
    headers_reviewer = {"Authorization": f"Bearer {reviewer_token}"}
    headers_admin = {"Authorization": f"Bearer {admin_token}"}

    # 1. Author creates draft
    create_res = client.post(
        "/api/content",
        headers=headers_author,
        json={
            "title": "Workflow Security Testing Article",
            "content_type": "blog",
            "body": "Initial draft content for workflow test.",
            "status": "draft"
        }
    )
    assert create_res.status_code == 201
    content = create_res.json()
    content_id = content["id"]
    assert content["status"] == "draft"

    # 2. Author submits for review
    sub_res = client.post(
        f"/api/content/{content_id}/workflow",
        headers=headers_author,
        json={"action": "submit_review"}
    )
    assert sub_res.status_code == 200
    assert sub_res.json()["status"] == "in_review"

    # 3. Author tries to approve own content -> MUST fail (403 Forbidden)
    author_app_res = client.post(
        f"/api/content/{content_id}/workflow",
        headers=headers_author,
        json={"action": "approve"}
    )
    assert author_app_res.status_code == 403

    # 4. Reviewer approves content -> Succeeds
    rev_app_res = client.post(
        f"/api/content/{content_id}/workflow",
        headers=headers_reviewer,
        json={"action": "approve", "comment": "Looks great, approved for publishing."}
    )
    assert rev_app_res.status_code == 200
    assert rev_app_res.json()["status"] == "approved"

    # 5. Reviewer tries to publish -> MUST fail (403 Forbidden, only Manager/Admin can publish)
    rev_pub_res = client.post(
        f"/api/content/{content_id}/workflow",
        headers=headers_reviewer,
        json={"action": "publish"}
    )
    assert rev_pub_res.status_code == 403

    # 6. Admin publishes content -> Succeeds
    admin_pub_res = client.post(
        f"/api/content/{content_id}/workflow",
        headers=headers_admin,
        json={"action": "publish"}
    )
    assert admin_pub_res.status_code == 200
    assert admin_pub_res.json()["status"] == "published"
    assert admin_pub_res.json()["published_at"] is not None

def test_comments_versions_and_activities():
    admin_token = get_token("admin@enterprise.com", "Admin123!")
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Fetch existing content #1
    list_res = client.get("/api/content?limit=1")
    content_id = list_res.json()["items"][0]["id"]

    # Post Comment
    comment_res = client.post(
        f"/api/content/{content_id}/comments",
        headers=headers,
        json={"comment": "Adding editorial comment for review testing."}
    )
    assert comment_res.status_code == 201
    assert comment_res.json()["comment"] == "Adding editorial comment for review testing."

    # Fetch Comments
    get_comments_res = client.get(f"/api/content/{content_id}/comments")
    assert get_comments_res.status_code == 200
    assert len(get_comments_res.json()) >= 1

    # Fetch Versions
    versions_res = client.get(f"/api/content/{content_id}/versions")
    assert versions_res.status_code == 200
    versions = versions_res.json()
    assert len(versions) >= 1

    # Restore version 1
    restore_res = client.post(
        f"/api/content/{content_id}/versions/1/restore",
        headers=headers
    )
    assert restore_res.status_code == 200

    # Fetch Activities
    act_res = client.get(f"/api/content/{content_id}/activities")
    assert act_res.status_code == 200
    activities = act_res.json()
    assert len(activities) >= 1

if __name__ == "__main__":
    test_workflow_permissions_and_state_transitions()
    test_comments_versions_and_activities()
    print("ALL WORKFLOW & VERSIONING TESTS PASSED CLEANLY!")
