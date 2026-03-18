"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Send, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { type InvoiceRecord } from "@/app/actions/invoice";
import { EditInvoiceForm } from "./edit-invoice-form";
import { SendInvoiceButton } from "./send-invoice-button";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusColor(status: string): string {
  switch (status) {
    case "draft":
      return "bg-gray-500/20 text-gray-300";
    case "sent":
      return "bg-blue-500/20 text-blue-300";
    case "paid":
      return "bg-green-500/20 text-green-300";
    case "overdue":
      return "bg-red-500/20 text-red-300";
    case "cancelled":
      return "bg-gray-600/20 text-gray-400";
    default:
      return "bg-white/10 text-gray-400";
  }
}

function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

type InvoiceRowProps = {
  invoice: InvoiceRecord;
  onDelete: (formData: FormData) => Promise<{ ok: boolean; error?: string }>;
};

export function InvoiceRow({ invoice, onDelete }: InvoiceRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      const formData = new FormData();
      formData.append("invoiceId", invoice.id);
      const result = await onDelete(formData);
      if (result?.ok) {
        toast.success("Invoice deleted", {
          description: `Invoice ${invoice.invoiceNumber} has been deleted.`,
        });
        router.refresh();
      } else {
        toast.error("Failed to delete invoice", {
          description: result?.error || "An error occurred while deleting the invoice.",
        });
      }
    }
  };

  return (
    <>
      <tr className="border-b border-white/5 last:border-0 hover:bg-white/5">
        <td className="px-4 py-3">
          <div>
            <p className="font-medium text-gray-100">{invoice.invoiceNumber}</p>
            {invoice.bookingId && (
              <p className="text-xs text-gray-500">Booking linked</p>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <div>
            <p className="font-medium text-gray-100">{invoice.customerName}</p>
            <p className="text-xs text-gray-500">{invoice.customerEmail}</p>
          </div>
        </td>
        <td className="hidden px-4 py-3 sm:table-cell text-gray-400">
          {formatDate(invoice.issueDate)}
        </td>
        <td className="hidden px-4 py-3 md:table-cell text-gray-400">
          {formatDate(invoice.dueDate)}
        </td>
        <td className="px-4 py-3 text-right">
          <span className="font-semibold text-white">
            {formatCurrency(invoice.total)}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(
              invoice.status
            )}`}
          >
            {getStatusLabel(invoice.status)}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1.5">
            {(invoice.status === "draft" || invoice.status === "sent") && (
              <SendInvoiceButton invoiceId={invoice.id} invoiceStatus={invoice.status} />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
              title="Edit invoice"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
              title="Delete invoice"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </td>
      </tr>
      {isEditing && (
        <EditInvoiceForm
          invoice={invoice}
          onClose={() => {
            setIsEditing(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
