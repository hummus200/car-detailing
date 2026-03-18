import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/common/glass-card";

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const kind = searchParams.type ?? "booking";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 sm:py-0">
      <GlassCard className="w-full max-w-md p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10">
          <CheckCircle2 className="h-6 w-6 text-emerald-300" />
        </div>
        <h1 className="text-2xl font-bold text-white">
          {kind === "booking" ? "Booking received" : "Message sent"}
        </h1>
        <p className="mt-2 text-gray-400">
          {kind === "booking"
            ? "We’ve captured your booking and will confirm the final details shortly."
            : "We’ve received your message and will respond as soon as possible."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to home</Link>
        </Button>
      </GlassCard>
    </div>
  );
}
