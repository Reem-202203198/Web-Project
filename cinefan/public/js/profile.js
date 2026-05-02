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

// ── Edit Profile Modal ──
const editProfileBtn = document.querySelector('.edit-btn');
if (editProfileBtn) {
  editProfileBtn.addEventListener('click', function () {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.style.zIndex = '9999';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';

    const formContainer = document.createElement('div');
    formContainer.style.backgroundColor = '#12141c';
    formContainer.style.borderRadius = '24px';
    formContainer.style.padding = '2rem';
    formContainer.style.width = '90%';
    formContainer.style.maxWidth = '500px';
    formContainer.style.border = '1px solid #4f46e5';
    formContainer.style.boxShadow = '0 20px 35px rgba(0,0,0,0.5)';

    const nameElement = document.querySelector('.profile-info h1');
    const usernameElement = document.querySelector('.username');
    const currentName = nameElement ? nameElement.textContent : '';
    const currentUsername = usernameElement ? usernameElement.textContent.replace('@', '') : '';

    formContainer.innerHTML = `
      <h2 style="color: white; margin-bottom: 1.5rem; font-size: 1.8rem;">Edit Profile</h2>
      <div style="margin-bottom: 1.2rem;">
        <label style="display: block; color: #9ca3db; margin-bottom: 0.5rem;">Username</label>
        <input type="text" id="editUsername" value="${currentUsername}" style="width: 100%; padding: 0.75rem; background: #1a1d2b; border: 1px solid #2d2f3a; border-radius: 12px; color: white; font-size: 1rem; box-sizing:border-box;">
      </div>
      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; color: #9ca3db; margin-bottom: 0.5rem;">Bio</label>
        <textarea id="editBio" rows="3" style="width: 100%; padding: 0.75rem; background: #1a1d2b; border: 1px solid #2d2f3a; border-radius: 12px; color: white; font-size: 0.9rem; resize: vertical; box-sizing:border-box;">${currentUser.bio || ''}</textarea>
      </div>
      <div style="display: flex; gap: 1rem; justify-content: flex-end;">
        <button type="button" id="cancelBtn" style="padding: 0.6rem 1.4rem; background: #2d2f3a; border: none; border-radius: 40px; color: white; cursor: pointer;">Cancel</button>
        <button type="button" id="saveBtn" style="padding: 0.6rem 1.4rem; background: linear-gradient(95deg, #4f46e5, #7c3aed); border: none; border-radius: 40px; color: white; cursor: pointer;">Save</button>
      </div>
    `;

    modal.appendChild(formContainer);
    document.body.appendChild(modal);

    document.getElementById('saveBtn').addEventListener('click', async function () {
      const newUsername = document.getElementById('editUsername').value.trim();
      const newBio = document.getElementById('editBio').value.trim();
      if (!newUsername) return;

      try {
        await fetch(`/api/users/${currentUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: newUsername, bio: newBio })
        });
        localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, username: newUsername, bio: newBio }));

        const toast = document.createElement('div');
        toast.textContent = 'Profile updated successfully!';
        toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#1e1f2e; color:white; padding:0.75rem 1.5rem; border-radius:40px; border:1px solid #4f46e5; z-index:10000;';
        document.body.appendChild(toast);
        setTimeout(() => { toast.remove(); location.reload(); }, 1500);

        modal.remove();
      } catch (err) {
        console.error('Edit failed:', err);
      }
    });

    document.getElementById('cancelBtn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  });
}

// ── Followers / Following Modal ──
const statSpans = document.querySelectorAll('.profile-stats span');

async function openFollowModal(type) {
  try {
    const res = await fetch(`/api/users/${profileId}/follow?type=${type}`);
    const list = await res.json();

    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';

    const box = document.createElement('div');
    box.style.cssText = 'background:#1a1a1a; padding:20px; border-radius:12px; width:300px; max-height:400px; overflow-y:auto; border:1px solid #333;';

    const title = document.createElement('h3');
    title.textContent = type === 'followers' ? 'Followers' : 'Following';
    title.style.color = 'white';
    title.style.marginBottom = '15px';
    box.appendChild(title);

    if (!list.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No users';
      empty.style.color = '#aaa';
      box.appendChild(empty);
    }

    list.forEach(user => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex; align-items:center; gap:10px; padding:10px; cursor:pointer; border-radius:8px;';
      item.addEventListener('mouseenter', () => item.style.background = '#2a2a2a');
      item.addEventListener('mouseleave', () => item.style.background = 'transparent');

      const img = document.createElement('img');
      img.src = user.profilePicture || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
      img.style.cssText = 'width:35px; height:35px; border-radius:50%; object-fit:cover;';

      const name = document.createElement('span');
      name.textContent = user.username;
      name.style.color = 'white';

      item.appendChild(img);
      item.appendChild(name);
      item.addEventListener('click', () => { window.location.href = `profile.html?id=${user.id}`; });
      box.appendChild(item);
    });

    modal.appendChild(box);
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  } catch (err) {
    console.error('Follow list failed:', err);
  }
}

if (statSpans.length >= 3) {
  statSpans[1].style.cursor = 'pointer';
  statSpans[2].style.cursor = 'pointer';
  statSpans[1].addEventListener('click', () => openFollowModal('followers'));
  statSpans[2].addEventListener('click', () => openFollowModal('following'));
}