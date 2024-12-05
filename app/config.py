import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load the environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # DB_USER: str = os.getenv("DB_USER", "root")
    # DB_PASSWORD: str = os.getenv("DB_PASSWORD", "toor")    
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "postgres")
    # DB_HOST: str = os.getenv("DB_HOST", "10.2.16.116:6543")
    # DB_NAME: str = os.getenv("DB_NAME", "Node-Simulator")
    DB_HOST: str = os.getenv("DB_HOST", "localhost:5432")
    DB_NAME: str = os.getenv("DB_NAME", "nodesimulatorv1")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY","d0f7217bc208bfc5065e699855de5e6b68b82613d6123389c8f1faf1d4f974cc")
    JWT_REFRESH_SECRET_KEY: str = os.getenv("JWT_REFRESH_SECRET_KEY","e8b1715b386aeb27942625d0037bf68a5b000760b54061f44ffded60639f06d1")

settings = Settings()