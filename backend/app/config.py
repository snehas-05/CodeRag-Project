from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # MySQL
    MYSQL_URL: str = "mysql+pymysql://coderag_user:coderag_pass@mysql:3306/coderag"

    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ChromaDB
    CHROMA_HOST: str = "chromadb"
    CHROMA_PORT: int = 8000

    # Elasticsearch
    ELASTICSEARCH_URL: str = "http://elasticsearch:9200"

    # Model & repo storage (inside container)
    MODEL_CACHE_DIR: str = "/app/model_cache"
    REPOS_DIR: str = "/app/repos"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
