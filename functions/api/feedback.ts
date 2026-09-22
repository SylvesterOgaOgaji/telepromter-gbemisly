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

  // 100% Genuine: start with empty array if no user reviews have been submitted yet
  return new Response(JSON.stringify([]), {
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

    const reviewId = body.id || ('rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));
    const updatedReview = {
      id: reviewId,
      userName: String(body.userName).trim(),
      country: String(body.country || 'Global').trim(),
      rating: Number(body.rating) || 5,
      message: String(body.message).trim(),
      date: body.date || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    if (env.DEBZANE_KV) {
      const existing = (await env.DEBZANE_KV.get('debzane_community_reviews', { type: 'json' })) || [];
      const list = Array.isArray(existing) ? existing : [];
      // If already exists, update in-place, otherwise prepend
      const existingIndex = list.findIndex((r: any) => r.id === reviewId);
      let updatedList;
      if (existingIndex >= 0) {
        updatedList = [...list];
        updatedList[existingIndex] = updatedReview;
      } else {
        updatedList = [updatedReview, ...list];
      }
      await env.DEBZANE_KV.put('debzane_community_reviews', JSON.stringify(updatedList.slice(0, 500)));
    }

    return new Response(JSON.stringify({ success: true, review: updatedReview }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
