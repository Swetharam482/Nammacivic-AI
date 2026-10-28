import pytest
from app.models.user import User
from app.models.complaint import Complaint
from app.core.security import verify_password

def test_user_registration_normalization_and_security(client, db_session):
    # 1. Register with mixed case and spaces in email
    payload = {
        "email": "  NewCitizen@Example.Com  ",
        "full_name": "  Subramanian Swamy  ",
        "phone_number": "  +91 9123456789  ",
        "password": "StrongPassword123!"
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["user"]["email"] == "newcitizen@example.com"
    assert data["user"]["full_name"] == "Subramanian Swamy"
    assert data["user"]["role"] == "CITIZEN"

    # Verify password is NOT stored in plain text in database
    db_user = db_session.query(User).filter(User.email == "newcitizen@example.com").first()
    assert db_user is not None
    assert db_user.hashed_password != "StrongPassword123!"
    assert verify_password("StrongPassword123!", db_user.hashed_password) is True

    # 2. Duplicate registration attempt with different casing must be rejected
    dup_res = client.post("/api/v1/auth/register", json={
        "email": "NEWCITIZEN@EXAMPLE.COM",
        "full_name": "Another Person",
        "password": "AnotherPassword123!"
    })
    assert dup_res.status_code == 400
    assert "already exists" in dup_res.json()["detail"]

    # 3. Login with mixed case credentials
    login_res = client.post("/api/v1/auth/login", json={
        "email": "NewCitizen@Example.COM",
        "password": "StrongPassword123!"
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

def test_login_rate_limiting_and_wrong_credentials(client):
    wrong_email = "victim_rate_limit@example.com"
    # Attempt 5 consecutive bad passwords
    for i in range(5):
        bad_res = client.post("/api/v1/auth/login", json={
            "email": wrong_email,
            "password": f"WrongPassword{i}"
        })
        assert bad_res.status_code == 401

    # 6th attempt should be blocked by rate limiting (429)
    locked_res = client.post("/api/v1/auth/login", json={
        "email": wrong_email,
        "password": "AnyPassword"
    })
    assert locked_res.status_code == 429
    assert "Too many failed login attempts" in locked_res.json()["detail"]

def test_complaint_creation_unique_id_and_case_insensitive_tracking(client, db_session):
    # 1. Register and login citizen
    reg = client.post("/api/v1/auth/register", json={
        "email": "creator@example.com",
        "full_name": "Ravi Kumar",
        "phone_number": "+91 9840123456",
        "password": "Password123!"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Submit complaint
    comp_payload = {
        "title": "Severe Pothole on Anna Salai",
        "description": "Deep monsoon crater near bus stand causing vehicular damage.",
        "category": "ROAD",
        "location": "Anna Salai, Mount Road",
        "landmark": "Near Anna Flyover",
        "duration": "4 days"
    }
    create_res = client.post("/api/v1/grievances", json=comp_payload, headers=headers)
    assert create_res.status_code == 201
    created_comp = create_res.json()
    cid = created_comp["complaint_id"]
    assert cid.startswith("NC-")
    assert created_comp["citizen_name"] == "Ravi Kumar"
    assert created_comp["citizen_phone"] == "+91 9840123456"

    # 3. Track with lower case and extra whitespace: "  nc-...  "
    track_res = client.get(f"/api/v1/grievances/  {cid.lower()}  ", headers=headers)
    assert track_res.status_code == 200
    tracked = track_res.json()
    assert tracked["complaint_id"] == cid
    # Since creator is logged in, they can view their own contact info unmasked
    assert tracked["citizen_phone"] == "+91 9840123456"

    # 4. Track anonymously (guest): phone must be masked for privacy!
    guest_track_res = client.get(f"/api/v1/grievances/{cid}")
    assert guest_track_res.status_code == 200
    guest_tracked = guest_track_res.json()
    assert guest_tracked["citizen_phone"] != "+91 9840123456"
    assert "*" in guest_tracked["citizen_phone"]

def test_demo_authority_protected_from_citizens(client):
    # Citizen registration
    reg = client.post("/api/v1/auth/register", json={
        "email": "unauthorized_citizen@example.com",
        "full_name": "Priya Ramesh",
        "password": "Password123!"
    })
    token = reg.json()["access_token"]
    citizen_headers = {"Authorization": f"Bearer {token}"}

    # Citizen tries to access demo authority endpoints
    list_res = client.get("/api/v1/demo/complaints", headers=citizen_headers)
    assert list_res.status_code == 403
    assert "Citizens are not authorized" in list_res.json()["detail"]

    # Citizen tries to update status via demo authority endpoint
    update_res = client.post("/api/v1/demo/complaints/NC-2026-10492/status", json={
        "status": "IN_PROGRESS"
    }, headers=citizen_headers)
    assert update_res.status_code == 403

def test_invalid_complaint_id_gives_clear_404(client):
    res = client.get("/api/v1/grievances/NC-9999-00000")
    assert res.status_code == 404
    assert "was not found" in res.json()["detail"]
