// Cloudflare Pages Serverless Function for Supporter Confirmations & Hall of Fame
// Endpoint: /api/donations (GET & POST)

interface Env {
  DEBZANE_KV?: any;
}

export const onRequestGet = async (context: { env: Env }) => {
  const { env } = context;
  try {
    if (env.DEBZANE_KV) {
      const stored = await env.DEBZANE_KV.get('debzane_supporter_donations', { type: 'json' });
      if (stored && Array.isArray(stored)) {
        return new Response(JSON.stringify(stored), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }
  } catch (e) {}

  // Default initial supporters list
  const defaultSupporters = [
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

  return new Response(JSON.stringify(defaultSupporters), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  try {
    const body = await request.json() as any;
    if (!body || !body.donorName) {
      return new Response(JSON.stringify({ error: 'Missing donorName' }), { status: 400 });
    }

    const newDonation = {
      id: 'don_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      donorName: String(body.donorName).trim(),
      amount: String(body.amount || 'Contributed').trim(),
      message: String(body.message || 'Thank you for keeping Debzane Teleprompter free!').trim(),
      date: new Date().toISOString().split('T')[0]
    };

    if (env.DEBZANE_KV) {
      const existing = (await env.DEBZANE_KV.get('debzane_supporter_donations', { type: 'json' })) || [];
      const updated = [newDonation, ...(Array.isArray(existing) ? existing : [])];
      await env.DEBZANE_KV.put('debzane_supporter_donations', JSON.stringify(updated.slice(0, 500)));
    }

    return new Response(JSON.stringify({ success: true, donation: newDonation }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
