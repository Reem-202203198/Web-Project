
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
//////////////////////
fetch(`/api/users/${currentUser.id}`)
  .then(r => r.json())
  .then(user => {
    const topImg = document.querySelector(".top-avatar img");
    if (topImg) {
      topImg.src = user.profilePicture || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    }
    if (user.profilePicture) {
      localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, profilePicture: user.profilePicture }));
    }
  });

const miniImg = document.querySelector(".mini-avatar img");

if (miniImg) {
  const user = getUserById(currentUser.id);
  const avatar = getAvatar(user);

  if (avatar) {
    miniImg.src = avatar;
  } else {
    miniImg.style.display = "none";
  }
}
/////////////////////////
// format timestamp
function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
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

  return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
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

  const isOwner = String(currentUser.id) === String(post.author?.id || post.authorId || post.userId);
  const likeCount = Array.isArray(post.likes) ? post.likes.length : 0;
  const commentCount = Array.isArray(post.comments) ? post.comments.length : 0;

  // Use template literal for better readability and to easily include conditional delete button
  postCard.innerHTML = `
    <div class="post-head">
      <div class="post-user">
        <div class="post-avatar">
          <img src="${getAvatar(post.author)}">
        </div>
        <div>
          <h4 class="post-author" data-user-id="${author.id}" style="cursor:pointer;">
            ${author.username}
          </h4>
          <p>${formatTimestamp(post.createdAt)}</p>
        </div>
      </div>

      ${
        isOwner
          ? `<button class="delete-btn" data-post-id="${post.id}">Delete</button>`
          : ""
      }
    </div>

    <p class="post-text">${post.content}</p>
    ${post.image ? `<img src="${post.image}" style="width:100%; border-radius:10px; margin-top:10px;">` : ""}

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
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>${commentUser ? commentUser.username : "Unknown User"}</strong>
            <p style="margin:5px 0; color:#ddd;">${comment.text}</p>
            <small style="color:#888;">${formatTimestamp(comment.timestamp)}</small>
          </div>

          ${
            comment.userId === currentUser.id
              ? `<button class="delete-comment-btn" style="background:none;border:none;color:red;cursor:pointer;">Delete</button>`
              : ""
          }
        </div>
      `;
      const deleteBtn = commentEl.querySelector(".delete-comment-btn");

      if (deleteBtn) {
        deleteBtn.addEventListener("click", function () {
          let posts = getPosts();
          let postIndex = posts.findIndex(p => p.id === post.id);

          if (postIndex === -1) return;

          posts[postIndex].comments = posts[postIndex].comments.filter(
            c =>
              !(
                c.userId === comment.userId &&
                c.text === comment.text &&
                c.timestamp === comment.timestamp
              )
          );

          savePosts(posts);

          renderComments();

          const newCount = posts[postIndex].comments.length;
          commentLink.textContent = `💬${newCount}`;
        });
      }
      commentsList.appendChild(commentEl);
    });
  }

// Toggle comments section visibility when comment link is clicked 
commentLink.addEventListener("click", function () {
    if (commentsSection.style.display === "none") {
      commentsSection.style.display = "block";
    } else {
      commentsSection.style.display = "none";
    }
  });

 // Handle adding new comment when comment button is clicked
  commentBtn.addEventListener("click", async function () {
  const text = commentInput.value.trim();
  if (text === '') return;

  try {
    const res = await fetch(`/api/posts/${post.id}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, text })
    });
    const comment = await res.json();
    commentInput.value = '';

    const commentEl = document.createElement('div');
    commentEl.style.padding = '8px 0';
    commentEl.style.borderBottom = '1px solid #2a2a2a';
commentEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>${comment.user.username}</strong>
          <p style="margin:5px 0; color:#ddd;">${comment.text}</p>
          <small style="color:#888;">${formatTimestamp(comment.createdAt)}</small>
        </div>
        ${comment.user.id === currentUser.id
          ? `<button class="delete-comment-btn" style="background:none;border:none;color:red;cursor:pointer;">Delete</button>`
          : ''}
      </div>
    `;
    commentsList.appendChild(commentEl);

    const deleteBtn = commentEl.querySelector('.delete-comment-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async function () {
        commentEl.remove();
        const currentCount = parseInt(commentLink.textContent.replace('💬', '')) || 0;
        commentLink.textContent = `💬${Math.max(0, currentCount - 1)}`;
      });
    }

    const currentCount = parseInt(commentLink.textContent.replace('💬', '')) || 0;
    commentLink.textContent = `💬${currentCount + 1}`;
  } catch (err) {
    console.error('Comment failed:', err);
  }
});
// Handle post deletion when delete button is clicked (only visible to post owner)
  const likeBtn = postCard.querySelector(".like-btn");
  const likeCountEl = postCard.querySelector(".like-count");

  likeBtn.addEventListener("click", async function () {
  try {
    const res = await fetch(`/api/posts/${post.id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    });
    const data = await res.json();
    likeBtn.textContent = data.liked ? '❤️ Liked' : '🤍 Like';
    const countRes = await fetch(`/api/posts/${post.id}`);
    const updatedPost = await countRes.json();
    likeCountEl.textContent = updatedPost._count.likes;
  } catch (err) {
    console.error('Like failed:', err);
  }
});
  const deleteBtn = postCard.querySelector(".delete-btn");
if (deleteBtn) {
  deleteBtn.addEventListener("click", async function () {
    const postId = this.dataset.postId;
    try {
      await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      await loadFeed();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  });
}
  return postCard;
}

// Task 2: Load and display feed
async function loadFeed() {
  feedContainer.innerHTML = '<p style="color:#aaa; text-align:center;">Loading...</p>';
  try {
    const res = await fetch(`/api/posts?userId=${currentUser.id}`);
    const posts = await res.json();
    feedContainer.innerHTML = '';
    if (!posts.length) {
      feedContainer.innerHTML = `<div class="card"><p style="color:#aaa;">Follow someone to see their posts!</p></div>`;
      return;
    }
    posts.forEach(post => {
      const postCard = createPostCard(post, post.author);
      feedContainer.appendChild(postCard);
    });
  } catch (err) {
    console.error('Failed to load feed:', err);
  }
}

// Task 3: Create Post
postBtn.addEventListener("click", async function () {
  const content = postInput.value.trim();
  if (content === '') {
    alert('Post content cannot be empty.');
    return;
  }

  const imageFile = document.getElementById('feed-post-image')?.files[0];

  const sendPost = async (imageData) => {
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, content, image: imageData || '' })
      });
      postInput.value = '';
      await loadFeed();
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function () {
      sendPost(reader.result);
    };
    reader.readAsDataURL(imageFile);
  } else {
    sendPost('');
  }
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
          <img src="${getAvatar(getUserById(user.id))}">
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