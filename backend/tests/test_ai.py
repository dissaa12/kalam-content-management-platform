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


def test_ai_all_10_actions():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    sample_content = "Scaling enterprise content marketing operations using generative AI workflows and role-based publishing approval systems."

    actions = [
        "generate_headlines",
        "generate_meta_description",
        "rewrite",
        "change_tone",
        "summarize",
        "social_caption",
        "suggest_keywords",
        "generate_outline",
        "generate_cta",
        "readability_analysis",
    ]

    tones = ["Professional", "Friendly", "Persuasive", "Informative", "Concise"]

    for idx, action in enumerate(actions):
        tone = tones[idx % len(tones)]
        response = client.post(
            "/api/ai/generate",
            json={
                "action": action,
                "content": sample_content,
                "tone": tone
            },
            headers=headers
        )
        assert response.status_code == 200, f"Action {action} failed: {response.text}"
        data = response.json()
        assert data["action"] == action
        assert len(data["result"]) > 0
        assert data["tone_used"] == tone
        assert "provider_used" in data

        if action == "readability_analysis":
            assert data["readability_metrics"] is not None
            assert data["readability_metrics"]["word_count"] > 0
            assert "flesch_reading_ease" in data["readability_metrics"]


def test_ai_invalid_action_and_error_handling():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Invalid action test
    resp = client.post(
        "/api/ai/generate",
        json={"action": "invalid_action_name", "content": "test"},
        headers=headers
    )
    assert resp.status_code == 400
    assert "Invalid AI action" in resp.json()["detail"]


if __name__ == "__main__":
    test_ai_all_10_actions()
    test_ai_invalid_action_and_error_handling()
    print("ALL 10 AI ASSISTANT FEATURE TESTS PASSED CLEANLY!")
