/* ==========================================
   STUDYFLOW - MAIN APPLICATION MODULE
   App initialization, clock, navigation, theme, back-to-top
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

    // Add progress gradient to SVG
    addProgressGradient();

    // Handle nav scroll state
    window.addEventListener("scroll", () => {
        const nav = document.getElementById("mainNav");
        if (nav) {
            if (window.scrollY > 50) {
                nav.classList.add("scrolled");
            } else {
                nav.classList.remove("scrolled");
            }
        }

        // Back to top visibility
        updateBackToTop();
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
   NAVIGATION
   ========================================== */

function initNavigation() {
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const navLinks = document.getElementById("navLinks");
    const links = document.querySelectorAll(".nav-link");

    // Mobile menu toggle
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("open");
            mobileMenuBtn.setAttribute("aria-expanded", isOpen);
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("open");
                mobileMenuBtn.setAttribute("aria-expanded", "false");
            });
        });
    }

    // Smooth scroll for all nav links
    links.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("href");
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const navHeight = document.getElementById("mainNav")?.offsetHeight || 0;
                const targetPosition = targetSection.offsetTop - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth"
                });

                // Update active state
                links.forEach(l => l.classList.remove("active"));
                link.classList.add("active");
            }
        });
    });

    // Active link highlighting on scroll
    const sections = document.querySelectorAll("section[id]");

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                links.forEach(link => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${id}`) {
                        link.classList.add("active");
                    }
                });
            }
        });
    }, {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0
    });

    sections.forEach(section => scrollObserver.observe(section));
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
   MORPHING SECTION
   ========================================== */

function initMorphingSection() {
    const section = document.getElementById("morphSection");
    if (!section) return;

    const words = section.querySelectorAll(".morph-word");
    const rings = section.querySelectorAll(".morph-ring");
    const glow = section.querySelector(".morph-glow");
    const progressFill = document.getElementById("morphProgressFill");
    const particlesContainer = document.getElementById("morphParticles");

    let lastWordIndex = -1;

    // Create floating particles for morph section
    if (particlesContainer) {
        for (let i = 0; i < 20; i++) {
            const p = document.createElement("div");
            p.className = "morph-particle";
            p.style.left = `${Math.random() * 100}%`;
            p.style.top = `${Math.random() * 100}%`;
            p.style.width = `${Math.random() * 4 + 2}px`;
            p.style.height = p.style.width;
            p.style.animationDelay = `${Math.random() * 5}s`;
            particlesContainer.appendChild(p);
        }
    }

    function updateMorph() {
        const rect = section.getBoundingClientRect();
        const sectionHeight = section.offsetHeight;
        const viewportHeight = window.innerHeight;

        const scrollProgress = Math.max(0, Math.min(1, 
            (viewportHeight - rect.top) / (sectionHeight + viewportHeight)
        ));

        const wordIndex = Math.min(
            words.length - 1,
            Math.floor(scrollProgress * words.length)
        );

        if (wordIndex !== lastWordIndex && lastWordIndex !== -1) {
            triggerMorphParticles(particlesContainer);
        }
        lastWordIndex = wordIndex;

        words.forEach((word, i) => {
            word.classList.remove("active", "exit-left", "exit-right");

            if (i === wordIndex) {
                word.classList.add("active");
            } else if (i < wordIndex) {
                word.classList.add("exit-left");
            } else {
                word.classList.add("exit-right");
            }
        });

        rings.forEach((ring, i) => {
            const offset = i * 0.08;
            const ringProgress = Math.max(0, Math.min(1, (scrollProgress - offset) * 1.5));
            const scale = 1 + ringProgress * 0.25;
            const rotate = scrollProgress * 120 * (i % 2 === 0 ? 1 : -1);
            const opacity = 0.2 + ringProgress * 0.5;
            ring.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
            ring.style.opacity = opacity;
        });

        if (glow) {
            const glowScale = 1 + scrollProgress * 0.4;
            const glowOpacity = 0.25 + Math.sin(scrollProgress * Math.PI) * 0.35;
            glow.style.transform = `scale(${glowScale})`;
            glow.style.opacity = glowOpacity;
        }

        if (progressFill) {
            progressFill.style.width = `${scrollProgress * 100}%`;
        }

        if (particlesContainer) {
            const particles = particlesContainer.querySelectorAll(".morph-particle");
            particles.forEach((p, i) => {
                const pProgress = (scrollProgress + i * 0.05) % 1;
                const pY = Math.sin(pProgress * Math.PI * 2 + i) * 30;
                const pX = Math.cos(pProgress * Math.PI * 2 + i * 0.5) * 20;
                const pOpacity = 0.3 + Math.sin(pProgress * Math.PI) * 0.5;
                p.style.transform = `translate(${pX}px, ${pY}px)`;
                p.style.opacity = pOpacity;
            });
        }
    }

    window.addEventListener("scroll", updateMorph, { passive: true });
    updateMorph();
}

function triggerMorphParticles(container) {
    if (!container) return;

    for (let i = 0; i < 12; i++) {
        const p = document.createElement("div");
        p.className = "morph-particle";
        p.style.left = "50%";
        p.style.top = "50%";
        p.style.width = "6px";
        p.style.height = "6px";
        p.style.background = "var(--accent)";
        p.style.borderRadius = "50%";
        p.style.opacity = "1";

        const angle = (i / 12) * Math.PI * 2;
        const distance = 80 + Math.random() * 60;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        p.style.setProperty("--tx", `${tx}px`);
        p.style.setProperty("--ty", `${ty}px`);
        p.style.animation = `morphParticleBurst 0.8s ease forwards`;

        container.appendChild(p);

        setTimeout(() => p.remove(), 800);
    }
}

/* ==========================================
   SCROLL ANIMATIONS
   ========================================== */

function initScrollAnimations() {
    const revealSelectors = [
        ".reveal-fade-up",
        ".reveal-fade-down", 
        ".reveal-scale",
        ".reveal-blur",
        ".reveal-slide-left",
        ".reveal-slide-right",
        ".reveal-text-slide-left",
        ".reveal-text-slide-right",
        ".reveal-letter-expand",
        ".reveal-clip",
        ".reveal-clip-vertical",
        ".reveal-rotate",
        ".stagger-children"
    ];

    const revealElements = document.querySelectorAll(revealSelectors.join(", "));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => observer.observe(el));

    window.timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.15 });
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