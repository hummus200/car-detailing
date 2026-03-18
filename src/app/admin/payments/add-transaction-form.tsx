"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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

type Props = {
  onAdd: (data: {
    transactionId?: string;
    date: string;
    clientName: string;
    serviceOffered: string;
    amount: number;
    status: string;
    method?: string;
  }) => Promise<{ ok: true; id: string } | { ok: false; error: string }>;
};

export function AddTransactionForm({ onAdd }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    transactionId: "",
    date: new Date().toISOString().slice(0, 10),
    clientName: "",
    serviceOffered: "",
    amount: "",
    status: "Completed",
    method: "Card",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amount = Number(form.amount);
    if (!form.date || !form.clientName.trim() || !form.serviceOffered.trim()) {
      setError("Date, client name and service are required.");
      return;
    }
    if (Number.isNaN(amount)) {
      setError("Amount must be a number.");
      return;
    }
    startTransition(async () => {
      const result = await onAdd({
        transactionId: form.transactionId.trim() || undefined,
        date: form.date,
        clientName: form.clientName.trim(),
        serviceOffered: form.serviceOffered.trim(),
        amount,
        status: form.status,
        method: form.method,
      });
      if (result.ok) {
        toast.success("Payment added successfully!", {
          description: `Transaction ${form.transactionId || "recorded"} has been added.`,
        });
        setForm({
          transactionId: "",
          date: new Date().toISOString().slice(0, 10),
          clientName: "",
          serviceOffered: "",
          amount: "",
          status: "Completed",
          method: "Card",
        });
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error);
        toast.error("Failed to add payment", {
          description: result.error,
        });
      }
    });
  }

  return (
    <div className="rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
      {!open ? (
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-medium text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          Add transaction
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="tx-id" className="text-xs text-gray-400">
                Transaction ID (optional)
              </Label>
              <Input
                id="tx-id"
                value={form.transactionId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, transactionId: e.target.value }))
                }
                placeholder="INV-2026-005"
                className="h-9 border border-white/15 bg-white/5 text-sm text-gray-100 placeholder-gray-500 focus:border-white/25 focus:ring-1 focus:ring-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-date" className="text-xs text-gray-400">
                Date
              </Label>
              <Input
                id="tx-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="h-9 border border-white/15 bg-white/5 text-sm text-gray-100 placeholder-gray-500 focus:border-white/25 focus:ring-1 focus:ring-white/10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-client" className="text-xs text-gray-400">
                Client name
              </Label>
              <Input
                id="tx-client"
                value={form.clientName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, clientName: e.target.value }))
                }
                placeholder="John Smith"
                className="h-9 border border-white/15 bg-white/5 text-sm text-gray-100 placeholder-gray-500 focus:border-white/25 focus:ring-1 focus:ring-white/10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-service" className="text-xs text-gray-400">
                Service offered
              </Label>
              <Input
                id="tx-service"
                value={form.serviceOffered}
                onChange={(e) =>
                  setForm((f) => ({ ...f, serviceOffered: e.target.value }))
                }
                placeholder="Full detail"
                className="h-9 border border-white/15 bg-white/5 text-sm text-gray-100 placeholder-gray-500 focus:border-white/25 focus:ring-1 focus:ring-white/10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-amount" className="text-xs text-gray-400">
                Amount ($)
              </Label>
              <Input
                id="tx-amount"
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder="520"
                className="h-9 border border-white/15 bg-white/5 text-sm text-gray-100 placeholder-gray-500 focus:border-white/25 focus:ring-1 focus:ring-white/10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v }))
                }
              >
                <SelectTrigger className="h-9 border border-white/15 bg-white/5 text-sm text-gray-100 placeholder-gray-500 focus:border-white/25 focus:ring-1 focus:ring-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Method</Label>
              <Select
                value={form.method}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, method: v }))
                }
              >
                <SelectTrigger className="h-9 border border-white/15 bg-white/5 text-sm text-gray-100 placeholder-gray-500 focus:border-white/25 focus:ring-1 focus:ring-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Bank transfer">Bank transfer</SelectItem>
                  <SelectItem value="Invoice">Invoice</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && (
            <p className="text-xs text-red-300">{error}</p>
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-medium text-gray-200 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              disabled={isPending}
            >
              {isPending ? "Adding…" : "Add transaction"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
              className="h-8 rounded-lg border border-white/15 bg-white/5 px-3 text-xs text-gray-400 hover:bg-white/10 hover:text-gray-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
