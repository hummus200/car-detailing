import { revalidatePath } from "next/cache";
import Link from "next/link";
import { getBookings, confirmBooking, updateBooking } from "@/app/actions/booking";
import { GlassCard } from "@/components/common/glass-card";
import { ConfirmBookingButton } from "./confirm-booking-button";
import { EditBookingForm } from "./edit-booking-form";

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminBookingsPage() {
  const bookings = await getBookings();
  
  // Debug logging
  console.log(`📊 AdminBookingsPage: Fetched ${bookings.length} bookings`);
  if (bookings.length > 0) {
    console.log("📋 Sample booking:", JSON.stringify(bookings[0], null, 2));
  }

  async function handleConfirm(formData: FormData) {
    "use server";
    const id = String(formData.get("bookingId") || "").trim();
    if (!id) return;
    const result = await confirmBooking(id);
    if (result.ok) revalidatePath("/admin/bookings");
    if (result.ok) revalidatePath("/admin");
  }

  async function handleUpdate(
    id: string,
    data: Parameters<typeof updateBooking>[1]
  ) {
    "use server";
    const result = await updateBooking(id, data);
    if (result.ok) {
      revalidatePath("/admin/bookings");
      revalidatePath("/admin");
    }
    return result;
  }

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Bookings
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Confirm bookings to send a confirmation email to the customer via Resend.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-gray-200">
            {pendingCount} pending
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-gray-400">
            {confirmedCount} confirmed
          </span>
        </div>
      </div>

      {bookings.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <p className="text-sm text-gray-400">No bookings yet.</p>
          <p className="mt-1 text-xs text-gray-500">
            New requests from the <Link href="/book" className="text-gray-300 hover:text-white">booking form</Link> will appear here.
          </p>
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[11px] font-medium uppercase tracking-[0.15em] text-gray-500">
                  <th className="px-4 py-3">Client</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Vehicle</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Date & time</th>
                  <th className="px-4 py-3 text-right">Status</th>
                  <th className="w-28 px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-100">{b.fullName}</p>
                        <p className="text-xs text-gray-500">{b.email}</p>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell text-gray-400">
                      {b.vehicleYear} {b.vehicleType} {b.vehicleModel}
                    </td>
                    <td className="px-4 py-3 text-gray-200">{b.serviceType}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {b.city} {b.postcode}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-200">{b.preferredDate}</span>
                      <span className="ml-1 text-gray-500">{b.preferredTime}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          b.status === "confirmed"
                            ? "rounded-full bg-white/10 px-2 py-1 text-xs font-medium text-gray-400"
                            : "rounded-full bg-white/15 px-2 py-1 text-xs font-medium text-gray-200"
                        }
                      >
                        {b.status === "confirmed" ? "Confirmed" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === "pending" && (
                          <ConfirmBookingButton bookingId={b.id} onConfirm={handleConfirm} />
                        )}
                        <EditBookingForm booking={b} onUpdate={handleUpdate} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-white/10 px-4 py-3 text-center text-xs text-gray-500">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
