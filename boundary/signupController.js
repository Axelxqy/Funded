const signupEmailInput = document.getElementById("signupEmailInput");
const signupPasswordInput = document.getElementById("signupPasswordInput");
const signupFnameInput = document.getElementById("signupFnameInput");
const signupLnameInput = document.getElementById("signupLnameInput");
const signupDobInput = document.getElementById("signupDobInput");
const signupPhoneInput = document.getElementById("signupPhoneInput");
const signupBtn = document.getElementById("signupBtn");

const signupEmailError = document.getElementById("signupEmailError");
const signupPasswordError = document.getElementById("signupPasswordError");
const signupFnameError = document.getElementById("signupFnameError");
const signupLnameError = document.getElementById("signupLnameError");
const signupDobError = document.getElementById("signupDobError");
const signupPhoneError = document.getElementById("signupPhoneError");

const toggleSignupPassword = document.getElementById("toggleSignupPassword");
const signupPasswordRules = document.getElementById("signupPasswordRules");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const specialPattern = /[@#$%!]/;

const signupRules = {
  length: document.getElementById("signup-rule-length"),
  number: document.getElementById("signup-rule-number"),
  lower: document.getElementById("signup-rule-lower"),
  upper: document.getElementById("signup-rule-upper"),
  special: document.getElementById("signup-rule-special"),
};

function showError(input, errorElement, message) {
  if (!input || !errorElement) return;

  input.classList.add("error");
  errorElement.textContent = message;
  errorElement.classList.remove("hidden");
}

function clearError(input, errorElement) {
  if (!input || !errorElement) return;

  input.classList.remove("error");
  errorElement.textContent = "";
  errorElement.classList.add("hidden");
}

function setRuleState(element, valid) {
  if (!element) return;

  if (valid) {
    element.classList.remove("invalid");
    element.classList.add("valid");
  } else {
    element.classList.remove("valid");
    element.classList.add("invalid");
  }
}

function checkPasswordRules(password, rulesMap) {
  const hasLength = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = specialPattern.test(password);

  setRuleState(rulesMap.length, hasLength);
  setRuleState(rulesMap.number, hasNumber);
  setRuleState(rulesMap.lower, hasLower);
  setRuleState(rulesMap.upper, hasUpper);
  setRuleState(rulesMap.special, hasSpecial);

  return hasLength && hasNumber && hasLower && hasUpper && hasSpecial;
}

async function readJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      message: text,
    };
  }
}

if (toggleSignupPassword) {
  toggleSignupPassword.addEventListener("click", function () {
    if (!signupPasswordInput) return;

    if (signupPasswordInput.type === "password") {
      signupPasswordInput.type = "text";
      toggleSignupPassword.textContent = "🙈";
    } else {
      signupPasswordInput.type = "password";
      toggleSignupPassword.textContent = "👁";
    }
  });
}

if (signupEmailInput) {
  signupEmailInput.addEventListener("input", function () {
    const value = signupEmailInput.value.trim();

    if (value === "") {
      clearError(signupEmailInput, signupEmailError);
      return;
    }

    if (!emailPattern.test(value)) {
      showError(
        signupEmailInput,
        signupEmailError,
        "Please follow the email format, for example: name@example.com"
      );
    } else {
      clearError(signupEmailInput, signupEmailError);
    }
  });
}

if (signupPasswordInput) {
  signupPasswordInput.addEventListener("input", function () {
    const value = signupPasswordInput.value;

    clearError(signupPasswordInput, signupPasswordError);

    if (value === "") {
      signupPasswordRules.classList.add("hidden");
      return;
    }

    signupPasswordRules.classList.remove("hidden");
    checkPasswordRules(value, signupRules);
  });
}

if (signupBtn) {
  signupBtn.addEventListener("click", async function () {
    const emailValue = signupEmailInput.value.trim();
    const passwordValue = signupPasswordInput.value;
    const fnameValue = signupFnameInput.value.trim();
    const lnameValue = signupLnameInput.value.trim();
    const dobValue = signupDobInput.value.trim();
    const phoneValue = signupPhoneInput.value.trim();

    let hasError = false;

    clearError(signupEmailInput, signupEmailError);
    clearError(signupPasswordInput, signupPasswordError);
    clearError(signupFnameInput, signupFnameError);
    clearError(signupLnameInput, signupLnameError);
    clearError(signupDobInput, signupDobError);
    clearError(signupPhoneInput, signupPhoneError);

    if (emailValue === "") {
      showError(
        signupEmailInput,
        signupEmailError,
        "Please enter your email address."
      );
      hasError = true;
    } else if (!emailPattern.test(emailValue)) {
      showError(
        signupEmailInput,
        signupEmailError,
        "Please follow the email format, for example: name@example.com"
      );
      hasError = true;
    }

    if (passwordValue === "") {
      showError(
        signupPasswordInput,
        signupPasswordError,
        "Please enter your password."
      );
      signupPasswordRules.classList.add("hidden");
      hasError = true;
    } else if (!checkPasswordRules(passwordValue, signupRules)) {
      signupPasswordRules.classList.remove("hidden");
      showError(
        signupPasswordInput,
        signupPasswordError,
        "Password does not meet all required criteria."
      );
      hasError = true;
    }

    if (fnameValue === "") {
      showError(
        signupFnameInput,
        signupFnameError,
        "Please enter your first name."
      );
      hasError = true;
    }

    if (lnameValue === "") {
      showError(
        signupLnameInput,
        signupLnameError,
        "Please enter your last name."
      );
      hasError = true;
    }

    if (dobValue === "") {
      showError(
        signupDobInput,
        signupDobError,
        "Please enter your date of birth."
      );
      hasError = true;
    }

    if (phoneValue === "") {
      showError(
        signupPhoneInput,
        signupPhoneError,
        "Please enter your phone number."
      );
      hasError = true;
    }

    if (hasError) return;

    try {
      const response = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailValue,
          password: passwordValue,
          f_name: fnameValue,
          l_name: lnameValue,
          dob: dobValue,
          phone: phoneValue,
        }),
      });

      const data = await readJsonResponse(response);

      if (!response.ok) {
        if (
          data.message === "Email already exists." ||
          data.message === "Email already registered."
        ) {
          showError(
            signupEmailInput,
            signupEmailError,
            "This email is already registered."
          );
        } else {
          alert(data.message || "Signup failed.");
        }

        return;
      }

      alert(data.message || "Signup successful.");
      window.location.href = "login.html";
    } catch (error) {
      console.error("Signup request error:", error);
      alert("Cannot connect to server.");
    }
  });
}