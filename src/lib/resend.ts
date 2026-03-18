import { Resend } from "resend";

// ⚠️ SECURITY: These are SECRET variables - server-side only, never exposed to client
const apiKey = process.env.RESEND_API_KEY;
const adminEmail = process.env.ADMIN_EMAIL;

// Only create Resend client if API key is provided
// This allows the app to work without email functionality if not configured
export const resend = apiKey ? new Resend(apiKey) : null;

export function isEmailConfigured(): boolean {
  return Boolean(apiKey && adminEmail);
}

export function getAdminEmail(): string {
  return adminEmail || "";
}
