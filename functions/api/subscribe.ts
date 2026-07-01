interface Env {
  DB?: D1Database;
  KV?: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const payload = await request.json() as { email?: string };
    const email = payload.email?.trim();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email address is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Try storing in D1 SQL Database first
    if (env.DB) {
      await env.DB.prepare(
        'INSERT OR IGNORE INTO subscribers (email) VALUES (?)'
      )
      .bind(email.toLowerCase())
      .run();
    }
    // Fallback to KV Namespace if D1 is not bound
    else if (env.KV) {
      const key = `subscriber:${email.toLowerCase()}`;
      await env.KV.put(key, JSON.stringify({
        email: email.toLowerCase(),
        subscribed_at: new Date().toISOString()
      }));
    }
    // Setup warning if neither is bound
    else {
      return new Response(JSON.stringify({
        error: 'Cloudflare binding missing. Please bind a D1 database to `DB` or a KV namespace to `KV` in your Cloudflare Pages project settings.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Subscribed successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
};
