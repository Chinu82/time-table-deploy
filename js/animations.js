/* ==========================================
   STUDYFLOW - ANIMATIONS MODULE
   Scroll effects, particles, 3D tilt, morphing
   ========================================== */

/**
 * Initialize canvas particle background
 */
function initParticles() {
    const canvas = document.getElementById("particleCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    let animationId = null;
    let isActive = true;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    const PARTICLE_COUNT = Math.min(50, Math.floor(window.innerWidth / 30));

    function getParticleColor() {
        const theme = document.documentElement.getAttribute("data-theme") || "dark";
        return theme === "dark" ? "108, 99, 255" : "91, 77, 255";
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }

        draw() {
            const color = getParticleColor();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color}, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function animate() {
        if (!isActive) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const color = getParticleColor();

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(${color}, ${0.08 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });
        });

        animationId = requestAnimationFrame(animate);
    }

    animate();

    // Pause when tab is hidden
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            isActive = false;
            if (animationId) cancelAnimationFrame(animationId);
        } else {
            isActive = true;
            animate();
        }
    });

    // Expose for theme updates
    window.refreshParticles = () => {
        // Particles will pick up new colors on next frame
    };
}

/**
 * Initialize IntersectionObserver for scroll reveal animations
 */
function initScrollAnimations() {
    const revealSelectors = [
        ".reveal-fade-up", ".reveal-fade-down", ".reveal-scale", ".reveal-blur",
        ".reveal-slide-left", ".reveal-slide-right", ".stagger-children"
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

    // Also observe timeline items dynamically
    window.timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.15 });
}

/**
 * Initialize parallax effects
 */
function initParallax() {
    const parallaxElements = document.querySelectorAll(".parallax-slow, .parallax-medium");
    if (!parallaxElements.length) return;

    let ticking = false;

    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                parallaxElements.forEach(el => {
                    const speed = el.classList.contains("parallax-slow") ? 0.3 : 0.5;
                    el.style.transform = `translateY(${scrollY * speed}px)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    });
}

/**
 * Initialize 3D tilt effect for cards
 */
function init3DTilt() {
    const cards = document.querySelectorAll(".tilt-card");

    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
        });
    });
}

/**
 * Initialize scroll-driven morphing section
 */
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

        // Calculate progress through the section (0 to 1)
        const scrollProgress = Math.max(0, Math.min(1, 
            (viewportHeight - rect.top) / (sectionHeight + viewportHeight)
        ));

        // Determine active word based on progress with smooth thresholds
        const wordIndex = Math.min(
            words.length - 1,
            Math.floor(scrollProgress * words.length)
        );

        // Only trigger particle burst when word changes
        if (wordIndex !== lastWordIndex && lastWordIndex !== -1) {
            triggerMorphParticles(particlesContainer);
        }
        lastWordIndex = wordIndex;

        // Update words with exit animations
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

        // Animate rings with smooth easing
        rings.forEach((ring, i) => {
            const offset = i * 0.08;
            const ringProgress = Math.max(0, Math.min(1, (scrollProgress - offset) * 1.5));
            const scale = 1 + ringProgress * 0.25;
            const rotate = scrollProgress * 120 * (i % 2 === 0 ? 1 : -1);
            const opacity = 0.2 + ringProgress * 0.5;
            ring.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
            ring.style.opacity = opacity;
        });

        // Animate glow
        if (glow) {
            const glowScale = 1 + scrollProgress * 0.4;
            const glowOpacity = 0.25 + Math.sin(scrollProgress * Math.PI) * 0.35;
            glow.style.transform = `scale(${glowScale})`;
            glow.style.opacity = glowOpacity;
        }

        // Update progress bar
        if (progressFill) {
            progressFill.style.width = `${scrollProgress * 100}%`;
        }

        // Animate particles
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

/**
 * Create celebration confetti effect
 */
function celebrationEffect() {
    const container = document.getElementById("celebrationParticles");
    if (!container) return;

    container.innerHTML = "";
    const colors = ["#6c63ff", "#8f88ff", "#22c55e", "#f59e0b", "#ec4899"];

    for (let i = 0; i < 60; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.animationDuration = `${Math.random() * 3 + 2}s`;
        piece.style.animationDelay = `${Math.random() * 2}s`;
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.width = `${Math.random() * 8 + 4}px`;
        piece.style.height = `${Math.random() * 8 + 4}px`;
        piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
        container.appendChild(piece);
    }

    setTimeout(() => {
        container.innerHTML = "";
    }, 6000);
}

/**
 * Add SVG gradient definition for progress ring
 */
function addProgressGradient() {
    // Already embedded in HTML, no need to add dynamically
}

// Expose functions
window.initParticles = initParticles;
window.initScrollAnimations = initScrollAnimations;
window.initParallax = initParallax;
window.init3DTilt = init3DTilt;
window.initMorphingSection = initMorphingSection;
window.celebrationEffect = celebrationEffect;
window.addProgressGradient = addProgressGradient;
window.triggerMorphParticles = triggerMorphParticles;