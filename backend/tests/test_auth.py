def test_register_and_login(client):
    # 1. Register new citizen
    reg_payload = {
        "email": "testuser@example.com",
        "full_name": "Test Citizen",
        "phone_number": "+91 9999988888",
        "password": "SecretPassword123!"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "testuser@example.com"

    # 2. Duplicate registration should fail
    dup_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_res.status_code == 400

    # 3. Login with credentials
    login_res = client.post("/api/v1/auth/login", json={
        "email": "testuser@example.com",
        "password": "SecretPassword123!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # 4. Access protected profile /me
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["full_name"] == "Test Citizen"
