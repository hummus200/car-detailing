import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/book", label: "Book" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50",
        "bg-white/5 backdrop-blur-xl border-b border-white/10"
      )}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold tracking-tight text-white hover:text-gray-200 transition-colors sm:text-lg"
        >
          <span className="relative inline-flex h-9 w-auto items-center sm:h-10">
            <Image
              src="/images/b2-auto-detailing-logo.png"
              alt="B2 Auto Detailing logo"
              width={160}
              height={42}
              priority
              className="h-full w-auto object-contain drop-shadow-[0_0_12px_rgba(0,0,0,0.6)]"
            />
          </span>
        </Link>
        <ul className="flex items-center gap-4 sm:gap-6">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-xs font-medium text-gray-300 hover:text-white transition-colors sm:text-sm"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
