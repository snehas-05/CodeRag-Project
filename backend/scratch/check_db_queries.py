from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://coderag_user:coderag_pass@127.0.0.1:5432/coderag"

def check_db():
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            tables = conn.execute(text(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = 'public' ORDER BY table_name"
            ))
            print("Tables:", tables.fetchall())

            recent_queries = conn.execute(text("SELECT repo_id, query FROM query_history LIMIT 5"))
            print("Recent Queries:", recent_queries.fetchall())
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    check_db()
