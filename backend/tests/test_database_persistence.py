import pytest
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError

from app.core.database import Base
from app.models.user import User
from app.models.department import Department
from app.models.complaint import Complaint
from app.models.history import ComplaintStatusHistory
from app.core.security import get_password_hash, verify_password

# Use an in-memory SQLite database or configured test database for isolation
TEST_DB_URL = "sqlite:///:memory:"

@pytest.fixture(scope="module")
def db_engine():
    engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session(db_engine):
    Session = sessionmaker(bind=db_engine, autocommit=False, autoflush=False)
    session = Session()
    yield session
    session.rollback()
    session.close()

def test_user_persistence_and_password_hashing(db_engine):
    Session = sessionmaker(bind=db_engine, autocommit=False, autoflush=False)
    
    # 1. Insert user in first session
    session1 = Session()
    plain_password = "SecurePassword2026!"
    hashed = get_password_hash(plain_password)
    user = User(
        email="citizen_persist@example.com",
        full_name="Persist Citizen",
        phone_number="+91 9999988888",
        hashed_password=hashed,
        role="CITIZEN"
    )
    session1.add(user)
    session1.commit()
    user_id = user.id
    session1.close()

    # 2. Query user from second independent session (simulating app restart)
    session2 = Session()
    loaded_user = session2.query(User).filter(User.id == user_id).first()
    assert loaded_user is not None
    assert loaded_user.email == "citizen_persist@example.com"
    assert loaded_user.hashed_password != plain_password
    assert verify_password(plain_password, loaded_user.hashed_password) is True
    session2.close()

def test_unique_email_constraint(db_session):
    user1 = User(
        email="duplicate@example.com",
        full_name="User One",
        hashed_password=get_password_hash("Pass1!"),
        role="CITIZEN"
    )
    db_session.add(user1)
    db_session.commit()

    user2 = User(
        email="duplicate@example.com",
        full_name="User Two",
        hashed_password=get_password_hash("Pass2!"),
        role="CITIZEN"
    )
    db_session.add(user2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()

def test_complaint_and_status_history_persistence(db_engine):
    Session = sessionmaker(bind=db_engine, autocommit=False, autoflush=False)

    # 1. Create complaint and initial history in Session 1
    session1 = Session()
    dept = Department(code="TEST_ELEC", name="Test Electrical")
    session1.add(dept)
    session1.flush()

    complaint = Complaint(
        complaint_id="NC-2026-90001",
        title="Flickering streetlight",
        description="Streetlight on 5th street flickers continuously.",
        category="STREETLIGHT",
        subcategory="FLICKERING",
        priority="HIGH",
        priority_reason="Safety hazard at dark junction.",
        status="SUBMITTED",
        location="5th Cross Street, Guindy",
        landmark="Near post office",
        pincode="600032",
        duration="2 days",
        language="English",
        latitude=13.0067,
        longitude=80.2023,
        geocoded_address="Guindy, Chennai, Tamil Nadu, 600032",
        department_id=dept.id
    )
    session1.add(complaint)
    session1.flush()

    history1 = ComplaintStatusHistory(
        complaint_id=complaint.id,
        from_status=None,
        to_status="SUBMITTED",
        action_by="CITIZEN",
        notes="Complaint initially submitted"
    )
    session1.add(history1)
    session1.commit()
    comp_id = complaint.id
    session1.close()

    # 2. Update status in Session 2
    session2 = Session()
    comp_to_update = session2.query(Complaint).filter(Complaint.id == comp_id).first()
    assert comp_to_update is not None
    comp_to_update.status = "IN_PROGRESS"
    history2 = ComplaintStatusHistory(
        complaint_id=comp_to_update.id,
        from_status="SUBMITTED",
        to_status="IN_PROGRESS",
        action_by="OFFICER",
        notes="Crew dispatched to site"
    )
    session2.add(history2)
    session2.commit()
    session2.close()

    # 3. Read back in Session 3 (verifying full persistence and relationship)
    session3 = Session()
    final_comp = session3.query(Complaint).filter(Complaint.id == comp_id).first()
    assert final_comp is not None
    assert final_comp.complaint_id == "NC-2026-90001"
    assert final_comp.status == "IN_PROGRESS"
    assert final_comp.latitude == 13.0067
    assert final_comp.longitude == 80.2023
    assert len(final_comp.status_history) == 2
    assert final_comp.status_history[0].to_status == "SUBMITTED"
    assert final_comp.status_history[1].to_status == "IN_PROGRESS"
    session3.close()

def test_unique_complaint_id_constraint(db_session):
    c1 = Complaint(
        complaint_id="NC-UNIQUE-001",
        title="Issue 1",
        description="Desc 1",
        category="ROAD",
        status="SUBMITTED",
        location="Location 1"
    )
    db_session.add(c1)
    db_session.commit()

    c2 = Complaint(
        complaint_id="NC-UNIQUE-001",
        title="Issue 2",
        description="Desc 2",
        category="GARBAGE",
        status="SUBMITTED",
        location="Location 2"
    )
    db_session.add(c2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()

def test_cascade_delete_history(db_session):
    comp = Complaint(
        complaint_id="NC-DELETE-001",
        title="To be deleted",
        description="Desc",
        category="WATER",
        status="SUBMITTED",
        location="Loc"
    )
    db_session.add(comp)
    db_session.flush()

    h = ComplaintStatusHistory(
        complaint_id=comp.id,
        to_status="SUBMITTED"
    )
    db_session.add(h)
    db_session.commit()

    cid = comp.id
    # Delete complaint
    db_session.delete(comp)
    db_session.commit()

    # Status history should be cascade-deleted
    remaining_hist = db_session.query(ComplaintStatusHistory).filter(
        ComplaintStatusHistory.complaint_id == cid
    ).all()
    assert len(remaining_hist) == 0

def test_role_based_complaint_filtering(db_session):
    # Citizen 1
    u1 = User(email="user1@example.com", full_name="User 1", hashed_password="h", role="CITIZEN")
    # Citizen 2
    u2 = User(email="user2@example.com", full_name="User 2", hashed_password="h", role="CITIZEN")
    db_session.add_all([u1, u2])
    db_session.flush()

    c1 = Complaint(
        complaint_id="NC-U1-001", title="U1 issue", description="D", category="ROAD",
        status="SUBMITTED", location="Loc 1", citizen_id=u1.id
    )
    c2 = Complaint(
        complaint_id="NC-U2-001", title="U2 issue", description="D", category="ROAD",
        status="SUBMITTED", location="Loc 2", citizen_id=u2.id
    )
    db_session.add_all([c1, c2])
    db_session.commit()

    # User 1 queries their complaints
    u1_complaints = db_session.query(Complaint).filter(Complaint.citizen_id == u1.id).all()
    assert len(u1_complaints) == 1
    assert u1_complaints[0].complaint_id == "NC-U1-001"

    # User 2 queries their complaints
    u2_complaints = db_session.query(Complaint).filter(Complaint.citizen_id == u2.id).all()
    assert len(u2_complaints) == 1
    assert u2_complaints[0].complaint_id == "NC-U2-001"

