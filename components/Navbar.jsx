"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Plus, LayoutDashboard } from "lucide-react";

export default function Navbar({ totalRecords = 0 }) {
  const path = usePathname();

  const tabs = [
    { href: "/form",      label: "Nueva Iniciativa", icon: <Plus size={16} /> },
    { href: "/dashboard", label: "Dashboard",        icon: <LayoutDashboard size={16} />, badge: totalRecords },
  ];

  return (
    <nav style={{ background: "white", borderBottom: "1px solid #E2E8F0", position: "sticky", top: 0, zIndex: 40 }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-6 py-3">
          <div style={{ background: "linear-gradient(135deg,#1E3A5F,#2563EB)" }}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <Layers size={16} color="white" />
          </div>
          <span style={{ fontFamily: "'Playfair Display',serif", color: "#0F172A" }}
            className="font-bold text-lg hidden sm:block">
            InnoTrack
          </span>
        </div>

        {/* Tabs */}
        {tabs.map((tab) => {
          const active = path === tab.href;
          return (
            <Link key={tab.href} href={tab.href}
              style={{
                borderBottom: active ? "3px solid #2563EB" : "3px solid transparent",
                color: active ? "#2563EB" : "#64748B",
                textDecoration: "none",
              }}
              className="flex items-center gap-2 px-4 py-3.5 text-sm font-semibold transition hover:text-slate-800">
              {tab.icon}
              {tab.label}
              {tab.badge > 0 && (
                <span style={{ background: "#2563EB", color: "white" }}
                  className="text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
