"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/common/glass-card";
import { createInvoice, type InvoiceFormData, type InvoiceLineItem } from "@/app/actions/invoice";

export function InvoiceForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [formData, setFormData] = useState<InvoiceFormData>({
    customerName: "",
    customerEmail: "",
    customerAddress: "",
    customerPhone: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    lineItems: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
    taxRate: 10,
    notes: "",
    terms: "",
  });

  const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const newItems = [...formData.lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
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
    startTransition(async () => {
      const result = await createInvoice(formData);
      if (result.ok) {
        toast.success("Invoice created successfully!", {
          description: `Invoice ${result.invoice.invoiceNumber} has been created.`,
        });
        setIsOpen(false);
        router.refresh();
        // Reset form
        setFormData({
          customerName: "",
          customerEmail: "",
          customerAddress: "",
          customerPhone: "",
          issueDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          lineItems: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
          taxRate: 10,
          notes: "",
          terms: "",
        });
      } else {
        toast.error("Failed to create invoice", {
          description: result.error || "An error occurred while creating the invoice.",
        });
      }
    });
  };

  const subtotal = formData.lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * formData.taxRate) / 100;
  const total = subtotal + taxAmount;

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Create Invoice</span>
        <span className="sm:hidden">New</span>
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Create Invoice</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                required
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Customer Email *</Label>
              <Input
                id="customerEmail"
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
              <Label htmlFor="customerAddress">Address</Label>
              <Input
                id="customerAddress"
                value={formData.customerAddress}
                onChange={(e) =>
                  setFormData({ ...formData, customerAddress: e.target.value })
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Phone</Label>
              <Input
                id="customerPhone"
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
              <Label htmlFor="issueDate">Issue Date *</Label>
              <Input
                id="issueDate"
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
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
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
                <Plus className="h-3 w-3 mr-1" />
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
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
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
                <span className="text-gray-200">
                  ${subtotal.toFixed(2)}
                </span>
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
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
              <Label htmlFor="terms">Payment Terms</Label>
              <Textarea
                id="terms"
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

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
