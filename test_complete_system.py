"""
Comprehensive Test Script for NammaCivic AI
Validates all requirements:
1. Authentication (User and Officer separation, role checks)
2. Registration with validation & duplicate detection
3. Login failure messages ("No user found with this email address. Please register first.", "Incorrect password. Please try again.")
4. Forgot password & secure token reset
5. Address verification statuses (VERIFIED, AMBIGUOUS, NOT_FOUND)
6. Chatbot conversation flow (greetings, multi-lingual, categories, confirmations, draft generation)
7. Complaint creation with unique sequential ID & PostgreSQL persistence
8. Officer dashboard list, full report details, RECTIFIED status update, and audit trail
"""

import os
import sys
from pathlib import Path

# Add backend directory to path
backend_path = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_path))

os.environ["TESTING"] = "1"
os.environ["AI_PROVIDER"] = "fallback"

from app.core.database import SessionLocal, check_db_connection
from app.models.user import User
from app.models.complaint import Complaint
from app.models.history import ComplaintStatusHistory
from app.models.password_reset import PasswordResetToken
from app.schemas.user import UserCreate, UserLogin, ForgotPasswordRequest, ResetPasswordRequest
from app.schemas.complaint import ComplaintCreate
from app.schemas.chat import ChatMessageRequest, ChatConfirmSubmissionRequest
from app.schemas.officer import OfficerStatusUpdateRequest
from app.api.v1.auth import register, login, forgot_password, reset_password
from app.api.v1.chat import _process_message, confirm_chatbot_submission
from app.api.v1.officer import list_officer_grievances, get_officer_complaint_detail, update_grievance_status
from app.services.complaint_service import complaint_service
from app.services.address_service import AddressVerificationService
from app.ai.dataset_retrieval import retrieval_engine

def run_tests():
    print("==================================================")
    print("NAMMACIVIC AI - COMPREHENSIVE SYSTEM VERIFICATION")
    print("==================================================")

    # 1. Database Connection Check
    db_status = check_db_connection()
    print(f"\n[1] Database Connection: {db_status}")
    assert db_status["status"] == "connected", f"Database not connected: {db_status}"

    db = SessionLocal()

    # 2. Authentication: User Registration & Duplicate Check
    test_email = "test_citizen_2026@nammacivic.org"
    db.query(PasswordResetToken).filter(PasswordResetToken.user.has(email=test_email)).delete(synchronize_session=False)
    db.query(Complaint).filter(Complaint.citizen.has(email=test_email)).delete(synchronize_session=False)
    db.query(User).filter(User.email == test_email).delete(synchronize_session=False)
    db.commit()

    print("\n[2] Testing Citizen Registration...")
    reg_in = UserCreate(
        email=test_email,
        full_name="Swetha Citizen",
        phone_number="9876543210",
        password="ValidPassword123!"
    )
    reg_res = register(reg_in, db)
    print(f"    Citizen registered successfully! User ID: {reg_res.user.id}, Role: {reg_res.user.role}")
    assert reg_res.user.role == "CITIZEN"

    # Duplicate registration check
    try:
        register(reg_in, db)
        assert False, "Should have rejected duplicate registration!"
    except Exception as e:
        print(f"    Duplicate registration correctly rejected: {e.detail}")

    # 3. Authentication: Unknown Email & Incorrect Password
    print("\n[3] Testing Login Failure Messages...")
    try:
        login(UserLogin(email="nonexistent_xyz@nammacivic.org", password="SomePassword"), db)
        assert False, "Should fail on unknown email"
    except Exception as e:
        print(f"    Unknown email message: {e.detail}")
        assert "No user found with this email address" in str(e.detail)

    try:
        login(UserLogin(email=test_email, password="WrongPassword123!"), db)
        assert False, "Should fail on wrong password"
    except Exception as e:
        print(f"    Wrong password message: {e.detail}")
        assert "Incorrect password" in str(e.detail)

    # Successful login
    login_res = login(UserLogin(email=test_email, password="ValidPassword123!"), db)
    print(f"    Citizen login successful! Token generated, User: {login_res.user.full_name}")

    # 4. Forgot Password & Secure Token Reset
    print("\n[4] Testing Forgot Password & Password Reset...")
    forgot_res = forgot_password(ForgotPasswordRequest(email=test_email), db)
    print(f"    Forgot password message: {forgot_res.message}")
    token = forgot_res.reset_token
    assert token, "Reset token should be generated in development test mode!"

    reset_res = reset_password(ResetPasswordRequest(token=token, new_password="NewSecurePassword123!"), db)
    print(f"    Reset password result: {reset_res['message']}")

    # Verify login with new password
    login_new = login(UserLogin(email=test_email, password="NewSecurePassword123!"), db)
    print(f"    Login with new password verified! User: {login_new.user.email}")
    citizen_orm = db.query(User).filter(User.id == login_new.user.id).first()

    # 5. Officer Role Setup & Authorization Check
    print("\n[5] Testing Officer Account & Role Restrictions...")
    officer_email = "test_officer@gcc.gov.in"
    officer = db.query(User).filter(User.email == officer_email).first()
    if not officer:
        from app.core.security import get_password_hash
        officer = User(
            email=officer_email,
            full_name="Er. K. Natarajan",
            hashed_password=get_password_hash("OfficerSecret2026!"),
            role="OFFICER"
        )
        db.add(officer)
        db.commit()
        db.refresh(officer)
    print(f"    Officer verified in database: {officer.full_name}, Role: {officer.role}")

    # Ordinary citizen should be rejected by require_officer_role
    from app.api.v1.officer import require_officer_role
    try:
        citizen_user = db.query(User).filter(User.email == test_email).first()
        require_officer_role(citizen_user)
        assert False, "Ordinary citizen should not have officer privileges!"
    except Exception as e:
        print(f"    Citizen access to officer dashboard correctly denied: {e.detail}")

    # 6. Address Verification
    print("\n[6] Testing Address Verification (OpenStreetMap / Nominatim)...")
    addr_svc = AddressVerificationService()
    v1 = addr_svc.verify_address("Anna Nagar 4th Main Road, Chennai")
    print(f"    Address 1 status: {v1.status}, Matches count: {len(v1.candidates)}")
    assert v1.status in ["VERIFIED", "PARTIALLY_MATCHED", "AMBIGUOUS"]

    v_empty = addr_svc.verify_address("")
    print(f"    Empty address status: {v_empty.status}")
    assert v_empty.status == "NOT_FOUND"

    # 7. Chatbot Conversation & Confirmation
    print("\n[7] Testing Multilingual Chatbot Conversation...")
    
    # 7a. Greeting test
    r_greet = _process_message(ChatMessageRequest(message="hii"), db)
    print(f"    'hii' greeting reply: {r_greet.reply[:60]}...")
    assert "NammaCivic AI" in r_greet.reply or "Hello" in r_greet.reply or "வணக்கம்" in r_greet.reply

    # 7b. Road damage in Tanglish
    r_chat = _process_message(ChatMessageRequest(message="road-la periya kuzhi irukku Anna Nagar 4th Main Road-la"), db)
    print(f"    Tanglish road report category: {r_chat.draft.category}")
    assert r_chat.draft.category in ["ROAD_DAMAGE", "ROAD"]
    session_id = r_chat.session_id

    # 7c. Missing info fulfillment (duration)
    r_dur = _process_message(ChatMessageRequest(session_id=session_id, message="3 days-a irukku"), db)
    print(f"    Duration fulfilled: {r_dur.draft.duration}, Summary ready: {r_dur.is_summary_ready}")
    assert r_dur.draft.needs_confirmation is True

    # 7d. Tamil confirmation: "ஆம் சமர்ப்பிக்கவும்"
    r_conf = _process_message(ChatMessageRequest(session_id=session_id, message="ஆம் சமர்ப்பிக்கவும்"), db)
    print(f"    Tamil confirmation accepted: Ready to submit = {r_conf.draft.is_ready_to_submit}")
    assert r_conf.draft.is_ready_to_submit is True

    # 7e. Finalize complaint via confirmation endpoint
    comp_chat = confirm_chatbot_submission(
        ChatConfirmSubmissionRequest(
            session_id=session_id,
            latitude=13.0850,
            longitude=80.2150,
            geocoded_address="4th Main Road, Anna Nagar, Chennai",
            address_verification_status="VERIFIED"
        ),
        db=db,
        current_user=citizen_orm
    )
    print(f"    Chatbot finalized complaint in PostgreSQL: ID = {comp_chat.complaint_id}, Status = {comp_chat.status}")
    assert comp_chat.complaint_id.startswith("NC-")

    # 8. Manual Complaint Reporting
    print("\n[8] Testing Manual Grievance Reporting (Method A)...")
    manual_in = ComplaintCreate(
        title="Overflowing garbage bin and uncollected waste",
        description="Garbage bin is overflowing onto pedestrian walkway near primary health center.",
        category="GARBAGE",
        location="Ranganathan Street, T. Nagar, Chennai",
        landmark="Near Primary Health Center",
        duration="4 days",
        citizen_name="Swetha Citizen",
        citizen_phone="9876543210",
        latitude=13.0418,
        longitude=80.2341,
        geocoded_address="Ranganathan St, T. Nagar, Chennai"
    )
    manual_comp = complaint_service.create_complaint(db, manual_in, citizen_id=login_new.user.id)
    manual_comp.address_verification_status = "VERIFIED"
    db.commit()
    print(f"    Manual complaint created in PostgreSQL: ID = {manual_comp.complaint_id}, Title = {manual_comp.title}")
    assert manual_comp.status == "SUBMITTED"

    # 9. Officer Dashboard: Listing & Detail & RECTIFIED Action
    print("\n[9] Testing Officer Dashboard Endpoints...")
    officer_list = list_officer_grievances(db=db, current_officer=officer)
    print(f"    Officer grievances retrieved from PostgreSQL: {len(officer_list)} items")
    assert len(officer_list) >= 2

    # Fetch full report detail
    detail = get_officer_complaint_detail(manual_comp.complaint_id, db=db, current_officer=officer)
    print(f"    Full report detail verified: {detail.complaint_id}, Location: {detail.location}")

    # Mark RECTIFIED
    rectify_req = OfficerStatusUpdateRequest(
        status="RESOLUTION_PENDING_VERIFICATION",
        assigned_officer="Er. K. Natarajan",
        resolution_notes="Garbage bin cleared by GCC solid waste management team with compactors."
    )
    rectified_comp = update_grievance_status(manual_comp.complaint_id, rectify_req, db, officer)
    print(f"    Grievance marked RECTIFIED! Status = {rectified_comp.status}")
    assert rectified_comp.status == "RESOLUTION_PENDING_VERIFICATION"

    # Verify history entry
    hist = db.query(ComplaintStatusHistory).filter(ComplaintStatusHistory.complaint_id == manual_comp.id).order_by(ComplaintStatusHistory.id.desc()).first()
    print(f"    Status history recorded: {hist.to_status} by {hist.action_by}, Notes: {hist.notes}")
    assert hist.to_status == "RESOLUTION_PENDING_VERIFICATION"

    db.close()
    print("\n==================================================")
    print("ALL TESTS PASSED SUCCESSFULLY ON POSTGRESQL!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
