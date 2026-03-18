import Link from "next/link";
import { getBookings } from "@/app/actions/booking";
import { getContacts } from "@/app/actions/contact";
import { GlassCard } from "@/components/common/glass-card";

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function formatRelative(s: string) {
  const d = new Date(s);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (days >= 1) return `${days}d ago`;
  if (hours >= 1) return `${hours}h ago`;
  const mins = Math.floor(diff / (1000 * 60));
  return `${mins}m ago`;
}

function formatShortDate(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
  });
}

export default async function AdminOverviewPage() {
  const [bookings, contacts] = await Promise.all([
    getBookings(),
    getContacts(),
  ]);
  
  // Debug logging
  console.log(`📊 AdminOverviewPage: Fetched ${bookings.length} bookings and ${contacts.length} contacts`);
  if (bookings.length > 0) {
    console.log("📋 Sample booking:", JSON.stringify(bookings[0], null, 2));
  }
  if (contacts.length > 0) {
    console.log("📋 Sample contact:", JSON.stringify(contacts[0], null, 2));
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const bookingsThisMonth = bookings.filter(
    (b) => new Date(b.createdAt) >= startOfMonth
  );
  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const upcomingIn7Days = bookings.filter((b) => {
    const d = new Date(`${b.preferredDate}T${b.preferredTime}`);
    return d >= now && d <= sevenDaysFromNow;
  });
  const openContacts = contacts.filter((c) => c.status === "open");
  const repliedContacts = contacts.filter((c) => c.status === "replied");
  const responseRate =
    contacts.length > 0
      ? Math.round((repliedContacts.length / contacts.length) * 100)
      : 0;

  const recentBookings = bookings.slice(0, 5);
  const recentContacts = contacts.slice(0, 5);

  const stats = [
    {
      label: "Bookings this month",
      value: String(bookingsThisMonth.length),
      sub:
        pendingBookings.length > 0
          ? `${pendingBookings.length} pending confirmation`
          : "All confirmed",
    },
    {
      label: "Open contacts",
      value: String(openContacts.length),
      sub:
        repliedContacts.length > 0
          ? `${responseRate}% response rate`
          : "Reply from Contacts page",
    },
    {
      label: "Upcoming (7 days)",
      value: String(upcomingIn7Days.length),
      sub: "Confirm to send reminder",
    },
    {
      label: "Total confirmed",
      value: String(confirmedBookings.length),
      sub: "Emails sent via Resend",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Analytics & overview
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Run the business at a glance. Confirm bookings and reply to contacts to send emails.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <GlassCard key={s.label} className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              {s.label}
            </p>
            <p className="mt-3 text-2xl font-semibold text-white">{s.value}</p>
            <p className="mt-1 text-xs text-gray-400">{s.sub}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <GlassCard className="lg:col-span-3 overflow-hidden p-0">
          <div className="border-b border-white/10 px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
              Recent bookings
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              Confirm from Bookings to send customer email.
            </p>
          </div>
          <div className="overflow-x-auto">
            {recentBookings.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No bookings yet. They appear when customers submit the booking form.
              </div>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-medium uppercase tracking-[0.15em] text-gray-500">
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="hidden px-4 py-3 sm:table-cell">Vehicle</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {recentBookings.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/5"
                    >
                      <td className="px-4 py-3 font-medium text-gray-100">
                        {b.fullName}
                      </td>
                      <td className="px-4 py-3 text-gray-200">
                        {b.serviceType}
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell text-gray-400">
                        {b.vehicleYear} {b.vehicleType} {b.vehicleModel}
                      </td>
                      <td className="px-4 py-3">
                        {formatShortDate(b.preferredDate)} {b.preferredTime}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={
                            b.status === "confirmed"
                              ? "rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400"
                              : "rounded-full bg-white/15 px-2 py-0.5 text-xs text-gray-200"
                          }
                        >
                          {b.status === "confirmed" ? "Confirmed" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="border-t border-white/10 px-4 py-2 sm:px-5">
            <Link
              href="/admin/bookings"
              className="text-xs font-medium text-gray-400 hover:text-white"
            >
              View all bookings →
            </Link>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-2 flex flex-col p-0">
          <div className="border-b border-white/10 px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
              Contact threads
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              Reply from Contacts to email the customer.
            </p>
          </div>
          <div className="flex-1 space-y-2 p-4 sm:p-5">
            {recentContacts.length === 0 ? (
              <div className="py-4 text-center text-sm text-gray-500">
                No messages yet. They appear when someone uses the contact form.
              </div>
            ) : (
              recentContacts.map((c) => (
                <Link
                  key={c.id}
                  href="/admin/contacts"
                  className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 transition-colors hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-100">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {formatRelative(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-300">
                    {c.subject}
                  </p>
                  <span
                    className={
                      c.status === "open"
                        ? "mt-1.5 inline-block rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-gray-200"
                        : "mt-1.5 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-gray-400"
                    }
                  >
                    {c.status === "open" ? "Open" : "Replied"}
                  </span>
                </Link>
              ))
            )}
          </div>
          <div className="border-t border-white/10 px-4 py-2 sm:px-5">
            <Link
              href="/admin/contacts"
              className="text-xs font-medium text-gray-400 hover:text-white"
            >
              View all contacts →
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
