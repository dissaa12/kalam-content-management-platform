import os
import sys
import uuid

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_auth_token():
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@enterprise.com", "password": "Admin123!"}
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_public_content_visibility_and_restrictions():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create a published article
    pub_slug = f"public-published-{uuid.uuid4().hex[:6]}"
    pub_resp = client.post(
        "/api/content",
        json={
            "title": f"Public Published Article {uuid.uuid4().hex[:4]}",
            "slug": pub_slug,
            "content_type": "blog",
            "body": "Public body content for published article.",
            "excerpt": "Public excerpt",
            "status": "published"
        },
        headers=headers
    )
    assert pub_resp.status_code == 201, pub_resp.text
    pub_id = pub_resp.json()["id"]

    # 2. Create a draft article
    draft_slug = f"public-draft-{uuid.uuid4().hex[:6]}"
    draft_resp = client.post(
        "/api/content",
        json={
            "title": f"Private Draft Article {uuid.uuid4().hex[:4]}",
            "slug": draft_slug,
            "content_type": "blog",
            "body": "Private body content for draft article.",
            "excerpt": "Draft excerpt",
            "status": "draft"
        },
        headers=headers
    )
    assert draft_resp.status_code == 201
    draft_id = draft_resp.json()["id"]

    # 3. Create an archived article
    arch_slug = f"public-archived-{uuid.uuid4().hex[:6]}"
    arch_resp = client.post(
        "/api/content",
        json={
            "title": f"Archived Article {uuid.uuid4().hex[:4]}",
            "slug": arch_slug,
            "content_type": "blog",
            "body": "Archived body content.",
            "excerpt": "Archived excerpt",
            "status": "archived"
        },
        headers=headers
    )
    assert arch_resp.status_code == 201
    arch_id = arch_resp.json()["id"]

    # --- VERIFY PUBLIC ENDPOINTS ---

    # A. Public List: Published article MUST be present; Draft & Archived MUST NOT be present!
    public_list_resp = client.get("/api/content/public/list")
    assert public_list_resp.status_code == 200
    public_items = public_list_resp.json()["items"]

    published_slugs = [item["slug"] for item in public_items]
    assert pub_slug in published_slugs, "Published article should appear in public list"
    assert draft_slug not in published_slugs, "Draft article MUST NOT appear in public list"
    assert arch_slug not in published_slugs, "Archived article MUST NOT appear in public list"

    # B. Public Detail for Published article -> 200 OK
    get_pub_resp = client.get(f"/api/content/public/{pub_slug}")
    assert get_pub_resp.status_code == 200
    assert get_pub_resp.json()["slug"] == pub_slug

    # C. Public Detail for Draft article -> 404 NOT FOUND
    get_draft_resp = client.get(f"/api/content/public/{draft_slug}")
    assert get_draft_resp.status_code == 404

    # D. Public Detail for Archived article -> 404 NOT FOUND
    get_arch_resp = client.get(f"/api/content/public/{arch_slug}")
    assert get_arch_resp.status_code == 404

    # Cleanup
    client.delete(f"/api/content/{pub_id}", headers=headers)
    client.delete(f"/api/content/{draft_id}", headers=headers)
    client.delete(f"/api/content/{arch_id}", headers=headers)


if __name__ == "__main__":
    test_public_content_visibility_and_restrictions()
    print("ALL PUBLIC WEBSITE CMS API TESTS PASSED CLEANLY!")
