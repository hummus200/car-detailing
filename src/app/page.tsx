import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/common/glass-card";
import { HeroMedia } from "@/components/home/hero-media";

const workMedia = [
  {
    title: "Ford exterior detail",
    description:
      "Careful hand wash and rinse on a real client Ford, with attention to lower panels and wheels.",
    type: "video" as const,
    src: "/videos/ford wash.mp4",
  },
  {
    title: "Nissan — finished exterior",
    description:
      "Completed Nissan detail with crisp reflections and fully dressed tyres.",
    type: "image" as const,
    src: "/images/nissan finish.jpeg",
  },
  {
    title: "Red Suzuki in process",
    description:
      "Compact car getting the same systemised process as a supercar, mid-wash.",
    type: "video" as const,
    src: "/videos/red suzuki vid.mp4",
  },
  {
    title: "Interior reset",
    description:
      "Neat, methodical interior vacuuming and cabin touch-point reset.",
    type: "video" as const,
    src: "/videos/neat vaccummking.mp4",
  },
  {
    title: "Detail in progress",
    description:
      "Our standard in action—technical, minimal, repeatable across every job.",
    type: "video" as const,
    src: "/videos/newVideo1.mp4",
  },
  {
    title: "Red Suzuki — final look",
    description:
      "Clean, glossy finish on a red Suzuki after an exterior session.",
    type: "image" as const,
    src: "/images/red suzuki.jpeg",
  },
  {
    title: "Ford detail",
    description:
      "Hand-finished exterior on a client Ford—wash, decontamination and protection.",
    type: "image" as const,
    src: "/images/ford.jpeg",
  },
  {
    title: "Studio process",
    description:
      "Investment-grade care—the same calm, engineered process every time.",
    type: "video" as const,
    src: "/videos/newvideo2.mp4",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-[-120px] h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="absolute -right-40 bottom-[-160px] h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:flex-row lg:items-center lg:gap-12 lg:px-8">
          <div className="max-w-xl space-y-5 sm:space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-300/80">
              B2 Auto Detailing • Studio-grade detailing
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
              Premium detailing,
              <span className="block bg-gradient-to-r from-yellow-300 via-amber-300 to-slate-100 bg-clip-text text-transparent">
                engineered like a system.
              </span>
            </h1>
            <p className="text-sm text-gray-300 sm:text-base lg:text-lg">
              We implement a standard where others perform a task. Our craft is
              technical, our signature is minimal, our promise is
              immutable—Australia-wide from coast to coast. This is
              investment-grade care for automotive capital.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-3 sm:gap-4">
              <Button asChild size="lg">
                <Link href="/book">Book a premium detail</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Talk with our team</Link>
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap gap-4 text-xs text-gray-400 sm:mt-6 sm:gap-6 sm:text-sm">
              <div>
                <p className="font-medium text-gray-200">98%</p>
                <p className="text-xs uppercase tracking-wide">
                  repeat bookings
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-200">Nationwide</p>
                <p className="text-xs uppercase tracking-wide">
                  metro & regional support
                </p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md lg:max-w-lg">
            <HeroMedia />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">
            Why teams choose B2 Auto Detailing
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-gray-400">
            Calm, systemised processes with measurable outcomes on every
            vehicle.
          </p>
          <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Technical precision",
                description:
                  "Documented, repeatable processes built with engineering discipline.",
              },
              {
                title: "Consistent outcomes",
                description:
                  "Before/after benchmarks and photography for every service.",
              },
              {
                title: "Fleet ready",
                description:
                  "From single vehicles to full commercial fleets, anywhere in Australia.",
              },
            ].map((feature) => (
              <GlassCard key={feature.title} className="p-6">
                <h3 className="text-base font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-300">
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="pb-5 flex flex-wrap items-end justify-between gap-3 sm:pb-6 sm:gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white sm:text-2xl">
                Real work, real vehicles
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Actual client vehicles in Perth, treated with the same calm,
                engineered process every time.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/book">Get an estimate</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {workMedia.map((item) => (
              <GlassCard key={item.title} className="overflow-hidden p-0">
                <div className="relative h-56">
                  {item.type === "image" ? (
                    <Image
                      src={item.src}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 hover:scale-105"
                    />
                  ) : (
                    <video
                      className="h-full w-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    >
                      <source src={item.src} type="video/mp4" />
                    </video>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-300/80">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-200">
                      {item.description}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-black/20 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="pb-6 text-center sm:pb-8">
            <h2 className="text-xl font-semibold text-white sm:text-3xl">
              Car detailing prices
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Working hours 7am – 6pm. All prices in AUD. Final quote may vary by vehicle size and condition.
            </p>
          </div>
          <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <GlassCard className="flex min-h-0 flex-col p-5 sm:p-6">
              <div className="border-b border-white/10 pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow-300/90">
                  Standard package
                </p>
                <div className="mt-3 space-y-0.5">
                  <p className="text-base font-semibold text-white sm:text-lg">
                    Hatch back / sedan from <span className="text-yellow-300/95">$149</span>
                  </p>
                  <p className="text-sm font-medium text-green-400/95">
                    Medium / 4WD / SUV from $249
                  </p>
                </div>
              </div>
              <ul className="mt-4 flex-1 space-y-2 text-[13px] leading-relaxed text-gray-300">
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Wheel & tire cleaning – tire shine</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Pre-wash & hand wash</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Microfiber towel dry</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Deep vacuum</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Scrubbing and cleaning all surfaces</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Interior trim dressing</li>
              </ul>
            </GlassCard>
            <GlassCard className="flex min-h-0 flex-col p-5 sm:p-6">
              <div className="border-b border-white/10 pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow-300/90">
                  Extensive package
                </p>
                <div className="mt-3 space-y-0.5">
                  <p className="text-base font-semibold text-white sm:text-lg">
                    Hatch back / sedan from <span className="text-yellow-300/95">$299</span>
                  </p>
                  <p className="text-sm font-medium text-green-400/95">
                    Medium / 4WD / SUV from $399
                  </p>
                </div>
              </div>
              <ul className="mt-4 flex-1 space-y-2 text-[13px] leading-relaxed text-gray-300">
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Wheel & tire cleaning – tire shine</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Pre-wash & hand wash</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Deep vacuum</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Scrubbing and cleaning all surfaces</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Deep cleaning</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Steam cleaning</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Interior trim dressing</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Microfiber towel dry</li>
              </ul>
            </GlassCard>
            <GlassCard className="flex min-h-0 flex-col p-5 sm:p-6">
              <div className="border-b border-white/10 pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow-300/90">
                  Interior cleaning
                </p>
                <p className="mt-3 text-base font-semibold text-white sm:text-lg">
                  From <span className="text-yellow-300/95">$139 – $219</span>
                </p>
              </div>
              <ul className="mt-4 flex-1 space-y-2 text-[13px] leading-relaxed text-gray-300">
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Deep vacuum</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Scrubbing and cleaning all surfaces</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Interior window cleaning</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Steam cleaning</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Stain removal – floor mat & seat</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Interior trim dressing</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Odour removal</li>
              </ul>
            </GlassCard>
            <GlassCard className="flex min-h-0 flex-col p-5 sm:p-6">
              <div className="border-b border-white/10 pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow-300/90">
                  Exterior cleaning
                </p>
                <p className="mt-3 text-base font-semibold text-white sm:text-lg">
                  From <span className="text-yellow-300/95">$89 – $199</span>
                </p>
              </div>
              <ul className="mt-4 flex-1 space-y-2 text-[13px] leading-relaxed text-gray-300">
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Wheel & tire cleaning – tire shine</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Pre-wash & hand wash</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Exterior window cleaning</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Exterior trim clean</li>
                <li className="flex gap-2"><span className="text-yellow-300/60">—</span> Microfiber towel dry</li>
              </ul>
            </GlassCard>
          </div>
          <p className="mt-6 text-center text-xs text-gray-500">
            Share your vehicle and preferred package on the booking form — we&apos;ll confirm the exact time window and pricing once we review your request.
          </p>
        </div>
      </section>
    </div>
  );
}
