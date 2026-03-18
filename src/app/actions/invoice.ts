"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export type InvoiceLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type InvoiceRecord = {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  customerName: string;
  customerEmail: string;
  customerAddress?: string;
  customerPhone?: string;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  terms?: string;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  paidAt?: string;
};

export type InvoiceFormData = {
  customerName: string;
  customerEmail: string;
  customerAddress?: string;
  customerPhone?: string;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  taxRate: number;
  notes?: string;
  terms?: string;
  bookingId?: string;
};

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${year}-${timestamp.toString().slice(-6)}-${random}`;
}

function calculateTotals(
  lineItems: InvoiceLineItem[],
  taxRate: number
): { subtotal: number; taxAmount: number; total: number } {
  const subtotal = lineItems.reduce(
    (sum, item) => sum + (item.total || item.quantity * item.unitPrice),
    0
  );
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;
  return { subtotal, taxAmount, total };
}

export async function createInvoice(
  data: InvoiceFormData
): Promise<{ ok: true; invoice: InvoiceRecord } | { ok: false; error: string }> {
  try {
    const supabase = createServiceClient();
    
    const { subtotal, taxAmount, total } = calculateTotals(
      data.lineItems,
      data.taxRate
    );

    const invoiceNumber = generateInvoiceNumber();

    const { data: invoice, error } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        status: "draft",
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_address: data.customerAddress || null,
        customer_phone: data.customerPhone || null,
        issue_date: data.issueDate,
        due_date: data.dueDate,
        line_items: data.lineItems,
        subtotal: subtotal,
        tax_rate: data.taxRate,
        tax_amount: taxAmount,
        total: total,
        notes: data.notes || null,
        terms: data.terms || null,
        booking_id: data.bookingId || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return { ok: false, error: "Failed to create invoice." };
    }

    // Revalidate invoices page to show new invoice
    revalidatePath("/admin/invoices");
    revalidatePath("/admin");

    return {
      ok: true,
      invoice: mapInvoiceFromDb(invoice),
    };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return { ok: false, error: "An error occurred." };
  }
}

export async function updateInvoice(
  id: string,
  data: Partial<InvoiceFormData & { status?: InvoiceStatus }>
): Promise<{ ok: true; invoice: InvoiceRecord } | { ok: false; error: string }> {
  try {
    const supabase = createServiceClient();
    
    const updateData: any = {};

    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "sent" && !updateData.sent_at) {
        updateData.sent_at = new Date().toISOString();
      }
      if (data.status === "paid" && !updateData.paid_at) {
        updateData.paid_at = new Date().toISOString();
      }
    }

    if (data.customerName !== undefined) updateData.customer_name = data.customerName;
    if (data.customerEmail !== undefined) updateData.customer_email = data.customerEmail;
    if (data.customerAddress !== undefined) updateData.customer_address = data.customerAddress || null;
    if (data.customerPhone !== undefined) updateData.customer_phone = data.customerPhone || null;
    if (data.issueDate !== undefined) updateData.issue_date = data.issueDate;
    if (data.dueDate !== undefined) updateData.due_date = data.dueDate;
    if (data.lineItems !== undefined) {
      updateData.line_items = data.lineItems;
      const taxRate = data.taxRate !== undefined ? data.taxRate : 0;
      const { subtotal, taxAmount, total } = calculateTotals(data.lineItems, taxRate);
      updateData.subtotal = subtotal;
      updateData.tax_rate = taxRate;
      updateData.tax_amount = taxAmount;
      updateData.total = total;
    }
    if (data.taxRate !== undefined && data.lineItems === undefined) {
      // Recalculate if only tax rate changed
      const { data: existing } = await supabase
        .from("invoices")
        .select("line_items")
        .eq("id", id)
        .single();
      
      if (existing) {
        const { subtotal, taxAmount, total } = calculateTotals(
          existing.line_items || [],
          data.taxRate
        );
        updateData.tax_rate = data.taxRate;
        updateData.tax_amount = taxAmount;
        updateData.total = total;
      }
    }
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.terms !== undefined) updateData.terms = data.terms || null;
    if (data.bookingId !== undefined) updateData.booking_id = data.bookingId || null;

    const { data: invoice, error } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return { ok: false, error: "Failed to update invoice." };
    }

    // Revalidate invoices page
    revalidatePath("/admin/invoices");
    revalidatePath("/admin");

    return {
      ok: true,
      invoice: mapInvoiceFromDb(invoice),
    };
  } catch (error) {
    console.error("Error updating invoice:", error);
    return { ok: false, error: "An error occurred." };
  }
}

export async function getInvoices(): Promise<InvoiceRecord[]> {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase error fetching invoices:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return [];
    }

    if (!data) {
      console.warn("⚠️ No data returned from invoices query");
      return [];
    }

    console.log(`✅ Fetched ${data.length} invoices from database`);
    
    const mapped = (data || []).map(mapInvoiceFromDb);
    console.log(`✅ Mapped ${mapped.length} invoices successfully`);
    
    return mapped;
  } catch (error) {
    console.error("❌ Error fetching invoices:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return [];
  }
}

export async function getInvoice(id: string): Promise<InvoiceRecord | null> {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return mapInvoiceFromDb(data);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return null;
  }
}

export async function deleteInvoice(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = createServiceClient();
    
    const { error } = await supabase.from("invoices").delete().eq("id", id);

    if (error) {
      return { ok: false, error: "Failed to delete invoice." };
    }

    // Revalidate invoices page
    revalidatePath("/admin/invoices");
    revalidatePath("/admin");

    return { ok: true };
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return { ok: false, error: "An error occurred." };
  }
}

function mapInvoiceFromDb(dbInvoice: any): InvoiceRecord {
  try {
    // Ensure dates are strings (handle both Date objects and strings)
    const formatDate = (date: any): string => {
      if (!date) return new Date().toISOString().split("T")[0];
      if (date instanceof Date) return date.toISOString().split("T")[0];
      if (typeof date === "string") {
        // If it's a full ISO string, extract just the date part
        return date.split("T")[0];
      }
      return String(date);
    };

    return {
      id: dbInvoice.id,
      invoiceNumber: dbInvoice.invoice_number || `INV-${dbInvoice.id?.substring(0, 8)}`,
      status: dbInvoice.status || "draft",
      customerName: dbInvoice.customer_name || "",
      customerEmail: dbInvoice.customer_email || "",
      customerAddress: dbInvoice.customer_address || undefined,
      customerPhone: dbInvoice.customer_phone || undefined,
      issueDate: formatDate(dbInvoice.issue_date),
      dueDate: formatDate(dbInvoice.due_date),
      lineItems: Array.isArray(dbInvoice.line_items) ? dbInvoice.line_items : (dbInvoice.line_items ? JSON.parse(dbInvoice.line_items) : []),
      subtotal: parseFloat(String(dbInvoice.subtotal || 0)),
      taxRate: parseFloat(String(dbInvoice.tax_rate || 0)),
      taxAmount: parseFloat(String(dbInvoice.tax_amount || 0)),
      total: parseFloat(String(dbInvoice.total || 0)),
      notes: dbInvoice.notes || undefined,
      terms: dbInvoice.terms || undefined,
      bookingId: dbInvoice.booking_id || undefined,
      createdAt: dbInvoice.created_at || new Date().toISOString(),
      updatedAt: dbInvoice.updated_at || new Date().toISOString(),
      sentAt: dbInvoice.sent_at || undefined,
      paidAt: dbInvoice.paid_at || undefined,
    };
  } catch (error) {
    console.error("❌ Error mapping invoice:", error);
    console.error("Invoice data:", JSON.stringify(dbInvoice, null, 2));
    throw error;
  }
}
