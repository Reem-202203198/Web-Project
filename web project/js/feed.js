
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

// // Task 2: create post card


// function createPostCard(post, author) {
//   const postCard = document.createElement("article");
//   postCard.className = "post-card card";

//   const isOwner = currentUser.id === post.userId;

//   postCard.innerHTML = `
//     <div class="post-head">
//       <div class="post-user">
//         <div class="post-avatar">
//           <img src="${getAvatar(author)}" alt="${author.username}">
//         </div>
//         <div>
//           <h4 class="post-author" data-user-id="${author.id}" style="cursor:pointer;">
//             ${author.username}
//           </h4>
//           <p>${formatTimestamp(post.timestamp)}</p>
//         </div>
//       </div>
//       ${
//         isOwner
//           ? `<button class="delete-btn" data-post-id="${post.id}">Delete</button>`
//           : ""
//       }
//     </div>

//     <p class="post-text">${post.content}</p>

//     <div class="post-footer">
//       <span>${post.likes.length}</span>
//       <span class="comment-link" data-post-id="${post.id}" style="cursor:pointer;">
//         ${post.comments.length}
//       </span>
//     </div>
//   `;

//   // Click author name take us to profile page
//   const authorName = postCard.querySelector(".post-author");
//   authorName.addEventListener("click", function () {
//     window.location.href = `profile.html?id=${author.id}`;
//   });

//   // Click comments go to post detail page 
//   const commentLink = postCard.querySelector(".comment-link");
//   commentLink.addEventListener("click", function () {
//     window.location.href = `post.html?id=${post.id}`;
//   });

//   return postCard;
// }


function createPostCard(post, author) {
  const postCard = document.createElement("article");
  postCard.className = "post-card card";

  const isOwner = currentUser.id === post.userId;
  const likeCount = Array.isArray(post.likes) ? post.likes.length : 0;
  const commentCount = Array.isArray(post.comments) ? post.comments.length : 0;

  // Use template literal for better readability and to easily include conditional delete button
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
      <button class="like-btn">
        ${Array.isArray(post.likes) && post.likes.includes(currentUser.id) ? "❤️ Liked" : "🤍 Like"}
      </button>

      <span class="like-count">${likeCount}</span>

      <span class="comment-link" style="cursor:pointer;">
        💬${commentCount}
      </span>
    </div>

    <div class="comments-section" style="display:none; margin-top:15px;">
      <div class="comments-list" style="margin-bottom:10px;"></div>

      <div class="comment-input-box" style="display:flex; gap:10px;">
        <input
          type="text"
          class="comment-input"
          placeholder="Write a comment..."
          style="
            flex:1;
            padding:10px;
            border-radius:8px;
            border:1px solid #2a2a2a;
            background:#111;
            color:white;
          "
        />
        <button
          class="comment-btn"
          style="
            padding:10px 16px;
            border:none;
            border-radius:8px;
            background:#ff2c2c;
            color:white;
            cursor:pointer;
          "
        >
          Comment
        </button>
      </div>
    </div>
  `;

// Click author name take us to profile page 
  const authorName = postCard.querySelector(".post-author");
  authorName.addEventListener("click", function () {
    window.location.href = `profile.html?id=${author.id}`;
  });

// Click comments show/hide comments section
  const commentLink = postCard.querySelector(".comment-link");
  const commentsSection = postCard.querySelector(".comments-section");
  const commentsList = postCard.querySelector(".comments-list");
  const commentInput = postCard.querySelector(".comment-input");
  const commentBtn = postCard.querySelector(".comment-btn");

// Function to render comments in the comments section and update the comment count in real-time when a new comment is added
  function renderComments() {
    commentsList.innerHTML = "";

    const posts = getPosts();
    const updatedPost = posts.find((p) => p.id === post.id);

    if (!updatedPost || !updatedPost.comments || updatedPost.comments.length === 0) {
      commentsList.innerHTML = `<p style="color:#aaa; font-size:14px;">No comments yet.</p>`;
      return;
    }

    updatedPost.comments.forEach((comment) => {
      const commentUser = getUserById(comment.userId);

      const commentEl = document.createElement("div");
      commentEl.style.padding = "8px 0";
      commentEl.style.borderBottom = "1px solid #2a2a2a";

      commentEl.innerHTML = `
        <strong>${commentUser ? commentUser.username : "Unknown User"}</strong>
        <p style="margin:5px 0; color:#ddd;">${comment.text}</p>
        <small style="color:#888;">${formatTimestamp(comment.timestamp)}</small>
      `;

      commentsList.appendChild(commentEl);
    });
  }

// Toggle comments section visibility when comment link is clicked 
  commentLink.addEventListener("click", function () {
    if (commentsSection.style.display === "none") {
      commentsSection.style.display = "block";
      renderComments();
    } else {
      commentsSection.style.display = "none";
    }
  });

 // Handle adding new comment when comment button is clicked
  commentBtn.addEventListener("click", function () {
    const text = commentInput.value.trim();

    if (text === "") return;

    const posts = getPosts();
    const postIndex = posts.findIndex((p) => p.id === post.id);

    if (postIndex === -1) return;

    if (!Array.isArray(posts[postIndex].comments)) {
      posts[postIndex].comments = [];
    }

    posts[postIndex].comments.push({
      userId: currentUser.id,
      text: text,
      timestamp: new Date().toISOString()
    });

    savePosts(posts);

    commentInput.value = "";


    const newCount = posts[postIndex].comments.length;
    commentLink.textContent = ` ${newCount}`;

   //to show the new comment immediately after adding without needing to click the comment link again, we call renderComments() here to update the comments section in real-time
    renderComments();
  });
// Handle post deletion when delete button is clicked (only visible to post owner)
  const likeBtn = postCard.querySelector(".like-btn");
  const likeCountEl = postCard.querySelector(".like-count");

  likeBtn.addEventListener("click", function () {
    let posts = getPosts();
    let postIndex = posts.findIndex(p => p.id === post.id);

    if (postIndex === -1) return;

    if (!Array.isArray(posts[postIndex].likes)) {
      posts[postIndex].likes = [];
    }

    let userId = currentUser.id;

    if (posts[postIndex].likes.includes(userId)) {
      posts[postIndex].likes =
        posts[postIndex].likes.filter(id => id !== userId);
    } else {
      posts[postIndex].likes.push(userId);
    }

    savePosts(posts);

    const updatedLikes = posts[postIndex].likes.length;
    likeCountEl.textContent = updatedLikes;

    likeBtn.textContent =
      posts[postIndex].likes.includes(userId) ? "❤️ Liked" : "🤍 Like";
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

function loadSuggestedUsers() {
  const users = getUsers();
  const container = document.querySelector(".right-sidebar .side-card:last-child");
  if (!container) return;
  const oldUsers = container.querySelectorAll(".suggested-user");
  oldUsers.forEach(u => u.remove());

  users.forEach(user => {
    if (user.id === currentUser.id) return;
    if (currentUser.following.includes(user.id)) return;
    const userEl = document.createElement("div");
    userEl.classList.add("suggested-user");

    userEl.innerHTML = `
      <div class="suggested-left">
        <div class="small-avatar">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8oghbsuzggpkknQSSU-Ch_xep_9v3m6EeBQ&s">
        </div>
        <span class="user-link">${user.username}</span>
      </div>
      <button class="follow-btn"></button>
    `;

    const nameEl = userEl.querySelector(".user-link");
    nameEl.addEventListener("click", function () {
      window.location.href = `profile.html?id=${user.id}`;
    });
    const followBtn = userEl.querySelector(".follow-btn");
    const isFollowing = currentUser.following.includes(user.id);
    followBtn.textContent = isFollowing ? "Unfollow" : "Follow";

    followBtn.addEventListener("click", function () {
      let users = getUsers();

      const currentIndex = users.findIndex(u => u.id === currentUser.id);
      const targetIndex = users.findIndex(u => u.id === user.id);

      if (currentUser.following.includes(user.id)) {
        currentUser.following = currentUser.following.filter(id => id !== user.id);
        users[targetIndex].followers = users[targetIndex].followers.filter(id => id !== currentUser.id);
      } else {
        currentUser.following.push(user.id);
        users[targetIndex].followers.push(currentUser.id);
        userEl.remove();
      }

      users[currentIndex] = currentUser;
      saveUsers(users);
      setCurrentUser(currentUser);
      followBtn.textContent = currentUser.following.includes(user.id)
        ? "Unfollow"
        : "Follow";
    });

    container.appendChild(userEl);
  });
}

loadSuggestedUsers();