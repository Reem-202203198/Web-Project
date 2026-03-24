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

// Edit Profile functionality - opens a form dialog to edit profile info
const editProfileBtn = document.querySelector('.edit-btn');

if (editProfileBtn) {
  editBtn.addEventListener('click', function() {
      // Create modal overlay
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
      
      // Create form container
      const formContainer = document.createElement('div');
      formContainer.style.backgroundColor = '#12141c';
      formContainer.style.borderRadius = '24px';
      formContainer.style.padding = '2rem';
      formContainer.style.width = '90%';
      formContainer.style.maxWidth = '500px';
      formContainer.style.border = '1px solid #4f46e5';
      formContainer.style.boxShadow = '0 20px 35px rgba(0,0,0,0.5)';
      
      // Form HTML
      formContainer.innerHTML = `
        <h2 style="color: white; margin-bottom: 1.5rem; font-size: 1.8rem;">Edit Profile</h2>
        <form id="profileEditForm">
          <div style="margin-bottom: 1.2rem;">
            <label style="display: block; color: #9ca3db; margin-bottom: 0.5rem;">Name</label>
            <input type="text" id="editName" value="Alex Rider" style="width: 100%; padding: 0.75rem; background: #1a1d2b; border: 1px solid #2d2f3a; border-radius: 12px; color: white; font-size: 1rem;">
          </div>
          <div style="margin-bottom: 1.2rem;">
            <label style="display: block; color: #9ca3db; margin-bottom: 0.5rem;">Username</label>
            <input type="text" id="editUsername" value="@alexrider" style="width: 100%; padding: 0.75rem; background: #1a1d2b; border: 1px solid #2d2f3a; border-radius: 12px; color: white; font-size: 1rem;">
          </div>
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; color: #9ca3db; margin-bottom: 0.5rem;">Bio</label>
            <textarea id="editBio" rows="3" style="width: 100%; padding: 0.75rem; background: #1a1d2b; border: 1px solid #2d2f3a; border-radius: 12px; color: white; font-size: 0.9rem; resize: vertical;">Film enthusiast | Movie critic | Sharing thoughts on cinema 🎬</textarea>
          </div>
          <div style="display: flex; gap: 1rem; justify-content: flex-end;">
            <button type="button" id="cancelBtn" style="padding: 0.6rem 1.4rem; background: #2d2f3a; border: none; border-radius: 40px; color: white; cursor: pointer;">Cancel</button>
            <button type="submit" style="padding: 0.6rem 1.4rem; background: linear-gradient(95deg, #4f46e5, #7c3aed); border: none; border-radius: 40px; color: white; cursor: pointer;">Save</button>
          </div>
        </form>
      `;
      
      modal.appendChild(formContainer);
      document.body.appendChild(modal);
      
      // Get current profile values
      const nameElement = document.querySelector('.profile-info h1');
      const usernameElement = document.querySelector('.username');
      let currentName = nameElement ? nameElement.textContent : 'Alex Rider';
      let currentUsername = usernameElement ? usernameElement.textContent : '@alexrider';
      
      // Set current values in form
      const nameInput = formContainer.querySelector('#editName');
      const usernameInput = formContainer.querySelector('#editUsername');
      const bioInput = formContainer.querySelector('#editBio');
      
      nameInput.value = currentName;
      usernameInput.value = currentUsername;
      
      // Check if bio exists, if not create one
      let bioElement = document.querySelector('.profile-bio');
      if (!bioElement) {
        bioElement = document.createElement('p');
        bioElement.className = 'profile-bio';
        bioElement.style.marginTop = '0.8rem';
        bioElement.style.color = '#b9c0e0';
        bioElement.style.fontSize = '0.9rem';
        const profileInfoDiv = document.querySelector('.profile-info');
        const statsDiv = document.querySelector('.profile-stats');
        if (statsDiv) {
          profileInfoDiv.insertBefore(bioElement, statsDiv);
        } else {
          profileInfoDiv.appendChild(bioElement);
        }
      }
      bioInput.value = bioElement.textContent || '';
      
      // Handle form submission
      const form = formContainer.querySelector('#profileEditForm');
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Update name
        const newName = nameInput.value.trim();
        if (newName) {
          nameElement.textContent = newName;
        }
        
        // Update username
        const newUsername = usernameInput.value.trim();
        if (newUsername) {
          usernameElement.textContent = newUsername.startsWith('@') ? newUsername : `@${newUsername}`;
        }
        
        // Update bio
        const newBio = bioInput.value.trim();
        bioElement.textContent = newBio || '';
        
        // Close modal
        document.body.removeChild(modal);
        
        // Show success message
        const toast = document.createElement('div');
        toast.textContent = 'Profile updated successfully!';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = '#1e1f2e';
        toast.style.color = 'white';
        toast.style.padding = '0.75rem 1.5rem';
        toast.style.borderRadius = '40px';
        toast.style.border = '1px solid #4f46e5';
        toast.style.zIndex = '10000';
        toast.style.fontSize = '0.9rem';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.remove();
        }, 2000);

        const currentUser=getCurrentUser();
        const users=getUsers();
        const index=users.findIndex(u => u.id === currentUser.id);
        users[index].username=newName;
        users[index].bio=newBio;

        saveUsers(users);
        setCurrentUser(users[index]);
      });
    
      // Handle cancel
      const cancelBtn = formContainer.querySelector('#cancelBtn');
      cancelBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
      });
      
      // Close modal when clicking outside
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      });
    });
  }




