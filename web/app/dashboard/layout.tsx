"use client";

import { useEffect, useState } from "react";
import "../globals.css";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark"); else root.classList.remove("dark");
  }, [darkMode]);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />
        <main className="px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

