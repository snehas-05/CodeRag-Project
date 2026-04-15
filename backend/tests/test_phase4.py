"""Integration tests for Phase 4: Authentication and endpoints."""

import asyncio
import json

from httpx import AsyncClient

# Import from main so we test the exact app configured
from app.main import app

# Keep track of shared state so we can run tests sequentially
test_state = {}


async def run_tests():
    async with AsyncClient(app=app, base_url="http://test") as ac:

        # 1. Register User
        print("Test 1/5: Register User")
        response = await ac.post(
            "/auth/register",
            json={"email": "test@example.com", "password": "password123"},
        )
        assert response.status_code == 201, f"Failed to register: {response.text}"
        data = response.json()
        assert "access_token" in data
        
        # 2. Duplicate Registration (Should Fail)
        print("Test 2/5: Duplicate Registration")
        response2 = await ac.post(
            "/auth/register",
            json={"email": "test@example.com", "password": "password123"},
        )
        assert response2.status_code == 400

        # 3. Login User
        print("Test 3/5: Login User")
        response = await ac.post(
            "/auth/login",
            data={"username": "test@example.com", "password": "password123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 200, f"Failed to login: {response.text}"
        data = response.json()
        assert "access_token" in data
        test_state["token"] = data["access_token"]
        
        # 4. Stream Query Edge Case (No Ingest First)
        print("Test 4/5: Trigger Streaming Query")
        response = await ac.post(
            "/query",
            json={"query": "test query length ok", "repo_id": "test_repo"},
            headers={"Authorization": f"Bearer {test_state['token']}"}
        )
        assert response.status_code == 200
        assert "text/event-stream" in response.headers["content-type"]
        
        # Since it's a streaming response we can verify the stream generator
        async for chunk in response.aiter_text():
            assert chunk.startswith("data: ")
            break # Just testing the start of the stream

        # 5. Get History List
        print("Test 5/5: Get Query History")
        response = await ac.get(
            "/history",
            headers={"Authorization": f"Bearer {test_state['token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data

    print("✅ All Phase 4 tests passed!")


if __name__ == "__main__":
    asyncio.run(run_tests())
