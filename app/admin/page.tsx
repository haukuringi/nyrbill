import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { AdminApp } from "@/components/admin-app";

export const metadata: Metadata = {
  title: "Stjórnborð · Nýrbíll.is",
  robots: { index: false, follow: false },
};

export default function AdminSida() {
  return (
    <>
      <SiteHeader baklink />
      <main className="mx-auto max-w-5xl px-4 py-5">
        <h2 className="mb-4 text-2xl font-extrabold tracking-tight">Stjórnborð</h2>
        <AdminApp />
      </main>
    </>
  );
}
