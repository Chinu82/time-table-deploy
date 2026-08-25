StudyFlow
A cinematic, interactive, frontend-only personal Study Timetable and Productivity Web Application. Built with pure HTML5, CSS3, and Vanilla JavaScript — no frameworks, no backend, no external dependencies.
Features
Cinematic Login Experience — Glassmorphism login card with animated gradient background, floating particles, and smooth transitions
Returning User Detection — Automatically welcomes back existing users via localStorage
Live Clock & Date — Real-time animated clock with pulsing seconds
Three Schedule Modes — WFO (Work From Office), Remote, and Holiday timetables
Interactive Task Completion — Click tasks to mark complete with animated checkmarks, glow effects, and strikethrough
Dynamic Progress Tracking — Animated circular progress ring and linear progress bar with motivational messages
Day Completion Celebration — Premium confetti and particle celebration when all tasks are done
Test Books Section — Curated study cards with 3D tilt hover effects
Local File Access — Add PDF, DOC, DOCX, and TXT files directly from your device (stored in IndexedDB)
Study Streak System — Tracks consecutive days of app usage
Profile Dashboard — Displays name, goal, streak, tasks completed, and average completion rate
Cinematic Scroll Animations — IntersectionObserver-powered fade, scale, blur, and slide reveals
Morphing Scroll Section — Scroll-driven text transformation (FOCUS → PLAN → EXECUTE → COMPLETE)
3D Card Tilt — Subtle mouse-tracking perspective effect on cards (desktop only)
Fully Responsive — Optimized for desktop, laptop, tablet, and mobile
Accessibility — Semantic HTML, ARIA labels, keyboard navigation, focus states, and reduced-motion support
Project Structure
plain
study-timetable/
│
├── index.html # Main application (SPA)
├── timetable.html # Redirects to index.html#timetable
│
├── css/
│ ├── style.css # Main styles, variables, layout, components
│ ├── animations.css # Keyframes, scroll reveals, transitions
│ └── responsive.css # Media queries, mobile layout, touch support
│
├── js/
│ ├── app.js # Main app init, clock, navigation, streak, profile
│ ├── login.js # Login flow, returning user, welcome UI
│ ├── timetable.js # Schedule data, timeline rendering, task completion
│ ├── storage.js # localStorage & IndexedDB wrappers
│ ├── animations.js # Particles, scroll effects, 3D tilt, morphing, celebration
│ └── fileManager.js # File input, IndexedDB storage, file list UI
│
├── assets/
│ ├── images/
│ ├── icons/
│ └── fonts/
│
└── README.md
How to Run Locally
Download or extract the project folder.
Open in VS Code (or any code editor).
Launch with Live Server:
Install the "Live Server" extension in VS Code.
Right-click on index.html → "Open with Live Server".
Or use any local static server (e.g., npx serve, python -m http.server).
Open in browser at http://127.0.0.1:5500 (or the port shown).
Do NOT open index.html directly via file:// protocol — some browser APIs (like IndexedDB) work best over http://localhost.
How to Customize Schedules
Open js/timetable.js and edit the schedules object:
JavaScript
const schedules = {
WFO: [
{ time: "06:00", title: "Wake Up", category: "routine" },
// Add, remove, or modify items here
],
REMOTE: [
{ time: "08:00", title: "Your Custom Task", category: "study" },
],
HOLIDAY: [
{ time: "09:00", title: "Deep Work", category: "coding" },
]
};
Categories can be any string — they are displayed as tags. Times use 24-hour format ("HH:MM").
Important JavaScript Modules
storage.js
Centralized storage management:
Storage.save(key, data) / Storage.get(key, default) — localStorage wrapper with JSON serialization
FileDB.saveFile(), FileDB.getAllFiles(), FileDB.deleteFile(id) — IndexedDB operations for file storage
STORAGE_KEYS — constants for all localStorage keys
timetable.js
Core timetable logic:
schedules — editable schedule data for all three modes
renderTimetable(mode) — dynamically builds the timeline DOM
toggleTask(taskId) — handles completion state with animations
updateProgress() — calculates percentage and updates ring/bar
animations.js
Visual effects engine:
initParticles() — canvas-based floating particle network
initScrollAnimations() — IntersectionObserver for reveal classes
init3DTilt() — mouse-driven CSS 3D transforms
initMorphingSection() — scroll-progress text morphing
celebrationEffect() — confetti particle burst
app.js
Application orchestration:
initClock() — live updating clock with second pulse
initNavigation() — smooth scroll, mobile hamburger, active link tracking
initModeSelector() — animated pill indicator for WFO/Remote/Holiday
updateStreak() — streak calculation with consecutive day logic
Data Persistence
localStorage
Used for small structured data:
User profile (name, email, goal)
Daily task completion state
Streak statistics
File metadata
IndexedDB
Used for larger binary data:
Uploaded test book files (PDF, DOC, DOCX, TXT)
Stores full file content as ArrayBuffer
Metadata (name, type, size, date) is mirrored in localStorage for fast listing
Storage Keys
JavaScript
STORAGE_KEYS = {
USER: "studyflow_user",
TASKS: "studyflow_tasks",
STREAK: "studyflow_streak",
SETTINGS:"studyflow_settings",
FILES: "studyflow_files_meta"
};
Browser Limitations (Honest Disclosure)
This is a frontend-only personal productivity app. Please be aware of the following limitations:
No Server-Side Authentication — User data is stored in localStorage, which is not secure for sensitive information. Anyone with physical access to your browser can view this data.
localStorage is Not Secure — Do not store passwords, financial data, or other sensitive information.
Local Files Cannot Be Accessed by Path — Browsers intentionally restrict direct filesystem access for security. When you select a file, the browser provides a temporary File object. The app cannot reopen that file automatically after you close and reopen the browser unless the file content is stored in IndexedDB (which this app does).
File System Access API — Modern browsers may support the File System Access API for persistent file handles, but this requires explicit user permission per file and is not universally supported.
IndexedDB Storage Limits — Browser-dependent (typically 50MB+). Very large files may fail to store.
Clearing Browser Data — If you clear cookies/site data, all application data (tasks, streak, files) will be deleted.
Cross-Browser Differences — Some animations and effects may vary slightly between browsers. Best experienced in Chrome, Edge, Firefox, or Safari (latest versions).
Design System
Colors and styles are controlled via CSS variables in css/style.css:
css
:root {
--bg-primary: #050816;
--bg-secondary: #0b1024;
--accent: #6c63ff;
--accent-light: #8f88ff;
--text-primary: #ffffff;
--text-secondary: #a8b0c5;
--glass-bg: rgba(255, 255, 255, 0.06);
--glass-border: rgba(255, 255, 255, 0.12);
--radius: 20px;
}
Modify these variables to change the entire app's appearance.
Accessibility
Semantic HTML5 elements (<nav>, <main>, <section>, <article>)
ARIA labels and roles for interactive components
Keyboard-navigable buttons and links
Visible focus states
prefers-reduced-motion media query disables animations for users who need it
Sufficient color contrast ratios
License
This project is provided as-is for personal productivity use. No external dependencies or frameworks required.
Built for focus. No data leaves your device.
