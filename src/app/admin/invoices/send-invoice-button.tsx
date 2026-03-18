"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type InvoiceStatus } from "@/app/actions/invoice";

type SendInvoiceButtonProps = {
  invoiceId: string;
  invoiceStatus: InvoiceStatus;
};

export function SendInvoiceButton({ invoiceId, invoiceStatus }: SendInvoiceButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isResend = invoiceStatus === "sent";
  const buttonText = isResend ? "Resend" : "Send";
  const buttonTitle = isResend ? "Resend invoice via email" : "Send invoice via email";

  const handleSend = () => {
    const confirmMessage = isResend
      ? "Resend this invoice to the customer via email?"
      : "Send this invoice to the customer via email?";
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/invoices/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ invoiceId }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          const errorMsg = data.error || "Failed to send invoice";
          setError(errorMsg);
          toast.error("Failed to send invoice", {
            description: errorMsg,
          });
          return;
        }

        toast.success("Invoice sent successfully!", {
          description: `The invoice has been ${isResend ? "resent" : "sent"} to the customer via email.`,
        });
        router.refresh();
      } catch (err) {
        const errorMsg = "An error occurred. Please try again.";
        setError(errorMsg);
        toast.error("Failed to send invoice", {
          description: errorMsg,
        });
        console.error("Error sending invoice:", err);
      }
    });
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSend}
        disabled={isPending}
        className="h-8 px-2 text-blue-400 hover:text-blue-300 text-xs"
        title={buttonTitle}
      >
        {isPending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            <span className="hidden sm:inline">Sending...</span>
          </>
        ) : (
          <>
            <Send className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">{buttonText}</span>
          </>
        )}
      </Button>
      {error && (
        <div className="absolute right-0 top-full mt-1 z-10 rounded-lg bg-red-500/20 border border-red-500/30 px-2 py-1 text-xs text-red-300 whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
}
