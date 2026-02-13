import uuid
from typing import List, Optional
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

# Enable CORS
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

# --- Schemas ---
class ContactBase(BaseModel):
    first_name: str
    last_name: str
    phone_work: str = ""

class UserBase(BaseModel):
    user_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    status: Optional[str] = "Active"
    is_admin: Optional[int] = 0

# --- CONTACT ROUTES (CRUD) ---

@app.get("/contacts", response_model=List[dict])
def read_contacts():
    conn = None
    try:
        conn = mysql.connector.connect(**MARIA_CONFIG)
        cursor = conn.cursor(dictionary=True)
        query = "SELECT id, first_name, last_name, phone_work FROM contacts WHERE deleted = 0 ORDER BY date_entered DESC"
        cursor.execute(query)
        return cursor.fetchall() or []
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching contacts")
    finally:
        if conn: conn.close()

@app.post("/contacts")
def create_contact(contact: ContactBase):
    new_id = str(uuid.uuid4())
    try:
        # 1. MariaDB
        conn_my = mysql.connector.connect(**MARIA_CONFIG)
        cursor_my = conn_my.cursor()
        cursor_my.execute(
            "INSERT INTO contacts (id, first_name, last_name, phone_work, deleted, date_entered, date_modified) VALUES (%s, %s, %s, %s, 0, NOW(), NOW())",
            (new_id, contact.first_name, contact.last_name, contact.phone_work)
        )
        conn_my.commit()
        conn_my.close()

        # 2. Postgres
        conn_pg = psycopg2.connect(**PG_CONFIG)
        cursor_pg = conn_pg.cursor()
        cursor_pg.execute("INSERT INTO contacts (id, first_name, last_name, phone_work) VALUES (%s, %s, %s, %s)",
                         (new_id, contact.first_name, contact.last_name, contact.phone_work))
        conn_pg.commit()
        conn_pg.close()
        return {"status": "success", "id": new_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/contacts/{contact_id}")
def update_contact(contact_id: str, updated_contact: ContactBase):
    try:
        # 1. MariaDB
        conn_my = mysql.connector.connect(**MARIA_CONFIG)
        cursor_my = conn_my.cursor()
        cursor_my.execute("UPDATE contacts SET first_name=%s, last_name=%s, phone_work=%s, date_modified=NOW() WHERE id=%s",
                         (updated_contact.first_name, updated_contact.last_name, updated_contact.phone_work, contact_id))
        conn_my.commit()
        conn_my.close()

        # 2. Postgres
        conn_pg = psycopg2.connect(**PG_CONFIG)
        cursor_pg = conn_pg.cursor()
        cursor_pg.execute("UPDATE contacts SET first_name=%s, last_name=%s, phone_work=%s WHERE id=%s",
                         (updated_contact.first_name, updated_contact.last_name, updated_contact.phone_work, contact_id))
        conn_pg.commit()
        conn_pg.close()
        return {"status": "updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/contacts/{contact_id}")
def delete_contact(contact_id: str):
    try:
        # 1. MariaDB Soft Delete
        conn_my = mysql.connector.connect(**MARIA_CONFIG)
        cursor_my = conn_my.cursor()
        cursor_my.execute("UPDATE contacts SET deleted = 1 WHERE id = %s", (contact_id,))
        conn_my.commit()
        conn_my.close()

        # 2. Postgres Hard Delete
        conn_pg = psycopg2.connect(**PG_CONFIG)
        cursor_pg = conn_pg.cursor()
        cursor_pg.execute("DELETE FROM contacts WHERE id = %s", (contact_id,))
        conn_pg.commit()
        conn_pg.close()
        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- USER ROUTES (CRUD WITH AUTO-SYNC) ---

@app.get("/users", response_model=List[dict])
def read_users():
    """Reads from high-performance Postgres"""
    try:
        conn_pg = psycopg2.connect(**PG_CONFIG)
        cursor_pg = conn_pg.cursor(cursor_factory=RealDictCursor)
        cursor_pg.execute("SELECT id, user_name, first_name, last_name, status, is_admin FROM users ORDER BY user_name ASC")
        users = cursor_pg.fetchall()
        conn_pg.close()
        return users
    except Exception:
        return []

@app.post("/users")
def create_user(user: UserBase):
    """Creates user in SuiteCRM (MariaDB) and Auto-Syncs to Postgres"""
    new_id = str(uuid.uuid4())
    try:
        # 1. MariaDB
        conn_my = mysql.connector.connect(**MARIA_CONFIG)
        cursor_my = conn_my.cursor()
        cursor_my.execute(
            "INSERT INTO users (id, user_name, first_name, last_name, status, is_admin, deleted, date_entered, date_modified) VALUES (%s, %s, %s, %s, %s, %s, 0, NOW(), NOW())",
            (new_id, user.user_name, user.first_name, user.last_name, user.status, user.is_admin)
        )
        conn_my.commit()
        conn_my.close()

        # 2. Postgres Auto-Sync
        conn_pg = psycopg2.connect(**PG_CONFIG)
        cursor_pg = conn_pg.cursor()
        cursor_pg.execute(
            "INSERT INTO users (id, user_name, first_name, last_name, status, is_admin, last_synced) VALUES (%s, %s, %s, %s, %s, %s, NOW())",
            (new_id, user.user_name, user.first_name, user.last_name, user.status, user.is_admin)
        )
        conn_pg.commit()
        conn_pg.close()
        return {"status": "success", "id": new_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/users/{user_id}")
def update_user(user_id: str, user: UserBase):
    try:
        # 1. MariaDB
        conn_my = mysql.connector.connect(**MARIA_CONFIG)
        cursor_my = conn_my.cursor()
        cursor_my.execute(
            "UPDATE users SET user_name=%s, first_name=%s, last_name=%s, status=%s, is_admin=%s, date_modified=NOW() WHERE id=%s",
            (user.user_name, user.first_name, user.last_name, user.status, user.is_admin, user_id)
        )
        conn_my.commit()
        conn_my.close()

        # 2. Postgres Auto-Sync
        conn_pg = psycopg2.connect(**PG_CONFIG)
        cursor_pg = conn_pg.cursor()
        cursor_pg.execute(
            "UPDATE users SET user_name=%s, first_name=%s, last_name=%s, status=%s, is_admin=%s, last_synced=NOW() WHERE id=%s",
            (user.user_name, user.first_name, user.last_name, user.status, user.is_admin, user_id)
        )
        conn_pg.commit()
        conn_pg.close()
        return {"status": "updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/users/{user_id}")
def delete_user(user_id: str):
    try:
        # 1. MariaDB Soft Delete
        conn_my = mysql.connector.connect(**MARIA_CONFIG)
        cursor_my = conn_my.cursor()
        cursor_my.execute("UPDATE users SET deleted = 1 WHERE id = %s", (user_id,))
        conn_my.commit()
        conn_my.close()

        # 2. Postgres Hard Delete
        conn_pg = psycopg2.connect(**PG_CONFIG)
        cursor_pg = conn_pg.cursor()
        cursor_pg.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn_pg.commit()
        conn_pg.close()
        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/users/sync")
def sync_users_maria_to_pg():
    """Pull all users from SuiteCRM (MariaDB) and upsert into Postgres."""
    try:
        conn_my = mysql.connector.connect(**MARIA_CONFIG)
        cursor_my = conn_my.cursor(dictionary=True)
        cursor_my.execute(
            "SELECT id, user_name, first_name, last_name, status, is_admin FROM users WHERE deleted = 0"
        )
        rows = cursor_my.fetchall()
        conn_my.close()

        conn_pg = psycopg2.connect(**PG_CONFIG)
        cursor_pg = conn_pg.cursor()
        for r in rows:
            cursor_pg.execute(
                """
                INSERT INTO users (id, user_name, first_name, last_name, status, is_admin, last_synced)
                VALUES (%s, %s, %s, %s, %s, %s, NOW())
                ON CONFLICT (id) DO UPDATE SET
                    user_name = EXCLUDED.user_name,
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    status = EXCLUDED.status,
                    is_admin = EXCLUDED.is_admin,
                    last_synced = NOW()
                """,
                (r["id"], r["user_name"], r.get("first_name"), r.get("last_name"), r.get("status"), r.get("is_admin", 0))
            )
        conn_pg.commit()
        conn_pg.close()
        return {"status": "success", "synced": len(rows)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)