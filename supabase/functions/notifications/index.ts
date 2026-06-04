import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationRequest {
  type: 'order_confirmation' | 'order_status' | 'welcome' | 'review_request';
  email: string;
  name: string;
  data: Record<string, string>;
}

function generateOrderConfirmationHtml(name: string, orderNumber: string, total: string, items: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff8f0; padding: 20px;">
      <div style="background: #6B1A1A; color: white; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="margin: 0;">Roots of Araku</h1>
        <p style="margin: 5px 0 0; opacity: 0.8;">Order Confirmation</p>
      </div>
      <div style="background: white; padding: 20px; border: 1px solid #e5e7eb;">
        <p>Hi ${name},</p>
        <p>Thank you for your order! Your order has been confirmed.</p>
        <div style="background: #f5f5dc; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 0;"><strong>Order #${orderNumber}</strong></p>
          <p style="margin: 5px 0;">Total: ₹${total}</p>
        </div>
        <p>Items: ${items}</p>
        <p>You can track your order status anytime from your account.</p>
      </div>
      <div style="text-align: center; padding: 15px; color: #6B1A1A; font-size: 12px;">
        Roots of Araku - Premium Organic Products from Araku Valley
      </div>
    </div>
  `;
}

function generateStatusUpdateHtml(name: string, orderNumber: string, status: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff8f0; padding: 20px;">
      <div style="background: #6B1A1A; color: white; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="margin: 0;">Order Update</h1>
      </div>
      <div style="background: white; padding: 20px; border: 1px solid #e5e7eb;">
        <p>Hi ${name},</p>
        <p>Your order <strong>#${orderNumber}</strong> status has been updated to: <strong>${status}</strong>.</p>
        <p>Track your order anytime from your account.</p>
      </div>
      <div style="text-align: center; padding: 15px; color: #6B1A1A; font-size: 12px;">
        Roots of Araku - Premium Organic Products from Araku Valley
      </div>
    </div>
  `;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { type, email, name, data }: NotificationRequest = await req.json();

    if (!email || !name || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, name, type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let subject = "";
    let html = ""; // html content for email (ready for integration with email service)

    switch (type) {
      case "order_confirmation":
        subject = `Order Confirmed - #${data.order_number || "N/A"}`;
        html = generateOrderConfirmationHtml(name, data.order_number || "N/A", data.total || "0", data.items || "");
        break;
      case "order_status":
        subject = `Order Update - #${data.order_number || "N/A"}`;
        html = generateStatusUpdateHtml(name, data.order_number || "N/A", data.status || "updated");
        break;
      case "welcome": {
        subject = "Welcome to Roots of Araku!";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff8f0; padding: 20px;">
            <div style="background: #6B1A1A; color: white; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0;">Welcome to Roots of Araku!</h1>
            </div>
            <div style="background: white; padding: 20px; border: 1px solid #e5e7eb;">
              <p>Hi ${name},</p>
              <p>Thank you for joining us! We are excited to have you as part of our community.</p>
              <p>Explore our premium organic products from the Araku Valley.</p>
            </div>
          </div>
        `;
        break;
      }
      default:
        return new Response(
          JSON.stringify({ error: "Unknown notification type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // In production, integrate with email service (Resend, SendGrid, etc.)
    console.log(`[NOTIFICATION] Type: ${type}, To: ${email}, Subject: ${subject}, HTML: ${html.length} chars`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notification queued: ${type}`,
        preview: { to: email, subject },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to process notification" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
