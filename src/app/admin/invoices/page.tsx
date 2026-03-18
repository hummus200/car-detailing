import { revalidatePath } from "next/cache";
import { getInvoices, deleteInvoice } from "@/app/actions/invoice";
import { GlassCard } from "@/components/common/glass-card";
import { InvoiceForm } from "./invoice-form";
import { InvoiceRow } from "./invoice-row";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
}

export default async function AdminInvoicesPage() {
  const invoices = await getInvoices();
  
  // Debug logging
  console.log(`📊 AdminInvoicesPage: Fetched ${invoices.length} invoices`);
  if (invoices.length > 0) {
    console.log("📋 Sample invoice:", JSON.stringify(invoices[0], null, 2));
  }

          async function handleDelete(formData: FormData): Promise<{ ok: boolean; error?: string }> {
            "use server";
            const id = String(formData.get("invoiceId") || "").trim();
            if (!id) return { ok: false, error: "Invoice ID is missing." };
            const result = await deleteInvoice(id);
            if (result.ok) {
              revalidatePath("/admin/invoices");
              revalidatePath("/admin");
            }
            return result;
          }

  const stats = {
    draft: invoices.filter((i) => i.status === "draft").length,
    sent: invoices.filter((i) => i.status === "sent").length,
    paid: invoices.filter((i) => i.status === "paid").length,
    total: invoices.reduce((sum, i) => sum + i.total, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Invoices
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Create, edit, and send invoices to customers via email.
          </p>
        </div>
        <InvoiceForm />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard className="p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Draft
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.draft}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Sent
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.sent}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Paid
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.paid}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Total Value
          </p>
          <p className="mt-2 text-2xl font-semibold text-yellow-300">
            {formatCurrency(stats.total)}
          </p>
        </GlassCard>
      </div>

      {/* Invoices List */}
      {invoices.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <p className="text-sm text-gray-400">No invoices yet.</p>
          <p className="mt-1 text-xs text-gray-500">
            Create your first invoice using the button above.
          </p>
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[11px] font-medium uppercase tracking-[0.15em] text-gray-500">
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Issue Date</th>
                  <th className="hidden px-4 py-3 md:table-cell">Due Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Status</th>
                  <th className="w-32 px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {invoices.map((invoice) => (
                  <InvoiceRow
                    key={invoice.id}
                    invoice={invoice}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-white/10 px-4 py-3 text-center text-xs text-gray-500">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
