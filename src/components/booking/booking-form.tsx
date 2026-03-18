"use client";

import { useState, useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import { createBooking, type BookingState } from "@/app/actions/booking";

const serviceTypes = [
  "Standard package",
  "Extensive package",
  "Interior cleaning",
  "Exterior cleaning"
];

const cities = [
  "Perth",
  "Sydney",
  "Melbourne",
  "Brisbane",
  "Adelaide",
  "Canberra",
  "Hobart",
  "Darwin",
];

// Generate years from 1970 to current year + 1
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear + 1 - 1970 + 1 }, (_, i) => 
  String(currentYear + 1 - i)
);

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-slate-900" />
      )}
      {pending ? "Submitting…" : "Book now"}
    </Button>
  );
}

export function BookingForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [serviceType, setServiceType] = useState("");
  const [city, setCity] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [addons, setAddons] = useState<string[]>([]);
  const [preview, setPreview] = useState({
    fullName: "",
    email: "",
    vehicleType: "",
    vehicleModel: "",
    vehicleYear: "",
    city: "",
    postcode: "",
    serviceType: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
  });
  const [state, formAction] = useFormState<BookingState, FormData>(
    createBooking,
    {}
  );

  // Clear form and show toast on success
  useEffect(() => {
    if (state.success) {
      toast.success("Booking submitted successfully!", {
        description: state.message || "We'll confirm your booking and get in touch soon.",
      });
      
      // Clear all form state
      setServiceType("");
      setCity("");
      setVehicleYear("");
      setAddons([]);
      setPreview({
        fullName: "",
        email: "",
        vehicleType: "",
        vehicleModel: "",
        vehicleYear: "",
        city: "",
        postcode: "",
        serviceType: "",
        preferredDate: "",
        preferredTime: "",
        message: "",
      });
      
      // Clear form fields
      if (formRef.current) {
        formRef.current.reset();
      }
      
      // Refresh to show updated state
      setTimeout(() => {
        router.refresh();
      }, 500);
    } else if (state.message && !state.success) {
      toast.error("Failed to submit booking", {
        description: state.message,
      });
    }
  }, [state.success, state.message, router]);

  return (
    <GlassCard className="p-4 sm:p-6 md:p-8">
      <form ref={formRef} action={formAction} className="space-y-5 sm:space-y-6">
        <input type="hidden" name="serviceType" value={serviceType} />
        <input type="hidden" name="city" value={city} />
        <input type="hidden" name="vehicleYear" value={vehicleYear} />
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            required
            placeholder="Your name"
            className="mt-2"
            aria-describedby={state.errors?.fullName ? "fullName-error" : undefined}
            onChange={(e) =>
              setPreview((p) => ({ ...p, fullName: e.target.value }))
            }
          />
          {state.errors?.fullName && (
            <p id="fullName-error" className="mt-1 text-sm text-red-400">
              {state.errors.fullName[0]}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="mt-2"
            aria-describedby={state.errors?.email ? "email-error" : undefined}
            onChange={(e) =>
              setPreview((p) => ({ ...p, email: e.target.value }))
            }
          />
          {state.errors?.email && (
            <p id="email-error" className="mt-1 text-sm text-red-400">
              {state.errors.email[0]}
            </p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <Label htmlFor="vehicleType">Vehicle make / type</Label>
            <Input
              id="vehicleType"
              name="vehicleType"
              type="text"
              required
              placeholder="e.g. Porsche, dual-cab ute"
              className="mt-2"
              aria-describedby={
                state.errors?.vehicleType ? "vehicleType-error" : undefined
              }
              onChange={(e) =>
                setPreview((p) => ({ ...p, vehicleType: e.target.value }))
              }
            />
            {state.errors?.vehicleType && (
              <p id="vehicleType-error" className="mt-1 text-sm text-red-400">
                {state.errors.vehicleType[0]}
              </p>
            )}
          </div>
          <div className="sm:col-span-1">
            <Label htmlFor="vehicleModel">Model</Label>
            <Input
              id="vehicleModel"
              name="vehicleModel"
              type="text"
              required
              placeholder="e.g. 911 Turbo S"
              className="mt-2"
              aria-describedby={
                state.errors?.vehicleModel ? "vehicleModel-error" : undefined
              }
              onChange={(e) =>
                setPreview((p) => ({ ...p, vehicleModel: e.target.value }))
              }
            />
            {state.errors?.vehicleModel && (
              <p id="vehicleModel-error" className="mt-1 text-sm text-red-400">
                {state.errors.vehicleModel[0]}
              </p>
            )}
          </div>
          <div className="sm:col-span-1">
            <Label htmlFor="vehicleYear">Year</Label>
            <Select
              value={vehicleYear}
              onValueChange={(value) => {
                setVehicleYear(value);
                setPreview((p) => ({ ...p, vehicleYear: value }));
              }}
              required
            >
              <SelectTrigger id="vehicleYear" className="mt-2">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.vehicleYear && (
              <p id="vehicleYear-error" className="mt-1 text-sm text-red-400">
                {state.errors.vehicleYear[0]}
              </p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Select
            value={city}
            onValueChange={(value) => {
              setCity(value);
              setPreview((p) => ({ ...p, city: value }));
            }}
          >
            <SelectTrigger id="city" className="mt-2">
              <SelectValue placeholder="Select your city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.city && (
            <p className="mt-1 text-sm text-red-400">
              {state.errors.city[0]}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="postcode">Postcode</Label>
          <Input
            id="postcode"
            name="postcode"
            type="text"
            inputMode="numeric"
            pattern="\d{4}"
            required
            placeholder="e.g. 6000"
            className="mt-2"
            aria-describedby={
              state.errors?.postcode ? "postcode-error" : undefined
            }
            onChange={(e) =>
              setPreview((p) => ({ ...p, postcode: e.target.value }))
            }
          />
          {state.errors?.postcode && (
            <p id="postcode-error" className="mt-1 text-sm text-red-400">
              {state.errors.postcode[0]}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="serviceType">Service type</Label>
          <Select
            value={serviceType}
            onValueChange={(value) => {
              setServiceType(value);
              setPreview((p) => ({ ...p, serviceType: value }));
            }}
          >
            <SelectTrigger id="serviceType" className="mt-2">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {serviceTypes.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.serviceType && (
            <p className="mt-1 text-sm text-red-400">
              {state.errors.serviceType[0]}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="preferredDate">Preferred date</Label>
          <Input
            id="preferredDate"
            name="preferredDate"
            type="date"
            required
            className="mt-2"
            aria-describedby={
              state.errors?.preferredDate ? "preferredDate-error" : undefined
            }
            onChange={(e) =>
              setPreview((p) => ({ ...p, preferredDate: e.target.value }))
            }
          />
          {state.errors?.preferredDate && (
            <p id="preferredDate-error" className="mt-1 text-sm text-red-400">
              {state.errors.preferredDate[0]}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="preferredTime">Preferred time</Label>
          <Input
            id="preferredTime"
            name="preferredTime"
            type="time"
            required
            className="mt-2"
            aria-describedby={
              state.errors?.preferredTime ? "preferredTime-error" : undefined
            }
            onChange={(e) =>
              setPreview((p) => ({ ...p, preferredTime: e.target.value }))
            }
          />
          {state.errors?.preferredTime && (
            <p id="preferredTime-error" className="mt-1 text-sm text-red-400">
              {state.errors.preferredTime[0]}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="message">Message (optional)</Label>
          <Textarea
            id="message"
            name="message"
            placeholder="Any special requests or notes"
            rows={3}
            className="mt-2"
            onChange={(e) =>
              setPreview((p) => ({ ...p, message: e.target.value }))
            }
          />
          {state.errors?.message && (
            <p className="mt-1 text-sm text-red-400">
              {state.errors.message[0]}
            </p>
          )}
        </div>
        <div>
          <Label>Additional services (optional)</Label>
          <div className="mt-2 grid gap-2 text-xs text-gray-300 sm:grid-cols-2">
            {[
              "Badge & emblem cleaning",
              "Floor mat deep cleaning",
              "Trunk deep cleaning",
              "Air vent cleaning",
              "Seat stain spot treatment",
              "Headliner / roof cleaning",
              "Bug & tar removal (front end)",
            ].map((item) => (
              <label key={item} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="addons"
                  value={item}
                  className="h-3.5 w-3.5 rounded border border-white/30 bg-transparent"
                  onChange={(e) => {
                    setAddons((current) =>
                      e.target.checked
                        ? [...current, item]
                        : current.filter((a) => a !== item)
                    );
                  }}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
        <SubmitButton />
      </form>
      <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-gray-300 sm:text-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-300/80">
          Booking summary
        </p>
        {preview.fullName || preview.serviceType || preview.city ? (
          <div className="mt-3 space-y-1.5">
            <p>
              <span className="text-gray-400">Client:</span>{" "}
              <span className="text-gray-100">
                {preview.fullName || "—"}
              </span>
            </p>
            <p>
              <span className="text-gray-400">Vehicle:</span>{" "}
              <span className="text-gray-100">
                {preview.vehicleYear && preview.vehicleType && preview.vehicleModel
                  ? `${preview.vehicleYear} ${preview.vehicleType} ${preview.vehicleModel}`
                  : "—"}
              </span>
            </p>
            <p>
              <span className="text-gray-400">Service:</span>{" "}
              <span className="text-gray-100">
                {preview.serviceType || "—"}
              </span>
            </p>
            <p>
              <span className="text-gray-400">Location:</span>{" "}
              <span className="text-gray-100">
                {preview.city || preview.postcode
                  ? `${preview.city || ""} ${preview.postcode || ""}`.trim()
                  : "—"}
              </span>
            </p>
            <p>
              <span className="text-gray-400">Preferred slot:</span>{" "}
              <span className="text-gray-100">
                {preview.preferredDate && preview.preferredTime
                  ? `${preview.preferredDate} at ${preview.preferredTime}`
                  : "—"}
              </span>
            </p>
            <p>
              <span className="text-gray-400">Add-ons:</span>{" "}
              <span className="text-gray-100">
                {addons.length ? addons.join(", ") : "None selected"}
              </span>
            </p>
          </div>
        ) : (
          <p className="mt-3 text-[11px] text-gray-400">
            Start filling the form to see a quick summary of your booking
            before you submit.
          </p>
        )}
      </div>
    </GlassCard>
  );
}
