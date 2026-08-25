/* ==========================================
   STUDYFLOW - FILE MANAGER MODULE
   Local file access using File API & IndexedDB
   ========================================== */

let savedFiles = [];

/**
 * Initialize file manager
 */
function initFileManager() {
    const fileInput = document.getElementById("fileInput");

    if (fileInput) {
        fileInput.addEventListener("change", handleFileSelect);
    }

    // Load previously saved files
    loadSavedFiles();
}

/**
 * Handle file selection
 */
async function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
        try {
            // Read file as ArrayBuffer for storage
            const arrayBuffer = await file.arrayBuffer();

            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                created: new Date().toISOString(),
                data: arrayBuffer
            };

            // Save to IndexedDB
            const id = await FileDB.saveFile(fileData);

            // Add to local tracking
            savedFiles.push({
                id: id,
                name: file.name,
                type: file.type,
                size: formatFileSize(file.size),
                created: fileData.created
            });

        } catch (error) {
            console.error("Error saving file:", error);
            alert(`Could not save "${file.name}". Storage may be full.`);
        }
    }

    // Save metadata to localStorage
    Storage.save(STORAGE_KEYS.FILES, savedFiles);

    // Render file list
    renderFileList();

    // Reset input
    e.target.value = "";
}

/**
 * Load saved files from IndexedDB on startup
 */
async function loadSavedFiles() {
    try {
        // First try to get metadata from localStorage
        const metaFiles = Storage.get(STORAGE_KEYS.FILES, []);

        // Then verify they exist in IndexedDB
        const dbFiles = await FileDB.getAllFiles();

        // Sync: keep only files that exist in both
        const dbIds = new Set(dbFiles.map(f => f.id));
        savedFiles = metaFiles.filter(f => dbIds.has(f.id));

        // If localStorage was empty but DB has files, rebuild metadata
        if (!savedFiles.length && dbFiles.length) {
            savedFiles = dbFiles.map(f => ({
                id: f.id,
                name: f.name,
                type: f.type,
                size: formatFileSize(f.size),
                created: f.created
            }));
            Storage.save(STORAGE_KEYS.FILES, savedFiles);
        }

        renderFileList();
    } catch (error) {
        console.error("Error loading files:", error);
    }
}

/**
 * Render file list in UI
 */
function renderFileList() {
    const fileList = document.getElementById("fileList");
    if (!fileList) return;

    fileList.innerHTML = "";

    if (!savedFiles.length) {
        fileList.innerHTML = `<p class="file-meta" style="text-align:center;padding:20px;">No files added yet.</p>`;
        return;
    }

    savedFiles.forEach(file => {
        const fileItem = document.createElement("div");
        fileItem.className = "file-item";

        const icon = getFileIcon(file.type, file.name);

        fileItem.innerHTML = `
            <div class="file-info">
                <span class="file-icon">${icon}</span>
                <div>
                    <div class="file-name">${escapeHtml(file.name)}</div>
                    <div class="file-meta">${file.size}</div>
                </div>
            </div>
            <div class="file-actions">
                <button class="file-btn file-btn-open" data-id="${file.id}">Open</button>
                <button class="file-btn file-btn-remove" data-id="${file.id}">Remove</button>
            </div>
        `;

        fileList.appendChild(fileItem);
    });

    // Add event listeners
    fileList.querySelectorAll(".file-btn-open").forEach(btn => {
        btn.addEventListener("click", (e) => openFile(parseInt(e.target.dataset.id)));
    });

    fileList.querySelectorAll(".file-btn-remove").forEach(btn => {
        btn.addEventListener("click", (e) => deleteFile(parseInt(e.target.dataset.id)));
    });
}

/**
 * Open a file using object URL
 */
async function openFile(id) {
    try {
        const fileData = await FileDB.getFile(id);
        if (!fileData || !fileData.data) {
            alert("File not found in storage.");
            return;
        }

        // Create blob from ArrayBuffer
        const blob = new Blob([fileData.data], { type: fileData.type || "application/octet-stream" });
        const url = URL.createObjectURL(blob);

        // Open in new tab
        window.open(url, "_blank");

        // Clean up object URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 60000);

    } catch (error) {
        console.error("Error opening file:", error);
        alert("Could not open file.");
    }
}

/**
 * Delete a file from storage
 */
async function deleteFile(id) {
    if (!confirm("Remove this file from the app?")) return;

    try {
        await FileDB.deleteFile(id);
        savedFiles = savedFiles.filter(f => f.id !== id);
        Storage.save(STORAGE_KEYS.FILES, savedFiles);
        renderFileList();
    } catch (error) {
        console.error("Error deleting file:", error);
    }
}

/**
 * Get appropriate icon for file type
 */
function getFileIcon(type, name) {
    if (type.includes("pdf") || name.endsWith(".pdf")) return "📄";
    if (type.includes("word") || name.endsWith(".doc") || name.endsWith(".docx")) return "📝";
    if (type.includes("text") || name.endsWith(".txt")) return "📃";
    return "📎";
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Expose
window.initFileManager = initFileManager;