"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/common/glass-card";
import { submitContact, type ContactState } from "@/app/actions/contact";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-slate-900" />
      )}
      {pending ? "Sending…" : "Send message"}
    </Button>
  );
}

export function ContactForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState<ContactState, FormData>(
    submitContact,
    {}
  );

  // Clear form and show toast on success
  useEffect(() => {
    if (state.success) {
      toast.success("Message sent successfully!", {
        description: state.message || "We'll be in touch soon.",
      });
      
      // Clear form
      if (formRef.current) {
        formRef.current.reset();
      }
      
      // Refresh to show updated state
      setTimeout(() => {
        router.refresh();
      }, 500);
    } else if (state.message && !state.success) {
      toast.error("Failed to send message", {
        description: state.message,
      });
    }
  }, [state.success, state.message, router]);

  return (
    <GlassCard className="p-4 sm:p-6 md:p-8">
      {state.success && (
        <div className="mb-4 flex items-center gap-2 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          <p>{state.message}</p>
        </div>
      )}
      {state.message && !state.success && (
        <div className="mb-4 flex items-center gap-2 text-sm text-red-300">
          <AlertCircle className="h-4 w-4" />
          <p>{state.message}</p>
        </div>
      )}
      <form ref={formRef} action={formAction} className="space-y-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Your name"
            className="mt-2"
            aria-describedby={state.errors?.name ? "name-error" : undefined}
          />
          {state.errors?.name && (
            <p id="name-error" className="mt-1 text-sm text-red-400">
              {state.errors.name[0]}
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
          />
          {state.errors?.email && (
            <p id="email-error" className="mt-1 text-sm text-red-400">
              {state.errors.email[0]}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            name="subject"
            type="text"
            required
            placeholder="What is this about?"
            className="mt-2"
            aria-describedby={state.errors?.subject ? "subject-error" : undefined}
          />
          {state.errors?.subject && (
            <p id="subject-error" className="mt-1 text-sm text-red-400">
              {state.errors.subject[0]}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            name="message"
            required
            placeholder="Your message"
            rows={4}
            className="mt-2"
            aria-describedby={state.errors?.message ? "message-error" : undefined}
          />
          {state.errors?.message && (
            <p id="message-error" className="mt-1 text-sm text-red-400">
              {state.errors.message[0]}
            </p>
          )}
        </div>
        <SubmitButton />
      </form>
    </GlassCard>
  );
}
