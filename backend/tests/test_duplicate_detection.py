def test_duplicate_complaint_detection(client):
    # 1. Create original complaint
    res1 = client.post("/api/v1/grievances", json={
        "description": "Garbage bin overflowing and waste scattered near bus stand",
        "category": "GARBAGE",
        "location": "Velachery Station Road",
        "landmark": "Near MRTS Gate 2"
    })
    assert res1.status_code == 201
    orig_id = res1.json()["complaint_id"]

    # 2. Check duplicates via duplicate checking endpoint
    check_res = client.post("/api/v1/grievances/check-duplicates", params={
        "category": "GARBAGE",
        "description": "Waste scattered and garbage bin overflowing near bus stand",
        "location": "Velachery Station Road",
        "landmark": "Near MRTS Gate 2"
    })
    assert check_res.status_code == 200
    dup_data = check_res.json()
    assert dup_data["is_duplicate_likely"] is True
    assert any(m["complaint_id"] == orig_id for m in dup_data["matches"])

    # 3. Submitting a duplicate should still succeed (non-blocking) but be flagged
    res2 = client.post("/api/v1/grievances", json={
        "description": "Waste scattered and garbage bin overflowing near bus stand",
        "category": "GARBAGE",
        "location": "Velachery Station Road",
        "landmark": "Near MRTS Gate 2"
    })
    assert res2.status_code == 201
    assert res2.json()["is_duplicate_flag"] is True
    assert res2.json()["related_complaint_id"] == orig_id
