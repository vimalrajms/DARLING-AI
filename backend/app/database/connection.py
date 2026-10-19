import sqlite3
from pathlib import Path
from contextlib import contextmanager

BASE_DIR = Path(__file__).resolve().parents[2]
STORAGE_DIR = BASE_DIR / "storage"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_PATH = STORAGE_DIR / "darling.db"


def get_connection():
    connection = sqlite3.connect(
        str(DATABASE_PATH),
        timeout=30
    )
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


@contextmanager
def database_connection():
    connection = get_connection()

    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize_database():
    with database_connection() as connection:
        connection.execute(
            "CREATE TABLE IF NOT EXISTS users ("
            "id INTEGER PRIMARY KEY AUTOINCREMENT, "
            "username TEXT NOT NULL UNIQUE COLLATE NOCASE, "
            "display_name TEXT NOT NULL, "
            "password_hash TEXT NOT NULL, "
            "language TEXT NOT NULL DEFAULT 'tanglish', "
            "created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"
        )

        connection.execute(
            "CREATE TABLE IF NOT EXISTS memories ("
            "id INTEGER PRIMARY KEY AUTOINCREMENT, "
            "user_id INTEGER NOT NULL, "
            "memory_key TEXT NOT NULL, "
            "memory_value TEXT NOT NULL, "
            "created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, "
            "updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, "
            "UNIQUE(user_id, memory_key), "
            "FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)"
        )

        connection.execute(
            "CREATE TABLE IF NOT EXISTS chat_history ("
            "id INTEGER PRIMARY KEY AUTOINCREMENT, "
            "user_id INTEGER NOT NULL, "
            "role TEXT NOT NULL CHECK(role IN ('user', 'assistant')), "
            "message TEXT NOT NULL, "
            "created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, "
            "FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)"
        )

        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_chat_user_id "
            "ON chat_history(user_id, id)"
        )

    return str(DATABASE_PATH)