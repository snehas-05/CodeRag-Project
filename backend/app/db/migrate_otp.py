import sys
import os
from sqlalchemy import inspect, text

# Add the parent directory to sys.path so we can import app.config
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database import engine

def migrate():
    try:
        connection = engine.connect()
        print("Connected to database.")
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    try:
        with connection.begin():
            inspector = inspect(connection)
            columns = {column["name"] for column in inspector.get_columns("users")}

            if "otp" not in columns:
                print("Adding 'otp' column...")
                connection.execute(text("ALTER TABLE users ADD COLUMN otp VARCHAR(10) NULL"))
            else:
                print("'otp' column already exists.")

            if "otp_expiry" not in columns:
                print("Adding 'otp_expiry' column...")
                connection.execute(text("ALTER TABLE users ADD COLUMN otp_expiry TIMESTAMP NULL"))
            else:
                print("'otp_expiry' column already exists.")

        print("Migration completed successfully.")
    except Exception as e:
        print(f"Migration failed during execution: {e}")
    finally:
        connection.close()
        print("Connection closed.")

if __name__ == "__main__":
    migrate()
