"use client";

import type { ReactNode } from "react";
import { Navigation } from "@/components/landing/navigation";
import { FooterSection } from "@/components/landing/footer-section";

type AdminPageLayoutProps = {
  children: ReactNode;
  variant?: "dashboard" | "subpage";
  mainClassName?: string;
};

const mainDashboard =
  "flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8";

const mainSubpage =
  "flex-1 max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto w-full px-4 pt-10 pb-32";

export function AdminPageLayout({
  children,
  variant = "subpage",
  mainClassName,
}: AdminPageLayoutProps) {
  const shellClass =
    variant === "dashboard"
      ? "flex min-h-screen flex-col bg-slate-50 font-sans pb-24 text-slate-900"
      : "flex flex-col min-h-screen bg-[#f0f4f8]";

  return (
    <div className={shellClass}>
      <Navigation tipoUsuario="Admin" />
      <main className={mainClassName ?? (variant === "dashboard" ? mainDashboard : mainSubpage)}>
        {children}
      </main>
      <FooterSection />
    </div>
  );
}
