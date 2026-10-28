def test_citizen_resolution_verification_yes_closes(client):
    # 1. Create complaint
    create_res = client.post("/api/v1/grievances", json={
        "description": "Streetlight bulb blown on 2nd cross",
        "category": "STREETLIGHT",
        "location": "Adyar 2nd Cross"
    })
    cid = create_res.json()["complaint_id"]

    # 2. Advance through lifecycle to RESOLUTION_PENDING_VERIFICATION
    client.post(f"/api/v1/demo/complaints/{cid}/status", json={"status": "ASSIGNED"})
    client.post(f"/api/v1/demo/complaints/{cid}/status", json={"status": "IN_PROGRESS"})
    client.post(f"/api/v1/demo/complaints/{cid}/status", json={
        "status": "RESOLUTION_PENDING_VERIFICATION",
        "resolution_notes": "Replaced bulb."
    })

    # 3. Citizen verifies: YES, IT IS FIXED
    ver_res = client.post(f"/api/v1/grievances/{cid}/verify-resolution", json={
        "is_resolved": True,
        "citizen_feedback": "Confirmed, light is shining bright now."
    })
    assert ver_res.status_code == 200
    comp = ver_res.json()
    assert comp["status"] == "CLOSED"
    assert len(comp["verifications"]) == 1
    assert comp["verifications"][0]["is_resolved"] is True

def test_citizen_resolution_verification_no_reopens(client):
    # 1. Create complaint
    create_res = client.post("/api/v1/grievances", json={
        "description": "Sewage pipeline leaking on footpath",
        "category": "DRAINAGE",
        "location": "Tambaram Main Road"
    })
    cid = create_res.json()["complaint_id"]

    # 2. Advance to RESOLUTION_PENDING_VERIFICATION
    client.post(f"/api/v1/demo/complaints/{cid}/status", json={"status": "IN_PROGRESS"})
    client.post(f"/api/v1/demo/complaints/{cid}/status", json={
        "status": "RESOLUTION_PENDING_VERIFICATION",
        "resolution_notes": "Claimed repair done."
    })

    # 3. Citizen verifies: NO, STILL PERSISTS!
    ver_res = client.post(f"/api/v1/grievances/{cid}/verify-resolution", json={
        "is_resolved": False,
        "reopen_reason": "Dirty water is still seeping out onto the road."
    })
    assert ver_res.status_code == 200
    comp = ver_res.json()
    assert comp["status"] == "REOPENED"
    assert len(comp["verifications"]) == 1
    assert comp["verifications"][0]["is_resolved"] is False
    assert comp["verifications"][0]["reopen_reason"] == "Dirty water is still seeping out onto the road."
