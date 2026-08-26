/* ==========================================
   STUDYFLOW - MAIN APPLICATION MODULE
   App initialization, clock, theme, back-to-top, floating progress
   ========================================== */

/**
 * Main app initialization
 */
function initApp() {
    // Initialize IndexedDB first
    initIndexedDB().catch(console.error);

    // Initialize theme before anything visible
    initTheme();

    // Initialize background effects
    initParticles();
    initScrollAnimations();
    initParallax();
    initMorphingSection();

    // Initialize login flow
    initLogin();

    // Initialize chatbot
    initChatbot();

    // Add progress gradient to SVG
    addProgressGradient();

    // Handle floating progress visibility on scroll
    window.addEventListener("scroll", () => {
        updateBackToTop();
        updateFloatingProgressVisibility();
    });
}

/* ==========================================
   THEME SYSTEM
   ========================================== */

const THEME_KEY = "studyflow_theme";

function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    const toggle = document.getElementById("themeToggle");
    if (toggle) {
        toggle.addEventListener("click", toggleTheme);
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";

    html.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);

    // Update particle colors for theme
    updateParticleColors(next);
}

function updateParticleColors(theme) {
    // Particles will naturally adapt on next frame since they read CSS variables
}

/* ==========================================
   FLOATING PROGRESS WIDGET
   ========================================== */

function showFloatingProgress() {
    const widget = document.getElementById("floatingProgress");
    if (widget) {
        widget.classList.add("visible");
    }
}

function updateFloatingProgressVisibility() {
    const widget = document.getElementById("floatingProgress");
    if (!widget) return;

    // Show after scrolling past welcome section
    const welcome = document.getElementById("welcome");
    if (welcome) {
        const welcomeBottom = welcome.offsetTop + welcome.offsetHeight;
        if (window.scrollY > welcomeBottom - 100) {
            widget.classList.add("visible");
        } else {
            widget.classList.remove("visible");
        }
    }
}

/* ==========================================
   BACK TO TOP
   ========================================== */

function initBackToTop() {
    const btn = document.getElementById("backToTop");
    if (!btn) return;

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

function updateBackToTop() {
    const btn = document.getElementById("backToTop");
    if (!btn) return;

    if (window.scrollY > 600) {
        btn.classList.add("visible");
    } else {
        btn.classList.remove("visible");
    }
}

/* ==========================================
   LIVE CLOCK
   ========================================== */

function initClock() {
    updateClock();
    setInterval(updateClock, 1000);
    updateDateDisplay();
}

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;

    const timeEl = document.getElementById("currentTime");
    const secondsEl = document.getElementById("currentSeconds");
    const ampmEl = document.getElementById("amPm");

    if (timeEl) {
        timeEl.textContent = `${hours}:${minutes.toString().padStart(2, "0")}`;
    }
    if (secondsEl) {
        secondsEl.textContent = seconds.toString().padStart(2, "0");
    }
    if (ampmEl) {
        ampmEl.textContent = ampm;
    }
}

function updateDateDisplay() {
    const now = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];

    const dayEl = document.getElementById("currentDay");
    const dateEl = document.getElementById("currentDate");

    if (dayEl) {
        dayEl.textContent = days[now.getDay()];
    }
    if (dateEl) {
        dateEl.textContent = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    }
}

/* ==========================================
   MODE SELECTOR
   ========================================== */

function initModeSelector() {
    const modeBtns = document.querySelectorAll(".mode-btn");
    const indicator = document.querySelector(".mode-indicator");

    if (!modeBtns.length || !indicator) return;

    function updateIndicator(btn) {
        indicator.style.width = `${btn.offsetWidth}px`;
        indicator.style.transform = `translateX(${btn.offsetLeft}px)`;
    }

    const activeBtn = document.querySelector(".mode-btn.active");
    if (activeBtn) {
        requestAnimationFrame(() => updateIndicator(activeBtn));
    }

    modeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            modeBtns.forEach(b => {
                b.classList.remove("active");
                b.setAttribute("aria-selected", "false");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");

            updateIndicator(btn);

            currentMode = btn.dataset.mode;
            renderTimetable(currentMode);
            updateProgress();
        });
    });

    window.addEventListener("resize", () => {
        const active = document.querySelector(".mode-btn.active");
        if (active) updateIndicator(active);
    });
}

/* ==========================================
   PROFILE - SIMPLIFIED
   ========================================== */

function initProfile() {
    const user = getCurrentUser();
    if (!user) return;

    const nameEl = document.getElementById("profileName");
    const goalEl = document.getElementById("profileGoal");
    const initialEl = document.getElementById("profileInitial");

    if (nameEl) nameEl.textContent = user.name;
    if (goalEl) goalEl.textContent = user.goal || "No goal set";
    if (initialEl) initialEl.textContent = user.name.charAt(0).toUpperCase();
}

/* ==========================================
   UTILITIES
   ========================================== */

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initApp);