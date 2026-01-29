import os
from dotenv import load_dotenv

# Load the .env file
load_dotenv()

class Settings:
    DB_HOST: str = os.getenv("DB_HOST", "127.0.0.1")
    DB_USER: str = os.getenv("DB_USER")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD")
    DB_NAME: str = os.getenv("DB_NAME")
    DB_PORT: int = int(os.getenv("DB_PORT", 3306))
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")

settings = Settings()