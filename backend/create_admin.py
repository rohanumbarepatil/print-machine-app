from app.database.database import SessionLocal
from app.database.models.admin import Admin
from app.services.security import hash_password


EMAIL = "admin@example.com"
PASSWORD = "Admin@12345"
NAME = "System Admin"


db = SessionLocal()

try:
    existing = db.query(Admin).filter(Admin.email == EMAIL).first()

    if existing:
        print("ADMIN ALREADY EXISTS")
    else:
        admin = Admin(
            email=EMAIL,
            password_hash=hash_password(PASSWORD),
            name=NAME,
            is_active=True,
        )

        db.add(admin)
        db.commit()

        print("ADMIN CREATED")
        print("EMAIL:", EMAIL)
        print("PASSWORD:", PASSWORD)

finally:
    db.close()
