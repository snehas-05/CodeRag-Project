import pymysql
import re
import sys
import os

# Add the parent directory to sys.path so we can import app.config
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.config import settings

def migrate():
    url = settings.resolved_mysql_url
    print(f"Connecting to: {url}")
    
    # Extract connection details from SQLAlchemy URL manually
    # Example: mysql+pymysql://coderag_user:coderag_pass@127.0.0.1:3307/coderag
    match = re.match(r"mysql\+pymysql://(.*?):(.*?)@(.*?):(.*?)/(.*)", url)
    if not match:
        print(f"Could not parse URL format: {url}")
        return

    user, password, host, port, db = match.groups()
    
    try:
        connection = pymysql.connect(
            host=host,
            user=user,
            password=password,
            database=db,
            port=int(port)
        )
        print("Connected to database.")
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    try:
        with connection.cursor() as cursor:
            # Check if columns exist
            cursor.execute("SHOW COLUMNS FROM users LIKE 'otp'")
            if not cursor.fetchone():
                print("Adding 'otp' column...")
                cursor.execute("ALTER TABLE users ADD COLUMN otp VARCHAR(10) NULL")
            else:
                print("'otp' column already exists.")
            
            cursor.execute("SHOW COLUMNS FROM users LIKE 'otp_expiry'")
            if not cursor.fetchone():
                print("Adding 'otp_expiry' column...")
                cursor.execute("ALTER TABLE users ADD COLUMN otp_expiry DATETIME NULL")
            else:
                print("'otp_expiry' column already exists.")
            
        connection.commit()
        print("Migration completed successfully.")
    except Exception as e:
        print(f"Migration failed during execution: {e}")
    finally:
        connection.close()
        print("Connection closed.")

if __name__ == "__main__":
    migrate()
