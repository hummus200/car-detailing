"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminHeader } from "@/components/admin/admin-header";

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string>("Admin");
  
  // Fetch user email client-side only when not on login page
  useEffect(() => {
    if (pathname === "/admin/login") return;
    
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
        }
      } catch (error) {
        // Silent fail - just use default "Admin"
      }
    };
    
    fetchUser();
  }, [pathname]);
  
  // Don't show admin nav/header on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <AdminHeader userEmail={userEmail} />
          <AdminNav />
          {children}
        </div>
      </div>
    </div>
  );
}
