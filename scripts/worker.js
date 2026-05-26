export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      return await pingSupabase(env);
    }
    return new Response("Method not allowed", { status: 405 });
  },

  async scheduled(event, env) {
    return await pingSupabase(env);
  },
};

async function pingSupabase(env) {
  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing environment variables",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const url = `${env.SUPABASE_URL}/rest/v1/keep_alive`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        id: "singleton",
        pinged_at: new Date().toISOString(),
      }),
    });

    const responseText = await response.text();

    if (response.ok) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Supabase keep-alive write successful",
          status: response.status,
          supabaseResponse: responseText,
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    throw new Error(`Upsert failed (${response.status}): ${responseText}`);
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
