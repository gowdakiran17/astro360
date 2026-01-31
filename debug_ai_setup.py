import sys
import os
from sqlalchemy import inspect
from astro_app.backend.database import engine, Base
from astro_app.backend.models import ChatMessage, User
from astro_app.backend.routers.chat_history import MessageCreate

def check_db_tables():
    print("Checking database tables...")
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Tables found: {tables}")
    if "chat_messages" in tables:
        print("PASS: 'chat_messages' table exists.")
        
        # Check columns
        columns = [c['name'] for c in inspector.get_columns("chat_messages")]
        print(f"Columns in chat_messages: {columns}")
        required = ['id', 'user_id', 'role', 'content', 'html_content', 'timestamp', 'session_id', 'suggestions']
        missing = [c for c in required if c not in columns]
        if missing:
             print(f"FAIL: Missing columns: {missing}")
        else:
             print("PASS: All required columns present.")
    else:
        print("FAIL: 'chat_messages' table MISSING.")
        print("Attempting to create tables...")
        try:
            Base.metadata.create_all(bind=engine)
            print("Tables created. Re-checking...")
            inspector = inspect(engine)
            if "chat_messages" in inspector.get_table_names():
                print("PASS: 'chat_messages' table created successfully.")
            else:
                print("FAIL: Could not create table even after create_all.")
        except Exception as e:
            print(f"FAIL: Error creating tables: {e}")

if __name__ == "__main__":
    try:
        check_db_tables()
        print("\nImport check:")
        print(f"ChatMessage model: {ChatMessage}")
    except Exception as e:
        print(f"An error occurred: {e}")
