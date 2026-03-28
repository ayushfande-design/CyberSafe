const API_URL = "http://127.0.0.1:8000";

async function loadPosts() {
    const res = await fetch(`${API_URL}/posts`);
    const posts = await res.json();

    const container = document.getElementById("posts-container");
    container.innerHTML = "";

    posts.forEach(post => {
        const div = document.createElement("div");
        div.className = "card post-card";

        div.innerHTML = `
            <h2>${post.title}</h2>
            <p>${post.content.substring(0, 120)}...</p>

            <div class="post-meta">
                <span>${post.username || "anonymous"}</span>
                <span>${new Date(post.created_at).toLocaleString()}</span>
                <span>${post.votes || 0}</span>
            </div>

            <a href="post.html?id=${post.id}" class="card-link">
                <span class="card-cta">Read More</span>
            </a>
        `;

        container.appendChild(div);
    });
}

loadPosts();