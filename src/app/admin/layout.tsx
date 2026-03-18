import type { ReactNode } from "react";
import { AdminLayoutWrapper } from "./layout-wrapper";

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Simple - no server-side auth, just wrap with layout wrapper
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
