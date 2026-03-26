const id = new URLSearchParams(window.location.search).get('id');

let posts = getPosts();

let post = posts.find(p => p.id === id);

const postContainer = document.getElementById("post-container");
const commentsList = document.getElementById("comments-list");
const commentInput = document.getElementById("comment-input");
const commentBtn = document.getElementById("comment-btn");

function renderPost() {
  if (!post) {
    postContainer.innerHTML = "Post not found";
    return;
  }

  postContainer.innerHTML = `
    <p>${post.content}</p>
    <p>Likes: ${(post.likes || []).length}</p>
  `;
}

// 5. display comments
function renderComments() {
  commentsList.innerHTML = "";

  if (!post.comments) return;

  post.comments.forEach(c => {
    const div = document.createElement("div");
    div.textContent = c.text;
    commentsList.appendChild(div);
  });
}

// 6. add comment
commentBtn.addEventListener("click", function () {
  const text = commentInput.value.trim();

  if (text === "") return;

  const postIndex = posts.findIndex(p => p.id === id);

  if (!Array.isArray(posts[postIndex].comments)) {
    posts[postIndex].comments = [];
  }

  posts[postIndex].comments.push({
    userId: currentUser.id,
    text: text,
    timestamp: new Date().toISOString()
  });

  savePosts(posts);

  post = posts[postIndex];

  commentInput.value = "";

  renderComments();
});

// initial render
renderPost();
renderComments();