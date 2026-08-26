/* ==========================================
   STUDYFLOW - LOGIN MODULE
   Handles user authentication flow (local only)
   ========================================== */

let currentUser = null;

/**
 * Initialize login module
 */
function initLogin() {
    const loginForm = document.getElementById("loginForm");
    const returningUserSection = document.getElementById("returningUser");
    const continueBtn = document.getElementById("continueBtn");
    const changeProfileBtn = document.getElementById("changeProfileBtn");

    // Check for returning user
    const savedUser = Storage.get(STORAGE_KEYS.USER);

    if (savedUser && savedUser.name) {
        currentUser = savedUser;
        loginForm.classList.add("hidden");
        returningUserSection.classList.remove("hidden");
        document.getElementById("returningName").textContent = savedUser.name;
    }

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    if (continueBtn) {
        continueBtn.addEventListener("click", () => {
            animateLoginExit();
        });
    }

    if (changeProfileBtn) {
        changeProfileBtn.addEventListener("click", () => {
            loginForm.classList.remove("hidden");
            returningUserSection.classList.add("hidden");
            document.getElementById("userName").value = currentUser?.name || "";
            document.getElementById("userEmail").value = currentUser?.email || "";
            document.getElementById("userGoal").value = currentUser?.goal || "";
        });
    }
}

/**
 * Handle login form submission
 */
function handleLogin(e) {
    e.preventDefault();

    const nameInput = document.getElementById("userName");
    const emailInput = document.getElementById("userEmail");
    const goalInput = document.getElementById("userGoal");
    const errorEl = document.getElementById("nameError");

    const name = nameInput.value.trim();

    if (!name) {
        errorEl.textContent = "Please enter your name";
        nameInput.style.borderColor = "var(--danger)";
        return;
    }

    if (name.length < 2) {
        errorEl.textContent = "Name must be at least 2 characters";
        nameInput.style.borderColor = "var(--danger)";
        return;
    }

    errorEl.textContent = "";
    nameInput.style.borderColor = "";

    currentUser = {
        name: name,
        email: emailInput.value.trim(),
        goal: goalInput.value.trim(),
        createdAt: new Date().toISOString()
    };

    Storage.save(STORAGE_KEYS.USER, currentUser);
    animateLoginExit();
}

/**
 * Animate login card away and show main app
 * NOTE: 650ms matches the CSS loginExit keyframe (0.6s)
 */
function animateLoginExit() {
    const loginSection = document.getElementById("loginSection");
    const mainApp = document.getElementById("mainApp");

    loginSection.classList.add("exiting");

    setTimeout(() => {
        loginSection.classList.add("hidden");
        mainApp.classList.remove("hidden");

        // Initialize app sections
        updateWelcomeUI();
        initClock();
        initBackToTop();
        initModeSelector();
        initTimetable();
        initProgress();
        initFileManager();
        initProfile();

        // Trigger welcome animations
        setTimeout(() => {
            document.querySelectorAll(".anim-line").forEach((line, i) => {
                setTimeout(() => {
                    line.style.opacity = "1";
                    line.style.transform = "translateY(0)";
                }, parseInt(line.dataset.delay) || i * 400);
            });
        }, 300);

        window.scrollTo(0, 0);
    }, 650);
}

/**
 * Update welcome section with time-based greeting
 */
function updateWelcomeUI() {
    const welcomeName = document.getElementById("welcomeName");
    if (welcomeName && currentUser) {
        const hour = new Date().getHours();
        let greeting = "Good Evening";

        if (hour < 12) {
            greeting = "Good Morning";
        } else if (hour < 17) {
            greeting = "Good Afternoon";
        }

        welcomeName.textContent = `${greeting}, ${currentUser.name}.`;
    }
}

/**
 * Get current user
 */
function getCurrentUser() {
    if (!currentUser) {
        currentUser = Storage.get(STORAGE_KEYS.USER);
    }
    return currentUser;
}

// Expose
window.initLogin = initLogin;
window.getCurrentUser = getCurrentUser;
window.animateLoginExit = animateLoginExit;