"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ContactRecord, type ContactReply } from "@/app/actions/contact";

type ContactThreadProps = {
  contact: ContactRecord;
  onReply: (contactId: string, replyMessage: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  onClose: (contactId: string) => Promise<{ ok: true } | { ok: false; error: string }>;
};

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor(diff / (1000 * 60));
  
  if (days >= 1) return `${days}d ago`;
  if (hours >= 1) return `${hours}h ago`;
  return `${mins}m ago`;
}

export function ContactThread({ contact, onReply, onClose }: ContactThreadProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasReplies = contact.replies && contact.replies.length > 0;
  const totalMessages = 1 + (contact.replies?.length || 0); // Original message + replies

  const handleReply = async () => {
    if (replyMessage.trim().length < 5) {
      toast.error("Reply too short", {
        description: "Reply must be at least 5 characters.",
      });
      return;
    }
    
    setIsSubmitting(true);
    const result = await onReply(contact.id, replyMessage.trim());
    if (result.ok) {
      toast.success("Reply sent!", {
        description: `Your reply has been sent to ${contact.name} via email.`,
      });
      setReplyMessage("");
      setShowReplyForm(false);
      router.refresh();
    } else {
      toast.error("Failed to send reply", {
        description: result.error || "An error occurred while sending the reply.",
      });
    }
    setIsSubmitting(false);
  };

  const handleClose = async () => {
    if (confirm(`Mark this conversation as closed? This indicates the customer's concern has been resolved and appreciated.`)) {
      const result = await onClose(contact.id);
      if (result.ok) {
        toast.success("Conversation closed", {
          description: "This conversation has been marked as closed.",
        });
        router.refresh();
      } else {
        toast.error("Failed to close conversation", {
          description: result.error || "An error occurred.",
        });
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Conversation Header - Always Visible */}
      <div 
        className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <MessageSquare className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-white">
              {contact.subject}
            </p>
            <p className="text-xs text-gray-400">
              {totalMessages} message{totalMessages !== 1 ? "s" : ""} • {formatRelativeTime(contact.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {contact.status === "closed" && (
            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-medium text-green-300">
              Closed
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Conversation Thread */}
      {isExpanded && (
        <div className="space-y-3 pl-4 border-l-2 border-white/10">
          {/* Original Message */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-white">{contact.name}</p>
                <p className="text-xs text-gray-400">{contact.email}</p>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDateTime(contact.createdAt)}
              </div>
            </div>
            <p className="text-sm text-gray-300 mt-2 whitespace-pre-wrap">
              {contact.message}
            </p>
          </div>

          {/* Replies */}
          {hasReplies && (
            <div className="space-y-3">
              {contact.replies!.map((reply: ContactReply) => (
                <div key={reply.id} className="rounded-lg border border-white/10 bg-white/5 p-4 ml-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-white">You (Admin)</p>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(reply.createdAt)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mt-2 whitespace-pre-wrap">
                    {reply.message}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Reply Form */}
          {contact.status !== "closed" && (
            <div className="mt-4">
              {!showReplyForm ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReplyForm(true)}
                  className="w-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {hasReplies ? "Send follow-up reply" : "Send reply"}
                </Button>
              ) : (
                <div className="rounded-lg border border-white/15 bg-white/5 p-4 space-y-3">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply… (sent to the customer's email)"
                    rows={4}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 resize-y"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleReply}
                      disabled={isSubmitting || replyMessage.trim().length < 5}
                      className="flex-1"
                    >
                      {isSubmitting ? "Sending…" : "Send reply"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyMessage("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Close Button */}
          {contact.status !== "closed" && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="w-full text-gray-400 hover:text-white border-gray-600 hover:border-gray-500"
              >
                Mark as closed
              </Button>
            </div>
          )}

          {contact.status === "closed" && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-center">
              <p className="text-xs text-green-300">
                ✓ Conversation closed • Customer concern resolved
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
