"use client";

import { useTransition, useState } from "react";
import { Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BookingRecord } from "@/app/actions/booking";

const formPanel =
  "rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm";
const inputClass =
  "h-9 border border-white/15 bg-white/5 text-gray-100 placeholder-gray-500 focus:border-white/25 focus:ring-1 focus:ring-white/10";
const labelClass = "text-[11px] font-medium uppercase tracking-wider text-gray-400";
const btnBase =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-medium text-gray-200 transition-colors hover:bg-white/10 hover:text-white";

type Props = {
  booking: BookingRecord;
  onUpdate: (
    id: string,
    data: Partial<{
      status: "pending" | "confirmed" | "completed" | "cancelled";
      preferredDate: string;
      preferredTime: string;
      internalNotes: string;
    }>
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
};

export function EditBookingForm({ booking, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    status: booking.status,
    preferredDate: booking.preferredDate,
    preferredTime: booking.preferredTime,
    internalNotes: booking.internalNotes || "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await onUpdate(booking.id, {
        status: form.status,
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        internalNotes: form.internalNotes || undefined,
      });
      if (result.ok) setOpen(false);
      else setError(result.error);
    });
  }

  return (
    <div className="inline-block">
      {!open ? (
        <button
          type="button"
          title="Edit booking"
          onClick={() => setOpen(true)}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </button>
      ) : (
        <div className={formPanel}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label className={labelClass}>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v as typeof form.status }))
                  }
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Date</Label>
                <Input
                  type="date"
                  value={form.preferredDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, preferredDate: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Time</Label>
                <Input
                  type="time"
                  value={form.preferredTime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, preferredTime: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Internal notes</Label>
              <Textarea
                value={form.internalNotes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, internalNotes: e.target.value }))
                }
                placeholder="Optional"
                rows={2}
                className={`resize-y ${inputClass}`}
              />
            </div>
            {error && <p className="text-xs text-red-300">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" className={btnBase} disabled={pending}>
                <Check className="h-3.5 w-3" />
                {pending ? "Saving…" : "Save"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 rounded-lg border border-white/10 bg-transparent px-3 text-xs text-gray-400 hover:bg-white/5 hover:text-gray-200"
                onClick={() => setOpen(false)}
              >
                <X className="h-3.5 w-3" />
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
