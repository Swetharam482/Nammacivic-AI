# NammaCivic AI - REST API Documentation

Base URL: `http://localhost:8000/api/v1`
Interactive Swagger UI: `http://localhost:8000/docs`

---

## 1. Authentication Endpoints

### Register Citizen
- **POST** `/auth/register`
- **Request Body**:
```json
{
  "email": "citizen@example.com",
  "full_name": "Karthik Raja",
  "phone_number": "+91 9876543210",
  "password": "Password123!"
}
```
- **Response (201 Created)**:
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "citizen@example.com",
    "full_name": "Karthik Raja",
    "phone_number": "+91 9876543210",
    "role": "CITIZEN",
    "created_at": "2026-10-16T17:00:00Z"
  }
}
```

### Citizen Login
- **POST** `/auth/login`
- **Request Body**:
```json
{
  "email": "citizen@example.com",
  "password": "Password123!"
}
```

### Current User Profile
- **GET** `/auth/me`
- **Headers**: `Authorization: Bearer <token>`

---

## 2. AI Chat & Voice Redressal Endpoints

### Send Chat Message
- **POST** `/chat`
- **Request Body**:
```json
{
  "session_id": "optional-uuid-session-string",
  "message": "enga street la street light work aagala",
  "language": "auto"
}
```
- **Response (200 OK)**:
```json
{
  "session_id": "4b68e987-...",
  "reply": "புரிந்தது. இந்தப் பிரச்சனை இருக்கும் இடம் அல்லது தெருவின் பெயரைச் சொல்ல முடியுமா?",
  "draft": {
    "category": "STREETLIGHT",
    "subcategory": "NOT_WORKING",
    "description": "enga street la street light work aagala",
    "location": null,
    "landmark": null,
    "duration": null,
    "priority": "MEDIUM",
    "missing_information": ["location", "duration"],
    "needs_confirmation": false,
    "is_ready_to_submit": false
  },
  "detected_language": "Tanglish",
  "is_summary_ready": false,
  "should_read_aloud": true
}
```

### Reset Chat Session
- **POST** `/chat/{session_id}/reset`

---

## 3. Grievances & Tracking Endpoints

### Submit Grievance
- **POST** `/grievances`
- **Request Body**:
```json
{
  "title": "Streetlight failure on 4th Main Road",
  "description": "Three streetlights not working for 3 days near school.",
  "category": "STREETLIGHT",
  "location": "4th Main Road, Anna Nagar West",
  "landmark": "Near Govt School",
  "duration": "3 days",
  "citizen_name": "Karthik Raja",
  "citizen_phone": "+91 9876543210"
}
```
- **Response (201 Created)**:
```json
{
  "id": 1,
  "complaint_id": "NC-2026-10492",
  "title": "Streetlight failure on 4th Main Road",
  "category": "STREETLIGHT",
  "priority": "HIGH",
  "status": "SUBMITTED",
  "location": "4th Main Road, Anna Nagar West",
  "is_duplicate_flag": false,
  "created_at": "2026-10-16T17:00:00Z"
}
```

### Track Complaint by ID
- **GET** `/grievances/{complaint_id}`
- **Parameters**: `complaint_id` (e.g. `NC-2026-10492`)
- **Returns**: Full status timeline, department assignment, evidence files, and resolution verification data.

### Check For Duplicates
- **POST** `/grievances/check-duplicates`
- **Query Params**: `category`, `description`, `location`, `landmark`

### Upload Photographic Evidence
- **POST** `/grievances/{complaint_id}/evidence`
- **Form Data**: `file` (Multipart file upload up to 5MB)

### Citizen Verify Resolution (Key Innovation)
- **POST** `/grievances/{complaint_id}/verify-resolution`
- **Request Body**:
```json
{
  "is_resolved": true,
  "citizen_feedback": "Streetlights are fully operational now. Great work!"
}
```
*(If `is_resolved: false`, complaint transitions to `REOPENED` with mandatory `reopen_reason`)*

---

## 4. Demo Authority Simulation Endpoints

### List All Demo Complaints
- **GET** `/demo/complaints`

### Simulate Authority Status Update
- **POST** `/demo/complaints/{complaint_id}/status`
- **Request Body**:
```json
{
  "status": "RESOLUTION_PENDING_VERIFICATION",
  "assigned_officer": "Er. Senthil Kumar (GCC Field Team)",
  "resolution_notes": "SIMULATED REPORT: Replaced bulb on pole #412. Tested ok."
}
```

---

## 5. Free OpenStreetMap Nominatim Geocoding Endpoints

*(100% Free - No Google Maps API key, credit card, or billing account required)*

### Address Lookup (GET)
- **GET** `/geocoding/search?q={address}&country_code=in`
- **Query Parameters**:
  - `q`: Street name, area, or landmark (e.g. `Anna Nagar 4th Main Road`)
  - `country_code` *(optional)*: Country filter code (defaults to `in` for India)
- **Response (200 OK)**:
```json
{
  "query": "Anna Nagar 4th Main Road",
  "provider": "OpenStreetMap Nominatim",
  "attribution": "Location data © OpenStreetMap contributors (ODbL 1.0)",
  "matches": [
    {
      "display_address": "4th Main Road, Anna Nagar West, Chennai, Tamil Nadu, 600040, India",
      "latitude": 13.085025,
      "longitude": 80.210142,
      "place_id": 128940,
      "osm_type": "way",
      "osm_id": 481928,
      "category": "highway",
      "type": "residential",
      "importance": 0.65,
      "city": "Chennai",
      "state": "Tamil Nadu",
      "postcode": "600040"
    }
  ],
  "message": "Found 1 matching location. Please confirm the correct match before saving.",
  "status": "success",
  "from_cache": false
}
```

### Address Lookup (POST)
- **POST** `/geocoding/search`
- **Request Body**:
```json
{
  "address": "4th Main Road, Anna Nagar West",
  "country_code": "in"
}
```

### Official Usage Policy Compliance:
- **Rate Limit**: Maximum 1 request per second enforced via thread-safe rate limiter in the backend.
- **Identifiable User-Agent**: Sent with application name and contact info (`NammaCivicAI/1.0`).
- **Attribution**: Transparent OpenStreetMap attribution (`© OpenStreetMap contributors, ODbL 1.0`).
- **Privacy Sanitization**: Strips citizen names, phone numbers, and emails before requesting upstream.
- **Cache**: In-memory TTL cache prevents duplicate queries to OpenStreetMap.
- **Never Reject**: If no match is found, citizen can edit the address, add a landmark, or proceed directly. Genuine civic grievances are never rejected.

