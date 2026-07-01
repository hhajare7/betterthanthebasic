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
    const payload = await request.json() as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    const name = payload.name?.trim();
    const email = payload.email?.trim();
    const subject = payload.subject?.trim();
    const message = payload.message?.trim();

    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: 'All fields (name, email, subject, message) are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email address is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Try storing in D1 SQL Database first
    if (env.DB) {
      await env.DB.prepare(
        'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)'
      )
      .bind(name, email.toLowerCase(), subject, message)
      .run();
    }
    // Fallback to KV Namespace if D1 is not bound
    else if (env.KV) {
      const timestamp = new Date().toISOString();
      const uuid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      const key = `contact:${timestamp}:${uuid}`;
      await env.KV.put(key, JSON.stringify({
        name,
        email: email.toLowerCase(),
        subject,
        message,
        created_at: timestamp
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

    return new Response(JSON.stringify({ success: true, message: 'Message saved successfully' }), {
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
