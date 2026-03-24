const currentUser=getCurrentUser();
if (!currentUser){
    window.location.href="login.html";
}
document.querySelector(".profile-info h1").textContent=currentUser.username;
document.querySelector(".username").textContent="@"+currentUser.username;

const posts=getPosts();
const userPosts=posts.filter(post => post.userId === currentUser.id);
const container=document.querySelector(".profile-posts");
container.innerHTML="";

if (userPosts.length === 0) {
    container.innerHTML = "<p>No posts yet</p>";
}

userPosts.forEach(post =>{
    const postEl=document.createElement("div");
    postEl.classList.add("post-card");
    postEl.innerHTML=`
    <div class="post-header">
        <h4>${currentUser.username}</h4>
        <button class="delete-btn" data-id="${post.id}">Delete</button>
    </div>
    <p>${post.content}</p>
    <span>${new Date(post.timestamp).toLocaleString()}</span>
    `;

    const deleteBtn=postEl.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", function () {
    let posts=getPosts();
    posts=posts.filter(p => p.id !== post.id);
    savePosts(posts);
    location.reload();
    });

    container.appendChild(postEl);
})

const postBtn=document.getElementById("post-btn");
const postInput=document.getElementById("post-input");

postBtn.addEventListener("click", function() {
    const content=postInput.value.trim();
    if (!content) return;
    const newPost={
        id: generateId(),
        userId: currentUser.id,
        content: content,
        timestamp: Date.now()
    };
    const posts = getPosts();
    posts.push(newPost);
    savePosts(posts);
    postInput.value="";
    location.reload();
});

const logoutBtn = document.getElementById("logout-btn");
logoutBtn.addEventListener("click", function () {
  clearCurrentUser();
  window.location.href="login.html";
});






