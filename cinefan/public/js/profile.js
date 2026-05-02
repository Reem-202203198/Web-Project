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
    if (editBtn) editBtn.style.display = String(currentUser.id) === String(profileId) ? '' : 'none';
    const createPostBox = document.querySelector('.create-post');
    if (createPostBox) createPostBox.style.display = String(currentUser.id) === String(profileId) ? '' : 'none';

    // Follow button
    const followBtn = document.getElementById('follow-btn');
    if (followBtn) {
      if (String(currentUser.id) === String(profileId)) {
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
          ${String(currentUser.id) === String(profileId) ? `<button class="delete-btn" data-id="${post.id}">Delete</button>` : ''}
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
// ── Post button ──
const postBtn = document.getElementById('post-btn');
const postInput = document.getElementById('post-input');

if (postBtn && postInput) {
  postBtn.addEventListener('click', async function () {
    const content = postInput.value.trim();
    if (!content) return;
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, content })
      });
      postInput.value = '';
      location.reload();
    } catch (err) {
      console.error('Post failed:', err);
    }
  });
}

// ── Edit profile ──
const editBtn = document.querySelector('.edit-btn');
if (editBtn) {
  editBtn.addEventListener('click', function () {
    const newUsername = prompt('Enter new username:', currentUser.username);
    if (!newUsername) return;
    const newBio = prompt('Enter new bio:', '');
    fetch(`/api/users/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: newUsername, bio: newBio })
    }).then(() => {
      localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, username: newUsername, bio: newBio }));
      location.reload();
    });
  });
}

// ── Followers / Following list ──
const followList = document.getElementById('follow-list');
const statSpans = document.querySelectorAll('.profile-stats span');

statSpans.forEach((span, index) => {
  if (index === 1 || index === 2) {
    span.style.cursor = 'pointer';
    span.addEventListener('click', async function () {
      const type = index === 1 ? 'followers' : 'following';
      try {
        const res = await fetch(`/api/users/${profileId}/follow?type=${type}`);
        const list = await res.json();

        if (!followList) return;

        if (followList.style.display === 'block') {
          followList.style.display = 'none';
          return;
        }

        followList.innerHTML = '';
        followList.style.display = 'block';
        followList.style.cssText = `
          display: block;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 10px;
          padding: 10px;
          margin-top: 10px;
          max-height: 200px;
          overflow-y: auto;
        `;

        if (!list.length) {
          followList.innerHTML = '<p style="color:#aaa;">No users found.</p>';
          return;
        }

        list.forEach(user => {
          const userEl = document.createElement('div');
          userEl.style.cssText = 'display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid #333; cursor:pointer;';
          userEl.innerHTML = `
            <img src="${user.profilePicture || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}" 
              style="width:35px; height:35px; border-radius:50%; object-fit:cover;">
            <span style="color:white;">${user.username}</span>
          `;
          userEl.addEventListener('click', () => {
            window.location.href = `profile.html?id=${user.id}`;
          });
          followList.appendChild(userEl);
        });
      } catch (err) {
        console.error('Follow list failed:', err);
      }
    });
  }
});