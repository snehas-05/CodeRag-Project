from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

def test_auth_flow():
    unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    password = "securepassword123"
    
    # Attempt to register
    register_response = client.post("/auth/register", json={
        "email": unique_email,
        "password": password
    })
    
    # Verify registration success
    assert register_response.status_code == 200
    data = register_response.json()
    assert "access_token" in data
    assert data["email"] == unique_email
        
    # Attempt to login
    login_response = client.post("/auth/login", json={
        "email": unique_email,
        "password": password
    })
    
    # Verify login success
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert "access_token" in login_data
    assert login_data["email"] == unique_email
