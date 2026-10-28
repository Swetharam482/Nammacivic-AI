import sys
from pathlib import Path
from datetime import datetime, timedelta, timezone

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

try:
    from app.core.database import SessionLocal, engine, Base
    from app.core.security import get_password_hash
    from app.models.user import User
    from app.models.department import Department
    from app.models.complaint import Complaint
    from app.models.history import ComplaintStatusHistory
    from app.models.verification import ResolutionVerification
except ImportError:
    from backend.app.core.database import SessionLocal, engine, Base
    from backend.app.core.security import get_password_hash
    from backend.app.models.user import User
    from backend.app.models.department import Department
    from backend.app.models.complaint import Complaint
    from backend.app.models.history import ComplaintStatusHistory
    from backend.app.models.verification import ResolutionVerification

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Departments
        departments_data = [
            {
                "code": "ELEC",
                "name": "GCC Electrical & Streetlighting (TNEB Liaison)",
                "description": "Maintenance of civic streetlights, high-mast lamps, junction poles, and electrical safety.",
                "contact_email": "electrical@nammacivic.demo.gov",
                "helpline": "1912"
            },
            {
                "code": "SWM",
                "name": "GCC Solid Waste Management",
                "description": "Door-to-door garbage collection, compactor bins, street sweeping, and dumping remediation.",
                "contact_email": "swm@nammacivic.demo.gov",
                "helpline": "1913"
            },
            {
                "code": "CMWSSB",
                "name": "Chennai Metro Water & Sewerage Board (CMWSSB)",
                "description": "Drinking water supply pipelines, sewer line unclogging, manhole maintenance, and contaminated water relief.",
                "contact_email": "water@nammacivic.demo.gov",
                "helpline": "044-45674567"
            },
            {
                "code": "ROADS",
                "name": "GCC Bus Routes & Highways Works Department",
                "description": "Pothole repairs, asphalt laying, speed breakers, road widening, and stormwater curb maintenance.",
                "contact_email": "roads@nammacivic.demo.gov",
                "helpline": "1913"
            },
            {
                "code": "VET",
                "name": "GCC Public Health & Veterinary Services",
                "description": "Stray dog vaccination and animal birth control, carcass removal, cattle impounding.",
                "contact_email": "vet@nammacivic.demo.gov",
                "helpline": "1913"
            },
            {
                "code": "GEN",
                "name": "GCC General Administration & Public Property",
                "description": "Parks, bus shelters, pedestrian footpaths, community infrastructure, and miscellaneous civic matters.",
                "contact_email": "admin@nammacivic.demo.gov",
                "helpline": "1913"
            }
        ]

        departments_map = {}
        for d in departments_data:
            existing = db.query(Department).filter(Department.code == d["code"]).first()
            if not existing:
                dept = Department(**d)
                db.add(dept)
                db.flush()
                departments_map[d["code"]] = dept
            else:
                departments_map[d["code"]] = existing

        print(f"Departments initialized ({len(departments_data)} departments).")

        # 2. Seed Users
        citizen_user = db.query(User).filter(User.email == "citizen@example.com").first()
        if not citizen_user:
            citizen_user = User(
                email="citizen@example.com",
                phone_number="+91 9876543210",
                full_name="Karthik Raja",
                hashed_password=get_password_hash("Password123!"),
                role="CITIZEN"
            )
            db.add(citizen_user)
            db.flush()
            print("Created demo citizen: citizen@example.com / Password123!")

        officer_user = db.query(User).filter(User.email == "officer@example.com").first()
        if not officer_user:
            officer_user = User(
                email="officer@example.com",
                phone_number="+91 9876543211",
                full_name="Er. Senthil Kumar (GCC Zone 8)",
                hashed_password=get_password_hash("Password123!"),
                role="OFFICER"
            )
            db.add(officer_user)
            db.flush()
            print("Created demo officer: officer@example.com / Password123!")

        # 3. Seed Realistic Grievances
        sample_complaints = [
            {
                "complaint_id": "NC-2026-10492",
                "title": "Streetlights not working on 4th Main Road",
                "description": "Three consecutive streetlights have stopped functioning on 4th Main Road near the government higher secondary school. The stretch is pitch dark after 7 PM, creating safety concerns for pedestrians and students.",
                "category": "STREETLIGHT",
                "subcategory": "NOT_WORKING",
                "priority": "HIGH",
                "priority_reason": "Pitch dark pedestrian zone near educational institution posing safety hazard.",
                "status": "RESOLUTION_PENDING_VERIFICATION",
                "location": "4th Main Road, Anna Nagar West",
                "landmark": "Opposite Govt Higher Secondary School",
                "pincode": "600040",
                "duration": "3 days",
                "language": "Tanglish",
                "citizen_id": citizen_user.id,
                "citizen_name": "Karthik Raja",
                "citizen_phone": "+91 9876543210",
                "department_id": departments_map["ELEC"].id,
                "assigned_officer": "Er. Senthil Kumar (GCC Zone 8)",
                "resolution_notes": "SIMULATED FIELD REPORT: Electrical team inspected pole #412-#414. Replaced blown capacitor and 70W LED luminaire unit. All 3 lamps tested operational. Awaiting citizen confirmation.",
                "resolution_date": datetime.now(timezone.utc) - timedelta(hours=2),
                "created_at": datetime.now(timezone.utc) - timedelta(days=2),
                "history": [
                    ("SUBMITTED", "Grievance submitted by citizen via voice assistant.", datetime.now(timezone.utc) - timedelta(days=2), "CITIZEN"),
                    ("ASSIGNED", "Assigned to GCC Electrical Division Zone 8.", datetime.now(timezone.utc) - timedelta(days=1, hours=18), "SYSTEM"),
                    ("IN_PROGRESS", "Field engineer dispatched with replacement components.", datetime.now(timezone.utc) - timedelta(hours=8), "DEMO_AUTHORITY"),
                    ("RESOLUTION_PENDING_VERIFICATION", "Work completed on site. Status moved to Resolution Pending Citizen Verification.", datetime.now(timezone.utc) - timedelta(hours=2), "DEMO_AUTHORITY")
                ]
            },
            {
                "complaint_id": "NC-2026-10493",
                "title": "Deep pothole causing skidding hazard",
                "description": "Large crater-like pothole formed right after the monsoon rains near the roundtana bus stop. Two-wheelers frequently lose balance during morning peak traffic.",
                "category": "ROAD",
                "subcategory": "POTHOLE",
                "priority": "HIGH",
                "priority_reason": "High-density transit road with imminent hazard to two-wheeler commuters.",
                "status": "IN_PROGRESS",
                "location": "Anna Nagar Roundtana, 2nd Avenue",
                "landmark": "Near Roundtana Bus Stop",
                "pincode": "600040",
                "duration": "4 days",
                "language": "English",
                "citizen_id": citizen_user.id,
                "citizen_name": "Karthik Raja",
                "citizen_phone": "+91 9876543210",
                "department_id": departments_map["ROADS"].id,
                "assigned_officer": "Assistant Engineer Ramesh (GCC Works)",
                "created_at": datetime.now(timezone.utc) - timedelta(days=3),
                "history": [
                    ("SUBMITTED", "Logged via portal.", datetime.now(timezone.utc) - timedelta(days=3), "CITIZEN"),
                    ("ASSIGNED", "Forwarded to Highways & Bus Routes division.", datetime.now(timezone.utc) - timedelta(days=2), "SYSTEM"),
                    ("IN_PROGRESS", "Cold-mix asphalt patch scheduled for night shift.", datetime.now(timezone.utc) - timedelta(hours=14), "DEMO_AUTHORITY")
                ]
            },
            {
                "complaint_id": "NC-2026-10494",
                "title": "Overflowing community garbage bin",
                "description": "குப்பைத் தொட்டி நிரம்பி வழிந்து தெருவெங்கும் குப்பைகள் சிதறி கிடக்கின்றன. கடுமையான துர்நாற்றம் வீசுகிறது, நாய்கள் இழுத்து விடுகின்றன.",
                "category": "GARBAGE",
                "subcategory": "OVERFLOWING_BIN",
                "priority": "MEDIUM",
                "priority_reason": "Accumulated household waste posing hygiene concern.",
                "status": "ASSIGNED",
                "location": "Velachery Station Road",
                "landmark": "Near Velachery MRTS Gate 2",
                "pincode": "600042",
                "duration": "2 days",
                "language": "Tamil",
                "citizen_id": citizen_user.id,
                "citizen_name": "Karthik Raja",
                "citizen_phone": "+91 9876543210",
                "department_id": departments_map["SWM"].id,
                "created_at": datetime.now(timezone.utc) - timedelta(days=1),
                "history": [
                    ("SUBMITTED", "Voice complaint submitted in Tamil.", datetime.now(timezone.utc) - timedelta(days=1), "CITIZEN"),
                    ("ASSIGNED", "Route compactor truck notified for clearance.", datetime.now(timezone.utc) - timedelta(hours=10), "SYSTEM")
                ]
            },
            {
                "complaint_id": "NC-2026-10495",
                "title": "Sewage overflow on residential cross street",
                "description": "Drainage manhole blocked and dirty sewage water overflowing on the walking street.",
                "category": "DRAINAGE",
                "subcategory": "SEWAGE_OVERFLOW",
                "priority": "HIGH",
                "priority_reason": "Sanitation contamination risk in residential walkway.",
                "status": "CLOSED",
                "location": "12th Cross Street, Adyar",
                "landmark": "Opposite Canara Bank",
                "pincode": "600020",
                "duration": "1 day",
                "language": "English",
                "citizen_id": citizen_user.id,
                "citizen_name": "Karthik Raja",
                "citizen_phone": "+91 9876543210",
                "department_id": departments_map["CMWSSB"].id,
                "resolution_notes": "Super sucker jetting machine cleared grease blockage. Chamber flushed.",
                "resolution_date": datetime.now(timezone.utc) - timedelta(days=1),
                "created_at": datetime.now(timezone.utc) - timedelta(days=4),
                "history": [
                    ("SUBMITTED", "Complaint logged.", datetime.now(timezone.utc) - timedelta(days=4), "CITIZEN"),
                    ("IN_PROGRESS", "Jetting crew deployed.", datetime.now(timezone.utc) - timedelta(days=2), "DEMO_AUTHORITY"),
                    ("RESOLUTION_PENDING_VERIFICATION", "Jetting complete. Pending citizen verification.", datetime.now(timezone.utc) - timedelta(days=1, hours=4), "DEMO_AUTHORITY"),
                    ("CLOSED", "Citizen confirmed issue is resolved.", datetime.now(timezone.utc) - timedelta(days=1), "CITIZEN")
                ],
                "verification": {
                    "is_resolved": True,
                    "citizen_feedback": "Drainage blockage cleared quickly and water is receding properly. Thank you!",
                    "verified_at": datetime.now(timezone.utc) - timedelta(days=1)
                }
            }
        ]

        for c_data in sample_complaints:
            existing = db.query(Complaint).filter(Complaint.complaint_id == c_data["complaint_id"]).first()
            if not existing:
                raw_history = c_data.pop("history", [])
                raw_verification = c_data.pop("verification", None)

                comp = Complaint(**c_data)
                db.add(comp)
                db.flush()

                if isinstance(raw_history, list):
                    for item in raw_history:
                        if isinstance(item, tuple) and len(item) == 4:
                            to_st, note, ts, actor = item
                            h = ComplaintStatusHistory(
                                complaint_id=comp.id,
                                from_status=None,
                                to_status=str(to_st),
                                notes=str(note),
                                action_by=str(actor),
                                created_at=ts
                            )
                            db.add(h)

                if isinstance(raw_verification, dict):
                    ver = ResolutionVerification(
                        complaint_id=comp.id,
                        is_resolved=bool(raw_verification.get("is_resolved", False)),
                        citizen_feedback=raw_verification.get("citizen_feedback"),
                        verified_at=raw_verification.get("verified_at")
                    )
                    db.add(ver)

                print(f"Seeded complaint {comp.complaint_id} ({comp.status})")

        db.commit()
        print("Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
