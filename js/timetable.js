/* ==========================================
   STUDYFLOW - TIMETABLE MODULE
   Schedule data, rendering, and task management
   ========================================== */

// ==========================================
// EDIT YOUR SCHEDULES HERE
// ==========================================
const schedules = {
    WFO: [
        { time: "06:00", title: "Wake Up & Fresh Up", category: "routine" },
        { time: "06:30", title: "Exercise / Yoga", category: "health" },
        { time: "07:30", title: "Breakfast & Plan", category: "routine" },
        { time: "09:00", title: "Office Commute / Start", category: "work" },
        { time: "13:00", title: "Lunch Break", category: "routine" },
        { time: "18:00", title: "Return Home", category: "routine" },
        { time: "19:00", title: "Java Study Session", category: "study" },
        { time: "20:30", title: "Project Work", category: "coding" },
        { time: "22:00", title: "Revision & Notes", category: "study" },
        { time: "23:00", title: "Wind Down", category: "routine" }
    ],

    REMOTE: [
        { time: "06:30", title: "Morning Study", category: "study" },
        { time: "08:00", title: "Breakfast", category: "routine" },
        { time: "09:00", title: "Remote Work Start", category: "work" },
        { time: "11:00", title: "Break & Stretch", category: "health" },
        { time: "13:00", title: "Lunch", category: "routine" },
        { time: "14:00", title: "Remote Work Continue", category: "work" },
        { time: "17:00", title: "Exercise", category: "health" },
        { time: "18:30", title: "Java / Spring Boot", category: "study" },
        { time: "20:30", title: "Personal Project", category: "coding" },
        { time: "22:00", title: "Revision", category: "study" }
    ],

    HOLIDAY: [
        { time: "07:30", title: "Wake Up Naturally", category: "routine" },
        { time: "08:00", title: "Deep Study Session", category: "study" },
        { time: "10:00", title: "Coding Practice", category: "coding" },
        { time: "11:30", title: "Mock Test", category: "test" },
        { time: "13:00", title: "Lunch & Break", category: "routine" },
        { time: "14:30", title: "Project Development", category: "coding" },
        { time: "16:30", title: "Exercise / Walk", category: "health" },
        { time: "17:30", title: "Review & Notes", category: "study" },
        { time: "19:00", title: "Interview Prep", category: "study" },
        { time: "20:30", title: "Relaxation", category: "routine" }
    ]
};

let currentMode = "WFO";
let todayTasks = {};

/**
 * Initialize timetable section
 */
function initTimetable() {
    // Load saved tasks for today
    loadTodayTasks();

    // Render initial timetable
    renderTimetable(currentMode);

    // Update progress
    updateProgress();
}

/**
 * Get today's date string for storage keys
 */
function getTodayKey() {
    return new Date().toISOString().split("T")[0];
}

/**
 * Load today's completed tasks from storage
 */
function loadTodayTasks() {
    const todayKey = getTodayKey();
    const allTasks = Storage.get(STORAGE_KEYS.TASKS, {});
    todayTasks = allTasks[todayKey] || {};
}

/**
 * Save today's completed tasks to storage
 */
function saveTodayTasks() {
    const todayKey = getTodayKey();
    const allTasks = Storage.get(STORAGE_KEYS.TASKS, {});
    allTasks[todayKey] = todayTasks;
    Storage.save(STORAGE_KEYS.TASKS, allTasks);
}

/**
 * Render timetable for given mode
 */
function renderTimetable(mode) {
    const container = document.getElementById("timelineContainer");
    if (!container) return;

    // Add switching class for transition
    container.classList.add("switching");

    setTimeout(() => {
        const schedule = schedules[mode] || schedules.WFO;
        container.innerHTML = "";

        schedule.forEach((item, index) => {
            const taskId = `${mode}_${index}`;
            const isCompleted = todayTasks[taskId] === true;

            const timelineItem = document.createElement("div");
            timelineItem.className = `timeline-item ${isCompleted ? "completed" : ""}`;
            timelineItem.dataset.taskId = taskId;

            const timeFormatted = formatTime(item.time);

            timelineItem.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="timeline-card glass-card">
                    <div class="timeline-time">${timeFormatted}</div>
                    <h4 class="timeline-title">${escapeHtml(item.title)}</h4>
                    <span class="timeline-category">${item.category}</span>
                    <div class="timeline-check">
                        <svg viewBox="0 0 24 24">
                            <path d="M5 12l5 5L20 7"/>
                        </svg>
                    </div>
                </div>
            `;

            // Add click handler
            timelineItem.addEventListener("click", () => toggleTask(taskId));

            container.appendChild(timelineItem);

            // Observe for scroll animation
            if (window.timelineObserver) {
                window.timelineObserver.observe(timelineItem);
            }
        });

        container.classList.remove("switching");

        // Re-init 3D tilt for new cards
        init3DTilt();
    }, 300);
}

/**
 * Toggle task completion status
 */
function toggleTask(taskId) {
    const item = document.querySelector(`[data-task-id="${taskId}"]`);
    if (!item) return;

    const isCompleted = !todayTasks[taskId];
    todayTasks[taskId] = isCompleted;

    if (isCompleted) {
        item.classList.add("completed", "just-completed");
        // Remove animation class after it plays
        setTimeout(() => item.classList.remove("just-completed"), 600);
    } else {
        item.classList.remove("completed");
    }

    saveTodayTasks();
    updateProgress();

    // Check if all tasks complete
    const schedule = schedules[currentMode];
    const totalTasks = schedule.length;
    const completedCount = Object.values(todayTasks).filter(v => v).length;

    if (completedCount === totalTasks && totalTasks > 0) {
        setTimeout(() => showDayComplete(), 800);
    }
}

/**
 * Update progress display
 */
function updateProgress() {
    const schedule = schedules[currentMode];
    const totalTasks = schedule.length;
    const completedCount = Object.keys(todayTasks).filter(key => 
        key.startsWith(currentMode + "_") && todayTasks[key]
    ).length;

    const percentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    // Update ring
    const ringFill = document.getElementById("progressRingFill");
    if (ringFill) {
        const circumference = 2 * Math.PI * 85; // r=85
        const offset = circumference - (percentage / 100) * circumference;
        ringFill.style.strokeDashoffset = offset;
    }

    // Update percent text
    const percentEl = document.getElementById("progressPercent");
    if (percentEl) {
        animateNumber(percentEl, parseInt(percentEl.textContent) || 0, percentage, "%");
    }

    // Update task count
    const tasksEl = document.getElementById("progressTasks");
    if (tasksEl) {
        tasksEl.textContent = `${completedCount} / ${totalTasks} Tasks`;
    }

    // Update bar
    const barFill = document.getElementById("progressBarFill");
    if (barFill) {
        barFill.style.width = `${percentage}%`;
    }

    // Update message
    const messageEl = document.getElementById("progressMessage");
    if (messageEl) {
        messageEl.textContent = getCompletionMessage(percentage);
    }
}

/**
 * Get motivational message based on progress
 */
function getCompletionMessage(percentage) {
    if (percentage === 0) return "Let's get started.";
    if (percentage < 30) return "Keep going.";
    if (percentage < 50) return "You're building momentum.";
    if (percentage < 70) return "You're doing great.";
    if (percentage < 100) return "Almost there!";
    return "Day completed! 🔥";
}

/**
 * Show day completion celebration
 */
function showDayComplete() {
    const celebration = document.getElementById("celebration");
    if (!celebration) return;

    celebration.classList.remove("hidden");
    celebrationEffect();

    // Auto-hide after 6 seconds
    setTimeout(() => {
        celebration.classList.add("hidden");
    }, 6000);
}

/**
 * Animate number counting
 */
function animateNumber(element, from, to, suffix = "") {
    const duration = 600;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const current = Math.round(from + (to - from) * eased);
        element.textContent = current + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/**
 * Format time from 24h to 12h with AM/PM
 */
function formatTime(time24) {
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize progress section
 */
function initProgress() {
    addProgressGradient();
    updateProgress();
}

// Expose
window.initTimetable = initTimetable;
window.renderTimetable = renderTimetable;
window.toggleTask = toggleTask;
window.updateProgress = updateProgress;
window.initProgress = initProgress;
window.schedules = schedules;