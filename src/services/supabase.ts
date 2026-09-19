import { createClient } from '@supabase/supabase-js';
import { FeedbackComment } from '../types';

const SUPABASE_URL_KEY = 'debzain_supabase_url';
const SUPABASE_ANON_KEY = 'debzain_supabase_anon_key';

export function getStoredSupabaseConfig() {
  const url = localStorage.getItem(SUPABASE_URL_KEY) || (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const anonKey = localStorage.getItem(SUPABASE_ANON_KEY) || (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';
  return { url, anonKey };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem(SUPABASE_URL_KEY, url);
  localStorage.setItem(SUPABASE_ANON_KEY, anonKey);
}

export function getSupabaseClient() {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (url && anonKey) {
    try {
      return createClient(url, anonKey);
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
    }
  }
  return null;
}

// Local mock feedback storage fallback
const LOCAL_FEEDBACK_KEY = 'debzain_local_feedback';

export const INITIAL_FEEDBACK: FeedbackComment[] = [
  {
    id: 'f-1',
    userName: 'Chukwuma David',
    rating: 5,
    message: 'Debzain Concept Teleprompter is a lifesaver for our YouTube studio recordings in Lagos! Smooth scrolling and 100% free with no annoying paywalls.',
    date: '2026-03-12',
    country: '🇳🇬 Nigeria'
  },
  {
    id: 'f-2',
    userName: 'Elena Rostova',
    rating: 5,
    message: 'The beam splitter mirror mode works seamlessly with my iPad prompter rig. Excellent developer work by Sylvester and JV Impact Initiative!',
    date: '2026-04-05',
    country: '🇬🇧 UK'
  },
  {
    id: 'f-3',
    userName: 'Marcus Vance',
    rating: 5,
    message: 'Bluetooth clicker/pedal support works straight away out of the box with my mini controller. Beautiful dark UI.',
    date: '2026-06-18',
    country: '🇺🇸 USA'
  }
];

export async function fetchFeedbackList(): Promise<FeedbackComment[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('debzain_feedback').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          userName: item.user_name || item.userName,
          rating: item.rating || 5,
          message: item.message,
          date: new Date(item.created_at).toISOString().split('T')[0],
          country: item.country || 'Global'
        }));
      }
    } catch (e) {
      console.warn('Supabase query failed, falling back to local list', e);
    }
  }

  const stored = localStorage.getItem(LOCAL_FEEDBACK_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
  }
  return INITIAL_FEEDBACK;
}

export async function submitFeedbackComment(feedback: Omit<FeedbackComment, 'id' | 'date'>): Promise<boolean> {
  const newEntry: FeedbackComment = {
    ...feedback,
    id: 'fb_' + Date.now(),
    date: new Date().toISOString().split('T')[0]
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('debzain_feedback').insert({
        user_name: feedback.userName,
        rating: feedback.rating,
        message: feedback.message,
        country: feedback.country || 'Global'
      });
    } catch (e) {
      console.warn('Supabase insert failed, storing locally', e);
    }
  }

  // Always store in local array as well
  const current = await fetchFeedbackList();
  const updated = [newEntry, ...current];
  localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(updated));
  return true;
}
