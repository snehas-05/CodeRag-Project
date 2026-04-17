import logging
import time
from sqlalchemy import text
from app.database import engine
from app.config import settings
from app.services.elasticsearch_service import _get_es_client
from app.services.embeddings import _get_chroma_client

logger = logging.getLogger("coderag.health")

def verify_mysql(max_retries: int = 5, delay: float = 2.0) -> bool:
    """Verify MySQL connectivity with retries."""
    for i in range(max_retries):
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            logger.info("MySQL: Connected and healthy.")
            return True
        except Exception as e:
            logger.warning(f"MySQL: Attempt {i+1}/{max_retries} failed: {e}")
            if i < max_retries - 1:
                time.sleep(delay)
    logger.error("MySQL: Failed to connect after multiple attempts.")
    return False

def verify_chroma(max_retries: int = 5, delay: float = 2.0) -> bool:
    """Verify ChromaDB connectivity with retries."""
    for i in range(max_retries):
        try:
            client = _get_chroma_client()
            client.heartbeat()
            logger.info("ChromaDB: Connected and healthy.")
            return True
        except Exception as e:
            logger.warning(f"ChromaDB: Attempt {i+1}/{max_retries} failed: {e}")
            if i < max_retries - 1:
                time.sleep(delay)
    logger.error("ChromaDB: Failed to connect after multiple attempts.")
    return False

def verify_elasticsearch(max_retries: int = 5, delay: float = 2.0) -> bool:
    """Verify Elasticsearch connectivity with retries."""
    for i in range(max_retries):
        try:
            es = _get_es_client()
            if es.ping():
                logger.info("Elasticsearch: Connected and healthy.")
                return True
            else:
                logger.warning(f"Elasticsearch: Attempt {i+1}/{max_retries} ping returned False.")
        except Exception as e:
            logger.warning(f"Elasticsearch: Attempt {i+1}/{max_retries} failed: {e}")
        
        if i < max_retries - 1:
            time.sleep(delay)
    logger.error("Elasticsearch: Failed to connect after multiple attempts.")
    return False

def check_dependencies() -> bool:
    """Run all dependency checks. Returns True if all core systems are up."""
    # We check them all, but MySQL is often the most critical for basic startup
    mysql_ok = verify_mysql()
    chroma_ok = verify_chroma()
    es_ok = verify_elasticsearch()
    
    return all([mysql_ok, chroma_ok, es_ok])
