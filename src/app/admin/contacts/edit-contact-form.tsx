"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, X, Check } from "lucide-react";
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
import type { ContactRecord } from "@/app/actions/contact";

const formPanel =
  "rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm mt-3";
const inputClass =
  "h-9 border border-white/15 bg-white/5 text-gray-100 placeholder-gray-500 focus:border-white/25 focus:ring-1 focus:ring-white/10";
const labelClass = "text-[11px] font-medium uppercase tracking-wider text-gray-400";
const btnBase =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-medium text-gray-200 transition-colors hover:bg-white/10 hover:text-white";

type Props = {
  contact: ContactRecord;
  onUpdate: (
    id: string,
    data: Partial<{ status: "open" | "replied" | "closed"; subject: string }>
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
};

export function EditContactForm({ contact, onUpdate }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    status: contact.status,
    subject: contact.subject,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await onUpdate(contact.id, {
        status: form.status,
        subject: form.subject.trim(),
      });
      if (result.ok) {
        toast.success("Contact updated", {
          description: "Contact information has been updated successfully.",
        });
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error);
        toast.error("Failed to update contact", {
          description: result.error || "An error occurred while updating the contact.",
        });
      }
    });
  }

  return (
    <div>
      {!open ? (
        <button
          type="button"
          title="Edit contact"
          onClick={() => setOpen(true)}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </button>
      ) : (
        <div className={formPanel}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Subject</Label>
                <Input
                  value={form.subject}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subject: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
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
