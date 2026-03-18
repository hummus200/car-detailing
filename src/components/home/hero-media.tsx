"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { GlassCard } from "@/components/common/glass-card";

type Slide =
  | {
      id: string;
      type: "image";
      src: string;
      alt: string;
      label: string;
      description: string;
    }
  | {
      id: string;
      type: "video";
      src: string;
      poster?: string;
      alt: string;
      label: string;
      description: string;
    };

const slides: Slide[] = [
  {
    id: "ford-wash",
    type: "video",
    src: "/videos/ford wash.mp4",
    alt: "Ford being carefully washed by hand",
    label: "Exterior wash in progress",
    description: "Controlled-contact prewash and rinse on a real client vehicle.",
  },
  {
    id: "new-video-1",
    type: "video",
    src: "/videos/newVideo1.mp4",
    alt: "B2 Auto Detailing process",
    label: "Detail in progress",
    description: "Our standard in action—technical, minimal, repeatable.",
  },
  {
    id: "nissan-finish",
    type: "image",
    src: "/images/nissan finish.jpeg",
    alt: "Finished Nissan detail under soft lighting",
    label: "Delivery-ready finish",
    description: "Completed exterior detail with crisp reflections and clean wheels.",
  },
  {
    id: "interior-vacuum",
    type: "video",
    src: "/videos/neat vaccummking.mp4",
    alt: "Interior vacuuming and cabin reset",
    label: "Interior reset",
    description: "Systemised interior vacuum and touch-point reset for daily drivers.",
  },
  {
    id: "new-video-2",
    type: "video",
    src: "/videos/newvideo2.mp4",
    alt: "B2 Auto Detailing craft",
    label: "Studio process",
    description: "Investment-grade care—every vehicle, every time.",
  },
  {
    id: "red-suzuki",
    type: "video",
    src: "/videos/red suzuki vid.mp4",
    alt: "Red Suzuki during an exterior wash",
    label: "Compact, treated like a supercar",
    description: "Same calm, engineered process on every size and shape of car.",
  },
];

const AUTOPLAY_INTERVAL = 9000;

export function HeroMedia() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Advance slides automatically
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  const active = slides[activeIndex];

  return (
    <GlassCard className="relative overflow-hidden p-0">
      <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/40 to-transparent" />
      <div className="relative h-72 w-full sm:h-80 lg:h-96">
        {active.type === "image" ? (
          <Image
            src={active.src}
            alt={active.alt}
            fill
            sizes="(min-width: 1024px) 28rem, (min-width: 640px) 22rem, 100vw"
            priority
            className="object-cover"
          />
        ) : (
          <video
            key={active.id}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={active.src} type="video/mp4" />
          </video>
        )}

        {/* Bottom overlay copy */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-300/80">
            {active.label}
          </p>
          <p className="mt-1 text-sm text-gray-100">{active.description}</p>
        </div>

        {/* Slide indicators */}
        <div className="pointer-events-auto absolute inset-x-0 bottom-3 flex justify-center gap-2">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  isActive
                    ? "w-6 bg-yellow-300"
                    : "w-2 bg-white/30 hover:bg-white/60"
                }`}
              />
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}

