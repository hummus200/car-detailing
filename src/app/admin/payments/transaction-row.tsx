"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TransactionRecord } from "@/app/actions/transactions";

const formPanel = "rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm";
const inputClass =
  "h-9 border border-white/15 bg-white/5 text-gray-100 placeholder-gray-500 focus:border-white/25 focus:ring-1 focus:ring-white/10 text-xs";
const labelClass = "text-[11px] font-medium uppercase tracking-wider text-gray-400";
const btnBase =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-medium text-gray-200 transition-colors hover:bg-white/10 hover:text-white";
const btnGhost =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white";

type Props = {
  transaction: TransactionRecord;
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

export function TransactionRow({ transaction, onUpdate, onDelete }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    transactionId: transaction.transactionId,
    date: transaction.date,
    clientName: transaction.clientName,
    serviceOffered: transaction.serviceOffered,
    amount: String(transaction.amount),
    status: transaction.status,
    method: transaction.method || "Card",
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amount = Number(form.amount);
    if (Number.isNaN(amount)) {
      setError("Amount must be a number.");
      return;
    }
    startTransition(async () => {
      const result = await onUpdate(transaction.id, {
        transactionId: form.transactionId,
        date: form.date,
        clientName: form.clientName,
        serviceOffered: form.serviceOffered,
        amount,
        status: form.status,
        method: form.method,
      });
      if (result.ok) {
        toast.success("Payment updated successfully!", {
          description: `Transaction ${transaction.transactionId} has been updated.`,
        });
        setEditing(false);
        router.refresh();
      } else {
        setError(result.error);
        toast.error("Failed to update payment", {
          description: result.error,
        });
      }
    });
  }

  function handleDelete() {
    if (confirm(`Delete transaction ${transaction.transactionId}?`)) {
      startTransition(async () => {
        const result = await onDelete(transaction.id);
        if (result.ok) {
          toast.success("Payment deleted", {
            description: `Transaction ${transaction.transactionId} has been deleted.`,
          });
          router.refresh();
        } else {
          setError(result.error);
          toast.error("Failed to delete payment", {
            description: result.error,
          });
        }
      });
    }
  }

  if (editing) {
    return (
      <tr className="border-b border-white/10">
        <td colSpan={7} className="px-4 py-3">
          <div className={formPanel}>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
                <div className="space-y-1.5">
                  <Label className={labelClass}>Transaction ID</Label>
                  <Input
                    value={form.transactionId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, transactionId: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Date</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Client</Label>
                  <Input
                    value={form.clientName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, clientName: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Service</Label>
                  <Input
                    value={form.serviceOffered}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, serviceOffered: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        status: v as "Completed" | "Pending" | "Refunded",
                      }))
                    }
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <Button type="submit" size="sm" className={btnBase} disabled={pending}>
                    <Check className="h-3.5 w-3" />
                    {pending ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 rounded-lg border border-white/10 bg-transparent px-3 text-xs text-gray-400 hover:bg-white/5 hover:text-gray-200"
                    onClick={() => setEditing(false)}
                  >
                    <X className="h-3.5 w-3" />
                    Cancel
                  </Button>
                </div>
              </div>
              {error && <p className="text-xs text-red-300">{error}</p>}
            </form>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-white/5 last:border-0 hover:bg-white/5">
      <td className="px-4 py-3 font-mono text-xs text-gray-400">
        {transaction.transactionId}
      </td>
      <td className="px-4 py-3 text-gray-400">{transaction.date}</td>
      <td className="px-4 py-3 font-medium text-gray-100">
        {transaction.clientName}
      </td>
      <td className="px-4 py-3 text-gray-200">{transaction.serviceOffered}</td>
      <td
        className={`px-4 py-3 text-right font-medium ${
          transaction.amount < 0 ? "text-red-300" : "text-white"
        }`}
      >
        {transaction.amount >= 0 ? "$" : "-$"}
        {Math.abs(transaction.amount).toLocaleString()}
      </td>
      <td className="px-4 py-3 text-right">
        <span
          className={
            transaction.status === "Completed"
              ? "rounded-full bg-white/15 px-2 py-0.5 text-xs text-gray-200"
              : transaction.status === "Pending"
                ? "rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400"
                : "rounded-full bg-white/10 px-2 py-0.5 text-xs text-red-300"
          }
        >
          {transaction.status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-1.5">
          <button
            type="button"
            title="Edit transaction"
            onClick={() => setEditing(true)}
            className={btnGhost}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            title="Delete transaction"
            onClick={handleDelete}
            disabled={pending}
            className={`${btnGhost} hover:text-red-300 disabled:opacity-50`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </td>
    </tr>
  );
}
