def test_create_and_track_complaint(client):
    # 1. Create a complaint
    payload = {
        "title": "Broken Streetlight on 1st Street",
        "description": "Streetlight pole #12 is not functioning for 2 days.",
        "category": "STREETLIGHT",
        "location": "1st Main Road, T. Nagar",
        "landmark": "Near Post Office",
        "duration": "2 days",
        "citizen_name": "Citizen User",
        "citizen_phone": "+91 9888877777"
    }
    res = client.post("/api/v1/grievances", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["complaint_id"].startswith("NC-")
    assert data["status"] == "SUBMITTED"
    assert len(data["status_history"]) >= 1
    assert data["status_history"][0]["to_status"] == "SUBMITTED"

    cid = data["complaint_id"]

    # 2. Track complaint
    track_res = client.get(f"/api/v1/grievances/{cid}")
    assert track_res.status_code == 200
    assert track_res.json()["complaint_id"] == cid
    assert track_res.json()["location"] == "1st Main Road, T. Nagar"

def test_status_transitions_via_demo_flow(client):
    # Create complaint
    res = client.post("/api/v1/grievances", json={
        "description": "Garbage dump not cleared on street corner",
        "category": "GARBAGE",
        "location": "Mylapore Tank Street"
    })
    cid = res.json()["complaint_id"]

    # Advance to ASSIGNED
    assign_res = client.post(f"/api/v1/demo/complaints/{cid}/status", json={
        "status": "ASSIGNED",
        "note": "Assigned to Zone 9 sanitary supervisor."
    })
    assert assign_res.status_code == 200
    assert assign_res.json()["status"] == "ASSIGNED"

    # Advance to IN_PROGRESS
    prog_res = client.post(f"/api/v1/demo/complaints/{cid}/status", json={
        "status": "IN_PROGRESS",
        "note": "Compactor truck en route."
    })
    assert prog_res.status_code == 200
    assert prog_res.json()["status"] == "IN_PROGRESS"

    # Advance to RESOLUTION_PENDING_VERIFICATION
    resolve_res = client.post(f"/api/v1/demo/complaints/{cid}/status", json={
        "status": "RESOLUTION_PENDING_VERIFICATION",
        "resolution_notes": "Garbage fully cleared and bleaching powder sprinkled."
    })
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "RESOLUTION_PENDING_VERIFICATION"
