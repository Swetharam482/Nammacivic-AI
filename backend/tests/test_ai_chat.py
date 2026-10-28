def test_ai_multilingual_chat_workflow(client):
    # Step 1: Citizen speaks in Tanglish
    step1_res = client.post("/api/v1/chat", json={
        "message": "enga street la street light work aagala",
        "language": "auto"
    })
    assert step1_res.status_code == 200
    data1 = step1_res.json()
    assert data1["draft"]["category"] == "STREETLIGHT"
    assert data1["detected_language"] in ["Tanglish", "English"]
    assert "location" in data1["draft"]["missing_information"]
    session_id = data1["session_id"]

    # Step 2: Citizen answers with location & landmark
    step2_res = client.post("/api/v1/chat", json={
        "session_id": session_id,
        "message": "Anna Nagar 4th Avenue near Govt School"
    })
    assert step2_res.status_code == 200
    data2 = step2_res.json()
    assert data2["draft"]["location"] is not None
    assert "duration" in data2["draft"]["missing_information"]

    # Step 3: Citizen provides duration
    step3_res = client.post("/api/v1/chat", json={
        "session_id": session_id,
        "message": "3 days"
    })
    assert step3_res.status_code == 200
    data3 = step3_res.json()
    assert data3["draft"]["duration"] is not None
    assert len(data3["draft"]["missing_information"]) == 0
    assert data3["draft"]["needs_confirmation"] is True

    # Step 4: Citizen confirms
    step4_res = client.post("/api/v1/chat", json={
        "session_id": session_id,
        "message": "yes"
    })
    assert step4_res.status_code == 200
    data4 = step4_res.json()
    assert data4["draft"]["is_ready_to_submit"] is True

def test_tamil_script_detection(client):
    res = client.post("/api/v1/chat", json={
        "message": "எங்க தெருவில் சாக்கடை அடைப்பு ஏற்பட்டுள்ளது",
        "language": "auto"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["draft"]["category"] == "DRAINAGE"
    assert data["detected_language"] == "Tamil"
