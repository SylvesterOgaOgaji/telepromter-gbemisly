export interface SupporterRecord {
  id: string;
  donorName: string;
  amount: string;
  message: string;
  date: string;
}

const LOCAL_DONATIONS_KEY = 'debzane_supporter_donations_cache';

export const INITIAL_SUPPORTERS: SupporterRecord[] = [
  {
    id: 'don_1',
    donorName: 'Adeola M. (Lagos)',
    amount: '₦5,000',
    message: 'Thank you Sylvester and Debzane for creating this 100% free tool for our church media ministry!',
    date: '2026-03-15'
  },
  {
    id: 'don_2',
    donorName: 'Pastor Emmanuel',
    amount: '₦10,000',
    message: 'Great software. God bless the JV ImpactVR Initiative!',
    date: '2026-04-10'
  },
  {
    id: 'don_3',
    donorName: 'Dr. Tunde Health Educator',
    amount: '₦2,500',
    message: 'The solo camera mode with prompter helps our clinic create daily health awareness clips on TikTok without subscriptions.',
    date: '2026-06-02'
  },
  {
    id: 'don_4',
    donorName: 'Anonymous Creator',
    amount: '₦1,000',
    message: 'Sent via OPay. Keep the servers running!',
    date: '2026-08-18'
  }
];

/**
 * Fetch supporters list from Cloudflare API with local fallback
 */
export async function fetchSupportersList(): Promise<SupporterRecord[]> {
  try {
    const res = await fetch('/api/donations');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(LOCAL_DONATIONS_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch (e) {
    console.warn('Could not reach /api/donations, using local cache:', e);
  }

  const cached = localStorage.getItem(LOCAL_DONATIONS_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {}
  }

  return INITIAL_SUPPORTERS;
}

/**
 * Submit a donor confirmation / pledge note
 */
export async function submitSupporterConfirmation(record: Omit<SupporterRecord, 'id' | 'date'>): Promise<SupporterRecord> {
  const newRecord: SupporterRecord = {
    ...record,
    id: 'don_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    date: new Date().toISOString().split('T')[0]
  };

  try {
    await fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord)
    });
  } catch (e) {
    console.warn('Failed to post to /api/donations, storing locally:', e);
  }

  // Update local storage cache
  try {
    const current = await fetchSupportersList();
    const updated = [newRecord, ...current.filter(d => d.id !== newRecord.id)];
    localStorage.setItem(LOCAL_DONATIONS_KEY, JSON.stringify(updated));
  } catch (e) {}

  return newRecord;
}

/**
 * Export all supporters to JSON file
 */
export async function exportSupportersToJSON(): Promise<void> {
  const list = await fetchSupportersList();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(list, null, 2));
  const a = document.createElement('a');
  a.setAttribute("href", dataStr);
  a.setAttribute("download", `debzane_supporters_hall_of_fame_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(a);
  a.click();
  a.remove();
}
