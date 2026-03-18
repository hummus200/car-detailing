import { NextResponse } from "next/server";
import { getBookings } from "@/app/actions/booking";

/**
 * GET /api/admin/bookings – list bookings (mock data from in-memory store).
 * In production, protect with auth and optionally replace with Supabase query.
 */
export async function GET() {
  try {
    const bookings = await getBookings();
    return NextResponse.json({
      success: true,
      data: bookings,
      count: bookings.length,
    });
  } catch (e) {
    console.error("Admin bookings API:", e);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings." },
      { status: 500 }
    );
  }
}
