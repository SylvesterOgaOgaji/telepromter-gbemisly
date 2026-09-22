import { FeedbackComment } from '../types';

const DB_NAME = 'debzane_teleprompter_db';
const DB_VERSION = 1;
const STORE_NAME = 'creator_reviews';
const LOCAL_STORAGE_KEY = 'debzane_persistent_reviews_backup';
const DEVICE_USER_REVIEW_KEY = 'debzane_device_user_review';
const TESTIMONIAL_FLAG_KEY = 'debzane_testimonial_submitted_v1';

export const INITIAL_COMMUNITY_REVIEWS: FeedbackComment[] = [];

/**
 * Checks if mandatory review policy is active (Effective Oct 1, 2026)
 */
export function isOctober1stReviewRequired(): boolean {
  try {
    const today = new Date();
    // Active from Oct 1, 2026 onwards
    const oct1st2026 = new Date('2026-10-01T00:00:00');
    return today >= oct1st2026;
  } catch (e) {
    return false;
  }
}

/**
 * Returns the review this specific device/user previously posted, if any.
 */
export function getDeviceUserReview(): FeedbackComment | null {
  try {
    const raw = localStorage.getItem(DEVICE_USER_REVIEW_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.userName && parsed.message) {
        return parsed;
      }
    }
  } catch (e) {}
  return null;
}

/**
 * Returns true if the user has already submitted a review on this device.
 */
export function hasUserReviewed(): boolean {
  if (getDeviceUserReview()) return true;
  if (localStorage.getItem(TESTIMONIAL_FLAG_KEY)) return true;
  return false;
}

/**
 * Requests the browser to mark storage as PERSISTENT (non-evictable).
 */
export async function enableBrowserPersistence(): Promise<boolean> {
  if (typeof window !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
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
 * Filter out any old mock / test reviews
 */
function filterOutMockReviews(list: FeedbackComment[]): FeedbackComment[] {
  if (!Array.isArray(list)) return [];
  return list.filter(r => 
    r && 
    !r.id.startsWith('rev_init_') && 
    !r.id.startsWith('cf_rev_') &&
    r.userName !== 'Amina Bello' &&
    r.userName !== 'Marcus Vance' &&
    r.userName !== 'Elena Rostova' &&
    r.userName !== 'Chukwuma David'
  );
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
 * Fetch all persistent reviews from IndexedDB, falling back to LocalStorage or Cloudflare API
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

    const genuineRecords = filterOutMockReviews(allRecords);

    if (genuineRecords.length > 0) {
      const sorted = genuineRecords.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
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
      const genuineParsed = filterOutMockReviews(parsed);
      if (genuineParsed.length > 0) {
        saveAllToIndexedDB(genuineParsed).catch(() => {});
        return genuineParsed;
      }
    }
  } catch (e) {}

  // Check Cloudflare serverless API if online
  try {
    const res = await fetch('/api/feedback');
    if (res.ok) {
      const cloudData = await res.json();
      const genuineCloud = filterOutMockReviews(cloudData);
      if (genuineCloud.length > 0) {
        saveAllToIndexedDB(genuineCloud).catch(() => {});
        try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(genuineCloud)); } catch (e) {}
        return genuineCloud;
      }
    }
  } catch (e) {}

  return [];
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
    console.warn('Failed to save to IndexedDB:', e);
  }
}

/**
 * Add or Update a persistent review into browser IndexedDB, LocalStorage, and Cloudflare
 */
export async function addPersistentReview(review: {
  id?: string;
  userName: string;
  country?: string;
  rating: number;
  message: string;
  date?: string;
}): Promise<FeedbackComment> {
  enableBrowserPersistence().catch(() => {});

  const existingDeviceReview = getDeviceUserReview();
  const reviewId = review.id || existingDeviceReview?.id || ('rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));

  const entryToSave: FeedbackComment = {
    id: reviewId,
    userName: review.userName,
    country: review.country || 'Global',
    rating: review.rating,
    message: review.message,
    date: review.date || existingDeviceReview?.date || new Date().toISOString().split('T')[0]
  };

  // 1. Post/Update to Cloudflare serverless API
  try {
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entryToSave)
    }).catch(() => {});
  } catch (e) {}

  // 2. Write to IndexedDB
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(entryToSave);
  } catch (e) {
    console.warn('Failed writing review to IndexedDB:', e);
  }

  // 3. Mirror into LocalStorage and record as device's official review
  try {
    localStorage.setItem(DEVICE_USER_REVIEW_KEY, JSON.stringify(entryToSave));
    localStorage.setItem(TESTIMONIAL_FLAG_KEY, Date.now().toString());

    const existing = await getPersistentReviews();
    const updated = [entryToSave, ...existing.filter(r => r.id !== entryToSave.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}

  return entryToSave;
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
    const deviceReview = getDeviceUserReview();
    if (deviceReview && deviceReview.id === id) {
      localStorage.removeItem(DEVICE_USER_REVIEW_KEY);
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
    const genuine = filterOutMockReviews(parsed);
    if (Array.isArray(genuine) && genuine.length > 0) {
      await saveAllToIndexedDB(genuine);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(genuine));
      return await getPersistentReviews();
    }
  } catch (e) {
    throw new Error('Invalid JSON review backup format');
  }
  return await getPersistentReviews();
}

