"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquare,
  CreditCard,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/contacts", label: "Contacts", icon: MessageSquare },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div
      role="tablist"
      className="flex flex-wrap gap-0.5 rounded-xl border border-white/10 bg-white/5 p-1"
    >
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-yellow-400/15 text-yellow-300 shadow-sm"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
