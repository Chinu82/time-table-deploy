/* ==========================================
   STUDYFLOW - CHATBOT MODULE
   Left-side assistant with dynamic answers
   ========================================== */

const chatbotResponses = {
    greetings: ["hi", "hello", "hey", "yo", "sup", "good morning", "good afternoon", "good evening"],
    nameGoal: ["name", "goal", "ambition", "who am i", "about me", "my profile"],
    workMode: ["mode", "schedule mode", "work mode", "today mode", "wfo", "remote", "holiday"],
    completed: ["completed", "done", "finished", "what did i do", "progress so far", "checked off"],
    progress: ["progress", "percentage", "percent", "how much", "how am i doing"],
    schedule: ["schedule", "timetable", "timeline", "what next", "my plan", "today plan"],
    nextTask: ["next", "next task", "next up", "what should i do", "what now", "upcoming"],
    timeLeft: ["time left", "remaining", "how much time", "hours left", "time remaining"],
    subjects: ["subjects", "what subjects", "topics", "what am i studying", "syllabus"],
    streak: ["streak", "consistent", "days", "how many days", "my streak"],
    tips: ["tips", "study tips", "advice", "how to study", "strategy", "hack"],
    doubts: ["doubt", "doubts", "doubt session", "clearance", "when is doubt", "pyq"],
    time: ["time", "clock", "what time", "current time", "date", "today date"],
    motivation: ["motivate me", "motivation", "inspire", "quote", "feeling low", "tired", "burnout"],
    help: ["help", "what can you do", "commands", "options", "features"]
};

let chatbotOpen = false;

/**
 * Initialize chatbot
 */
function initChatbot() {
    const toggle = document.getElementById("chatbotToggle");
    const panel = document.getElementById("chatbotPanel");
    const closeBtn = document.getElementById("chatbotClose");
    const sendBtn = document.getElementById("chatbotSend");
    const input = document.getElementById("chatbotInput");
    const quickChips = document.querySelectorAll(".chatbot-chip");

    if (toggle) {
        toggle.addEventListener("click", () => toggleChatbot());
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => toggleChatbot(false));
    }

    if (sendBtn && input) {
        sendBtn.addEventListener("click", () => handleChatbotSend());
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handleChatbotSend();
        });
    }

    quickChips.forEach(chip => {
        chip.addEventListener("click", () => {
            const question = chip.dataset.question;
            if (question) {
                addChatMessage("user", question);
                const answer = generateAnswer(question);
                setTimeout(() => addChatMessage("bot", answer), 300);
            }
        });
    });

    // Add welcome message after login
    setTimeout(() => {
        const user = getCurrentUser();
        if (user && user.name) {
            addChatMessage("bot", `Hey ${user.name}! I'm your StudyFlow assistant. Ask me about your schedule, next task, progress, or anything else.`);
        }
    }, 1200);
}

/**
 * Toggle chatbot panel
 */
function toggleChatbot(forceState) {
    const panel = document.getElementById("chatbotPanel");
    const toggle = document.getElementById("chatbotToggle");
    if (!panel) return;

    chatbotOpen = forceState !== undefined ? forceState : !chatbotOpen;

    if (chatbotOpen) {
        panel.classList.add("open");
        if (toggle) toggle.classList.add("active");
        setTimeout(() => {
            const input = document.getElementById("chatbotInput");
            if (input) input.focus();
        }, 300);
    } else {
        panel.classList.remove("open");
        if (toggle) toggle.classList.remove("active");
    }
}

/**
 * Handle user message send
 */
function handleChatbotSend() {
    const input = document.getElementById("chatbotInput");
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    addChatMessage("user", text);
    input.value = "";

    const answer = generateAnswer(text);
    setTimeout(() => addChatMessage("bot", answer), 400 + Math.random() * 200);
}

/**
 * Add message to chat
 */
function addChatMessage(sender, text) {
    const messages = document.getElementById("chatbotMessages");
    if (!messages) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = `chatbot-msg ${sender}`;

    const bubble = document.createElement("div");
    bubble.className = "chatbot-bubble";
    bubble.innerHTML = text;

    msgDiv.appendChild(bubble);
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
}

/**
 * Generate dynamic answer based on question
 */
function generateAnswer(input) {
    const lower = input.toLowerCase();
    const user = getCurrentUser();
    const name = user?.name || "there";
    const goal = user?.goal || "not set yet";

    // Greetings
    if (matchesAny(lower, chatbotResponses.greetings)) {
        return `Hey ${name}! Ready to crush today's goals? Ask me about your next task, schedule, progress, or anything else.`;
    }

    // Name & Goal (still works via text, just removed chip)
    if (matchesAny(lower, chatbotResponses.nameGoal)) {
        return `You are <strong>${escapeHtml(name)}</strong>! Your ambition is: <em>"${escapeHtml(goal)}"</em>. Let's make it happen today! 💪`;
    }

    // Work Mode
    if (matchesAny(lower, chatbotResponses.workMode)) {
        const modeLabels = { WFO: "Work From Office", REMOTE: "Remote Work", HOLIDAY: "Holiday / Weekend" };
        const modeLabel = modeLabels[currentMode] || currentMode;
        const modeDesc = {
            WFO: "You're commuting today. Morning: Quant + English. Night: Reasoning + Vocab. Use commute for podcasts!",
            REMOTE: "You're working from home. Deep GK/GS in the morning, Quant at night. No commute = more sleep!",
            HOLIDAY: "It's your game-changer day! 8 hours study + 4 hours doubt clearance. Backlogs end today!"
        };
        return `Today's mode is <strong>${modeLabel}</strong>. ${modeDesc[currentMode] || ""}`;
    }

    // Completed tasks
    if (matchesAny(lower, chatbotResponses.completed)) {
        const schedule = schedules[currentMode] || [];
        const completedKeys = Object.keys(todayTasks).filter(k => k.startsWith(currentMode + "_") && todayTasks[k]);
        const completedCount = completedKeys.length;

        if (completedCount === 0) {
            return "You haven't checked off any tasks yet today. Let's get started! Tap a task in your timeline to mark it done.";
        }

        const completedTitles = completedKeys.map(key => {
            const idx = parseInt(key.split("_")[1]);
            return schedule[idx]?.title || "Unknown task";
        }).slice(0, 5);

        let msg = `You've completed <strong>${completedCount}</strong> task${completedCount > 1 ? "s" : ""} so far!`;
        if (completedTitles.length > 0) {
            msg += `<br><br>Latest done:<br>• ${completedTitles.join("<br>• ")}`;
        }
        if (completedCount > 5) {
            msg += `<br><em>...and ${completedCount - 5} more!</em>`;
        }
        return msg;
    }

    // Overall progress
    if (matchesAny(lower, chatbotResponses.progress)) {
        const schedule = schedules[currentMode] || [];
        const total = schedule.length;
        const completed = Object.keys(todayTasks).filter(k => k.startsWith(currentMode + "_") && todayTasks[k]).length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

        let msg = `You're at <strong>${pct}%</strong> today — <strong>${completed} / ${total}</strong> tasks done.`;
        if (pct === 0) msg += " Time to start! 🚀";
        else if (pct < 30) msg += " Keep pushing! 💪";
        else if (pct < 60) msg += " Building momentum! 🔥";
        else if (pct < 100) msg += " Almost there! ⚡";
        else msg += " DAY COMPLETE! You're incredible! 🎉";
        return msg;
    }

    // Schedule / What's next
    if (matchesAny(lower, chatbotResponses.schedule)) {
        const schedule = schedules[currentMode] || [];
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        let nextTask = null;
        let nextIndex = -1;

        for (let i = 0; i < schedule.length; i++) {
            const [h, m] = schedule[i].time.split(":").map(Number);
            const taskMinutes = h * 60 + m;
            if (taskMinutes > currentMinutes && !todayTasks[`${currentMode}_${i}`]) {
                nextTask = schedule[i];
                nextIndex = i;
                break;
            }
        }

        if (nextTask) {
            const timeFormatted = formatTime(nextTask.time);
            return `Your next task is at <strong>${timeFormatted}</strong>:<br><em>${escapeHtml(nextTask.title)}</em> (${nextTask.category})<br><br>Go get it! 🎯`;
        } else {
            const remaining = schedule.filter((_, i) => !todayTasks[`${currentMode}_${i}`]).length;
            if (remaining === 0) return "All tasks done for today! You crushed it! 🏆";
            return "No upcoming tasks by time — but you still have unchecked items. Scroll your timeline!";
        }
    }

    // NEXT TASK (concise version)
    if (matchesAny(lower, chatbotResponses.nextTask)) {
        const schedule = schedules[currentMode] || [];
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        for (let i = 0; i < schedule.length; i++) {
            const [h, m] = schedule[i].time.split(":").map(Number);
            const taskMinutes = h * 60 + m;
            if (taskMinutes > currentMinutes && !todayTasks[`${currentMode}_${i}`]) {
                const timeFormatted = formatTime(schedule[i].time);
                const minsAway = taskMinutes - currentMinutes;
                const hoursAway = Math.floor(minsAway / 60);
                const remMins = minsAway % 60;
                let timeText = "";
                if (hoursAway > 0) timeText = `${hoursAway}h ${remMins}m`;
                else timeText = `${remMins}m`;
                return `🎯 <strong>${timeFormatted}</strong> — ${escapeHtml(schedule[i].title)}<br><em>(${schedule[i].category}) — starts in ${timeText}</em>`;
            }
        }
        return "No more upcoming tasks today! Either you're done or check your timeline. 🏁";
    }

    // TIME LEFT
    if (matchesAny(lower, chatbotResponses.timeLeft)) {
        const schedule = schedules[currentMode] || [];
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        let remainingStudyMins = 0;
        schedule.forEach((item, i) => {
            if (!todayTasks[`${currentMode}_${i}`]) {
                const [h, m] = item.time.split(":").map(Number);
                const taskMinutes = h * 60 + m;
                if (taskMinutes > currentMinutes) {
                    // Estimate 60 mins per study slot, 30 for breaks, 30 for routine
                    const cat = item.category;
                    if (["english", "quant", "reasoning", "gkgs", "study", "doubt"].includes(cat)) {
                        remainingStudyMins += 75;
                    } else if (["break", "routine", "commute"].includes(cat)) {
                        remainingStudyMins += 30;
                    } else {
                        remainingStudyMins += 60;
                    }
                }
            }
        });

        const remHours = Math.floor(remainingStudyMins / 60);
        const remMins = remainingStudyMins % 60;

        if (remainingStudyMins === 0) return "Nothing left on your schedule! You either finished or it's past your last task. 🎉";
        return `You have approximately <strong>${remHours}h ${remMins}m</strong> of scheduled time remaining today.<br><br>Focus on what's next and don't rush quality! ⚡`;
    }

    // SUBJECTS TODAY
    if (matchesAny(lower, chatbotResponses.subjects)) {
        const schedule = schedules[currentMode] || [];
        const subjectCounts = {};
        schedule.forEach(item => {
            const cat = item.category;
            const label = {
                english: "English", quant: "Quant / Aptitude", reasoning: "Reasoning",
                gkgs: "GK / GS", doubt: "Doubt Clearance", study: "Study",
                work: "Work Hours", break: "Breaks", routine: "Routine", commute: "Commute"
            }[cat] || cat;
            subjectCounts[label] = (subjectCounts[label] || 0) + 1;
        });

        let msg = "Today's subject breakdown:<br><br>";
        Object.entries(subjectCounts).forEach(([subj, count]) => {
            msg += `• <strong>${subj}</strong>: ${count} slot${count > 1 ? "s" : ""}<br>`;
        });
        return msg;
    }

    // STREAK
    if (matchesAny(lower, chatbotResponses.streak)) {
        const allTasks = Storage.get(STORAGE_KEYS.TASKS, {});
        const dates = Object.keys(allTasks).sort();
        let streak = 0;
        const today = getTodayKey();

        // Count backwards from today
        for (let i = dates.length - 1; i >= 0; i--) {
            const dateKey = dates[i];
            const dayTasks = allTasks[dateKey] || {};
            const completed = Object.values(dayTasks).filter(v => v).length;
            const total = Object.values(dayTasks).length;
            const pct = total > 0 ? (completed / total) : 0;

            if (pct >= 0.5) {
                streak++;
            } else if (dateKey !== today) {
                break;
            }
        }

        if (streak === 0) {
            return "No active streak yet. Complete at least 50% of today's tasks to start one! 🔥";
        } else if (streak === 1) {
            return "You're on a <strong>1-day streak</strong>! Complete today to make it 2. Keep going! 💪";
        } else {
            return `You're on a <strong>${streak}-day streak</strong>! Consistency is the key to cracking this exam. Don't break the chain! 🔥🔥`;
        }
    }

    // STUDY TIPS
    if (matchesAny(lower, chatbotResponses.tips)) {
        const tips = {
            WFO: [
                "Use your commute for audio revision — GK podcasts and current affairs work great!",
                "Since time is tight on WFO days, focus on quality over quantity. 10 focused MCQs > 50 distracted ones.",
                "Prep your bag and clothes the night before. Saves 10 mins = 10 extra quant problems!"
            ],
            REMOTE: [
                "Use the saved commute time for an extra 30-min GK/GS deep dive. That's 2.5 hours extra per week!",
                "Take a 5-min eye break every 45 mins. It actually improves retention.",
                "Keep a 'doubt notebook' open during work. Jot questions as they come — clear them on holiday."
            ],
            HOLIDAY: [
                "Start with your weakest subject when your brain is freshest (morning).",
                "During doubt sessions, don't just watch solutions — pause and solve yourself first.",
                "After every 2-hour block, do a 5-min rapid revision of what you just studied. Spaced repetition wins!"
            ]
        };
        const modeTips = tips[currentMode] || tips.REMOTE;
        const tip = modeTips[Math.floor(Math.random() * modeTips.length)];
        return `💡 <strong>Tip for ${currentMode} day:</strong><br><br>${tip}`;
    }

    // DOUBT SESSION
    if (matchesAny(lower, chatbotResponses.doubts)) {
        if (currentMode === "HOLIDAY") {
            return `🧐 <strong>Doubt Sessions today:</strong><br><br>
            • <strong>Doubt 1:</strong> 12:45 PM — 2:45 PM<br>&nbsp;&nbsp;Mock test mistake analysis + solution videos<br><br>
            • <strong>Doubt 2:</strong> 4:45 PM — 6:45 PM<br>&nbsp;&nbsp;50 PYQs of GK & Quant with reasoning<br><br>
            Total doubt clearance: <strong>4 hours</strong>. Use it wisely!`;
        } else {
            return `Doubt sessions are only scheduled on <strong>Holiday/Weekend</strong> mode (4 hours total).<br><br>For ${currentMode} days, jot doubts in a notebook and hit them on your next holiday! 📝`;
        }
    }

    // Time / Date
    if (matchesAny(lower, chatbotResponses.time)) {
        const now = new Date();
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `It's <strong>${hours}:${minutes} ${ampm}</strong> on <strong>${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}</strong>.`;
    }

    // Motivation
    if (matchesAny(lower, chatbotResponses.motivation)) {
        const quotes = [
            "Success is the sum of small efforts, repeated day in and day out. — Robert Collier",
            "The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt",
            "Don't watch the clock; do what it does. Keep going. — Sam Levenson",
            "Your time is limited, don't waste it living someone else's life. — Steve Jobs",
            "The only way to do great work is to love what you do. — Steve Jobs",
            "Discipline is doing what needs to be done, even if you don't want to do it.",
            "Every expert was once a beginner. Every pro was once an amateur.",
            "One year from now, you'll wish you started today."
        ];
        const q = quotes[Math.floor(Math.random() * quotes.length)];
        return `Here's something for you, ${name}:<br><br><em>"${q}"</em><br><br>You've got this! 🔥`;
    }

    // Help
    if (matchesAny(lower, chatbotResponses.help)) {
        return `Here's what I can tell you:<br><br>
        • <strong>🎯 Next task</strong> — "What's next?"<br>
        • <strong>📅 Work mode</strong> — "What mode am I in?"<br>
        • <strong>✅ Completed</strong> — "What have I done?"<br>
        • <strong>📊 Progress</strong> — "How much progress?"<br>
        • <strong>⏰ Time left</strong> — "How much time remaining?"<br>
        • <strong>📚 Subjects</strong> — "What subjects today?"<br>
        • <strong>🔥 Streak</strong> — "What's my streak?"<br>
        • <strong>💡 Tips</strong> — "Give me a tip"<br>
        • <strong>🧐 Doubts</strong> — "When is doubt session?"<br>
        • <strong>🔥 Motivation</strong> — "Motivate me"<br><br>
        Or just tap the quick buttons below! 👇`;
    }

    // Fallback
    return `I'm not sure about that, ${name}. Try asking about your <strong>next task, schedule, progress, streak,</strong> or <strong>study tips</strong>. Or type "help" to see what I can do!`;
}

/**
 * Check if input matches any keyword in array
 */
function matchesAny(input, keywords) {
    return keywords.some(k => input.includes(k));
}

// Expose
window.initChatbot = initChatbot;
window.toggleChatbot = toggleChatbot;