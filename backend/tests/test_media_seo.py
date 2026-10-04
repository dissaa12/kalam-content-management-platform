import os
import sys
import io

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


def test_media_upload_list_preview_and_delete():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Upload sample image file
    file_content = b"fake image binary content"
    file_obj = io.BytesIO(file_content)

    upload_resp = client.post(
        "/api/media/upload",
        headers=headers,
        files={"file": ("test_banner.png", file_obj, "image/png")}
    )
    assert upload_resp.status_code == 201, upload_resp.text
    media_data = upload_resp.json()
    assert media_data["original_filename"] == "test_banner.png"
    assert media_data["file_type"] == "image"
    assert media_data["file_size"] == len(file_content)
    media_id = media_data["id"]

    # 2. List media and verify search/filter
    list_resp = client.get(
        "/api/media?file_type=image&search=test_banner",
        headers=headers
    )
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert len(items) >= 1
    assert any(m["id"] == media_id for m in items)

    # 3. Delete media
    del_resp = client.delete(f"/api/media/{media_id}", headers=headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["id"] == media_id


def test_seo_metadata_saving_and_retrieval():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Create content with complete SEO metadata and keywords
    import uuid
    unique_title = f"SEO Test Article {uuid.uuid4().hex[:6]}"
    payload = {
        "title": unique_title,
        "content_type": "blog",
        "body": "<h1>Introduction to Enterprise AI</h1><p>Here is body text with focus keywords.</p>",
        "excerpt": "Brief summary excerpt",
        "status": "draft",
        "seo_metadata": {
            "meta_title": "Optimized SEO Title for Search Engines",
            "meta_description": "Meta description offering compelling summary of the article content (120-160 chars).",
            "keywords": "enterprise AI, marketing automation",
            "canonical_url": "https://enterprise.com/seo-article"
        }
    }

    create_resp = client.post("/api/content", json=payload, headers=headers)
    assert create_resp.status_code == 201, create_resp.text
    content_data = create_resp.json()
    content_id = content_data["id"]

    assert content_data["seo_metadata"] is not None
    assert content_data["seo_metadata"]["meta_title"] == "Optimized SEO Title for Search Engines"
    assert content_data["seo_metadata"]["keywords"] == "enterprise AI, marketing automation"

    # Cleanup
    client.delete(f"/api/content/{content_id}", headers=headers)


if __name__ == "__main__":
    test_media_upload_list_preview_and_delete()
    test_seo_metadata_saving_and_retrieval()
    print("ALL MEDIA & SEO TESTS PASSED CLEANLY!")
