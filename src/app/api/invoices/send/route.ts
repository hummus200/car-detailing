import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { resend, isEmailConfigured } from "@/lib/resend";
import { createServiceClient } from "@/lib/supabase/server";
import { getInvoice } from "@/app/actions/invoice";
import { EMAIL_FROM, generateEmailWrapper, getEmailBaseStyles } from "@/lib/email-templates";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
}

function generateInvoiceEmailHTML(invoice: any): string {
  const styles = getEmailBaseStyles();

  const lineItemsHTML = invoice.lineItems
    .map(
      (item: any) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid ${styles.border};color:${styles.text.secondary};">
          ${item.description}
        </td>
        <td style="padding:12px;border-bottom:1px solid ${styles.border};text-align:center;color:${styles.text.secondary};">
          ${item.quantity}
        </td>
        <td style="padding:12px;border-bottom:1px solid ${styles.border};text-align:right;color:${styles.text.secondary};">
          ${formatCurrency(item.unitPrice)}
        </td>
        <td style="padding:12px;border-bottom:1px solid ${styles.border};text-align:right;color:${styles.text.primary};font-weight:600;">
          ${formatCurrency(item.total)}
        </td>
      </tr>
    `
    )
    .join("");

  const content = `
    <!-- Invoice Header -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid ${styles.border};">
      <tr>
        <td>
          <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:${styles.text.primary};">
            Invoice
          </h1>
          <p style="margin:0;font-size:16px;color:${styles.text.muted};">
            Invoice #${invoice.invoiceNumber}
          </p>
        </td>
      </tr>
    </table>

    <!-- Invoice Details -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:32px;">
      <tr>
        <td width="50%" style="padding-right:12px;vertical-align:top;">
          <h2 style="margin:0 0 12px;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${styles.text.muted};">
            Bill To
          </h2>
          <p style="margin:0 0 4px;font-size:16px;color:${styles.text.primary};font-weight:600;">${invoice.customerName}</p>
          ${invoice.customerAddress ? `<p style="margin:4px 0;font-size:14px;color:${styles.text.tertiary};line-height:1.5;">${invoice.customerAddress}</p>` : ""}
          ${invoice.customerPhone ? `<p style="margin:4px 0;font-size:14px;color:${styles.text.tertiary};line-height:1.5;">${invoice.customerPhone}</p>` : ""}
          <p style="margin:4px 0;font-size:14px;color:${styles.text.tertiary};line-height:1.5;">${invoice.customerEmail}</p>
        </td>
        <td width="50%" style="padding-left:12px;vertical-align:top;">
          <h2 style="margin:0 0 12px;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${styles.text.muted};">
            Invoice Details
          </h2>
          <p style="margin:0 0 8px;font-size:14px;color:${styles.text.tertiary};line-height:1.6;">
            <span style="color:${styles.text.muted};">Issue Date:</span>
            <span style="color:${styles.text.primary};margin-left:8px;">${new Date(invoice.issueDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</span>
          </p>
          <p style="margin:0 0 8px;font-size:14px;color:${styles.text.tertiary};line-height:1.6;">
            <span style="color:${styles.text.muted};">Due Date:</span>
            <span style="color:${styles.text.primary};margin-left:8px;font-weight:600;">${new Date(invoice.dueDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</span>
          </p>
          <p style="margin:0;font-size:14px;color:${styles.text.tertiary};line-height:1.6;">
            <span style="color:${styles.text.muted};">Status:</span>
            <span style="color:${styles.text.accent};margin-left:8px;font-weight:600;text-transform:uppercase;">${invoice.status}</span>
          </p>
        </td>
      </tr>
    </table>

    <!-- Line Items -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:32px;border-collapse:collapse;">
      <thead>
        <tr style="background:${styles.background.subtle};">
          <th style="padding:12px;text-align:left;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${styles.text.muted};">
            Description
          </th>
          <th style="padding:12px;text-align:center;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${styles.text.muted};">
            Qty
          </th>
          <th style="padding:12px;text-align:right;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${styles.text.muted};">
            Unit Price
          </th>
          <th style="padding:12px;text-align:right;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${styles.text.muted};">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        ${lineItemsHTML}
      </tbody>
    </table>

    <!-- Totals -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="right" style="margin-bottom:32px;width:280px;">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid ${styles.border};">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="font-size:14px;color:${styles.text.muted};">Subtotal</td>
              <td align="right" style="font-size:14px;color:${styles.text.secondary};font-weight:500;">${formatCurrency(invoice.subtotal)}</td>
            </tr>
          </table>
        </td>
      </tr>
      ${invoice.taxRate > 0 ? `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid ${styles.border};">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="font-size:14px;color:${styles.text.muted};">GST (${invoice.taxRate}%)</td>
              <td align="right" style="font-size:14px;color:${styles.text.secondary};font-weight:500;">${formatCurrency(invoice.taxAmount)}</td>
            </tr>
          </table>
        </td>
      </tr>
      ` : ""}
      <tr>
        <td style="padding:12px 0;border-top:2px solid ${styles.border};margin-top:8px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="font-size:18px;font-weight:700;color:${styles.text.primary};">Total</td>
              <td align="right" style="font-size:18px;font-weight:700;color:${styles.text.accent};">${formatCurrency(invoice.total)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${invoice.notes ? `
    <!-- Notes -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
      <tr>
        <td style="padding:16px;background:${styles.background.subtle};border-radius:8px;border-left:3px solid ${styles.text.accent};">
          <h3 style="margin:0 0 8px;font-size:14px;font-weight:600;color:${styles.text.accent};">
            Notes
          </h3>
          <p style="margin:0;font-size:14px;color:${styles.text.tertiary};line-height:1.6;white-space:pre-wrap;">${invoice.notes}</p>
        </td>
      </tr>
    </table>
    ` : ""}

    ${invoice.terms ? `
    <!-- Terms -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
      <tr>
        <td style="padding:16px;background:rgba(255,255,255,0.03);border-radius:8px;">
          <h3 style="margin:0 0 8px;font-size:14px;font-weight:600;color:${styles.text.muted};">
            Payment Terms
          </h3>
          <p style="margin:0;font-size:13px;color:${styles.text.muted};line-height:1.6;white-space:pre-wrap;">${invoice.terms}</p>
        </td>
      </tr>
    </table>
    ` : ""}
  `;

  return generateEmailWrapper(content, `Invoice ${invoice.invoiceNumber} - B2 Auto Detailing`);
}

export async function POST(request: NextRequest) {
  try {
    if (!isEmailConfigured() || !resend) {
      return NextResponse.json(
        { success: false, error: "Email service not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { invoiceId } = body;

    if (!invoiceId || typeof invoiceId !== "string") {
      return NextResponse.json(
        { success: false, error: "Invoice ID is required." },
        { status: 400 }
      );
    }

    const invoice = await getInvoice(invoiceId);

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found." },
        { status: 404 }
      );
    }

    // Update invoice status to "sent" BEFORE sending email
    const supabase = createServiceClient();
    const updateResult = await supabase
      .from("invoices")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", invoiceId);

    if (updateResult.error) {
      console.error("Error updating invoice status:", updateResult.error);
      return NextResponse.json(
        { success: false, error: "Failed to update invoice status." },
        { status: 500 }
      );
    }

    // Generate and send email
    const emailHTML = generateInvoiceEmailHTML(invoice);

    const emailResult = await resend.emails.send({
      from: EMAIL_FROM,
      to: [invoice.customerEmail],
      subject: `Invoice ${invoice.invoiceNumber} - B2 Auto Detailing`,
      html: emailHTML,
    });

    if (!emailResult.data) {
      // If email fails, we could revert the status, but for now just log it
      console.error("Failed to send email, but invoice status was already updated");
      return NextResponse.json(
        { success: false, error: "Failed to send email." },
        { status: 500 }
      );
    }

    // Revalidate invoices pages to reflect status change
    revalidatePath("/admin/invoices");
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: "Invoice sent successfully.",
      emailId: emailResult.data.id,
    });
  } catch (error) {
    console.error("Error sending invoice:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred while sending the invoice." },
      { status: 500 }
    );
  }
}
