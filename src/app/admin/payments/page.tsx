import { revalidatePath } from "next/cache";
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/app/actions/transactions";
import { GlassCard } from "@/components/common/glass-card";
import { AddTransactionForm } from "./add-transaction-form";
import { TransactionsTable } from "./transactions-table";

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPaymentsPage() {
  const transactions = await getTransactions();

  async function handleAdd(data: {
    transactionId?: string;
    date: string;
    clientName: string;
    serviceOffered: string;
    amount: number;
    status?: string;
    method?: string;
  }) {
    "use server";
    const result = await addTransaction({
      ...data,
      status: data.status as "Completed" | "Pending" | "Refunded",
    });
    if (result.ok) revalidatePath("/admin/payments");
    return result;
  }

  async function handleUpdate(
    id: string,
    data: Parameters<typeof updateTransaction>[1]
  ) {
    "use server";
    const result = await updateTransaction(id, data);
    if (result.ok) revalidatePath("/admin/payments");
    return result;
  }

  async function handleDelete(id: string) {
    "use server";
    const result = await deleteTransaction(id);
    if (result.ok) revalidatePath("/admin/payments");
    return result;
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonthTotal = transactions
    .filter((t) => t.date >= startOfMonth.toISOString().slice(0, 10) && t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const lastMonthTotal = transactions
    .filter(
      (t) =>
        t.date >= lastMonthStart.toISOString().slice(0, 10) &&
        t.date < startOfMonth.toISOString().slice(0, 10) &&
        t.amount > 0
    )
    .reduce((s, t) => s + t.amount, 0);
  const pendingTotal = transactions
    .filter((t) => t.status === "Pending" && t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Payments & transactions
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Add and edit transactions manually. Table shows ID, date, client, service and amount.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            This month
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            ${thisMonthTotal.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {lastMonthTotal > 0
              ? `+$${thisMonthTotal - lastMonthTotal} vs last month`
              : "Revenue this month"}
          </p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Pending
          </p>
          <p className="mt-3 text-2xl font-semibold text-gray-300">
            ${pendingTotal.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-gray-400">Not yet paid</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Last month
          </p>
          <p className="mt-3 text-2xl font-semibold text-gray-300">
            ${lastMonthTotal.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-gray-400">Total collected</p>
        </GlassCard>
      </div>

      <AddTransactionForm onAdd={handleAdd} />

      <GlassCard className="overflow-hidden p-0">
        <div className="border-b border-white/10 px-4 py-3 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
            All transactions
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            Edit or delete from the row actions.
          </p>
        </div>
        <TransactionsTable
          transactions={transactions}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
        <div className="border-t border-white/10 px-4 py-3 text-center text-xs text-gray-500">
          {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
        </div>
      </GlassCard>
    </div>
  );
}
