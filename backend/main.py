import os
import re
import time
import jwt

from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pwdlib import PasswordHash

from app.database.connection import (
    initialize_database,
    database_connection
)

app = FastAPI(title="DARLING Robot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5501",
        "http://127.0.0.1:5501"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
)

password_hasher = PasswordHash.recommended()
security = HTTPBearer()

SECRET_KEY = os.environ.get("DARLING_SECRET_KEY")

if not SECRET_KEY or len(SECRET_KEY) < 32:
    raise RuntimeError(
        "Set DARLING_SECRET_KEY to a random secret of at least 32 characters."
    )


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    display_name: str = Field(min_length=1, max_length=60)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    password: str = Field(min_length=1, max_length=128)


def create_token(user_id: int, username: str):
    now = datetime.now(timezone.utc)

    payload = {
        "sub": str(user_id),
        "username": username,
        "iat": now,
        "exp": now + timedelta(hours=12)
    }

    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        user_id = int(payload["sub"])

    except (jwt.InvalidTokenError, ValueError, KeyError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired login token."
        )

    with database_connection() as connection:
        user = connection.execute(
            "SELECT id, username, display_name, language "
            "FROM users WHERE id = ?",
            (user_id,)
        ).fetchone()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Account not found."
        )

    return dict(user)


@app.on_event("startup")
def startup():
    initialize_database()


@app.get("/")
def home():
    return {
        "status": "online",
        "app": "DARLING Robot API"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/api/register")
def register(data: RegisterRequest):
    username = data.username.strip()
    display_name = data.display_name.strip()

    if not re.fullmatch(r"[A-Za-z0-9_]{3,30}", username):
        raise HTTPException(
            status_code=400,
            detail="Username must contain 3-30 letters, numbers or underscores."
        )

    if not display_name:
        raise HTTPException(
            status_code=400,
            detail="Display name is required."
        )

    password_hash = password_hasher.hash(data.password)

    try:
        with database_connection() as connection:
            cursor = connection.execute(
                "INSERT INTO users "
                "(username, display_name, password_hash) "
                "VALUES (?, ?, ?)",
                (username, display_name, password_hash)
            )

            user_id = cursor.lastrowid

    except Exception as error:
        if "UNIQUE constraint failed" in str(error):
            raise HTTPException(
                status_code=409,
                detail="Username already exists."
            )
        raise

    token = create_token(user_id, username)

    return {
        "message": "Account created successfully.",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "username": username,
            "display_name": display_name
        }
    }


@app.post("/api/login")
def login(data: LoginRequest):
    with database_connection() as connection:
        user = connection.execute(
            "SELECT id, username, display_name, password_hash, language "
            "FROM users WHERE username = ? COLLATE NOCASE",
            (data.username.strip(),)
        ).fetchone()

    if user is None or not password_hasher.verify(
        data.password,
        user["password_hash"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password."
        )

    token = create_token(user["id"], user["username"])

    return {
        "message": "Login successful.",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "display_name": user["display_name"],
            "language": user["language"]
        }
    }


@app.get("/api/me")
def get_me(user: dict = Depends(get_current_user)):
    return {
        "user": user
    }