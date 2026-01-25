from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from astro_app.backend.models import User, Chart

# Ensure imports work by setting python path if needed, but running as module or from root usually works
# Or simpler:
import sys
import os
sys.path.append(os.getcwd())

SQLALCHEMY_DATABASE_URL = "sqlite:///./astro_app.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

print("--- Users ---")
users = db.query(User).all()
for u in users:
    print(f"ID: {u.id}, Email: {u.email}")

print("\n--- Charts ---")
charts = db.query(Chart).all()
for c in charts:
    print(f"ID: {c.id}, UserID: {c.user_id}, Name: {c.first_name} {c.last_name}, Created: {c.created_at}")

db.close()
