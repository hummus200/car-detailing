"use server";

import { redirect } from "next/navigation";
import { resend, isEmailConfigured, getAdminEmail } from "@/lib/resend";
import { createServiceClient } from "@/lib/supabase/server";
import {
  EMAIL_FROM,
  generateBookingConfirmationEmail,
  generateBookingConfirmedEmail,
  generateAdminNotificationEmail,
} from "@/lib/email-templates";

export type BookingState = {
  errors?: {
    fullName?: string[];
    email?: string[];
    vehicleType?: string[];
    vehicleModel?: string[];
    vehicleYear?: string[];
    serviceType?: string[];
    city?: string[];
    postcode?: string[];
    preferredDate?: string[];
    preferredTime?: string[];
    message?: string[];
  };
  message?: string;
  success?: boolean;
};

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type BookingRecord = {
  id: string;
  fullName: string;
  email: string;
  vehicleType: string;
  vehicleModel: string;
  vehicleYear: string;
  serviceType: string;
  city: string;
  postcode: string;
  preferredDate: string;
  preferredTime: string;
  addons: string[];
  message?: string;
  status: BookingStatus;
  internalNotes?: string;
  createdAt: string;
};

function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function createBooking(
  _prevState: BookingState,
  formData: FormData
): Promise<BookingState> {
  const fullName = (formData.get("fullName") as string)?.trim() || "";
  const email = (formData.get("email") as string)?.trim() || "";
  const vehicleType = (formData.get("vehicleType") as string)?.trim() || "";
  const vehicleModel = (formData.get("vehicleModel") as string)?.trim() || "";
  const vehicleYear = (formData.get("vehicleYear") as string)?.trim() || "";
  const serviceType = (formData.get("serviceType") as string)?.trim() || "";
  const city = (formData.get("city") as string)?.trim() || "";
  const postcode = (formData.get("postcode") as string)?.trim() || "";
  const preferredDate = (formData.get("preferredDate") as string)?.trim() || "";
  const preferredTime = (formData.get("preferredTime") as string)?.trim() || "";
  const addons = formData.getAll("addons").map((value) => String(value));
  const message = (formData.get("message") as string)?.trim() || undefined;

  const errors: BookingState["errors"] = {};

  if (!fullName || fullName.length < 2) {
    errors.fullName = ["Full name must be at least 2 characters."];
  }
  if (!vehicleType || vehicleType.length < 2) {
    errors.vehicleType = ["Vehicle type / make is required."];
  }
  if (!vehicleModel || vehicleModel.length < 1) {
    errors.vehicleModel = ["Vehicle model is required."];
  }
  if (!vehicleYear) {
    errors.vehicleYear = ["Year of manufacture is required."];
  } else {
    const yearNum = Number(vehicleYear);
    const currentYear = new Date().getFullYear();
    if (
      !Number.isInteger(yearNum) ||
      yearNum < 1970 ||
      yearNum > currentYear + 1
    ) {
      errors.vehicleYear = [
        `Please enter a valid year between 1970 and ${currentYear + 1}.`,
      ];
    }
  }
  if (!email) {
    errors.email = ["Email is required."];
  } else if (!validateEmail(email)) {
    errors.email = ["Please enter a valid email address."];
  }
  if (!serviceType) {
    errors.serviceType = ["Please select a service type."];
  }
  if (!city) {
    errors.city = ["Please select a city."];
  }
  if (!postcode) {
    errors.postcode = ["Postcode is required."];
  } else if (!/^\d{4}$/.test(postcode)) {
    errors.postcode = ["Please enter a valid 4-digit postcode."];
  }
  if (!preferredDate) {
    errors.preferredDate = ["Preferred date is required."];
  }
  if (!preferredTime) {
    errors.preferredTime = ["Preferred time is required."];
  }

  if (preferredDate && preferredTime) {
    const combined = new Date(`${preferredDate}T${preferredTime}:00`);
    const now = new Date();

    if (Number.isNaN(combined.getTime())) {
      errors.preferredDate = ["Please select a valid date and time."];
    } else if (combined <= now) {
      errors.preferredTime = ["Please choose a time in the future."];
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors, success: false };
  }

  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        full_name: fullName,
        email,
        vehicle_make: vehicleType,
        vehicle_model: vehicleModel,
        vehicle_year: parseInt(vehicleYear, 10),
        service_type: serviceType,
        city,
        postcode,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        addons: addons.length > 0 ? addons : [],
        message: message || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return {
        errors: {},
        message: "Failed to create booking. Please try again.",
      };
    }

    if (isEmailConfigured() && resend) {
      const adminEmail = getAdminEmail();
      try {
        // Send admin notification
        await resend.emails.send({
          from: EMAIL_FROM,
          to: [adminEmail],
          subject: `New booking: ${fullName} – ${serviceType}`,
          html: generateAdminNotificationEmail({
            type: "booking",
            title: "New Booking Received",
            details: {
              Name: fullName,
              Email: email,
              Vehicle: `${vehicleYear} ${vehicleType} ${vehicleModel}`,
              Service: serviceType,
              Location: `${city} ${postcode}`,
              "Preferred slot": `${preferredDate} at ${preferredTime}`,
              "Additional services": addons.length ? addons.join(", ") : "None selected",
              ...(message ? { Message: message } : {}),
            },
          }),
        });

        // Send customer confirmation
        await resend.emails.send({
          from: EMAIL_FROM,
          to: [email],
          subject: "Booking Received – B2 Auto Detailing",
          html: generateBookingConfirmationEmail({
            fullName,
            email,
            serviceType,
            vehicleYear,
            vehicleType,
            vehicleModel,
            city,
            postcode,
            preferredDate,
            preferredTime,
            addons,
            message,
          }),
        });
      } catch (e) {
        console.error("Resend error:", e);
      }
    }

    // Return success state instead of redirecting to allow form clearing
    return {
      success: true,
      message: "Booking submitted successfully! We'll confirm your booking and get in touch soon.",
    };
  } catch (error) {
    console.error("Error creating booking:", error);
    return {
      errors: {},
      message: "An error occurred. Please try again.",
      success: false,
    };
  }
}

export async function getBookings(): Promise<BookingRecord[]> {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase error fetching bookings:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return [];
    }

    if (!data) {
      console.warn("⚠️ No data returned from bookings query");
      return [];
    }

    console.log(`✅ Fetched ${data.length} bookings from database`);
    
    const mapped = (data || []).map((booking: any) => ({
      id: booking.id,
      fullName: booking.full_name || "",
      email: booking.email || "",
      vehicleType: booking.vehicle_make || "",
      vehicleModel: booking.vehicle_model || "",
      vehicleYear: String(booking.vehicle_year || ""),
      serviceType: booking.service_type || "",
      city: booking.city || "",
      postcode: booking.postcode || "",
      preferredDate: booking.preferred_date || new Date().toISOString().split("T")[0],
      preferredTime: booking.preferred_time || "",
      addons: Array.isArray(booking.addons) ? booking.addons : [],
      message: booking.message || undefined,
      status: booking.status || "pending",
      internalNotes: booking.internal_notes || undefined,
      createdAt: booking.created_at || new Date().toISOString(),
    }));
    
    console.log(`✅ Mapped ${mapped.length} bookings successfully`);
    
    return mapped;
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return [];
  }
}

export async function confirmBooking(bookingId: string): Promise<
  | { ok: true }
  | { ok: false; error: string }
> {
  try {
    const supabase = createServiceClient();
    
    // Get booking first
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      return { ok: false, error: "Booking not found." };
    }

    if (booking.status === "confirmed") {
      return { ok: false, error: "Booking already confirmed." };
    }

    // Update status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", bookingId);

    if (updateError) {
      return { ok: false, error: "Failed to update booking." };
    }

    if (resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: [booking.email],
          subject: "Your booking is confirmed – B2 Auto Detailing",
          html: generateBookingConfirmedEmail({
            fullName: booking.full_name,
            serviceType: booking.service_type,
            vehicleYear: String(booking.vehicle_year),
            vehicleType: booking.vehicle_make,
            vehicleModel: booking.vehicle_model,
            preferredDate: booking.preferred_date,
            preferredTime: booking.preferred_time,
            city: booking.city,
            postcode: booking.postcode,
            addons: booking.addons || [],
          }),
        });
      } catch (e) {
        console.error("Resend error:", e);
        return { ok: false, error: "Failed to send confirmation email." };
      }
    }

    return { ok: true };
  } catch (error) {
    console.error("Error confirming booking:", error);
    return { ok: false, error: "An error occurred." };
  }
}

export async function updateBooking(
  id: string,
  data: Partial<{
    status: "pending" | "confirmed" | "completed" | "cancelled";
    preferredDate: string;
    preferredTime: string;
    internalNotes: string;
  }>
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = createServiceClient();
    
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.preferredDate !== undefined) updateData.preferred_date = data.preferredDate.trim();
    if (data.preferredTime !== undefined) updateData.preferred_time = data.preferredTime.trim();
    if (data.internalNotes !== undefined) {
      updateData.internal_notes = data.internalNotes.trim() || null;
    }

    const { error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", id);

    if (error) {
      return { ok: false, error: "Failed to update booking." };
    }

    return { ok: true };
  } catch (error) {
    console.error("Error updating booking:", error);
    return { ok: false, error: "An error occurred." };
  }
}
