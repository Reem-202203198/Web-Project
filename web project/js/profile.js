const currentUser=getCurrentUser();
const params=new URLSearchParams(window.location.search);
const profileId = params.get("id");
let profileUser;

if (profileId) {
    const users = getUsers();
    profileUser = users.find(u => u.id === profileId);
}else{
    profileUser = currentUser;
}
if (!currentUser){
    window.location.href="login.html";
}

const createPostBox = document.querySelector(".create-post");
if (createPostBox && currentUser.id !== profileUser.id) {
    createPostBox.style.display = "none";
}

document.querySelector(".profile-info h1").textContent=profileUser.username;
const editBtn = document.querySelector(".edit-btn");

if (editBtn && currentUser.id !== profileUser.id) {
    editBtn.style.display = "none";
}

document.querySelector(".username").textContent="@"+profileUser.username;
const stats = document.querySelectorAll(".profile-stats span");

stats[1].innerHTML = `<strong>${profileUser.followers.length}</strong> Followers`;
stats[2].innerHTML = `<strong>${profileUser.following.length}</strong> Following`;
const followBtn = document.getElementById("follow-btn");

if (followBtn) {
    if (currentUser.id === profileUser.id) {
        followBtn.style.display = "none";
    }else{
        const isFollowing = currentUser.following.includes(profileUser.id);
        followBtn.textContent = isFollowing ? "Unfollow" : "Follow";
        followBtn.addEventListener("click", function () {
            let users = getUsers();
            const currentIndex = users.findIndex(u => u.id === currentUser.id);
            const profileIndex = users.findIndex(u => u.id === profileUser.id);

            if (currentUser.following.includes(profileUser.id)) {
                currentUser.following = currentUser.following.filter(id => id !== profileUser.id);
                users[profileIndex].followers = users[profileIndex].followers.filter(id => id !== currentUser.id);
            }else{
                currentUser.following.push(profileUser.id);
                users[profileIndex].followers.push(currentUser.id);
            }
            users[currentIndex] = currentUser;
            saveUsers(users);
            setCurrentUser(currentUser);

            location.reload();
        });
    }
}

const posts=getPosts();
const userPosts=posts.filter(post => post.userId === profileUser.id);
const container=document.querySelector(".profile-posts");
container.innerHTML="";

if (userPosts.length === 0) {
    container.innerHTML = "<p>No posts yet</p>";
}

userPosts.forEach(post => {
    const postEl = document.createElement("div");
    postEl.classList.add("post-card");

    postEl.innerHTML = `
    <div class="post-header">
        <h4>${profileUser.username}</h4>
        <button class="delete-btn" data-id="${post.id}">Delete</button>
    </div>
    <p>${post.content}</p>
    <span>${new Date(post.timestamp).toLocaleString()}</span>
    `;
    const deleteBtn = postEl.querySelector(".delete-btn");
    if (currentUser.id !== profileUser.id) {
        deleteBtn.style.display = "none";
    }
    deleteBtn.addEventListener("click", function () {
        let posts = getPosts();
        posts = posts.filter(p => p.id !== post.id);
        savePosts(posts);
        location.reload();
    });

    container.appendChild(postEl);
});

const postBtn=document.getElementById("post-btn");
const postInput=document.getElementById("post-input");

if (postBtn && postInput){
    postBtn.addEventListener("click", function() {
        const content = postInput.value.trim();
        if (!content) return;

        const newPost = {
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
}

const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        clearCurrentUser();
        window.location.href = "login.html";
    });
}






