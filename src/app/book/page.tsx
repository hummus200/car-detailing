import Link from "next/link";
import Image from "next/image";
import { BookingForm } from "@/components/booking/booking-form";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/common/glass-card";

export default function BookPage() {
  return (
    <div className="min-h-screen">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            Book a service
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-400 sm:text-base">
            Tell us what you need. We'll confirm your booking and get in touch.
          </p>
        </div>
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="mx-auto w-full max-w-lg">
            <BookingForm />
          </div>
          <GlassCard className="flex h-full flex-col p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
              Service packages
            </p>
            <ul className="mt-4 space-y-4 text-sm text-gray-300">
              <li>
                <p className="font-semibold text-gray-100">Standard package</p>
                <p className="mt-1 text-xs text-gray-400">
                  Hatch back / sedan from $149 • Medium / 4WD / SUV from $249
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Wheel & tire cleaning, pre-wash & hand wash, deep vacuum, scrubbing and cleaning all surfaces, interior trim dressing, microfiber towel dry.
                </p>
              </li>
              <li>
                <p className="font-semibold text-gray-100">Extensive package</p>
                <p className="mt-1 text-xs text-gray-400">
                  Hatch back / sedan from $299 • Medium / 4WD / SUV from $399
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  All standard services plus deep cleaning, steam cleaning, and comprehensive interior/exterior treatment.
                </p>
              </li>
              <li>
                <p className="font-semibold text-gray-100">Interior cleaning</p>
                <p className="mt-1 text-xs text-gray-400">
                  From $139 – $219
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Deep vacuum, scrubbing and cleaning all surfaces, interior window cleaning, steam cleaning, stain removal, interior trim dressing, odour removal.
                </p>
              </li>
              <li>
                <p className="font-semibold text-gray-100">Exterior cleaning</p>
                <p className="mt-1 text-xs text-gray-400">
                  From $89 – $199
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Wheel & tire cleaning, pre-wash & hand wash, exterior window cleaning, exterior trim clean, microfiber towel dry.
                </p>
              </li>
            </ul>
            <div className="mt-6 border-t border-white/10 pt-4 text-xs text-gray-400 space-y-2">
              <p className="font-semibold text-gray-200">
                Before you book
              </p>
              <ul className="space-y-1 list-disc pl-4">
                <li>
                  Have your <span className="font-medium">vehicle make, model and year</span> handy so we can match the right process.
                </li>
                <li>
                  Standard bookings assume safe off-street access and running water / power where required.
                </li>
                <li>
                  Remove valuables and loose items from the cabin and boot where possible.
                </li>
                <li>
                  We&apos;ll confirm the exact time window and pricing once we review your request.
                </li>
              </ul>
            </div>
            <div className="mt-6 flex justify-center lg:mt-8">
              <Image
                src="/images/b2-auto-detailing-logo.png"
                alt="B2 Auto Detailing"
                width={320}
                height={96}
                className="h-28 w-auto max-w-[580px] object-contain opacity-95 sm:h-24 sm:max-w-[320px] lg:h-56 lg:max-w-[660px]"
              />
            </div>
          </GlassCard>
        </div>
        <div className="mt-8 flex justify-center">
          <Button asChild variant="ghost">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
