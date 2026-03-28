from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import get_db
import random

app = FastAPI()

# -------- USERNAME GENERATOR -------- #
adjectives = ["cool", "smart", "silent", "fast", "brave", "fox", "dark", "cyber"]
nouns = ["tiger", "hawk", "coder", "ninja", "ghost", "hunter", "wolf"]

def generate_username():
    return random.choice(adjectives) + random.choice(nouns) + str(random.randint(10, 99))


# -------- CORS -------- #
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= AUTH ================= #

@app.post("/signup")
def signup(data: dict):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE email=%s", (data["email"],))
    if cursor.fetchone():
        return {"error": "User already exists"}

    username = generate_username()

    cursor.execute(
        "INSERT INTO users (email, password, username) VALUES (%s, %s, %s)",
        (data["email"], data["password"], username)
    )
    db.commit()

    return {"message": "User created"}


@app.post("/login")
def login(data: dict):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM users WHERE email=%s AND password=%s",
        (data["email"], data["password"])
    )

    user = cursor.fetchone()

    if not user:
        return {"error": "Invalid credentials"}

    return {
        "user_id": user["id"],
        "username": user["username"]
    }


# ================= POSTS ================= #

@app.get("/posts")
def get_posts():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM posts ORDER BY created_at DESC")
    return cursor.fetchall()


@app.post("/create-post")
def create_post(data: dict):
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "INSERT INTO posts (title, content, author_id, username) VALUES (%s, %s, %s, %s)",
        (data["title"], data["content"], data["user_id"], data["username"])
    )

    db.commit()
    return {"message": "Post created"}


# ================= COMMENTS ================= #

@app.get("/comments/{post_id}")
def get_comments(post_id: int):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT * FROM comments 
        WHERE post_id=%s 
        ORDER BY created_at ASC
    """, (post_id,))

    return cursor.fetchall()


@app.post("/add-comment")
def add_comment(data: dict):
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "INSERT INTO comments (post_id, parent_id, content, author_id, username) VALUES (%s, %s, %s, %s, %s)",
        (data["post_id"], data.get("parent_id"), data["content"], data["user_id"], data["username"])
    )

    db.commit()
    return {"message": "Comment added"}