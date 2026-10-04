import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_token():
    res = client.post(
        "/api/auth/login",
        json={"email": "admin@enterprise.com", "password": "Admin123!"}
    )
    assert res.status_code == 200
    return res.json()["access_token"]

def test_list_content():
    response = client.get("/api/content?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] > 0

def test_content_search_and_filter():
    response = client.get("/api/content?search=Enterprise&status=published")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) >= 1

def test_create_get_update_delete_content():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Content
    create_res = client.post(
        "/api/content",
        headers=headers,
        json={
            "title": "Unit Test Content Article",
            "content_type": "blog",
            "excerpt": "This is a test content item.",
            "body": "# Test Content Body",
            "status": "draft",
            "tag_names": ["Test", "Automation"],
            "seo_metadata": {
                "meta_title": "Unit Test Content Article - SEO Title",
                "meta_description": "SEO description for unit test."
            }
        }
    )
    assert create_res.status_code == 201, create_res.text
    content_item = create_res.json()
    content_id = content_item["id"]
    assert content_item["title"] == "Unit Test Content Article"
    assert len(content_item["tags"]) == 2

    # 2. Get Detail
    get_res = client.get(f"/api/content/{content_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == content_id

    # 3. Update Content
    update_res = client.put(
        f"/api/content/{content_id}",
        headers=headers,
        json={
            "title": "Updated Unit Test Content Article",
            "status": "published",
            "body": "Updated body content."
        }
    )
    assert update_res.status_code == 200
    assert update_res.json()["title"] == "Updated Unit Test Content Article"
    assert update_res.json()["status"] == "published"
    assert update_res.json()["published_at"] is not None

    # 4. Delete Content
    delete_res = client.delete(f"/api/content/{content_id}", headers=headers)
    assert delete_res.status_code == 200

    # 5. Verify 404
    get_after_delete = client.get(f"/api/content/{content_id}")
    assert get_after_delete.status_code == 404

if __name__ == "__main__":
    test_list_content()
    test_content_search_and_filter()
    test_create_get_update_delete_content()
    print("ALL BACKEND CONTENT CRUD TESTS PASSED CLEANLY!")
