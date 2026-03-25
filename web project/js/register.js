redirectIfLoggedIn();
initStorage();

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password) {
  const hasNumber = /\d/.test(password);
  return password.length >= 8 && hasNumber;
}

function showError(fieldId, message) {
  const errorEl = document.getElementById(fieldId + "-error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }
}

function clearError(fieldId) {
  const errorEl = document.getElementById(fieldId + "-error");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.style.display = "none";
  }
}

function clearAllErrors() {
  ["username", "email", "password", "confirmPassword"].forEach(clearError);
}

const registerForm = document.getElementById("register-form");

registerForm.addEventListener("submit", function (e) {
  e.preventDefault();

  clearAllErrors();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  let hasError = false;

  if (username === "") {
    showError("username", "Username is required.");
    hasError = true;
  }

  if (email === "") {
    showError("email", "Email is required.");
    hasError = true;
  } else if (!isValidEmail(email)) {
    showError("email", "Please enter a valid email address.");
    hasError = true;
  } else if (getUserByEmail(email)) {
    showError("email", "This email is already registered.");
    hasError = true;
  }

  if (password === "") {
    showError("password", "Password is required.");
    hasError = true;
  } else if (!isValidPassword(password)) {
    showError(
      "password",
      "Password must be at least 8 characters and contain a number.",
    );
    hasError = true;
  }

  if (confirmPassword === "") {
    showError("confirmPassword", "Please confirm your password.");
    hasError = true;
  } else if (password !== confirmPassword) {
    showError("confirmPassword", "Passwords do not match.");
    hasError = true;
  }

  if (hasError) return; // ✅ STOP here if any errors

  const newUser = {
    id: generateId(),
    username: username,
    email: email,
    password: password,
    bio: "",
    profilePicture: "",
    following: [],
    followers: [],
  };

  const users = getUsers();
  users.push(newUser);
  saveUsers(users);

  alert("Account created successfully! Please log in.");
  window.location.href = "login.html";
});
