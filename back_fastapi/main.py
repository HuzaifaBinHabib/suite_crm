from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import mysql.connector
from config import settings # Import our new config

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGINS],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration now uses the settings object
DB_CONFIG = {
    "host": settings.DB_HOST,
    "user": settings.DB_USER,
    "password": settings.DB_PASSWORD,
    "database": settings.DB_NAME,
    "port": settings.DB_PORT
}

class ContactBase(BaseModel):
    first_name: str
    last_name: str
    phone_work: str = ""
class ContactBase(BaseModel):
    first_name: str
    last_name: str
    phone_work: str = ""

@app.get("/contacts", response_model=List[dict])
def read_contacts():
    conn = None
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # Check if table exists first (prevents crash on fresh SuiteCRM installs)
        cursor.execute("SHOW TABLES LIKE 'contacts'")
        if not cursor.fetchone():
            return [] # Return empty list if SuiteCRM hasn't created the table yet

        cursor.execute("SELECT id, first_name, last_name, phone_work FROM contacts WHERE deleted = 0")
        contacts = cursor.fetchall()
        
        # Ensure we return an empty list [] if contacts is None/Empty
        return contacts if contacts else []
        
    except Exception as e:
        print(f"Database Error: {e}")
        # Return a 500 error so Next.js knows something went wrong
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn and conn.is_connected():
            conn.close()

@app.post("/contacts")
def create_contact(contact: ContactBase):
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        sql = """INSERT INTO contacts (id, first_name, last_name, phone_work, deleted, date_entered, date_modified) 
                 VALUES (UUID(), %s, %s, %s, 0, NOW(), NOW())"""
        cursor.execute(sql, (contact.first_name, contact.last_name, contact.phone_work))
        conn.commit()
        conn.close()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/contacts/{contact_id}")
def delete_contact(contact_id: str):
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("UPDATE contacts SET deleted = 1, date_modified = NOW() WHERE id = %s", (contact_id,))
        conn.commit()
        conn.close()
        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))