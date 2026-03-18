"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/common/glass-card";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.error || "Invalid email or password.");
          return;
        }

        // Redirect to admin dashboard
        router.push("/admin");
        router.refresh();
      } catch (err) {
        setError("An error occurred. Please try again.");
        console.error("Login error:", err);
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] py-4 px-4">
      <GlassCard className="w-full max-w-md p-5 sm:p-6">
        <div className="text-center mb-4">
          <div className="flex justify-center mb-2">
            <Image
              src="/images/b2-auto-detailing-logo.png"
              alt="B2 Auto Detailing"
              width={180}
              height={48}
              className="h-9 w-auto sm:h-11"
            />
          </div>
          <h1 className="text-lg sm:text-xl font-semibold text-white mb-1">
            Admin Login
          </h1>
          <p className="text-xs text-gray-400">
            Sign in to access the admin dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="mt-2"
              disabled={isPending}
              autoComplete="email"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-2"
              disabled={isPending}
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            B2 Auto Detailing Admin Portal
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
