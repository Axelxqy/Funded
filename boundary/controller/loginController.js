const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const signInBtn = document.getElementById("signInBtn");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const togglePassword = document.getElementById("togglePassword");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showEmailError(message) {
  emailInput.classList.add("error");
  emailError.textContent = message;
  emailError.classList.remove("hidden");
}

function clearEmailError() {
  emailInput.classList.remove("error");
  emailError.textContent = "";
  emailError.classList.add("hidden");
}

function showPasswordError(message) {
  passwordInput.classList.add("error");
  passwordError.textContent = message;
  passwordError.classList.remove("hidden");
}

function clearPasswordError() {
  passwordInput.classList.remove("error");
  passwordError.textContent = "";
  passwordError.classList.add("hidden");
}

emailInput.addEventListener("input", function () {
  const value = emailInput.value.trim();

  if (value === "") {
    clearEmailError();
    return;
  }

  if (!emailPattern.test(value)) {
    showEmailError("Please follow the email format, for example: name@example.com");
  } else {
    clearEmailError();
  }
});

passwordInput.addEventListener("input", function () {
  clearPasswordError();
});

togglePassword.addEventListener("click", function () {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
});

signInBtn.addEventListener("click", async function () {
  const emailValue = emailInput.value.trim();
  const passwordValue = passwordInput.value.trim();

  let hasError = false;

  clearEmailError();
  clearPasswordError();

  if (emailValue === "") {
    showEmailError("Please enter your email address.");
    hasError = true;
  } else if (!emailPattern.test(emailValue)) {
    showEmailError("Please follow the email format, for example: name@example.com");
    hasError = true;
  }

  if (passwordValue === "") {
    showPasswordError("Please enter your password.");
    hasError = true;
  }

  if (hasError) return;

  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: emailValue,
        password: passwordValue
      })
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.message === "User not found.") {
        showEmailError("Email is not registered.");
      } else if (data.message === "Wrong password.") {
        showPasswordError("Incorrect password.");
      } else {
        alert(data.message || "Login failed.");
      }
      return;
    }

    alert("Login successful.");
    window.location.href = "homepage.html";
  } catch (error) {
    console.error("Login request error:", error);
    alert("Cannot connect to server.");
  }
});