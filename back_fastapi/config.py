import os
from pathlib import Path
from dotenv import load_dotenv

# Force load from the current directory's .env file
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

class Settings:
    # MariaDB (MySQL)
    DB_HOST: str = os.getenv("DB_HOST", "127.0.0.1")
    DB_USER: str = os.getenv("DB_USER")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD")
    DB_NAME: str = os.getenv("DB_NAME")
    DB_PORT: int = int(os.getenv("DB_PORT", 3306))

    # PostgreSQL
    PG_HOST: str = os.getenv("PG_HOST", "127.0.0.1")
    PG_USER: str = os.getenv("PG_USER")
    PG_PASSWORD: str = os.getenv("PG_PASSWORD")
    PG_NAME: str = os.getenv("PG_NAME")
    PG_PORT: int = int(os.getenv("PG_PORT", 5432))

    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*") 

settings = Settings()

# Debug: This will print in your terminal so you can verify the host
print(f"--- CONFIG LOADED: MariaDB Host is {settings.DB_HOST} ---")