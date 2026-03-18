"use client";

import { useTransition } from "react";
import { CheckCircle } from "lucide-react";

type Props = {
  bookingId: string;
  onConfirm: (formData: FormData) => Promise<void>;
};

export function ConfirmBookingButton({ bookingId, onConfirm }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        startTransition(() => onConfirm(fd));
      }}
      className="inline-block"
    >
      <input type="hidden" name="bookingId" value={bookingId} />
      <button
        type="submit"
        title="Confirm & send email"
        disabled={isPending}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
      >
        <CheckCircle className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
