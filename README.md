# NammaCivic AI 🏛️📍

**AI-Powered Multilingual Voice & Text Grievance Redressal for Local Civic Bodies**

NammaCivic AI is a civic-technology platform built to empower citizens across Tamil Nadu to report, track, and verify municipal issues (streetlights, potholes, garbage, sewage, drinking water) in **Tamil (தமிழ்), Tanglish, and English**.

---

## 🗄️ PostgreSQL Database Integration

NammaCivic AI uses **SQLAlchemy 2.0** with **PostgreSQL** (via the `psycopg2-binary` driver) as its primary relational persistence engine, with seamless fallback to SQLite for zero-setup local development:

- **Database URL Configuration**: The database connection is configured exclusively via the backend environment variable `DATABASE_URL` (never exposed to the frontend).
- **Compatible Connection Schemes**: Automatically normalizes `postgres://`, `postgresql://`, or `postgresql+psycopg2://` formats, including cloud SSL flags (`?sslmode=require`).
- **Connection Pooling**: Configured with `pool_size=10`, `max_overflow=20`, `pool_pre_ping=True`, and `pool_recycle=300` for high-throughput concurrency and resilience.
- **Relational Models & Integrity**:
  - `User`: Secure accounts with bcrypt salted password hashing (never plaintext), unique email enforcement (case-normalized), optional phone numbers, and role-based permissions (`CITIZEN`, `OFFICER`, `DEMO_ADMIN`).
  - `Department`: Municipal divisions (Electrical, Solid Waste, Water & Sewage, Roads & Works, Veterinary, General).
  - `Complaint`: Civic grievances with sequential unique tracking references (`NC-YYYY-XXXXX`), descriptions, categories, geocoded coordinates (latitude/longitude), duration, and priority.
  - `ComplaintStatusHistory`: Immutable audit trail tracking every lifecycle transition (`SUBMITTED` -> `ASSIGNED` -> `IN_PROGRESS` -> `RESOLUTION_PENDING_VERIFICATION` -> `CLOSED` / `REOPENED`) with timestamps, actor roles, and resolution notes. Cascade-deleted upon complaint deletion.
  - `ResolutionVerification`: Closed-loop citizen feedback confirming work satisfaction before grievances are marked closed.
  - `EvidenceFile`: Uploaded geo-tagged photos and documents.
  - `ConversationSession` & `ConversationMessage`: Multilingual AI dialogue history.
- **Role-Based Isolation**: Citizens can only query their own submitted complaints in list views, while authorized municipal staff can inspect grievances across their jurisdiction. Unauthenticated tracking of specific complaint IDs masks citizen personal identifiers.
- **Database Migrations**: Includes both a zero-dependency migration tool (`python database/migrate.py`) and standard Alembic configuration (`alembic.ini` and `alembic/versions/`).

---

## 🚀 Local Setup & Quick Start (Windows PowerShell)

Follow these exact Windows PowerShell commands to set up and run the application:

### Step 1: Clone and Configure Environment

```powershell
# Navigate into the project folder
cd "C:\Users\sweth\OneDrive\Desktop\Namma civic AI"

# Copy the environment configuration template
Copy-Item .env.example .env
```

Open `.env` in your text editor and set `DATABASE_URL`:
- For **Local PostgreSQL**:
  ```ini
  DATABASE_URL="postgresql://postgres:your_password@localhost:5432/nammacivic"
  ```
- For **Managed Cloud PostgreSQL** (Neon, Supabase, Render, Railway, AWS RDS):
  ```ini
  DATABASE_URL="postgresql://user:password@ep-host-region.aws.neon.tech/nammacivic?sslmode=require"
  ```
- For **SQLite Fallback** (default for instant offline testing):
  ```ini
  DATABASE_URL="sqlite:///./nammacivic.db"
  ```

### Step 2: Set Up Local PostgreSQL Database (If using PostgreSQL)

If you have PostgreSQL installed on your machine:

```powershell
# Option A: Using PostgreSQL psql CLI
psql -U postgres -c "CREATE DATABASE nammacivic;"

# Option B: Using createdb command
createdb -U postgres nammacivic
```

If connecting to a managed PostgreSQL database (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Render](https://render.com)):
1. Create a free project on Neon or Supabase.
2. Copy the PostgreSQL connection string.
3. Paste it as `DATABASE_URL` in `.env` with `?sslmode=require`.

### Step 3: Run Database Migrations

Apply the database schema and version tracking table:

```powershell
# Check migration status
python database/migrate.py --status

# Run migrations
python database/migrate.py

# (Optional) Seed realistic municipal departments and demo accounts
python database/seed.py
```

*Note: If you have Alembic installed in your virtual environment, you can also run:*
```powershell
cd backend
alembic upgrade head
cd ..
```

### Step 4: Start Backend API Server (FastAPI)

```powershell
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

- API Base: `http://localhost:8000/api/v1`
- Health check & DB dialect status: `http://localhost:8000/api/v1/health`
- Interactive Swagger UI: `http://localhost:8000/docs`

### Step 5: Start Frontend Web Portal (Vite + React)

In a new Windows PowerShell terminal:

```powershell
# Navigate to frontend directory
cd "C:\Users\sweth\OneDrive\Desktop\Namma civic AI\frontend"

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```

- Web Portal: `http://localhost:5173`

---

## 🧪 Testing and Verification

### Run Database Persistence & Isolation Suite

```powershell
cd backend
pytest tests/test_database_persistence.py -v
```

This tests:
1. `test_user_persistence_and_password_hashing`: Verifies bcrypt hashing, persistence across independent sessions, and password verification.
2. `test_unique_email_constraint`: Verifies unique email enforcement and transaction rollback on collisions.
3. `test_complaint_and_status_history_persistence`: Verifies multi-stage status history, timestamps, foreign keys, and coordinates persist across app restarts.
4. `test_unique_complaint_id_constraint`: Verifies unique tracking ID enforcement.
5. `test_cascade_delete_history`: Verifies cascading deletion of status history when a complaint is removed.
6. `test_role_based_complaint_filtering`: Verifies citizens can only access their own complaints in citizen-scoped queries.

### Run Full Test Suite

```powershell
cd backend
pytest -v
```

All 33 test suites (AI conversational chat, authentication, citizen verification, duplicate detection, geocoding, lifecycle and security, database persistence) run and pass.

### Production Frontend Build

```powershell
cd frontend
npm run build
```

Compiles TypeScript and bundles production assets into `frontend/dist/`.

---

## 🗺️ Free OpenStreetMap Nominatim Geocoding Integration

NammaCivic AI uses the free, community-powered **OpenStreetMap Nominatim** service for address lookups and civic grievance mapping:

- **100% Free**: No Google Maps API key, credit card, or Google Cloud billing account is required.
- **Backend Orchestrated**: Frontend never talks to geocoding services directly; lookups are routed through FastAPI (`/api/v1/geocoding/search`).
- **Official OSM Usage Policy Adherence**:
  - **Rate Limiting**: Thread-safe backend rate limiter guarantees no more than 1 request per second to Nominatim.
  - **Identifiable User-Agent**: Every request sends a custom user agent (`NammaCivicAI/1.0`).
  - **OpenStreetMap Attribution**: Displayed on all maps, candidate lists, confirmation cards, and the platform footer (`Location data © OpenStreetMap contributors, ODbL 1.0`).
  - **No Autocomplete Hammering**: Address searches are only triggered on intentional user actions (clicking "Verify / Lookup Location"), avoiding keystroke auto-complete requests.
  - **Privacy Sanitization**: Automatically strips personal information (citizen names, phone numbers, email addresses, IDs) before queries are sent upstream.
  - **Smart Caching**: In-memory TTL cache stores results for repeated searches, preventing redundant queries.
- **Citizen Confirmation**: Returns up to 3 candidate locations with display address, latitude, and longitude. Citizens review and confirm the correct match before coordinates are committed.
- **Never Rejects Genuine Complaints**: If no map match is found or the service is temporarily unreachable, citizens are invited to edit the address, provide a landmark, or proceed directly with their manual address. Genuine civic grievances are never blocked or rejected.

---

## 🏛️ Key Civic Innovation Highlights

1. **Multilingual Voice & Text Assistant**: Web Speech API for Tamil and English voice inputs with Tanglish phonetic fallback.
2. **Citizen-Verified Resolution**: Closed-loop governance where grievances cannot be closed without citizen confirmation.
3. **Transparent Duplicate Detection**: Weighted similarity scanner alerting citizens of nearby active reports.
4. **OpenStreetMap Civic Mapping**: 100% free open-source spatial indexing respecting OpenStreetMap Foundation usage policies.
5. **PostgreSQL Relational Persistence**: Complete transaction-safe schema with status audit history and password hashing.

---

## 📜 Attribution & Licenses

- Geocoding and map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) (ODbL 1.0) via [Nominatim](https://nominatim.openstreetmap.org/).
- Built for academic demonstration and municipal grievance management prototyping.
