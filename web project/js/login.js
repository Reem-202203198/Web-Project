//redirect
redirectIfLoggedIn();
//initialize storage
initStorage();
function showError(fieldId, message) {
  const errorEl = document.getElementById(fieldId + "-error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }
}
function clearAllErrors() {
  ["email", "password"].forEach((id) => {
    const el = document.getElementById(id + "-error");
    if (el) {
      el.textContent = "";
      el.style.display = "none";
    }
  });
}

//Login form submit
const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  clearAllErrors();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  let hasError = false;

  // Validate fields not empty
  if (email === "") {
    showError("email", "Email is required.");
    hasError = true;
  }

  if (password === "") {
    showError("password", "Password is required.");
    hasError = true;
  }

  if (hasError) return;

  //Find user by email
  const user = getUserByEmail(email);

  if (!user) {
    showError("email", "No account found with this email.");
    return;
  }

  //  Check password
  if (user.password !== password) {
    showError("password", "Incorrect password.");
    return;
  }

  //  Save session and redirect
  setCurrentUser(user);
  window.location.href = "feed.html";
});
