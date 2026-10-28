# NammaCivic AI - System Architecture Documentation

## 1. Executive Overview
**NammaCivic AI** is a modern civic-tech web application designed to empower citizens in local bodies across Tamil Nadu to report, track, and verify civic grievances via text and voice in Tamil, Tanglish, and English.

The architecture emphasizes:
1. **Multilingual Voice-First Access**: Browser Web Speech API (STT & TTS) with Tanglish phonetic parsing and Tamil script understanding.
2. **Citizen-Verified Resolution**: Closed-loop governance where grievances cannot be closed unilaterally by civic authorities—citizens have the final authority to confirm or reopen issues.
3. **Transparent Classification & Priority**: Rule-based civic urgency matrix (LOW, MEDIUM, HIGH, CRITICAL) preventing AI hallucinations.
4. **Duplicate Grievance Mitigation**: Non-blocking similarity scanner to alert citizens and administrators of related nearby reports without silencing voices.

---

## 2. Architecture Diagram

```mermaid
graph TD
    subgraph Frontend [React + Vite + TypeScript + Tailwind CSS]
        UI[Citizen & Admin Web Interface]
        VoiceService[Web Speech API Service - STT & TTS]
        AuthCtx[Auth Context & JWT Store]
        LangCtx[Language Context - Tamil / Tanglish / English]
    end

    subgraph Backend [FastAPI Application]
        Router[API Gateway /api/v1]
        AuthRouter[/auth - Register, Login, Profile]
        ChatRouter[/chat - Conversational Engine]
        ComplaintRouter[/grievances - CRUD & Tracking]
        DemoRouter[/demo - College Presentation Simulator]
        DeptRouter[/departments - Civic Bodies]
        GeocodingRouter[/geocoding - OpenStreetMap Address Verification]
        
        AIEngine[AI Conversation & NLP Engine]
        RuleFallback[Tamil / Tanglish Offline Rule Engine]
        GeminiService[Google Gemini AI Integration]
        
        GeocodingService[OpenStreetMap Nominatim Engine]
        DupService[Duplicate Detection Service]
        ComplaintService[Complaint Lifecycle & Verification Service]
        StorageService[Local Evidence Storage]
    end

    subgraph StorageLayer [Relational Database]
        DB[(PostgreSQL / SQLite Development DB)]
        Tables[Users, Complaints, History, Verifications, Evidence, Sessions]
    end

    subgraph ExternalServices [External Open Services]
        OSM[OpenStreetMap Nominatim API - Free, No Billing/Keys]
    end

    UI --> Router
    VoiceService --> UI
    Router --> AuthRouter
    Router --> ChatRouter
    Router --> ComplaintRouter
    Router --> DemoRouter
    Router --> DeptRouter
    Router --> GeocodingRouter

    ChatRouter --> AIEngine
    AIEngine --> GeminiService
    AIEngine --> RuleFallback

    GeocodingRouter --> GeocodingService
    GeocodingService --> OSM

    ComplaintRouter --> ComplaintService
    ComplaintRouter --> DupService
    ComplaintRouter --> StorageService

    ComplaintService --> DB
    AuthRouter --> DB
    ChatRouter --> DB
```

---

## 3. Core Subsystems

### 3.1 AI Conversation Engine & Offline Fallback
- **Multilingual Support**: Supports Tamil (`\u0B80-\u0BFF`), Tanglish (e.g. `street light work aagala`, `water supply varala`, `drainage block aaiduchu`), and English.
- **Entity Extraction**:
  - `Category`: Automatically mapped to 10 civic sectors (STREETLIGHT, ROAD, GARBAGE, DRAINAGE, WATER, SANITATION, PUBLIC_PROPERTY, ENVIRONMENT, ANIMAL, OTHER).
  - `Location & Landmark`: Detects streets, avenues, colonies, and landmarks while excluding generic pronouns (e.g. `enga street`).
  - `Duration`: Normalizes terms like `3 days`, `romba naala`, `oru vaaram`.
  - `Missing Fields`: Dynamically queries the citizen for remaining details one question at a time.
  - `Final Confirmation`: Summarizes details and generates a preview before database commit.
- **Hybrid Engine**: Supports Google Gemini AI when `GEMINI_API_KEY` is provided; seamlessly defaults to the zero-dependency rule-based engine when offline.

### 3.2 Closed-Loop Citizen Resolution Verification
The status lifecycle is strictly enforced:
```
SUBMITTED ➔ ASSIGNED ➔ IN_PROGRESS ➔ RESOLUTION_PENDING_VERIFICATION ➔ CLOSED
                                              │
                                              └──(Citizen says "No")➔ REOPENED ➔ IN_PROGRESS
```
- When a field officer marks a complaint resolved, the status moves to `RESOLUTION_PENDING_VERIFICATION`.
- The citizen is presented with:
  - **Yes, the issue is fixed** ➔ Transitions to `CLOSED`, logs timestamp & citizen feedback, awards "Citizen Verified" badge.
  - **No, the issue remains** ➔ Transitions to `REOPENED`, logs mandatory reopen reason, and triggers alert for field redeployment.

### 3.3 Transparent Duplicate Grievance Detection
- Computes weighted token similarity (Jaccard index on normalized description and geographic location overlap) across active reports within a 30-day window.
- If similarity exceeds 0.55, existing matches are flagged.
- **Non-blocking Policy**: The citizen is informed of the existing complaint but retains full power to submit their report.

### 3.4 Free OpenStreetMap Nominatim Geocoding Subsystem
- **Zero API Key & Zero Cost**: Replaces commercial Google Maps Geocoding API with OpenStreetMap Nominatim. No payment methods, credit cards, or billing accounts required.
- **Official Usage Policy Compliance**:
  - Backend thread-safe rate limiter strictly enforcing maximum 1 request per second.
  - Identifiable custom `User-Agent` (`NammaCivicAI/1.0`).
  - Strict input sanitization stripping personal information (phone numbers, emails, personal names) before upstream queries.
  - Integrated in-memory TTL caching layer satisfying OSM caching requirements.
  - No autocomplete or keystroke-triggered requests; lookups occur on citizen intent.
  - India country filter (`countrycodes=in`) to prioritize domestic civic locations.
- **Citizen Confirmation & Graceful Redressal**:
  - Maximum of three candidate matches returned with display address, latitude, and longitude.
  - Citizen explicitly selects and confirms the location before coordinates are saved.
  - If no match is found or service is unavailable, citizen can edit the address, add a landmark, or proceed directly with manual details. Genuine civic complaints are never rejected.


---

## 4. Security & Privacy
- **Password Protection**: Passwords hashed using `bcrypt` / `passlib` with salt.
- **JWT Authorization**: Cryptographically signed bearer tokens for citizen profiles and demo management.
- **File Validation**: Strict MIME inspection and 5MB size ceiling for image evidence.
- **CORS Protection**: Whitelisted frontend origins.
- **Fictional Data**: Seed records exclusively represent simulated municipal test points for college evaluation.
