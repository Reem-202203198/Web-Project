if (!getCurrentUser()) window.location.href = 'login.html';

const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const currentUser = getCurrentUser();

// Handle navbar search query
const navbarQuery = new URLSearchParams(window.location.search).get('q');
if (navbarQuery) {
  searchInput.value = navbarQuery;
  setTimeout(() => searchInput.dispatchEvent(new Event('input')), 100);
}

// Logout
document.getElementById('logout-btn').addEventListener('click', function () {
  clearCurrentUser();
  window.location.href = 'login.html';
});

// Get IDs of users current user is following
async function getFollowingIds() {
  try {
    const res = await fetch(`/api/users/${currentUser.id}/follow?type=following`);
    const data = await res.json();
    return Array.isArray(data) ? data.map(u => u.id) : [];
  } catch {
    return [];
  }
}

searchInput.addEventListener('input', async function () {
  const query = this.value.trim();

  if (query.length < 1) {
    searchResults.innerHTML = '<p style="color:#aaa;">Start typing to find users...</p>';
    return;
  }

  try {
    const [usersRes, followingIds] = await Promise.all([
      fetch(`/api/users/search?q=${encodeURIComponent(query)}`).then(r => r.json()),
      getFollowingIds()
    ]);

    const users = usersRes;

    if (!users.length) {
      searchResults.innerHTML = '<p style="color:#aaa;">No users found.</p>';
      return;
    }

    searchResults.innerHTML = '';

    users.forEach(user => {
      if (user.id === currentUser.id) return;

      const avatar = user.profilePicture?.trim()
        ? user.profilePicture
        : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

      const isFollowing = followingIds.includes(user.id);

      const card = document.createElement('div');
      card.style.cssText = `
        display: flex; align-items: center; justify-content: space-between;
        background: #1a1a1a; border: 1px solid #2a2a2a;
        border-radius: 12px; padding: 14px 18px; margin-bottom: 12px;
      `;

      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:14px;">
          <img src="${avatar}" style="width:46px; height:46px; border-radius:50%; object-fit:cover;"/>
          <div>
            <a href="profile.html?id=${user.id}" style="color:white; font-weight:bold; text-decoration:none; font-size:15px;">
              ${user.username}
            </a>
            <p style="color:#aaa; margin:2px 0 0; font-size:13px;">${user.bio || ''}</p>
          </div>
        </div>
        <button
          class="follow-btn"
          data-user-id="${user.id}"
          style="padding:8px 18px; border:none; border-radius:8px;
            background:${isFollowing ? '#333' : '#cc0000'};
            color:white; cursor:pointer; font-size:14px;"
          ${isFollowing ? 'disabled' : ''}
        >${isFollowing ? 'Following ✓' : 'Follow'}</button>
      `;

      searchResults.appendChild(card);
    });

    // Follow button listeners
    document.querySelectorAll('.follow-btn').forEach(btn => {
      btn.addEventListener('click', async function () {
        const targetUserId = this.dataset.userId;
        try {
          await fetch(`/api/users/${targetUserId}/follow`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ followerId: currentUser.id })
          });
          this.textContent = 'Following ✓';
          this.disabled = true;
          this.style.background = '#333';
        } catch (err) {
          console.error('Follow failed:', err);
        }
      });
    });

  } catch (err) {
    searchResults.innerHTML = '<p style="color:red;">Error loading results.</p>';
    console.error(err);
  }
});