/* ==========================================
   STUDYFLOW - TIMETABLE MODULE
   ========================================== */

const DAY_RESET_HOUR = 4;
const TIME_REFRESH_INTERVAL = 30 * 1000;

const schedules = {
  REMOTE: [
    { time: "08:30", title: "🌅 Wake Up & Freshen Up", category: "routine" },
    { time: "09:00", title: "🍳 Breakfast", category: "routine" },
    { time: "09:30", title: "💡 Light Revision — English Vocab / GK / Current Affairs", category: "english" },
    { time: "10:15", title: "🧘 Short Break & Get Ready for Work", category: "routine" },
    { time: "11:00", title: "💼 Work Start", category: "work" },
    { time: "13:00", title: "🍱 Lunch Break", category: "routine" },
    { time: "20:00", title: "💼 Work End", category: "work" },
    { time: "20:15", title: "🍽️ Dinner & Relax", category: "routine" },
    { time: "20:45", title: "📘 Session 1 — Reasoning (Puzzles / Syllogism / Direction)", category: "reasoning" },
    { time: "22:00", title: "☕ Short Break", category: "break" },
    { time: "22:15", title: "📗 Session 2 — English Grammar / Cloze Test / Vocab", category: "english" },
    { time: "23:30", title: "☕ Short Break", category: "break" },
    { time: "23:45", title: "📙 Session 3 — Quant (Arithmetic / Algebra / DI)", category: "quant" },
    { time: "00:45", title: "🌙 Wind Down — Light Revision / Plan Tomorrow", category: "routine" },
    { time: "01:00", title: "💤 Sleep", category: "routine" }
  ],
  WFO: [
    { time: "08:30", title: "🌅 Wake Up & Freshen Up", category: "routine" },
    { time: "09:00", title: "🍳 Breakfast", category: "routine" },
    { time: "09:30", title: "💡 Quick Revision — GK / Current Affairs / Flashcards", category: "gkgs" },
    { time: "10:00", title: "👔 Get Ready for Office", category: "routine" },
    { time: "10:30", title: "🚗 Commute to Office", category: "commute" },
    { time: "11:00", title: "💼 Work Start", category: "work" },
    { time: "20:00", title: "💼 Work End", category: "work" },
    { time: "20:15", title: "🚗 Commute Back — Audio Notes / Relax", category: "commute" },
    { time: "21:00", title: "🍽️ Dinner & Freshen Up", category: "routine" },
    { time: "21:30", title: "📘 Session 1 — Reasoning (Non-Verbal / Missing Numbers / Puzzles)", category: "reasoning" },
    { time: "22:45", title: "☕ Short Break", category: "break" },
    { time: "23:00", title: "📗 Session 2 — English (Grammar / Para Jumbles / Sentence Correction)", category: "english" },
    { time: "00:15", title: "☕ Short Break", category: "break" },
    { time: "00:30", title: "📙 Session 3 — Quant (Arithmetic / Algebra / Trigonometry)", category: "quant" },
    { time: "01:30", title: "🌙 Wind Down — Plan Tomorrow", category: "routine" },
    { time: "01:45", title: "💤 Sleep", category: "routine" }
  ],
  HOLIDAY: [
    { time: "08:30", title: "🌅 Wake Up & Freshen Up", category: "routine" },
    { time: "09:00", title: "🍳 Breakfast", category: "routine" },
    { time: "09:30", title: "📘 Session 1 — Reasoning (High-Level Puzzles / Input-Output)", category: "reasoning" },
    { time: "10:45", title: "☕ Short Break", category: "break" },
    { time: "11:00", title: "📗 Session 2 — English (RC Passage / Grammar / Vocab)", category: "english" },
    { time: "12:15", title: "☕ Short Break", category: "break" },
    { time: "12:30", title: "📙 Session 3 — Quant (Arithmetic / Algebra)", category: "quant" },
    { time: "13:45", title: "🍱 Lunch & Relax", category: "routine" },
    { time: "14:30", title: "😌 Rest / Personal Time", category: "routine" },
    { time: "15:30", title: "📕 Session 4 — GK/GS (History / Geography / Polity / Science)", category: "gkgs" },
    { time: "16:45", title: "☕ Short Break", category: "break" },
    { time: "17:00", title: "🧐 Mock Test / PYQ / Doubt Analysis", category: "doubt" },
    { time: "18:15", title: "🚶 Evening Walk / Relax", category: "routine" },
    { time: "19:00", title: "🍽️ Dinner", category: "routine" },
    { time: "19:45", title: "📗 Session 5 — English (Spelling / Fillers / Revision)", category: "english" },
    { time: "21:00", title: "☕ Short Break", category: "break" },
    { time: "21:15", title: "📘 Session 6 — Reasoning (Puzzles / Data Sufficiency)", category: "reasoning" },
    { time: "22:30", title: "☕ Short Break", category: "break" },
    { time: "22:45", title: "📙 Session 7 — Quant (DI / Miscellaneous / Weak Topics)", category: "quant" },
    { time: "00:00", title: "🌙 Wind Down — Light Revision / Plan Tomorrow", category: "routine" },
    { time: "00:30", title: "💤 Sleep", category: "routine" }
  ]
};

let currentMode = "REMOTE";
let todayTasks = {};
let timetableRefreshTimer = null;

/* ==========================================
   INIT
   ========================================== */

function initTimetable() {
  loadTodayTasks();
  renderTimetable(currentMode);
  startTimetableClock();
}

function getStudyDate() {
  const now = new Date();
  const studyDate = new Date(now);
  if (now.getHours() < DAY_RESET_HOUR) {
    studyDate.setDate(studyDate.getDate() - 1);
  }
  return studyDate;
}

function getTodayKey() {
  const d = getStudyDate();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadTodayTasks() {
  const todayKey = getTodayKey();
  const allTasks = Storage.get(STORAGE_KEYS.TASKS, {});
  todayTasks = allTasks[todayKey] || {};
}

function saveTodayTasks() {
  const todayKey = getTodayKey();
  const allTasks = Storage.get(STORAGE_KEYS.TASKS, {});
  allTasks[todayKey] = todayTasks;
  Storage.save(STORAGE_KEYS.TASKS, allTasks);
}

/* ==========================================
   TIME HELPERS
   ========================================== */

function getCurrentStudyMinutes() {
  const now = new Date();
  let minutes = now.getHours() * 60 + now.getMinutes();
  if (now.getHours() < DAY_RESET_HOUR) {
    minutes += 24 * 60;
  }
  return minutes;
}

function getTaskStudyMinutes(time24) {
  const [hours, minutes] = time24.split(":").map(Number);
  let totalMinutes = hours * 60 + minutes;
  if (hours < DAY_RESET_HOUR) {
    totalMinutes += 24 * 60;
  }
  return totalMinutes;
}

function canCompleteTask(taskTime) {
  return getCurrentStudyMinutes() >= getTaskStudyMinutes(taskTime);
}

function getMinutesUntilTask(taskTime) {
  return Math.max(getTaskStudyMinutes(taskTime) - getCurrentStudyMinutes(), 0);
}

function formatWaitTime(minutes) {
  if (minutes <= 0) return "";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

/* ==========================================
   RENDER
   ========================================== */

function renderTimetable(mode) {
  const container = document.getElementById("timelineContainer");
  if (!container) return;

  currentMode = mode;
  const schedule = schedules[mode] || schedules.REMOTE;
  container.innerHTML = "";

  schedule.forEach((item, index) => {
    const taskId = `${mode}_${index}`;
    const isCompleted = todayTasks[taskId] === true;
    const isAvailable = canCompleteTask(item.time);
    const minutesUntil = getMinutesUntilTask(item.time);

    const timelineItem = document.createElement("div");
    timelineItem.className = [
      "timeline-item",
      isCompleted ? "completed" : "",
      !isAvailable ? "locked" : ""
    ].filter(Boolean).join(" ");
    timelineItem.dataset.taskId = taskId;
    timelineItem.dataset.taskTime = item.time;
    timelineItem.dataset.available = String(isAvailable);

    const timeFormatted = formatTime(item.time);

    let statusHtml = "";
    if (isCompleted) {
      statusHtml = `<div class="timeline-status completed-status">✓ Completed</div>`;
    } else if (!isAvailable) {
      statusHtml = `
        <div class="timeline-status locked-status">
          🔒 Available at ${timeFormatted}
          <span class="unlock-countdown">(${formatWaitTime(minutesUntil)})</span>
        </div>
      `;
    } else {
      statusHtml = `<div class="timeline-status available-status">✓ Available now</div>`;
    }

    timelineItem.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-card glass-card">
        <div class="timeline-time">${timeFormatted}</div>
        <h4 class="timeline-title">${escapeHtml(item.title)}</h4>
        <span class="timeline-category">${escapeHtml(item.category)}</span>
        ${statusHtml}
        <div class="timeline-check">
          ${!isAvailable && !isCompleted
            ? `<span class="task-lock-icon">🔒</span>`
            : `<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>`
          }
        </div>
      </div>
    `;

    timelineItem.addEventListener("click", () => toggleTask(taskId));
    container.appendChild(timelineItem);

    if (window.timelineObserver) {
      window.timelineObserver.observe(timelineItem);
    }
  });

  updateProgress();
  if (typeof init3DTilt === "function") init3DTilt();
}

/* ==========================================
   UPDATE PROGRESS  (ONLY ONE — correct IDs)
   ========================================== */

function updateProgress() {
  const schedule = schedules[currentMode];
  if (!schedule) return;

  const totalTasks = schedule.length;
  const completedCount = Object.keys(todayTasks)
    .filter(key => key.startsWith(currentMode + "_") && todayTasks[key] === true)
    .length;

  const percentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const ringFill = document.getElementById("fpRingFill");
  const percentEl = document.getElementById("fpPercent");
  const tasksEl  = document.getElementById("fpTasks");
  const msgEl    = document.getElementById("fpMsg");

  if (ringFill) {
    const offset = 264 - (264 * percentage) / 100;
    ringFill.style.strokeDashoffset = offset;
  }

  if (percentEl) percentEl.textContent = `${percentage}%`;
  if (tasksEl)   tasksEl.textContent   = `${completedCount} / ${totalTasks}`;

  if (msgEl) {
    if (totalTasks === 0)       msgEl.textContent = "Let's go";
    else if (percentage === 0)  msgEl.textContent = "Start strong";
    else if (percentage < 50)   msgEl.textContent = "Keep going";
    else if (percentage < 100)  msgEl.textContent = "Almost there";
    else                        msgEl.textContent = "All done! 🔥";
  }
}

/* ==========================================
   TOGGLE TASK
   ========================================== */

function toggleTask(taskId) {
  const schedule = schedules[currentMode];
  if (!schedule) return;

  const lastUnderscore = taskId.lastIndexOf("_");
  const taskIndex = Number(taskId.substring(lastUnderscore + 1));
  const task = schedule[taskIndex];
  if (!task) return;

  const item = document.querySelector(`[data-task-id="${taskId}"]`);
  if (!item) return;

  if (!canCompleteTask(task.time)) {
    showTaskLockedMessage(task);
    item.classList.add("locked-click");
    setTimeout(() => item.classList.remove("locked-click"), 500);
    return;
  }

  const isCompleted = todayTasks[taskId] === true;
  const newCompleted = !isCompleted;
  todayTasks[taskId] = newCompleted;

  if (newCompleted) {
    item.classList.add("completed", "just-completed");
    setTimeout(() => item.classList.remove("just-completed"), 600);
  } else {
    item.classList.remove("completed");
  }

  const statusEl = item.querySelector(".timeline-status");
  if (statusEl) {
    if (newCompleted) {
      statusEl.className = "timeline-status completed-status";
      statusEl.innerHTML = "✓ Completed";
    } else {
      statusEl.className = "timeline-status available-status";
      statusEl.innerHTML = "✓ Available now";
    }
  }

  const checkEl = item.querySelector(".timeline-check");
  if (checkEl) {
    checkEl.innerHTML = `<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>`;
  }

  saveTodayTasks();
  updateProgress();

  const totalTasks = schedule.length;
  const completedCount = Object.keys(todayTasks)
    .filter(key => key.startsWith(currentMode + "_") && todayTasks[key] === true)
    .length;

  if (completedCount === totalTasks && totalTasks > 0) {
    setTimeout(showDayComplete, 800);
  }
}

/* ==========================================
   LOCKED MESSAGE
   ========================================== */

function showTaskLockedMessage(task) {
  const formattedTime = formatTime(task.time);
  const minutes = getMinutesUntilTask(task.time);
  const waitTime = formatWaitTime(minutes);
  const msg = `🔒 Available at ${formattedTime}${waitTime ? ` — ${waitTime} remaining` : ""}`;

  if (typeof showToast === "function") {
    showToast(msg);
  } else {
    const toast = document.createElement("div");
    toast.style.cssText = `
      position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.8); color: #fff; padding: 12px 24px;
      border-radius: 8px; font-size: 0.95rem; z-index: 9999;
      backdrop-filter: blur(8px); border: 1px solid var(--glass-border);
      transition: opacity 0.3s ease; font-family: var(--font-main);
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

/* ==========================================
   DAY COMPLETE
   ========================================== */

function showDayComplete() {
  const celebration = document.getElementById("celebration");
  if (!celebration) return;
  celebration.classList.remove("hidden");
  if (typeof celebrationEffect === "function") celebrationEffect();
  setTimeout(() => celebration.classList.add("hidden"), 6000);
}

/* ==========================================
   AUTO REFRESH
   ========================================== */

function startTimetableClock() {
  if (timetableRefreshTimer) clearInterval(timetableRefreshTimer);
  timetableRefreshTimer = setInterval(refreshTaskAvailability, TIME_REFRESH_INTERVAL);
}

function refreshTaskAvailability() {
  const schedule = schedules[currentMode];
  if (!schedule) return;

  let needsRender = false;
  schedule.forEach((task, index) => {
    const taskId = `${currentMode}_${index}`;
    const element = document.querySelector(`[data-task-id="${taskId}"]`);
    if (!element) return;
    const oldAvailable = element.dataset.available === "true";
    const newAvailable = canCompleteTask(task.time);
    if (oldAvailable !== newAvailable) needsRender = true;
  });

  if (needsRender) renderTimetable(currentMode);
}

/* ==========================================
   MODE CHANGE
   ========================================== */

function changeTimetableMode(mode) {
  if (!schedules[mode]) {
    console.warn(`Unknown timetable mode: ${mode}`);
    return;
  }
  currentMode = mode;
  renderTimetable(currentMode);
}

/* ==========================================
   UTILITIES
   ========================================== */

function formatTime(time24) {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function destroyTimetableClock() {
  if (timetableRefreshTimer) {
    clearInterval(timetableRefreshTimer);
    timetableRefreshTimer = null;
  }
}

/* ==========================================
   GLOBAL EXPOSURE
   ========================================== */

window.initTimetable = initTimetable;
window.renderTimetable = renderTimetable;
window.toggleTask = toggleTask;
window.updateProgress = updateProgress;
window.schedules = schedules;
window.changeTimetableMode = changeTimetableMode;
window.canCompleteTask = canCompleteTask;
window.refreshTaskAvailability = refreshTaskAvailability;
window.destroyTimetableClock = destroyTimetableClock;