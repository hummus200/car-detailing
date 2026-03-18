"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  contactId: string;
  contactName: string;
  onReply: (contactId: string, replyMessage: string) => Promise<{ ok: true } | { ok: false; error: string }>;
};

const labelClass = "text-[11px] font-medium uppercase tracking-wider text-gray-400";
const inputClass =
  "min-h-[100px] resize-y border border-white/15 bg-white/5 text-sm text-gray-100 placeholder-gray-500 focus:border-white/25 focus:ring-1 focus:ring-white/10";
const btnBase =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-black px-3 text-xs font-medium text-white transition-colors hover:bg-gray-900 hover:border-white/30";

export function ContactReplyForm({ contactId, contactName, onReply }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = message.trim();
    if (trimmed.length < 5) {
      setError("Reply must be at least 5 characters.");
      toast.error("Reply too short", {
        description: "Reply must be at least 5 characters.",
      });
      return;
    }
    startTransition(async () => {
      const result = await onReply(contactId, trimmed);
      if (result.ok) {
        toast.success("Reply sent!", {
          description: `Your reply has been sent to ${contactName} via email.`,
        });
        setMessage("");
        router.refresh();
      } else {
        setError(result.error);
        toast.error("Failed to send reply", {
          description: result.error || "An error occurred while sending the reply.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
      <Label htmlFor={`reply-${contactId}`} className={labelClass}>
        Reply to {contactName}
      </Label>
      <Textarea
        id={`reply-${contactId}`}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your reply… (sent to the customer’s email)"
        rows={4}
        className={inputClass}
        disabled={isPending}
      />
      {error && <p className="text-xs text-red-300">{error}</p>}
      <Button
        type="submit"
        size="sm"
        className={btnBase}
        disabled={isPending || message.trim().length < 5}
      >
        <Send className="h-3.5 w-3" />
        {isPending ? "Sending…" : "Send reply"}
      </Button>
    </form>
  );
}
