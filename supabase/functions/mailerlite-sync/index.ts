import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const MAILER_LITE_API_KEY = Deno.env.get("MAILERLITE_API_KEY");
const MAILER_LITE_GROUP_ID = Deno.env.get("MAILER_LITE_GROUP_ID");

Deno.serve(async (req) => {
  try {
    if (!MAILER_LITE_API_KEY) {
      throw new Error("MAILERLITE_API_KEY is not set");
    }

    const payload = await req.json();
    console.log("Received webhook payload:", payload);

    // Supabase Webhook payload structure: { record, old_record, type, table, schema }
    const { record, type } = payload;

    if (type !== "INSERT") {
      return new Response(JSON.stringify({ message: "Ignoring non-insert event" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const { email, first_name, last_name } = record;

    if (!email) {
      return new Response(JSON.stringify({ message: "No email found in record" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`Syncing new user to MailerLite: ${email}`);

    const mailerlitePayload: any = {
      email,
      fields: {
        name: first_name || "",
        last_name: last_name || "",
      },
      resubscribe: true,
    };

    if (MAILER_LITE_GROUP_ID) {
      mailerlitePayload.groups = [MAILER_LITE_GROUP_ID];
    }

    const response = await fetch("https://api.mailerlite.com/api/v2/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MailerLite-ApiKey": MAILER_LITE_API_KEY,
      },
      body: JSON.stringify(mailerlitePayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("MailerLite API error:", result);
      throw new Error(`MailerLite failed: ${response.statusText}`);
    }

    console.log(`Successfully synced ${email} to MailerLite`);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Edge Function error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
