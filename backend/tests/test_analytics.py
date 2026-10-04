import os
import sys

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


def test_dashboard_analytics_endpoints():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Dashboard analytics with filters
    resp = client.get(
        "/api/analytics/dashboard?date_range=last_30_days&content_type=blog",
        headers=headers
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "summary" in data
    assert "total_views" in data["summary"]
    assert "avg_engagement" in data["summary"]
    assert "avg_ctr" in data["summary"]
    assert "total_shares" in data["summary"]
    assert "total_conversions" in data["summary"]
    assert "avg_reading_time" in data["summary"]
    assert len(data["content_performance"]) > 0
    assert len(data["publishing_trends"]) > 0
    assert len(data["engagement_trends"]) > 0
    assert data["is_simulated"] is True


def test_content_and_campaign_analytics():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Test per-content analytics
    c_resp = client.get("/api/analytics/content/1", headers=headers)
    assert c_resp.status_code == 200
    c_data = c_resp.json()
    assert c_data["id"] == 1
    assert "views" in c_data
    assert "engagement_rate" in c_data

    # Test per-campaign analytics
    cmp_resp = client.get("/api/analytics/campaign/1", headers=headers)
    assert cmp_resp.status_code == 200
    cmp_data = cmp_resp.json()
    assert cmp_data["campaign_id"] == 1
    assert "conversions" in cmp_data


if __name__ == "__main__":
    test_dashboard_analytics_endpoints()
    test_content_and_campaign_analytics()
    print("ALL ANALYTICS TESTS PASSED CLEANLY!")
