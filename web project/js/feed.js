
// Task 1: Auth Guard
const currentUser = getCurrentUser();

if (!currentUser) {
  window.location.href = "login.html";
}

// DOM elements
const feedContainer = document.getElementById("feed-posts-container");
const postInput = document.getElementById("feed-post-input");
const postBtn = document.getElementById("feed-post-btn");
const logoutBtn = document.getElementById("logout-btn");

// format timestamp
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

//  default avatar for new users who haven't set profile picture
function getAvatar(user) {
  if (
    user &&
    user.profilePicture &&
    user.profilePicture.trim() !== "" &&
    user.profilePicture !== "undefined" &&
    user.profilePicture !== "null"
  ) {
    return user.profilePicture;
  }

  return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8oghbsuzggpkknQSSU-Ch_xep_9v3m6EeBQ&s";
}

// Task 2: create post card
function createPostCard(post, author) {
  const postCard = document.createElement("article");
  postCard.className = "post-card card";

  const isOwner = currentUser.id === post.userId;

  postCard.innerHTML = `
    <div class="post-head">
      <div class="post-user">
        <div class="post-avatar">
          <img src="${getAvatar(author)}" alt="${author.username}">
        </div>
        <div>
          <h4 class="post-author" data-user-id="${author.id}" style="cursor:pointer;">
            ${author.username}
          </h4>
          <p>${formatTimestamp(post.timestamp)}</p>
        </div>
      </div>
      ${
        isOwner
          ? `<button class="delete-btn" data-post-id="${post.id}">Delete</button>`
          : ""
      }
    </div>

    <p class="post-text">${post.content}</p>

    <div class="post-footer">
      <span>${post.likes.length}</span>
      <span class="comment-link" data-post-id="${post.id}" style="cursor:pointer;">
        ${post.comments.length}
      </span>
    </div>
  `;

  // Click author name take us to profile page
  const authorName = postCard.querySelector(".post-author");
  authorName.addEventListener("click", function () {
    window.location.href = `profile.html?id=${author.id}`;
  });

  // Click comments go to post detail page 
  const commentLink = postCard.querySelector(".comment-link");
  commentLink.addEventListener("click", function () {
    window.location.href = `post.html?id=${post.id}`;
  });

  return postCard;
}

// Task 2: Load and display feed
function loadFeed() {
  const posts = getPosts();
  const users = getUsers();

  const followingIds = currentUser.following || [];

  // Show followed users + current user's own posts
  const feedPosts = posts
    .filter(
      (post) =>
        followingIds.includes(post.userId) || post.userId === currentUser.id
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  feedContainer.innerHTML = "";

  if (feedPosts.length === 0) {
    feedContainer.innerHTML = `
      <div class="card">
        <p style="color:#aaa;">Follow someone to see their posts!</p>
      </div>
    `;
    return;
  }

  feedPosts.forEach((post) => {
    const author = users.find((user) => user.id === post.userId);

    if (!author) return;

    const postCard = createPostCard(post, author);
    feedContainer.appendChild(postCard);
  });
}

// Task 3: Create Post
postBtn.addEventListener("click", function () {
  const content = postInput.value.trim();

  if (content === "") {
    alert("Post content cannot be empty.");
    return;
  }

  const newPost = {
    id: generateId(),
    userId: currentUser.id,
    content: content,
    timestamp: new Date().toISOString(),
    likes: [],
    comments: []
  };

  const posts = getPosts();
  posts.push(newPost);
  savePosts(posts);

  // Clear input if user refreshes the page, we want to show the post they just created
  postInput.value = "";

  // Reload feed without page refresh
  loadFeed();
});

// Task 4: Logout
logoutBtn.addEventListener("click", function () {
  clearCurrentUser();
  window.location.href = "login.html";
});


loadFeed();