import uuid
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Database Drivers
import mysql.connector
import psycopg2
from psycopg2.extras import RealDictCursor

# Internal Import
from config import settings

app = FastAPI(title="SuiteCRM & Postgres Bridge")

# Enable CORS for your Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGINS],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Configurations ---
MARIA_CONFIG = {
    "host": settings.DB_HOST,
    "user": settings.DB_USER,
    "password": settings.DB_PASSWORD,
    "database": settings.DB_NAME,
    "port": settings.DB_PORT
}

PG_CONFIG = {
    "host": settings.PG_HOST,
    "user": settings.PG_USER,
    "password": settings.PG_PASSWORD,
    "database": settings.PG_NAME,
    "port": settings.PG_PORT
}

# --- Schema ---
class ContactBase(BaseModel):
    first_name: str
    last_name: str
    phone_work: str = ""

# --- Routes ---

@app.get("/contacts", response_model=List[dict])
def read_contacts():
    """Fetches contacts from SuiteCRM (MariaDB)"""
    conn = None
    try:
        conn = mysql.connector.connect(**MARIA_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # Check if table exists
        cursor.execute("SHOW TABLES LIKE 'contacts'")
        if not cursor.fetchone():
            return []

        # Fetch active contacts
        query = "SELECT id, first_name, last_name, phone_work FROM contacts WHERE deleted = 0 ORDER BY date_entered DESC"
        cursor.execute(query)
        return cursor.fetchall() or []
        
    except Exception as e:
        print(f"MariaDB Error: {e}")
        raise HTTPException(status_code=500, detail="Error connecting to SuiteCRM database")
    finally:
        if conn and conn.is_connected():
            conn.close()

@app.post("/contacts")
def create_contact(contact: ContactBase):
    """Saves a contact to BOTH MariaDB and PostgreSQL"""
    new_id = str(uuid.uuid4())
    
    # 1. Save to MariaDB (SuiteCRM)
    try:
        conn_my = mysql.connector.connect(**MARIA_CONFIG)
        cursor_my = conn_my.cursor()
        sql_my = """INSERT INTO contacts (id, first_name, last_name, phone_work, deleted, date_entered, date_modified) 
                    VALUES (%s, %s, %s, %s, 0, NOW(), NOW())"""
        cursor_my.execute(sql_my, (new_id, contact.first_name, contact.last_name, contact.phone_work))
        conn_my.commit()
        conn_my.close()
    except Exception as e:
        print(f"MariaDB Insert Fail: {e}")
        raise HTTPException(status_code=500, detail="Failed to save to SuiteCRM")

    # 2. Save to PostgreSQL (Custom Analytics/Backup)
    try:
        conn_pg = psycopg2.connect(**PG_CONFIG)
        cursor_pg = conn_pg.cursor()
        
        # Ensure table exists in Postgres
        cursor_pg.execute("""
            CREATE TABLE IF NOT EXISTS contacts (
                id UUID PRIMARY KEY,
                first_name TEXT,
                last_name TEXT,
                phone_work TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        sql_pg = "INSERT INTO contacts (id, first_name, last_name, phone_work) VALUES (%s, %s, %s, %s)"
        cursor_pg.execute(sql_pg, (new_id, contact.first_name, contact.last_name, contact.phone_work))
        conn_pg.commit()
        conn_pg.close()
    except Exception as e:
        print(f"Postgres Insert Fail: {e}")
        # We don't raise 500 here if MariaDB succeeded, just log it
        return {"status": "success", "warning": "Saved to CRM but Postgres sync failed"}

    return {"status": "success", "id": new_id, "synced": ["mariadb", "postgres"]}

@app.delete("/contacts/{contact_id}")
def delete_contact(contact_id: str):
    """Soft deletes in SuiteCRM and removes from Postgres"""
    try:
        # MariaDB Soft Delete
        conn_my = mysql.connector.connect(**MARIA_CONFIG)
        cursor_my = conn_my.cursor()
        cursor_my.execute("UPDATE contacts SET deleted = 1, date_modified = NOW() WHERE id = %s", (contact_id,))
        conn_my.commit()
        conn_my.close()

        # Postgres Hard Delete
        conn_pg = psycopg2.connect(**PG_CONFIG)
        cursor_pg = conn_pg.cursor()
        cursor_pg.execute("DELETE FROM contacts WHERE id = %s", (contact_id,))
        conn_pg.commit()
        conn_pg.close()

        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/contacts/{contact_id}")
def update_contact(contact_id: str, updated_contact: ContactBase):
    """Updates contact in both MariaDB and Postgres"""
    try:
        # Update MariaDB
        conn_my = mysql.connector.connect(**MARIA_CONFIG)
        cursor_my = conn_my.cursor()
        cursor_my.execute(
            "UPDATE contacts SET first_name=%s, last_name=%s, phone_work=%s, date_modified=NOW() WHERE id=%s",
            (updated_contact.first_name, updated_contact.last_name, updated_contact.phone_work, contact_id)
        )
        conn_my.commit()
        conn_my.close()

        # Update Postgres
        conn_pg = psycopg2.connect(**PG_CONFIG)
        cursor_pg = conn_pg.cursor()
        cursor_pg.execute(
            "UPDATE contacts SET first_name=%s, last_name=%s, phone_work=%s WHERE id=%s",
            (updated_contact.first_name, updated_contact.last_name, updated_contact.phone_work, contact_id)
        )
        conn_pg.commit()
        conn_pg.close()

        return {"status": "updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)