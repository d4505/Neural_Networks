"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  BookOpen,
  BarChart2,
  Calendar,
  Settings,
  Moon,
  Sun,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";
import clsx from "clsx";
import { useEffect, useState } from "react";
import useSWR from "swr";
import api from "../lib/api";

import { AntaraLogoIcon } from "./AntaraLogo";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Journal", href: "/journal", icon: BookOpen },
  { name: "Insights", href: "/insights", icon: BarChart2 },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const { data: user } = useSWR("/api/auth/me", fetcher);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {}
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  return (
    <div className="flex flex-col w-64 border-r border-[#C8D7C5] dark:border-[#28362D] bg-[#E8EFE6]/90 dark:bg-[#141C17] h-screen p-5 shrink-0 select-none transition-colors duration-200 backdrop-blur-xs">
      {/* Brand Header */}
      <Link href="/dashboard" className="flex items-center space-x-3 mb-8 px-2 group">
        <div className="w-11 h-11 bg-gradient-to-tr from-[#D6E3D3] to-[#E4ECE2] dark:from-[#1D2D23] dark:to-[#141C17] border border-[#C8D7C5] dark:border-[#28362D] rounded-2xl flex items-center justify-center p-1.5 shadow-xs group-hover:scale-105 transition-transform shrink-0">
          <AntaraLogoIcon size={30} />
        </div>
        <div>
          <span className="text-2xl font-serif font-bold tracking-tight text-[#24201D] dark:text-[#F5EFE6] block leading-none">
            Antara
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-[#5F7E5C] dark:text-[#86A882] block mt-1">
            Multilingual Journal
          </span>
        </div>
      </Link>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl transition-all text-sm",
                isActive
                  ? "bg-[#D6E3D3] dark:bg-[#1D2D23] text-[#263825] dark:text-[#B4D4B0] font-bold shadow-xs border border-[#C8D7C5]/70 dark:border-transparent"
                  : "text-[#596557] dark:text-[#A6A099] hover:bg-[#DCE7DA]/70 dark:hover:bg-[#1E2822] hover:text-[#24201D] dark:hover:text-[#F5EFE6] font-medium"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Mini Bar & Actions */}
      <div className="pt-4 border-t border-[#C8D7C5] dark:border-[#28362D] space-y-2">
        {user && (
          <div className="px-3 py-2 rounded-2xl bg-[#DCE7DA]/80 dark:bg-[#19221C] flex items-center space-x-3 mb-2 border border-[#C8D7C5]/60 dark:border-[#28362D]/50">
            <div className="w-8 h-8 rounded-full bg-[#5F7E5C] dark:bg-[#86A882] text-white dark:text-[#0F1713] flex items-center justify-center text-xs font-bold font-serif shadow-2xs">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-[#24201D] dark:text-[#F5EFE6] truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-[#596557] dark:text-[#A6A099] truncate">{user.email}</p>
            </div>
          </div>
        )}

        {mounted && (
          <button
            onClick={() => {
              const currentTheme = resolvedTheme || theme;
              const nextTheme = currentTheme === "dark" ? "light" : "dark";
              setTheme(nextTheme);
            }}
            className="flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-[#68625D] dark:text-[#A6A099] bg-[#EAE3D6]/60 dark:bg-[#19221C] hover:bg-[#EAEFE8] dark:hover:bg-[#1D2D23] hover:text-[#24201D] dark:hover:text-[#F5EFE6] border border-[#E5DDD0] dark:border-[#28362D] w-full transition-all cursor-pointer"
          >
            {(resolvedTheme || theme) === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-[#5F7E5C] shrink-0" />
            )}
            <span className="truncate">{(resolvedTheme || theme) === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
          </button>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-3.5 py-2 rounded-2xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 w-full transition-colors text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
