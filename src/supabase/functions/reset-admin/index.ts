import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!url || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase environment variables" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const secret = req.headers.get("x-reset-admin-secret");
    if (secret !== Deno.env.get("RESET_ADMIN_SECRET")) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { email, password, role = "admin", username = "admin", create_account = false, account_type = "checking" } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: userList, error: listError } = await adminClient.auth.admin.listUsers({});

    if (listError) {
      return new Response(
        JSON.stringify({ error: listError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const existing = userList.users.find((u) => u.email === email);
    let result;
    if (existing) {
      const { data, error } = await adminClient.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
        user_metadata: { role, username },
      });
      result = { data, error };
    } else {
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role, username },
      });
      result = { data, error };
    }

    if (result.error) {
      return new Response(
        JSON.stringify({ error: result.error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = existing ? existing.id : result.data.user.id;
    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert({ id: userId, email, role, username, updated_at: new Date().toISOString() });

    if (profileError) {
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (create_account && role === "user") {
      const existingAccount = await adminClient
        .from("bank_accounts")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!existingAccount.data) {
        const accountNumber = "GHB" + Date.now().toString().slice(-8);
        const { error: accountError } = await adminClient
          .from("bank_accounts")
          .insert({
            user_id: userId,
            account_number: accountNumber,
            account_type,
            currency: "USD",
            balance: 0,
            is_active: true,
          });

        if (accountError) {
          return new Response(
            JSON.stringify({ error: accountError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "User reset/created" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
