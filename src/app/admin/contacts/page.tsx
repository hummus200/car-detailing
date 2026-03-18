import { revalidatePath } from "next/cache";
import Link from "next/link";
import { getContacts, replyToContact, updateContact, closeContact } from "@/app/actions/contact";
import { GlassCard } from "@/components/common/glass-card";
import { ContactThread } from "./contact-thread";
import { EditContactForm } from "./edit-contact-form";

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function formatDate(s: string) {
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

export default async function AdminContactsPage() {
  const contacts = await getContacts();

  async function handleReply(contactId: string, replyMessage: string) {
    "use server";
    const result = await replyToContact(contactId, replyMessage);
    if (result.ok) {
      revalidatePath("/admin/contacts");
      revalidatePath("/admin");
    }
    return result;
  }

  async function handleUpdate(
    id: string,
    data: Partial<{ status: "open" | "replied" | "closed"; subject: string }>
  ) {
    "use server";
    const result = await updateContact(id, data);
    if (result.ok) {
      revalidatePath("/admin/contacts");
      revalidatePath("/admin");
    }
    return result;
  }

  async function handleClose(contactId: string) {
    "use server";
    const result = await closeContact(contactId);
    if (result.ok) {
      revalidatePath("/admin/contacts");
      revalidatePath("/admin");
    }
    return result;
  }

  const openCount = contacts.filter((c) => c.status === "open").length;
  const repliedCount = contacts.filter((c) => c.status === "replied").length;
  const closedCount = contacts.filter((c) => c.status === "closed").length;

  const hasContacts = contacts && Array.isArray(contacts) && contacts.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Contacts
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Reply to messages; the customer receives your reply via email (Resend).
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-gray-200">
            {openCount} open
          </span>
          <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-blue-300">
            {repliedCount} replied
          </span>
          <span className="rounded-full bg-green-500/20 px-2.5 py-1 text-green-300">
            {closedCount} closed
          </span>
        </div>
      </div>

      {!hasContacts ? (
        <GlassCard className="p-8 text-center">
          <p className="text-sm text-gray-400">No contact messages yet.</p>
          <p className="mt-1 text-xs text-gray-500">
            Submissions from the <Link href="/contact" className="text-gray-300 hover:text-white">contact form</Link> will appear here.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {contacts.map((c) => (
            <GlassCard key={c.id} className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-white">{c.name}</p>
                    <span
                      className={
                        c.status === "open"
                          ? "rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-gray-200"
                          : c.status === "closed"
                          ? "rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-medium text-green-300"
                          : "rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-300"
                      }
                    >
                      {c.status === "open" ? "Open" : c.status === "closed" ? "Closed" : "Replied"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{c.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[11px] text-gray-500">
                    {formatDate(c.createdAt)}
                  </span>
                  <EditContactForm contact={c} onUpdate={handleUpdate} />
                </div>
              </div>
              
              {/* Conversation Thread */}
              <ContactThread
                contact={c}
                onReply={handleReply}
                onClose={handleClose}
              />
            </GlassCard>
          ))}
        </div>
      )}

      {contacts.length > 0 && (
        <p className="text-center text-xs text-gray-500">
          {contacts.length} message{contacts.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
