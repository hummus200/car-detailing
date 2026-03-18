"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: "rgba(2, 6, 23, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#f9fafb",
        },
        className: "sonner-toast",
      }}
    />
  );
}
