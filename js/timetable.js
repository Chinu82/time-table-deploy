/* ==========================================
   STUDYFLOW - TIMETABLE MODULE
   Your actual exam prep schedule
   ========================================== */

const schedules = {
    REMOTE: [
        { time: "05:30", title: "Wake Up, Freshen Up, Hydrate", category: "routine" },
        { time: "06:00", title: "Study Slot 1 — Reasoning (Puzzles / Syllogism / Direction)", category: "reasoning" },
        { time: "07:15", title: "Break — Walk / Stretch", category: "break" },
        { time: "07:25", title: "Breakfast", category: "break" },
        { time: "07:45", title: "Study Slot 2 — English Grammar + Cloze Test", category: "english" },
        { time: "09:00", title: "Break", category: "break" },
        { time: "09:10", title: "Study Slot 3 — GK/GS Deep Dive (History / Polity / Geography)", category: "gkgs" },
        { time: "10:25", title: "Break", category: "break" },
        { time: "10:35", title: "Study Slot 4 — English Vocab / Idioms", category: "english" },
        { time: "11:00", title: "Work Hours", category: "work" },
        { time: "20:00", title: "Freshen Up / Unwind", category: "routine" },
        { time: "20:30", title: "Dinner", category: "break" },
        { time: "21:00", title: "Study Slot 5 — Quant / Aptitude (Arithmetic / Algebra)", category: "quant" },
        { time: "22:15", title: "Break", category: "break" },
        { time: "22:25", title: "Study Slot 6 — English RC Passage", category: "english" },
        { time: "22:50", title: "Wind Down — Pack notes, no screens", category: "routine" },
        { time: "23:00", title: "💤 Lights Off", category: "routine" }
    ],

    WFO: [
        { time: "05:30", title: "Wake Up, Freshen Up", category: "routine" },
        { time: "06:00", title: "Study Slot 1 — Quant / Aptitude (20 Easy + 10 Medium MCQs)", category: "quant" },
        { time: "07:15", title: "Break", category: "break" },
        { time: "07:25", title: "Breakfast", category: "break" },
        { time: "07:45", title: "Study Slot 2 — English Grammar + Para Jumbles", category: "english" },
        { time: "09:00", title: "Break", category: "break" },
        { time: "09:10", title: "Study Slot 3 — GK/GS Static Quick Revision", category: "gkgs" },
        { time: "10:25", title: "Quick Get Ready", category: "routine" },
        { time: "10:30", title: "🚗 Commute — GK Podcasts / Current Affairs Audio", category: "commute" },
        { time: "11:00", title: "Work Hours", category: "work" },
        { time: "20:00", title: "🚗 Commute Back — Flashcards on Phone", category: "commute" },
        { time: "20:30", title: "Dinner", category: "break" },
        { time: "21:00", title: "Study Slot 4 — Reasoning (Non-verbal / Missing Numbers)", category: "reasoning" },
        { time: "22:15", title: "Break", category: "break" },
        { time: "22:25", title: "Study Slot 5 — English Vocab Booster (Root Words)", category: "english" },
        { time: "22:50", title: "Wind Down — Prep for tomorrow", category: "routine" },
        { time: "23:00", title: "💤 Lights Off", category: "routine" }
    ],

    HOLIDAY: [
        { time: "06:30", title: "Study Slot 1 — English (Full Grammar + 1 RC Set)", category: "english" },
        { time: "07:45", title: "Break + Breakfast", category: "break" },
        { time: "08:30", title: "Study Slot 2 — Reasoning (High-level Puzzles / Input-Output)", category: "reasoning" },
        { time: "09:45", title: "Break", category: "break" },
        { time: "10:00", title: "Study Slot 3 — GK/GS Deep Dive (Art & Culture / Environment)", category: "gkgs" },
        { time: "11:15", title: "Break", category: "break" },
        { time: "11:30", title: "Study Slot 4 — Quant Hard (Trigonometry / Algebra)", category: "quant" },
        { time: "12:45", title: "🧐 Doubt Session 1 — Mock Test Mistake Analysis", category: "doubt" },
        { time: "14:45", title: "Lunch / Rest Break", category: "break" },
        { time: "15:30", title: "Study Slot 5 — English (Vocab + Spelling Checks)", category: "english" },
        { time: "16:45", title: "🧐 Doubt Session 2 — 50 PYQs GK & Quant", category: "doubt" },
        { time: "18:45", title: "Evening Tea Break", category: "break" },
        { time: "19:00", title: "Study Slot 6 — Reasoning / Quant (Weak Areas)", category: "quant" },
        { time: "20:15", title: "Break + Dinner", category: "break" },
        { time: "20:45", title: "Study Slot 7 — GK/GS Rapid Fire Current Affairs", category: "gkgs" },
        { time: "21:30", title: "Buffer / Extra Study", category: "study" },
        { time: "22:15", title: "Wind Down — Relax, light news", category: "routine" },
        { time: "23:00", title: "💤 Lights Off", category: "routine" }
    ]
};

let currentMode = "REMOTE";
let todayTasks = {};

/**
 * Initialize timetable section
 */
function initTimetable() {
    loadTodayTasks();
    renderTimetable(currentMode);
    updateProgress();
}

/**
 * Get today's date string for storage keys (LOCAL time, not UTC)
 */
function getTodayKey() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

    container.classList.add("switching");

    setTimeout(() => {
        const schedule = schedules[mode] || schedules.REMOTE;
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

            timelineItem.addEventListener("click", () => toggleTask(taskId));

            container.appendChild(timelineItem);

            if (window.timelineObserver) {
                window.timelineObserver.observe(timelineItem);
            }
        });

        container.classList.remove("switching");
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
        setTimeout(() => item.classList.remove("just-completed"), 600);
    } else {
        item.classList.remove("completed");
    }

    saveTodayTasks();
    updateProgress();

    const schedule = schedules[currentMode];
    const totalTasks = schedule.length;
    const completedCount = Object.values(todayTasks).filter(v => v).length;

    if (completedCount === totalTasks && totalTasks > 0) {
        setTimeout(() => showDayComplete(), 800);
    }
}

/**
 * Update progress display with cinematic animation
 * Also updates the floating progress widget
 */
function updateProgress() {
    const schedule = schedules[currentMode];
    const totalTasks = schedule.length;
    const completedCount = Object.keys(todayTasks).filter(key => 
        key.startsWith(currentMode + "_") && todayTasks[key]
    ).length;

    const percentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    // Update floating progress widget
    updateFloatingProgress(percentage, completedCount, totalTasks);

    // Update message with crossfade
    const messageEl = document.getElementById("progressMessage");
    if (messageEl) {
        const newMessage = getCompletionMessage(percentage);
        if (messageEl.textContent !== newMessage) {
            messageEl.classList.add("fade-out");
            setTimeout(() => {
                messageEl.textContent = newMessage;
                messageEl.classList.remove("fade-out");
                messageEl.classList.add("fade-in");
                setTimeout(() => messageEl.classList.remove("fade-in"), 400);
            }, 400);
        }
    }
}

/**
 * Update the floating progress widget in top-right corner
 */
function updateFloatingProgress(percentage, completed, total) {
    const ringFill = document.getElementById("fpRingFill");
    const percentEl = document.getElementById("fpPercent");
    const tasksEl = document.getElementById("fpTasks");
    const msgEl = document.getElementById("fpMsg");

    if (ringFill) {
        const circumference = 2 * Math.PI * 42;
        const offset = circumference - (percentage / 100) * circumference;
        ringFill.style.strokeDashoffset = offset;
    }

    if (percentEl) {
        percentEl.textContent = percentage + "%";
    }

    if (tasksEl) {
        tasksEl.textContent = `${completed} / ${total}`;
    }

    if (msgEl) {
        msgEl.textContent = getCompletionMessage(percentage);
    }
}

/**
 * Get motivational message based on progress
 */
function getCompletionMessage(percentage) {
    if (percentage === 0) return "Let's go";
    if (percentage < 30) return "Keep going";
    if (percentage < 50) return "Building momentum";
    if (percentage < 70) return "Doing great";
    if (percentage < 100) return "Almost there";
    return "Day complete! 🔥";
}

/**
 * Show day completion celebration
 */
function showDayComplete() {
    const celebration = document.getElementById("celebration");
    if (!celebration) return;

    celebration.classList.remove("hidden");
    celebrationEffect();

    setTimeout(() => {
        celebration.classList.add("hidden");
    }, 6000);
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
window.updateFloatingProgress = updateFloatingProgress;