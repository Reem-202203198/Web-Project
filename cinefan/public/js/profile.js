const currentUser = getCurrentUser();
if (!currentUser) window.location.href = 'login.html';

const params = new URLSearchParams(window.location.search);
const profileId = params.get('id') || currentUser.id;

document.getElementById('logout-btn')?.addEventListener('click', function () {
  clearCurrentUser();
  window.location.href = 'login.html';
});

async function loadProfile() {
  try {
    const [userRes, postsRes] = await Promise.all([
      fetch(`/api/users/${profileId}`),
      fetch(`/api/users/${profileId}/posts`)
    ]);

    const profileUser = await userRes.json();
    const posts = await postsRes.json();

    // Avatar
    const avatar = profileUser.profilePicture || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    const profileImg = document.querySelector('.profile-big-avatar img');
    if (profileImg) profileImg.src = avatar;
    const topImg = document.querySelector('.top-avatar img');
    if (topImg) topImg.src = currentUser.profilePicture || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

    // Name & username
    const h1 = document.querySelector('.profile-info h1');
    if (h1) h1.textContent = profileUser.username;
    const usernameEl = document.querySelector('.username');
    if (usernameEl) usernameEl.textContent = '@' + profileUser.username;

    // Stats
    const stats = document.querySelectorAll('.profile-stats span');
    if (stats.length >= 3) {
      stats[0].innerHTML = `<strong>${posts.length}</strong> Posts`;
      stats[1].innerHTML = `<strong>${profileUser._count?.followers ?? 0}</strong> Followers`;
      stats[2].innerHTML = `<strong>${profileUser._count?.following ?? 0}</strong> Following`;
    }

    // Hide/show buttons
    const editBtn = document.querySelector('.edit-btn');
    if (editBtn) editBtn.style.display = currentUser.id === profileId ? '' : 'none';
    const createPostBox = document.querySelector('.create-post');
    if (createPostBox) createPostBox.style.display = currentUser.id === profileId ? '' : 'none';

    // Follow button
    const followBtn = document.getElementById('follow-btn');
    if (followBtn) {
      if (currentUser.id === profileId) {
        followBtn.style.display = 'none';
      } else {
        const followRes = await fetch(`/api/users/${currentUser.id}/follow?type=following`);
        const followingList = await followRes.json();
        const isFollowing = Array.isArray(followingList) && followingList.some(u => u.id === profileId);

        followBtn.textContent = isFollowing ? 'Unfollow' : 'Follow';
        followBtn.addEventListener('click', async function () {
          if (isFollowing) {
            await fetch(`/api/users/${profileId}/follow`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ followerId: currentUser.id })
            });
          } else {
            await fetch(`/api/users/${profileId}/follow`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ followerId: currentUser.id })
            });
          }
          location.reload();
        });
      }
    }

    // Render posts
    const container = document.querySelector('.profile-posts');
    if (!container) return;
    container.innerHTML = '';

    if (posts.length === 0) {
      container.innerHTML = '<p>No posts yet</p>';
      return;
    }

    posts.forEach(post => {
      const postEl = document.createElement('div');
      postEl.classList.add('post-card');
      postEl.innerHTML = `
        <div class="post-header">
          <h4>${profileUser.username}</h4>
          ${currentUser.id === profileId ? `<button class="delete-btn" data-id="${post.id}">Delete</button>` : ''}
        </div>
        <p>${post.content}</p>
        ${post.image ? `<img src="${post.image}" style="width:100%; border-radius:10px; margin-top:10px;">` : ''}
        <span>${new Date(post.createdAt).toLocaleString()}</span>
      `;

      const deleteBtn = postEl.querySelector('.delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async function () {
          await fetch(`/api/posts/${post.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id })
          });
          location.reload();
        });
      }
      container.appendChild(postEl);
    });

  } catch (err) {
    console.error('Profile load error:', err);
  }
  document.querySelector('main').style.visibility = 'visible';
}

loadProfile();