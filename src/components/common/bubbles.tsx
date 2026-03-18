export function BubblesBackground() {
  const bubbles = [
    { size: "w-24 h-24", left: "8%", bottom: "10%", delay: "0s", duration: "20s" },
    { size: "w-16 h-16", left: "22%", bottom: "25%", delay: "3s", duration: "22s" },
    { size: "w-20 h-20", left: "42%", bottom: "5%", delay: "6s", duration: "18s" },
    { size: "w-28 h-28", left: "58%", bottom: "18%", delay: "2s", duration: "24s" },
    { size: "w-14 h-14", left: "75%", bottom: "30%", delay: "5s", duration: "19s" },
    { size: "w-18 h-18", left: "88%", bottom: "8%", delay: "8s", duration: "21s" },
    { size: "w-12 h-12", left: "35%", bottom: "12%", delay: "4s", duration: "17s" },
    { size: "w-22 h-22", left: "68%", bottom: "22%", delay: "1s", duration: "23s" },
  ] as const;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {bubbles.map((b, index) => (
        <div
          key={index}
          className={`bubble absolute ${b.size} rounded-full bg-yellow-300/25 shadow-[0_0_40px_rgba(253,224,71,0.15)]`}
          style={{
            left: b.left,
            bottom: b.bottom,
            animationDelay: b.delay,
            animationDuration: b.duration,
          }}
        />
      ))}
    </div>
  );
}

