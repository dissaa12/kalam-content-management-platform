import os
import sys

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"

def test_login_demo_admin():
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@enterprise.com", "password": "Admin123!"}
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@enterprise.com"
    assert data["user"]["role"] == "admin"
    return data["access_token"]

def test_login_invalid_password():
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@enterprise.com", "password": "WrongPassword!"}
    )
    assert response.status_code == 401

def test_get_me():
    token = test_login_demo_admin()
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@enterprise.com"
    assert data["role"] == "admin"

def test_register_and_login():
    import uuid
    random_email = f"user_{uuid.uuid4().hex[:8]}@enterprise.com"
    reg_response = client.post(
        "/api/auth/register",
        json={
            "first_name": "Test",
            "last_name": "Author",
            "email": random_email,
            "password": "Password123!",
            "role": "content_author"
        }
    )
    assert reg_response.status_code == 201
    reg_data = reg_response.json()
    assert reg_data["user"]["email"] == random_email

    login_response = client.post(
        "/api/auth/login",
        json={"email": random_email, "password": "Password123!"}
    )
    assert login_response.status_code == 200

if __name__ == "__main__":
    test_health_check()
    test_login_demo_admin()
    test_login_invalid_password()
    test_get_me()
    test_register_and_login()
    print("ALL BACKEND AUTH TESTS PASSED CLEANLY!")
