"use server";

import { revalidatePath } from "next/cache";
import { resend, isEmailConfigured, getAdminEmail } from "@/lib/resend";
import { createServiceClient } from "@/lib/supabase/server";
import {
  EMAIL_FROM,
  generateContactReceivedEmail,
  generateContactReplyEmail,
  generateAdminNotificationEmail,
} from "@/lib/email-templates";

export type ContactState = {
  errors?: {
    name?: string[];
    email?: string[];
    subject?: string[];
    message?: string[];
  };
  success?: boolean;
  message?: string;
};

export type ContactStatus = "open" | "replied" | "closed";

export type ContactReply = {
  id: string;
  contactId: string;
  message: string;
  sentBy: string;
  createdAt: string;
};

export type ContactRecord = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  lastReplyAt?: string;
  replies?: ContactReply[];
};

function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function submitContact(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = (formData.get("name") as string)?.trim() || "";
  const email = (formData.get("email") as string)?.trim() || "";
  const subject = (formData.get("subject") as string)?.trim() || "";
  const message = (formData.get("message") as string)?.trim() || "";

  const errors: ContactState["errors"] = {};

  if (!name || name.length < 2) {
    errors.name = ["Name must be at least 2 characters."];
  }
  if (!email) {
    errors.email = ["Email is required."];
  } else if (!validateEmail(email)) {
    errors.email = ["Please enter a valid email address."];
  }
  if (!subject || subject.length < 2) {
    errors.subject = ["Subject must be at least 2 characters."];
  }
  if (!message || message.length < 10) {
    errors.message = ["Message must be at least 10 characters."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        subject,
        message,
        status: "open",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return {
        success: false,
        message: "Failed to send message. Please try again.",
      };
    }

    if (isEmailConfigured() && resend) {
      const adminEmail = getAdminEmail();
      try {
        // Send admin notification
        await resend.emails.send({
          from: EMAIL_FROM,
          to: [adminEmail],
          subject: `Contact: ${subject}`,
          html: generateAdminNotificationEmail({
            type: "contact",
            title: "New Contact Message",
            details: {
              Name: name,
              Email: email,
              Subject: subject,
              Message: message,
            },
          }),
        });

        // Send customer confirmation
        await resend.emails.send({
          from: EMAIL_FROM,
          to: [email],
          subject: "We received your message – B2 Auto Detailing",
          html: generateContactReceivedEmail({ name }),
        });
      } catch (e) {
        console.error("Resend error:", e);
        return {
          success: false,
          message: "Failed to send. Please try again or email us directly.",
        };
      }
    }

    // Revalidate contact pages
    revalidatePath("/admin/contacts");
    revalidatePath("/admin");
    revalidatePath("/contact");

    return { success: true, message: "Message sent. We'll be in touch soon." };
  } catch (error) {
    console.error("Error submitting contact:", error);
    return {
      success: false,
      message: "An error occurred. Please try again.",
    };
  }
}

export async function getContacts(): Promise<ContactRecord[]> {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase error fetching contacts:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return [];
    }

    if (!data) {
      console.warn("⚠️ No data returned from contact_messages query");
      return [];
    }

    console.log(`✅ Fetched ${data.length} contact messages from database`);
    
    // Fetch replies for all contacts
    const contactIds = data.map((c: any) => c.id);
    const { data: repliesData } = await supabase
      .from("contact_replies")
      .select("*")
      .in("contact_id", contactIds)
      .order("created_at", { ascending: true });

    // Group replies by contact_id
    const repliesByContact = new Map<string, ContactReply[]>();
    (repliesData || []).forEach((reply: any) => {
      if (!repliesByContact.has(reply.contact_id)) {
        repliesByContact.set(reply.contact_id, []);
      }
      repliesByContact.get(reply.contact_id)!.push({
        id: reply.id,
        contactId: reply.contact_id,
        message: reply.message,
        sentBy: reply.sent_by || "admin",
        createdAt: reply.created_at,
      });
    });
    
    const mapped = (data || []).map((contact: any) => ({
      id: contact.id,
      name: contact.name || "",
      email: contact.email || "",
      subject: contact.subject || "",
      message: contact.message || "",
      status: contact.status || "open",
      createdAt: contact.created_at || new Date().toISOString(),
      lastReplyAt: contact.last_reply_at || undefined,
      replies: repliesByContact.get(contact.id) || [],
    }));
    
    console.log(`✅ Mapped ${mapped.length} contact messages successfully`);
    
    return mapped;
  } catch (error) {
    console.error("❌ Error fetching contacts:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return [];
  }
}

export async function replyToContact(
  contactId: string,
  replyMessage: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = createServiceClient();
    
    const trimmed = replyMessage?.trim() || "";
    if (trimmed.length < 5) {
      return { ok: false, error: "Reply must be at least 5 characters." };
    }

    // Get contact first
    const { data: contact, error: fetchError } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("id", contactId)
      .single();

    if (fetchError || !contact) {
      return { ok: false, error: "Contact not found." };
    }

    // Store reply in contact_replies table
    const { error: replyError } = await supabase
      .from("contact_replies")
      .insert({
        contact_id: contactId,
        message: trimmed,
        sent_by: "admin",
      });

    if (replyError) {
      console.error("Error storing reply:", replyError);
      return { ok: false, error: "Failed to store reply." };
    }

    // Update status and last_reply_at
    const { error: updateError } = await supabase
      .from("contact_messages")
      .update({
        status: contact.status === "closed" ? "closed" : "replied", // Keep closed if already closed
        last_reply_at: new Date().toISOString(),
      })
      .eq("id", contactId);

    if (updateError) {
      return { ok: false, error: "Failed to update contact." };
    }

    if (resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: [contact.email],
          subject: `Re: ${contact.subject} – B2 Auto Detailing`,
          html: generateContactReplyEmail({
            name: contact.name,
            subject: contact.subject,
            replyMessage: trimmed,
          }),
        });
      } catch (e) {
        console.error("Resend error:", e);
        return { ok: false, error: "Failed to send reply." };
      }
    }

    return { ok: true };
  } catch (error) {
    console.error("Error replying to contact:", error);
    return { ok: false, error: "An error occurred." };
  }
}

export async function updateContact(
  id: string,
  data: Partial<{ status: "open" | "replied" | "closed"; subject: string }>
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = createServiceClient();
    
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.subject !== undefined) updateData.subject = data.subject.trim();

    const { error } = await supabase
      .from("contact_messages")
      .update(updateData)
      .eq("id", id);

    if (error) {
      return { ok: false, error: "Failed to update contact." };
    }

    // Revalidate contact pages
    revalidatePath("/admin/contacts");
    revalidatePath("/admin");

    return { ok: true };
  } catch (error) {
    console.error("Error updating contact:", error);
    return { ok: false, error: "An error occurred." };
  }
}

export async function closeContact(
  contactId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = createServiceClient();
    
    const { error } = await supabase
      .from("contact_messages")
      .update({
        status: "closed",
      })
      .eq("id", contactId);

    if (error) {
      return { ok: false, error: "Failed to close contact." };
    }

    // Revalidate contact pages
    revalidatePath("/admin/contacts");
    revalidatePath("/admin");

    return { ok: true };
  } catch (error) {
    console.error("Error closing contact:", error);
    return { ok: false, error: "An error occurred." };
  }
}
