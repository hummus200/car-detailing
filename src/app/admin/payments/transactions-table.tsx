import type { TransactionRecord } from "@/app/actions/transactions";
import { TransactionRow } from "./transaction-row";

type Props = {
  transactions: TransactionRecord[];
  onUpdate: (
    id: string,
    data: Partial<{
      transactionId: string;
      date: string;
      clientName: string;
      serviceOffered: string;
      amount: number;
      status: "Completed" | "Pending" | "Refunded";
      method: string;
    }>
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  onDelete: (id: string) => Promise<{ ok: true } | { ok: false; error: string }>;
};

export function TransactionsTable({
  transactions,
  onUpdate,
  onDelete,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5 text-[11px] font-medium uppercase tracking-[0.15em] text-gray-500">
            <th className="px-4 py-3">Transaction ID</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Client name</th>
            <th className="px-4 py-3">Service offered</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3 text-right">Status</th>
            <th className="w-32 px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-300">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                No transactions yet. Use “Add transaction” above.
              </td>
            </tr>
          ) : (
            transactions.map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
