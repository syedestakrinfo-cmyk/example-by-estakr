import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui";
import { AdminShell } from "@/components/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin – China Garden", robots: { index: false, follow: false } };

/**
 * Route protection is handled by src/middleware.ts (edge) so that
 * /admin/login renders standalone while every other /admin route
 * requires a valid session cookie.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AdminShell>{children}</AdminShell>
    </ToastProvider>
  );
}
