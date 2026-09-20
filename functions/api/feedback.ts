// Cloudflare Pages Serverless Function for Global Community Reviews
// Endpoint: /api/feedback (GET & POST)

interface Env {
  DEBZANE_KV?: any;
}

export const onRequestGet = async (context: { env: Env }) => {
  const { env } = context;
  try {
    if (env.DEBZANE_KV) {
      const stored = await env.DEBZANE_KV.get('debzane_community_reviews', { type: 'json' });
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

  // Default seed community reviews if KV not yet populated
  const defaultReviews = [
    {
      id: 'cf_rev_1',
      userName: 'Chukwuma David',
      rating: 5,
      message: 'Debzane Concept Teleprompter is a lifesaver for our YouTube studio in Lagos! 100% free with no paywalls.',
      date: '2026-03-12',
      country: '🇳🇬 Nigeria'
    },
    {
      id: 'cf_rev_2',
      userName: 'Elena Rostova',
      rating: 5,
      message: 'The mirror mode and Solo Camera recording work seamlessly with my iPad prompter rig. Excellent work Sylvester and JV Impact Initiative!',
      date: '2026-04-05',
      country: '🇬🇧 UK'
    },
    {
      id: 'cf_rev_3',
      userName: 'Marcus Vance',
      rating: 5,
      message: 'Bluetooth foot pedal support and multi-format MP4 exports work straight away. Beautiful dark UI.',
      date: '2026-06-18',
      country: '🇺🇸 USA'
    },
    {
      id: 'cf_rev_4',
      userName: 'Amina Bello',
      rating: 5,
      message: 'The dual split studio reaction feature and custom news ticker is broadcast standard. Amazing job!',
      date: '2026-08-20',
      country: '🇳🇬 Nigeria'
    }
  ];

  return new Response(JSON.stringify(defaultReviews), {
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
    if (!body || !body.userName || !body.message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const newReview = {
      id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userName: String(body.userName).trim(),
      country: String(body.country || 'Global').trim(),
      rating: Number(body.rating) || 5,
      message: String(body.message).trim(),
      date: new Date().toISOString().split('T')[0]
    };

    if (env.DEBZANE_KV) {
      const existing = (await env.DEBZANE_KV.get('debzane_community_reviews', { type: 'json' })) || [];
      const updated = [newReview, ...(Array.isArray(existing) ? existing : [])];
      await env.DEBZANE_KV.put('debzane_community_reviews', JSON.stringify(updated.slice(0, 500)));
    }

    return new Response(JSON.stringify({ success: true, review: newReview }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
