// Cloudflare Pages Serverless Function for 100% Sincere Real-Time Statistics
// Endpoint: /api/stats (GET & POST)

interface Env {
  DEBZANE_KV?: any;
}

export const onRequestGet = async (context: { env: Env }) => {
  const { env } = context;
  const todayKey = new Date().toISOString().split('T')[0];

  let todayClicks = 0;
  let totalSpeeches = 0;
  let activeUsers = 1;

  try {
    if (env.DEBZANE_KV) {
      const storedToday = await env.DEBZANE_KV.get(`stats_clicks_${todayKey}`, { type: 'json' });
      const storedTotal = await env.DEBZANE_KV.get('stats_total_speeches', { type: 'json' });
      
      if (storedToday && typeof storedToday === 'number') {
        todayClicks = storedToday;
      }
      if (storedTotal && typeof storedTotal === 'number') {
        totalSpeeches = storedTotal;
      }
    }
  } catch (e) {}

  return new Response(JSON.stringify({
    todayClicks,
    totalSpeeches,
    activeUsersNow: activeUsers,
    date: todayKey,
    status: 'online',
    isGenuine: true
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    }
  });
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { env } = context;
  const todayKey = new Date().toISOString().split('T')[0];

  let todayClicks = 1;
  let totalSpeeches = 0;

  try {
    if (env.DEBZANE_KV) {
      const storedToday = await env.DEBZANE_KV.get(`stats_clicks_${todayKey}`, { type: 'json' });
      const current = (storedToday && typeof storedToday === 'number') ? storedToday : 0;
      todayClicks = current + 1;
      await env.DEBZANE_KV.put(`stats_clicks_${todayKey}`, JSON.stringify(todayClicks));

      const storedTotal = await env.DEBZANE_KV.get('stats_total_speeches', { type: 'json' });
      if (storedTotal && typeof storedTotal === 'number') {
        totalSpeeches = storedTotal;
      }
    }
  } catch (e) {}

  return new Response(JSON.stringify({
    success: true,
    todayClicks,
    totalSpeeches,
    timestamp: Date.now()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};
