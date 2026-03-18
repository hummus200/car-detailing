"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
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
import { GlassCard } from "@/components/common/glass-card";
import {
  updateInvoice,
  type InvoiceRecord,
  type InvoiceFormData,
  type InvoiceLineItem,
} from "@/app/actions/invoice";

type EditInvoiceFormProps = {
  invoice: InvoiceRecord;
  onClose: () => void;
};

export function EditInvoiceForm({ invoice, onClose }: EditInvoiceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<InvoiceFormData>({
    customerName: invoice.customerName,
    customerEmail: invoice.customerEmail,
    customerAddress: invoice.customerAddress || "",
    customerPhone: invoice.customerPhone || "",
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    lineItems: invoice.lineItems,
    taxRate: invoice.taxRate,
    notes: invoice.notes || "",
    terms: invoice.terms || "",
  });

  const updateLineItem = (
    index: number,
    field: keyof InvoiceLineItem,
    value: any
  ) => {
    const newItems = [...formData.lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].total =
        newItems[index].quantity * newItems[index].unitPrice;
    }
    setFormData({ ...formData, lineItems: newItems });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [
        ...formData.lineItems,
        { description: "", quantity: 1, unitPrice: 0, total: 0 },
      ],
    });
  };

  const removeLineItem = (index: number) => {
    if (formData.lineItems.length > 1) {
      setFormData({
        ...formData,
        lineItems: formData.lineItems.filter((_, i) => i !== index),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateInvoice(invoice.id, formData);
      if (result.ok) {
        toast.success("Invoice updated successfully!", {
          description: `Invoice ${result.invoice.invoiceNumber} has been updated.`,
        });
        onClose();
        router.refresh();
      } else {
        setError(result.error);
        toast.error("Failed to update invoice", {
          description: result.error || "An error occurred while updating the invoice.",
        });
      }
    });
  };

  const subtotal = formData.lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * formData.taxRate) / 100;
  const total = subtotal + taxAmount;

  return (
    <tr>
      <td colSpan={7} className="p-0">
        <div className="border-t border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              Edit Invoice {invoice.invoiceNumber}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-customerName">Customer Name *</Label>
                <Input
                  id="edit-customerName"
                  required
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="edit-customerEmail">Customer Email *</Label>
                <Input
                  id="edit-customerEmail"
                  type="email"
                  required
                  value={formData.customerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, customerEmail: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="edit-customerAddress">Address</Label>
                <Input
                  id="edit-customerAddress"
                  value={formData.customerAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, customerAddress: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="edit-customerPhone">Phone</Label>
                <Input
                  id="edit-customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
            </div>

            {/* Invoice Dates */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-issueDate">Issue Date *</Label>
                <Input
                  id="edit-issueDate"
                  type="date"
                  required
                  value={formData.issueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, issueDate: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="edit-dueDate">Due Date *</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Line Items *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addLineItem}
                  className="text-xs"
                >
                  Add Item
                </Button>
              </div>
              <div className="space-y-3">
                {formData.lineItems.map((item, index) => (
                  <div
                    key={index}
                    className="grid gap-3 sm:grid-cols-12 items-end p-3 rounded-lg border border-white/10 bg-white/5"
                  >
                    <div className="sm:col-span-5">
                      <Label className="text-xs">Description</Label>
                      <Input
                        required
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(index, "description", e.target.value)
                        }
                        className="mt-1"
                        placeholder="Service description"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs">Unit Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateLineItem(
                            index,
                            "unitPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs">Total</Label>
                      <Input
                        type="number"
                        readOnly
                        value={item.total.toFixed(2)}
                        className="mt-1 bg-white/5"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      {formData.lineItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Rate */}
            <div>
              <Label htmlFor="edit-taxRate">Tax Rate (%)</Label>
              <Input
                id="edit-taxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.taxRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    taxRate: parseFloat(e.target.value) || 0,
                  })
                }
                className="mt-2"
              />
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2 p-4 rounded-lg border border-white/10 bg-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="text-gray-200">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tax ({formData.taxRate}%):</span>
                  <span className="text-gray-200">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10">
                  <span className="font-semibold text-white">Total:</span>
                  <span className="text-lg font-bold text-yellow-300">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="mt-2"
                  placeholder="Additional notes for the customer"
                />
              </div>
              <div>
                <Label htmlFor="edit-terms">Payment Terms</Label>
                <Textarea
                  id="edit-terms"
                  rows={3}
                  value={formData.terms}
                  onChange={(e) =>
                    setFormData({ ...formData, terms: e.target.value })
                  }
                  className="mt-2"
                  placeholder="Payment terms and conditions"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={invoice.status}
                onValueChange={(value) => {
                  startTransition(async () => {
                    const result = await updateInvoice(invoice.id, {
                      status: value as any,
                    });
                    if (result.ok) {
                      toast.success("Status updated", {
                        description: `Invoice status changed to ${value}.`,
                      });
                      onClose();
                      router.refresh();
                    } else {
                      toast.error("Failed to update status", {
                        description: result.error || "An error occurred.",
                      });
                    }
                  });
                }}
              >
                <SelectTrigger className="mt-2 h-9 border border-white/15 bg-white/5 text-sm text-gray-100 placeholder-gray-500 focus:border-white/25 focus:ring-1 focus:ring-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </td>
    </tr>
  );
}
