"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminHeaderProps = {
  userEmail?: string | null;
};

export function AdminHeader({ userEmail }: AdminHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/admin/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10">
          <User className="h-4 w-4 text-gray-300" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            {userEmail || "Admin"}
          </p>
          <p className="text-xs text-gray-400">Administrator</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="text-gray-400 hover:text-white"
      >
        <LogOut className="h-4 w-4 mr-2" />
        {isLoggingOut ? "Signing out..." : "Sign Out"}
      </Button>
    </div>
  );
}
