/**
 * Email templates for B2 Auto Detailing
 * Monochromatic design matching the brand aesthetic
 */

export const EMAIL_FROM = "B2 Auto Detailing <noreply@b2autodetailers.au>";

export function getEmailBaseStyles() {
  return {
    container: "max-width:680px;margin:0 auto;background:#020617;padding:32px;border-radius:16px;",
    body: "margin:0;padding:0;background-color:#0a0a0a;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;",
    text: {
      primary: "#f9fafb",
      secondary: "#e5e7eb",
      tertiary: "#d1d5db",
      muted: "#9ca3af",
      accent: "#fbbf24",
    },
    border: "rgba(255,255,255,0.1)",
    background: {
      card: "#020617",
      subtle: "rgba(255,255,255,0.05)",
      page: "#0a0a0a",
    },
  };
}

export function generateEmailWrapper(content: string, title?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";
  const logoUrl = `${baseUrl}/images/b2-auto-detailing-logo.png`;
  const styles = getEmailBaseStyles();

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${title || "B2 Auto Detailing"}</title>
        <!--[if mso]>
        <style type="text/css">
          body, table, td {font-family: Arial, sans-serif !important;}
        </style>
        <![endif]-->
      </head>
      <body style="${styles.body}">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${styles.background.page};">
          <tr>
            <td align="center" style="padding:40px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="680" style="${styles.container}">
                <!-- Logo Header -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <img src="${logoUrl}" alt="B2 Auto Detailing" style="max-width:180px;height:auto;display:block;" />
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td>
                    ${content}
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="margin-top:32px;padding-top:24px;border-top:1px solid ${styles.border};text-align:center;">
                    <p style="margin:0 0 8px;font-size:14px;color:${styles.text.muted};">
                      <strong style="color:${styles.text.primary};">B2 Auto Detailing</strong>
                    </p>
                    <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
                      Premium automotive services – Perth, Western Australia
                    </p>
                    <p style="margin:8px 0 0;font-size:12px;color:#6b7280;">
                      Phone: <a href="tel:+61427816980" style="color:#9ca3af;text-decoration:none;">+61 427 816 980</a> | 
                      Email: <a href="mailto:contact@b2autodetailers.au" style="color:#9ca3af;text-decoration:none;">contact@b2autodetailers.au</a>
                    </p>
                    <p style="margin:12px 0 0;font-size:11px;color:#4b5563;">
                      © ${new Date().getFullYear()} B2 Auto Detailing. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export function generateBookingConfirmationEmail(data: {
  fullName: string;
  email: string;
  serviceType: string;
  vehicleYear: string;
  vehicleType: string;
  vehicleModel: string;
  city: string;
  postcode: string;
  preferredDate: string;
  preferredTime: string;
  addons: string[];
  message?: string;
}): string {
  const styles = getEmailBaseStyles();

  const content = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${styles.text.primary};">
      Booking Received
    </h1>
    <p style="margin:0 0 20px;font-size:16px;color:${styles.text.secondary};line-height:1.6;">
      Hi ${data.fullName},
    </p>
    <p style="margin:0 0 20px;font-size:16px;color:${styles.text.secondary};line-height:1.6;">
      We've received your booking for <strong style="color:${styles.text.primary};">${data.serviceType}</strong> on your 
      <strong style="color:${styles.text.primary};">${data.vehicleYear} ${data.vehicleType} ${data.vehicleModel}</strong> 
      in <strong style="color:${styles.text.primary};">${data.city} ${data.postcode}</strong>.
    </p>
    
    <div style="margin:24px 0;padding:20px;background:${styles.background.subtle};border-radius:12px;border:1px solid ${styles.border};">
      <h2 style="margin:0 0 16px;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${styles.text.muted};">
        Booking Details
      </h2>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${styles.text.tertiary};">Date & Time:</td>
          <td align="right" style="padding:8px 0;font-size:14px;color:${styles.text.primary};font-weight:600;">
            ${new Date(data.preferredDate).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} at ${data.preferredTime}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${styles.text.tertiary};">Service:</td>
          <td align="right" style="padding:8px 0;font-size:14px;color:${styles.text.primary};font-weight:600;">${data.serviceType}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${styles.text.tertiary};">Vehicle:</td>
          <td align="right" style="padding:8px 0;font-size:14px;color:${styles.text.primary};font-weight:600;">
            ${data.vehicleYear} ${data.vehicleType} ${data.vehicleModel}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${styles.text.tertiary};">Location:</td>
          <td align="right" style="padding:8px 0;font-size:14px;color:${styles.text.primary};font-weight:600;">${data.city} ${data.postcode}</td>
        </tr>
        ${data.addons.length > 0 ? `
        <tr>
          <td colspan="2" style="padding:8px 0;font-size:14px;color:${styles.text.tertiary};">
            Additional Services: <span style="color:${styles.text.primary};">${data.addons.join(", ")}</span>
          </td>
        </tr>
        ` : ""}
      </table>
    </div>

    ${data.message ? `
    <div style="margin:20px 0;padding:16px;background:${styles.background.subtle};border-radius:8px;border-left:3px solid ${styles.text.accent};">
      <p style="margin:0;font-size:14px;color:${styles.text.secondary};line-height:1.6;white-space:pre-wrap;">${data.message}</p>
    </div>
    ` : ""}

    <p style="margin:24px 0 0;font-size:16px;color:${styles.text.secondary};line-height:1.6;">
      We'll be in touch shortly to confirm your booking. If you have any questions, feel free to reply to this email or call us.
    </p>
  `;

  return generateEmailWrapper(content, "Booking Confirmation – B2 Auto Detailing");
}

export function generateBookingConfirmedEmail(data: {
  fullName: string;
  serviceType: string;
  vehicleYear: string;
  vehicleType: string;
  vehicleModel: string;
  preferredDate: string;
  preferredTime: string;
  city: string;
  postcode: string;
  addons: string[];
}): string {
  const styles = getEmailBaseStyles();

  const content = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${styles.text.primary};">
      Booking Confirmed ✓
    </h1>
    <p style="margin:0 0 20px;font-size:16px;color:${styles.text.secondary};line-height:1.6;">
      Hi ${data.fullName},
    </p>
    <p style="margin:0 0 20px;font-size:16px;color:${styles.text.secondary};line-height:1.6;">
      Your booking with B2 Auto Detailing is <strong style="color:${styles.text.accent};">confirmed</strong>.
    </p>
    
    <div style="margin:24px 0;padding:20px;background:${styles.background.subtle};border-radius:12px;border:1px solid ${styles.border};">
      <h2 style="margin:0 0 16px;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${styles.text.muted};">
        Confirmed Details
      </h2>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${styles.text.tertiary};">Date & Time:</td>
          <td align="right" style="padding:8px 0;font-size:14px;color:${styles.text.primary};font-weight:600;">
            ${new Date(data.preferredDate).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} at ${data.preferredTime}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${styles.text.tertiary};">Service:</td>
          <td align="right" style="padding:8px 0;font-size:14px;color:${styles.text.primary};font-weight:600;">${data.serviceType}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${styles.text.tertiary};">Vehicle:</td>
          <td align="right" style="padding:8px 0;font-size:14px;color:${styles.text.primary};font-weight:600;">
            ${data.vehicleYear} ${data.vehicleType} ${data.vehicleModel}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${styles.text.tertiary};">Location:</td>
          <td align="right" style="padding:8px 0;font-size:14px;color:${styles.text.primary};font-weight:600;">${data.city} ${data.postcode}</td>
        </tr>
        ${data.addons.length > 0 ? `
        <tr>
          <td colspan="2" style="padding:8px 0;font-size:14px;color:${styles.text.tertiary};">
            Additional Services: <span style="color:${styles.text.primary};">${data.addons.join(", ")}</span>
          </td>
        </tr>
        ` : ""}
      </table>
    </div>

    <p style="margin:24px 0 0;font-size:16px;color:${styles.text.secondary};line-height:1.6;">
      We'll see you then. If you need to reschedule, reply to this email or call us at <a href="tel:+61427816980" style="color:${styles.text.accent};text-decoration:none;">+61 427 816 980</a>.
    </p>
  `;

  return generateEmailWrapper(content, "Booking Confirmed – B2 Auto Detailing");
}

export function generateContactReceivedEmail(data: {
  name: string;
}): string {
  const styles = getEmailBaseStyles();

  const content = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${styles.text.primary};">
      Message Received
    </h1>
    <p style="margin:0 0 20px;font-size:16px;color:${styles.text.secondary};line-height:1.6;">
      Hi ${data.name},
    </p>
    <p style="margin:0 0 20px;font-size:16px;color:${styles.text.secondary};line-height:1.6;">
      Thanks for getting in touch. We've received your message and will respond shortly.
    </p>
    <p style="margin:24px 0 0;font-size:16px;color:${styles.text.secondary};line-height:1.6;">
      If your inquiry is urgent, feel free to call us at <a href="tel:+61427816980" style="color:${styles.text.accent};text-decoration:none;">+61 427 816 980</a>.
    </p>
  `;

  return generateEmailWrapper(content, "Message Received – B2 Auto Detailing");
}

export function generateContactReplyEmail(data: {
  name: string;
  subject: string;
  replyMessage: string;
}): string {
  const styles = getEmailBaseStyles();

  const content = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${styles.text.primary};">
      Re: ${data.subject}
    </h1>
    <p style="margin:0 0 20px;font-size:16px;color:${styles.text.secondary};line-height:1.6;">
      Hi ${data.name},
    </p>
    <p style="margin:0 0 20px;font-size:16px;color:${styles.text.secondary};line-height:1.6;">
      Thanks for getting in touch. Here's our reply:
    </p>
    <div style="margin:20px 0;padding:20px;background:${styles.background.subtle};border-radius:12px;border-left:3px solid ${styles.text.accent};">
      <p style="margin:0;font-size:15px;color:${styles.text.secondary};line-height:1.7;white-space:pre-wrap;">${data.replyMessage}</p>
    </div>
    <p style="margin:24px 0 0;font-size:16px;color:${styles.text.secondary};line-height:1.6;">
      If you have any follow-up questions, just reply to this email or call us at <a href="tel:+61427816980" style="color:${styles.text.accent};text-decoration:none;">+61 427 816 980</a>.
    </p>
  `;

  return generateEmailWrapper(content, `Re: ${data.subject} – B2 Auto Detailing`);
}

export function generateAdminNotificationEmail(data: {
  type: "booking" | "contact";
  title: string;
  details: Record<string, string | string[]>;
}): string {
  const styles = getEmailBaseStyles();

  const detailsHTML = Object.entries(data.details)
    .map(([key, value]) => {
      const displayValue = Array.isArray(value) ? value.join(", ") : value;
      return `
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${styles.text.tertiary};vertical-align:top;">${key}:</td>
          <td style="padding:8px 0;font-size:14px;color:${styles.text.primary};font-weight:500;padding-left:12px;">${displayValue}</td>
        </tr>
      `;
    })
    .join("");

  const content = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${styles.text.primary};">
      ${data.title}
    </h1>
    <p style="margin:0 0 24px;font-size:16px;color:${styles.text.secondary};line-height:1.6;">
      New ${data.type === "booking" ? "booking" : "contact message"} received:
    </p>
    <div style="margin:0 0 24px;padding:20px;background:${styles.background.subtle};border-radius:12px;border:1px solid ${styles.border};">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        ${detailsHTML}
      </table>
    </div>
    <p style="margin:0;font-size:14px;color:${styles.text.muted};">
      View in admin dashboard to manage this ${data.type === "booking" ? "booking" : "message"}.
    </p>
  `;

  return generateEmailWrapper(content, data.title);
}
