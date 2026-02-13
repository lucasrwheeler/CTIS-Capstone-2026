import psycopg2
import os
from dotenv import load_dotenv

# Load env file relative to this file's directory
env_path = os.path.join(os.path.dirname(__file__), "..", "variables.env")
load_dotenv(env_path)

def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database="postgres",
        user="postgres",
        password=os.getenv("DB_PASSWORD"),
        port="5432"
    )
