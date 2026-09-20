import { FeedbackComment } from '../types';

const DB_NAME = 'debzane_teleprompter_db';
const DB_VERSION = 1;
const STORE_NAME = 'creator_reviews';
const LOCAL_STORAGE_KEY = 'debzane_persistent_reviews_backup';

export const INITIAL_COMMUNITY_REVIEWS: FeedbackComment[] = [
  {
    id: 'rev_init_1',
    userName: 'Chukwuma David',
    rating: 5,
    message: 'Debzane Concept Teleprompter is a lifesaver for our YouTube studio recordings in Lagos! Smooth scrolling and 100% free with no annoying paywalls.',
    date: '2026-03-12',
    country: '🇳🇬 Nigeria'
  },
  {
    id: 'rev_init_2',
    userName: 'Elena Rostova',
    rating: 5,
    message: 'The beam splitter mirror mode works seamlessly with my iPad prompter rig. Excellent developer work by Sylvester and JV Impact Initiative!',
    date: '2026-04-05',
    country: '🇬🇧 UK'
  },
  {
    id: 'rev_init_3',
    userName: 'Marcus Vance',
    rating: 5,
    message: 'Bluetooth clicker/pedal support works straight away out of the box with my mini controller. Beautiful dark UI and crisp scrolling.',
    date: '2026-06-18',
    country: '🇺🇸 USA'
  },
  {
    id: 'rev_init_4',
    userName: 'Amina Bello',
    rating: 5,
    message: 'The dual split studio reaction feature and custom news ticker is broadcast standard. Amazing job!',
    date: '2026-08-20',
    country: '🇳🇬 Nigeria'
  }
];

/**
 * Requests the browser to mark storage as PERSISTENT (non-evictable).
 * Chrome, Safari, Firefox, Edge and Android WebView will never auto-delete this data.
 */
export async function enableBrowserPersistence(): Promise<boolean> {
  if (typeof window !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      console.log('Browser persistent storage mode granted:', isPersisted);
      return isPersisted;
    } catch (e) {
      console.warn('Could not request persistent storage:', e);
    }
  }
  return false;
}

export async function checkBrowserPersistence(): Promise<boolean> {
  if (typeof window !== 'undefined' && navigator.storage && navigator.storage.persisted) {
    try {
      return await navigator.storage.persisted();
    } catch (e) {
      return false;
    }
  }
  return false;
}

/**
 * Open or upgrade IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('rating', 'rating', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Fetch all persistent reviews from IndexedDB, falling back to LocalStorage or defaults
 */
export async function getPersistentReviews(): Promise<FeedbackComment[]> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const allRecords: FeedbackComment[] = await new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (allRecords && allRecords.length > 0) {
      // Sort newest first
      const sorted = allRecords.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      // Sync backup to localStorage
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sorted));
      } catch (e) {}
      return sorted;
    }
  } catch (err) {
    console.warn('IndexedDB read error, checking localStorage fallback:', err);
  }

  // Fallback 1: LocalStorage backup
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Hydrate back into IndexedDB asynchronously
        saveAllToIndexedDB(parsed).catch(() => {});
        return parsed;
      }
    }
  } catch (e) {}

  // Check Cloudflare serverless API if online
  try {
    const res = await fetch('/api/feedback');
    if (res.ok) {
      const cloudData = await res.json();
      if (Array.isArray(cloudData) && cloudData.length > 0) {
        saveAllToIndexedDB(cloudData).catch(() => {});
        try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudData)); } catch (e) {}
        return cloudData;
      }
    }
  } catch (e) {}

  // Fallback 2: Initialize default community reviews into persistent storage
  await saveAllToIndexedDB(INITIAL_COMMUNITY_REVIEWS);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_COMMUNITY_REVIEWS));
  } catch (e) {}
  return INITIAL_COMMUNITY_REVIEWS;
}

/**
 * Helper to batch save reviews into IndexedDB
 */
async function saveAllToIndexedDB(reviews: FeedbackComment[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const item of reviews) {
      store.put(item);
    }
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('Failed to seed IndexedDB:', e);
  }
}

/**
 * Add a new persistent review into browser IndexedDB & LocalStorage
 */
export async function addPersistentReview(review: Omit<FeedbackComment, 'id' | 'date'>): Promise<FeedbackComment> {
  // Ensure browser persistence is requested
  enableBrowserPersistence().catch(() => {});

  const newEntry: FeedbackComment = {
    ...review,
    id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    date: new Date().toISOString().split('T')[0]
  };

  // 1. Post to Cloudflare serverless API
  try {
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry)
    }).catch(() => {});
  } catch (e) {}

  // 2. Write to IndexedDB
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(newEntry);
  } catch (e) {
    console.warn('Failed writing review to IndexedDB:', e);
  }

  // 3. Mirror into LocalStorage backup
  try {
    const existing = await getPersistentReviews();
    const updated = [newEntry, ...existing.filter(r => r.id !== newEntry.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}

  return newEntry;
}

/**
 * Delete a review from IndexedDB & LocalStorage
 */
export async function deletePersistentReview(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
  } catch (e) {}

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const list = JSON.parse(saved) as FeedbackComment[];
      const filtered = list.filter(r => r.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (e) {}

  return true;
}

/**
 * Export reviews as a downloadable JSON backup file
 */
export async function exportReviewsToJSON(): Promise<void> {
  const reviews = await getPersistentReviews();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reviews, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `debzane_reviews_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Import reviews from a JSON string or file
 */
export async function importReviewsFromJSON(jsonString: string): Promise<FeedbackComment[]> {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed) && parsed.length > 0) {
      await saveAllToIndexedDB(parsed);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
      return await getPersistentReviews();
    }
  } catch (e) {
    throw new Error('Invalid JSON review backup format');
  }
  return await getPersistentReviews();
}
