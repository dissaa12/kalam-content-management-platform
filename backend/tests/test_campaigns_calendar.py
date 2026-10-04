import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_admin_token():
    res = client.post("/api/auth/login", json={"email": "admin@enterprise.com", "password": "Admin123!"})
    assert res.status_code == 200
    return res.json()["access_token"]

def test_campaign_crud_and_metrics():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    now = datetime.utcnow()
    # 1. Create Campaign
    create_res = client.post(
        "/api/campaigns",
        headers=headers,
        json={
            "name": "Automated Unit Test Campaign",
            "description": "Test campaign description",
            "objective": "Verify backend API",
            "target_audience": "Software Engineers",
            "campaign_type": "product_launch",
            "start_date": now.isoformat(),
            "end_date": (now + timedelta(days=30)).isoformat(),
            "budget": 15000.0,
            "status": "active",
        }
    )
    assert create_res.status_code == 201, create_res.text
    campaign = create_res.json()
    campaign_id = campaign["id"]
    assert campaign["name"] == "Automated Unit Test Campaign"
    assert "metrics" in campaign

    # 2. Get Campaign Detail
    get_res = client.get(f"/api/campaigns/{campaign_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Automated Unit Test Campaign"

    # 3. Update Campaign
    update_res = client.put(
        f"/api/campaigns/{campaign_id}",
        headers=headers,
        json={"name": "Updated Unit Test Campaign", "status": "completed"}
    )
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Updated Unit Test Campaign"
    assert update_res.json()["status"] == "completed"

    # 4. Delete Campaign
    del_res = client.delete(f"/api/campaigns/{campaign_id}", headers=headers)
    assert del_res.status_code == 200

def test_calendar_events_and_reschedule():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch Calendar Events
    events_res = client.get("/api/calendar/events")
    assert events_res.status_code == 200
    events = events_res.json()
    assert len(events) >= 1

    event_id = events[0]["id"]
    new_date = (datetime.utcnow() + timedelta(days=7)).isoformat()

    # Reschedule Event Date
    reschedule_res = client.put(
        f"/api/calendar/reschedule/{event_id}",
        headers=headers,
        json={"scheduled_at": new_date}
    )
    assert reschedule_res.status_code == 200
    assert reschedule_res.json()["scheduled_at"] is not None

if __name__ == "__main__":
    test_campaign_crud_and_metrics()
    test_calendar_events_and_reschedule()
    print("ALL CAMPAIGN & CALENDAR TESTS PASSED CLEANLY!")
