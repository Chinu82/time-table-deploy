/* ==========================================
   STUDYFLOW - STORAGE MODULE
   Handles localStorage and IndexedDB operations
   ========================================== */

const STORAGE_KEYS = {
    USER: "studyflow_user",
    TASKS: "studyflow_tasks",
    STREAK: "studyflow_streak",
    SETTINGS: "studyflow_settings",
    FILES: "studyflow_files_meta"
};

const DB_NAME = "StudyFlowDB";
const DB_VERSION = 1;
const FILE_STORE = "files";

let db = null;

/**
 * Initialize IndexedDB for file storage
 */
function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            if (!database.objectStoreNames.contains(FILE_STORE)) {
                const store = database.createObjectStore(FILE_STORE, { keyPath: "id", autoIncrement: true });
                store.createIndex("name", "name", { unique: false });
                store.createIndex("created", "created", { unique: false });
            }
        };
    });
}

/**
 * localStorage wrapper with error handling
 */
const Storage = {
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error("Storage save error:", e);
            return false;
        }
    },

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error("Storage get error:", e);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error("Storage remove error:", e);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error("Storage clear error:", e);
            return false;
        }
    }
};

/**
 * IndexedDB file operations
 */
const FileDB = {
    async saveFile(fileData) {
        if (!db) await initIndexedDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([FILE_STORE], "readwrite");
            const store = tx.objectStore(FILE_STORE);
            const request = store.add(fileData);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async getAllFiles() {
        if (!db) await initIndexedDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([FILE_STORE], "readonly");
            const store = tx.objectStore(FILE_STORE);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async deleteFile(id) {
        if (!db) await initIndexedDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([FILE_STORE], "readwrite");
            const store = tx.objectStore(FILE_STORE);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async getFile(id) {
        if (!db) await initIndexedDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([FILE_STORE], "readonly");
            const store = tx.objectStore(FILE_STORE);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
};

// Expose to global scope
window.STORAGE_KEYS = STORAGE_KEYS;
window.Storage = Storage;
window.FileDB = FileDB;
window.initIndexedDB = initIndexedDB;