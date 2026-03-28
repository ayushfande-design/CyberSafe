const API_URL = "http://127.0.0.1:8000";

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

let allComments = [];

const user_id = localStorage.getItem("user_id");
const username = localStorage.getItem("username");

if (!user_id) {
    alert("Please login first");
    window.location.href = "index.html";
}

// -------- Load Post -------- //
async function loadPost() {
    const res = await fetch(`${API_URL}/posts`);
    const posts = await res.json();

    const post = posts.find(p => p.id == postId);

    document.getElementById("post").innerHTML = `
        <div class="single-post">
            <h1>${post.title}</h1>
            <p>${post.content}</p>
        </div>
    `;
}

// -------- Load Comments -------- //
async function loadComments() {
    const res = await fetch(`${API_URL}/comments/${postId}`);
    allComments = await res.json();

    const tree = buildTree(allComments);

    const container = document.getElementById("comments");
    container.innerHTML = "";

    tree.forEach(comment => {
        container.appendChild(renderComment(comment));
    });
}

// -------- Convert to Tree -------- //
function buildTree(comments) {
    const map = {};
    const roots = [];

    comments.forEach(c => {
        c.children = [];
        map[c.id] = c;
    });

    comments.forEach(c => {
        if (c.parent_id) {
            map[c.parent_id]?.children.push(c);
        } else {
            roots.push(c);
        }
    });

    return roots;
}

// -------- Render Comment (Recursive) -------- //
function renderComment(comment, level = 0) {
    const div = document.createElement("div");
    div.className = "card";
    div.style.marginLeft = `${level * 30}px`;

    div.innerHTML = `
        <div class="post-meta">
            <span>${comment.username}</span>
            <span>${new Date(comment.created_at).toLocaleString()}</span>
        </div>

        <p>${comment.content}</p>

        <button onclick="showReplyBox(${comment.id})">Reply</button>

        <div id="reply-box-${comment.id}"></div>
    `;

    // Render children
    comment.children.forEach(child => {
        div.appendChild(renderComment(child, level + 1));
    });

    return div;
}

// -------- Show Reply Box -------- //
function showReplyBox(parentId) {
    const box = document.getElementById(`reply-box-${parentId}`);

    box.innerHTML = `
        <textarea id="reply-${parentId}" placeholder="Reply..."></textarea>
        <button onclick="submitReply(${parentId})">Submit</button>
    `;
}

// -------- Submit Reply -------- //
async function submitReply(parentId) {
    const content = document.getElementById(`reply-${parentId}`).value;

    await fetch(`${API_URL}/add-comment`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            post_id: postId,
            parent_id: parentId,
            content,
            user_id,
            username
        })
    });

    loadComments();
}

// -------- Add Root Comment -------- //
async function addComment() {
    const content = document.getElementById("commentInput").value;

    await fetch(`${API_URL}/add-comment`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            post_id: postId,
            content,
            user_id,
            username
        })
    });

    document.getElementById("commentInput").value = "";
    loadComments();
}

function renderComment(comment, level = 0) {
    const div = document.createElement("div");
    div.className = "card";
    div.classList.add(`comment-level-${Math.min(level, 4)}`);

    div.innerHTML = `
        <div class="post-meta">
            <span><strong>${comment.username || "anonymous"}</strong></span>
            <span>${new Date(comment.created_at).toLocaleString()}</span>
        </div>

        <p>${comment.content}</p>

        <button class="reply-btn" onclick="showReplyBox(${comment.id})">
            Reply
        </button>

        <div id="reply-box-${comment.id}" class="reply-box"></div>
    `;

    comment.children.forEach(child => {
        div.appendChild(renderComment(child, level + 1));
    });

    return div;
}

// Init
loadPost();
loadComments();