// Auth guard
if (!getCurrentUser()) window.location.href = 'login.html';

const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const currentUser = getCurrentUser();

// Logout button
document.getElementById('logout-btn').addEventListener('click', function () {
  clearCurrentUser();
  window.location.href = 'login.html';
});

searchInput.addEventListener('input', async function () {
  const query = this.value.trim();

  if (query.length < 1) {
    searchResults.innerHTML = '<p style="color:#aaa;">Start typing to find users...</p>';
    return;
  }

  try {
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
    const users = await res.json();

    if (!users.length) {
      searchResults.innerHTML = '<p style="color:#aaa;">No users found.</p>';
      return;
    }

    searchResults.innerHTML = '';

    users.forEach(user => {
      if (user.id === currentUser.id) return;

      const avatar = user.profilePicture && user.profilePicture.trim() !== ''
        ? user.profilePicture
        : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

      const card = document.createElement('div');
      card.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #1a1a1a;
        border: 1px solid #2a2a2a;
        border-radius: 12px;
        padding: 14px 18px;
        margin-bottom: 12px;
      `;

      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:14px;">
          <img src="${avatar}" style="width:46px; height:46px; border-radius:50%; object-fit:cover;" />
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
          style="padding:8px 18px; border:none; border-radius:8px; background:#cc0000; color:white; cursor:pointer; font-size:14px;"
        >Follow</button>
      `;

      searchResults.appendChild(card);
    });

    // Attach follow listeners after all cards are in the DOM
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