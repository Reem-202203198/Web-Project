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

loginForm.addEventListener("submit", async function (e) {
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

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      showError("password", data.error);
      return;
    }
    localStorage.setItem("currentUser", JSON.stringify(data));
    window.location.href = "feed.html";
  } catch (err) {
    showError("password", "Something went wrong. Try again.");
  }
});
