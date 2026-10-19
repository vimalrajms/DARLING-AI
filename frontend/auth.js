const API_BASE = "http://127.0.0.1:8000";

const authForm = document.getElementById("authForm");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const tabIndicator = document.getElementById("tabIndicator");

const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const submitButton = document.getElementById("submitButton");
const submitText = document.getElementById("submitText");

const displayNameGroup = document.getElementById("displayNameGroup");
const confirmGroup = document.getElementById("confirmGroup");
const loginOptions = document.getElementById("loginOptions");

const displayNameInput = document.getElementById("displayName");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const passwordToggle = document.getElementById("passwordToggle");
const rememberMe = document.getElementById("rememberMe");
const messageBox = document.getElementById("messageBox");
const switchMessage = document.getElementById("switchMessage");
const switchButton = document.getElementById("switchButton");
const starsContainer = document.getElementById("stars");

let currentMode = "login";


// Show status message
function showMessage(message, success = false) {
    messageBox.textContent = message;
    messageBox.classList.toggle("success", success);
    messageBox.classList.toggle("error", !success);
}


// Switch between Login and Register
function setMode(mode) {
    currentMode = mode;

    const isRegister = mode === "register";

    displayNameGroup.classList.toggle("hidden", !isRegister);
    confirmGroup.classList.toggle("hidden", !isRegister);
    loginOptions.classList.toggle("hidden", isRegister);

    displayNameInput.required = isRegister;
    confirmPasswordInput.required = isRegister;

    loginTab.classList.toggle("active", !isRegister);
    registerTab.classList.toggle("active", isRegister);

    tabIndicator.style.transform = isRegister
        ? "translateX(100%)"
        : "translateX(0)";

    formTitle.textContent = isRegister
        ? "Create Your Account"
        : "Welcome Back!";

    formSubtitle.textContent = isRegister
        ? "Join your personal DARLING space."
        : "Login to continue your journey.";

    submitText.textContent = isRegister
        ? "Create Account"
        : "Login to DARLING";

    switchMessage.textContent = isRegister
        ? "Already have an account?"
        : "New to DARLING?";

    switchButton.textContent = isRegister
        ? "Login"
        : "Create account";

    passwordInput.autocomplete = isRegister
        ? "new-password"
        : "current-password";

    showMessage("");

    if (isRegister) {
        displayNameInput.focus();
    } else {
        usernameInput.focus();
    }
}


// Tab buttons
loginTab.addEventListener("click", () => {
    setMode("login");
});

registerTab.addEventListener("click", () => {
    setMode("register");
});

switchButton.addEventListener("click", () => {
    setMode(currentMode === "login" ? "register" : "login");
});


// Password show/hide
passwordToggle.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden ? "text" : "password";

    passwordToggle.textContent = isHidden ? "◎" : "◉";

    passwordToggle.setAttribute(
        "aria-label",
        isHidden ? "Hide password" : "Show password"
    );
});


// Generate background stars
if (starsContainer) {
    for (let i = 0; i < 45; i++) {
        const star = document.createElement("span");

        star.className = "star";

        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 4}s`;
        star.style.animationDuration = `${2 + Math.random() * 4}s`;

        starsContainer.appendChild(star);
    }
}


// Register and Login API
authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!/^[A-Za-z0-9_]{3,30}$/.test(username)) {
        showMessage(
            "Username must be 3-30 characters. Use letters, numbers and underscores."
        );

        usernameInput.focus();
        return;
    }

    if (password.length < 8 || password.length > 128) {
        showMessage("Password must contain 8-128 characters.");
        passwordInput.focus();
        return;
    }

    const isRegister = currentMode === "register";

    if (isRegister) {
        const displayName = displayNameInput.value.trim();

        if (!displayName) {
            showMessage("Please enter your name.");
            displayNameInput.focus();
            return;
        }

        if (password !== confirmPasswordInput.value) {
            showMessage("Passwords do not match.");
            confirmPasswordInput.focus();
            return;
        }
    }

    const endpoint = isRegister
        ? "/api/register"
        : "/api/login";

    const requestData = isRegister
        ? {
            username: username,
            display_name: displayNameInput.value.trim(),
            password: password
        }
        : {
            username: username,
            password: password
        };

    submitButton.disabled = true;
    submitText.textContent = "Please wait...";

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                typeof result.detail === "string"
                    ? result.detail
                    : "Authentication failed."
            );
        }

        if (!result.access_token) {
            throw new Error("The server did not return a login token.");
        }

        // Save session token
        sessionStorage.setItem(
            "darling_token",
            result.access_token
        );

        sessionStorage.setItem(
            "darling_user",
            JSON.stringify(result.user)
        );

        showMessage(
            isRegister
                ? "Account created successfully! Opening DARLING..."
                : "Login successful! Opening DARLING...",
            true
        );

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);

    } catch (error) {
        console.error("DARLING authentication error:", error);

        showMessage(
            error.message === "Failed to fetch"
                ? "Cannot connect to backend. Check that the server is running."
                : error.message
        );

    } finally {
        submitButton.disabled = false;

        submitText.textContent = currentMode === "register"
            ? "Create Account"
            : "Login to DARLING";
    }
});


// Initial state
setMode("login");