import { NextResponse } from "next/server";
import { getContacts } from "@/app/actions/contact";

/**
 * GET /api/admin/contacts – list contact submissions (mock data from in-memory store).
 * In production, protect with auth and optionally replace with Supabase query.
 */
export async function GET() {
  try {
    const contacts = await getContacts();
    return NextResponse.json({
      success: true,
      data: contacts,
      count: contacts.length,
    });
  } catch (e) {
    console.error("Admin contacts API:", e);
    return NextResponse.json(
      { success: false, error: "Failed to fetch contacts." },
      { status: 500 }
    );
  }
}
