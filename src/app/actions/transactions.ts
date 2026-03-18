"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type TransactionStatus = "Completed" | "Pending" | "Refunded";

export type TransactionRecord = {
  id: string;
  transactionId: string;
  date: string;
  clientName: string;
  serviceOffered: string;
  amount: number;
  status: TransactionStatus;
  method?: string;
  createdAt: string;
};

function mapTransactionFromDb(dbTransaction: any): TransactionRecord {
  return {
    id: dbTransaction.id,
    transactionId: dbTransaction.transaction_id || "",
    date: dbTransaction.payment_date || new Date().toISOString().split("T")[0],
    clientName: dbTransaction.client_name || "",
    serviceOffered: dbTransaction.service_offered || "",
    amount: Number(dbTransaction.amount || 0),
    status: (dbTransaction.status || "Completed") as TransactionStatus,
    method: dbTransaction.payment_method || undefined,
    createdAt: dbTransaction.created_at || new Date().toISOString(),
  };
}

export async function getTransactions(): Promise<TransactionRecord[]> {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("payment_date", { ascending: false });

    if (error) {
      console.error("❌ Supabase error fetching payments:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    console.log(`✅ Fetched ${data.length} payments from database`);
    
    const mapped = (data || []).map(mapTransactionFromDb);
    
    return mapped;
  } catch (error) {
    console.error("❌ Error fetching payments:", error);
    return [];
  }
}

export async function addTransaction(data: {
  transactionId?: string;
  date: string;
  clientName: string;
  serviceOffered: string;
  amount: number;
  status?: TransactionStatus;
  method?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const date = (data.date || "").trim();
    const clientName = (data.clientName || "").trim();
    const serviceOffered = (data.serviceOffered || "").trim();
    
    if (!date || !clientName || !serviceOffered) {
      return { ok: false, error: "Date, client name and service are required." };
    }
    
    const amount = Number(data.amount);
    if (Number.isNaN(amount)) {
      return { ok: false, error: "Amount must be a number." };
    }
    
    const transactionId =
      (data.transactionId || "").trim() || `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const supabase = createServiceClient();
    
    const { data: payment, error } = await supabase
      .from("payments")
      .insert({
        transaction_id: transactionId,
        payment_date: date,
        client_name: clientName,
        service_offered: serviceOffered,
        amount: amount,
        status: data.status || (amount >= 0 ? "Completed" : "Refunded"),
        payment_method: (data.method || "").trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return { ok: false, error: "Failed to create payment." };
    }

    revalidatePath("/admin/payments");
    revalidatePath("/admin");

    return { ok: true, id: payment.id };
  } catch (error) {
    console.error("Error adding payment:", error);
    return { ok: false, error: "An error occurred." };
  }
}

export async function updateTransaction(
  id: string,
  data: Partial<{
    transactionId: string;
    date: string;
    clientName: string;
    serviceOffered: string;
    amount: number;
    status: TransactionStatus;
    method: string;
  }>
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = createServiceClient();
    
    const updateData: any = {};
    if (data.transactionId !== undefined) updateData.transaction_id = data.transactionId.trim();
    if (data.date !== undefined) updateData.payment_date = data.date.trim();
    if (data.clientName !== undefined) updateData.client_name = data.clientName.trim();
    if (data.serviceOffered !== undefined) updateData.service_offered = data.serviceOffered.trim();
    if (data.amount !== undefined && !Number.isNaN(Number(data.amount))) {
      updateData.amount = Number(data.amount);
    }
    if (data.status !== undefined) updateData.status = data.status;
    if (data.method !== undefined) updateData.payment_method = data.method.trim() || null;

    const { error } = await supabase
      .from("payments")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return { ok: false, error: "Failed to update payment." };
    }

    revalidatePath("/admin/payments");
    revalidatePath("/admin");

    return { ok: true };
  } catch (error) {
    console.error("Error updating payment:", error);
    return { ok: false, error: "An error occurred." };
  }
}

export async function deleteTransaction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = createServiceClient();
    
    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return { ok: false, error: "Failed to delete payment." };
    }

    revalidatePath("/admin/payments");
    revalidatePath("/admin");

    return { ok: true };
  } catch (error) {
    console.error("Error deleting payment:", error);
    return { ok: false, error: "An error occurred." };
  }
}
