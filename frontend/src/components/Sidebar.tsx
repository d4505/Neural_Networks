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
  Award,
  Wind,
  Flame,
  ClipboardCheck,
} from "lucide-react";
import { useTheme } from "next-themes";
import clsx from "clsx";
import { useEffect, useState } from "react";
import useSWR from "swr";
import api from "../lib/api";

import { AntaraLogoIcon } from "./AntaraLogo";
import { BreathingModal } from "./BreathingModal";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Journal", href: "/journal", icon: BookOpen },
  { name: "Therapy Copilot", href: "/clinical", icon: ClipboardCheck },
  { name: "Insights", href: "/insights", icon: BarChart2 },
  { name: "Streaks & Rewards", href: "/rewards", icon: Award },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);

  const { data: user } = useSWR("/api/auth/me", fetcher);
  const { data: streakData } = useSWR("/api/insights/streaks", fetcher);

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
    <>
      <div className="flex flex-col w-64 border-r border-[#EDE3DF] dark:border-[#2D2427] bg-[#F8F3F1]/95 dark:bg-[#161314] h-screen p-5 shrink-0 select-none transition-colors duration-200 backdrop-blur-xs">
        {/* Brand Header */}
        <Link href="/dashboard" className="flex items-center space-x-3 mb-6 px-2 group">
          <div className="w-11 h-11 bg-gradient-to-tr from-[#FAF3E8] to-[#F7F1EE] dark:from-[#261E14] dark:to-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] rounded-2xl flex items-center justify-center p-1.5 shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <AntaraLogoIcon size={30} />
          </div>
          <div>
            <span className="text-2xl font-serif font-bold tracking-tight text-[#241F1D] dark:text-[#EFEAEB] block leading-none">
              Swadhyaya
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-[#94676E] dark:text-[#BA8E94] block mt-1">
              Multilingual Journal
            </span>
          </div>
        </Link>

        {/* Quick Mindful Breathing Button */}
        <div className="mb-4">
          <button
            onClick={() => setIsBreathingOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl bg-[#FAF3E8] hover:bg-[#F5EAD7] dark:bg-[#261E14] dark:hover:bg-[#33271A] border border-[#EBD2A4] dark:border-[#3D2C21] text-xs font-semibold text-[#72531F] dark:text-[#F3D39B] shadow-2xs transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-2">
              <Wind className="w-4 h-4 text-[#B58A46] dark:text-[#C89F58] group-hover:rotate-45 transition-transform" />
              <span>Mindful Breath</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FCFAF9] dark:bg-[#161314] text-[#726561] dark:text-[#9B8E91] border border-[#EDE3DF] dark:border-[#2D2427]">
              60s
            </span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isRewards = item.href === "/rewards";

            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all text-sm",
                  isActive
                    ? "bg-[#F4EAE6] dark:bg-[#251C1F] text-[#94676E] dark:text-[#BA8E94] font-bold shadow-xs border border-[#EDE3DF] dark:border-transparent"
                    : "text-[#726561] dark:text-[#9B8E91] hover:bg-[#F7F1EE] dark:hover:bg-[#1E1719] hover:text-[#241F1D] dark:hover:text-[#EFEAEB] font-medium"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>

                {isRewards && streakData?.current_streak > 0 && (
                  <span className="flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAF3E8] text-[#72531F] dark:bg-[#261E14] dark:text-[#F3D39B] border border-[#EBD2A4] dark:border-[#3D2C21]">
                    <Flame className="w-3 h-3 text-[#B58A46] dark:text-[#C89F58] fill-current" />
                    <span>{streakData.current_streak}d</span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

      {/* User Mini Bar & Actions */}
      <div className="pt-4 border-t border-[#EDE3DF] dark:border-[#2D2427] space-y-2">
        {user && (
          <div className="px-3 py-2 rounded-2xl bg-[#F7F1EE] dark:bg-[#1C1719] flex items-center space-x-3 mb-2 border border-[#EDE3DF]/80 dark:border-[#2D2427]/60">
            <div className="w-8 h-8 rounded-full bg-[#94676E] dark:bg-[#BA8E94] text-white dark:text-[#150D0F] flex items-center justify-center text-xs font-bold font-serif shadow-2xs">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-[#241F1D] dark:text-[#EFEAEB] truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-[#726561] dark:text-[#9B8E91] truncate">{user.email}</p>
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
            className="flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-[#726561] dark:text-[#9B8E91] bg-[#F7F1EE] dark:bg-[#1C1719] hover:bg-[#F4EAE6] dark:hover:bg-[#241B1E] hover:text-[#241F1D] dark:hover:text-[#EFEAEB] border border-[#EDE3DF] dark:border-[#2D2427] w-full transition-all cursor-pointer"
          >
            {(resolvedTheme || theme) === "dark" ? (
              <Sun className="w-4 h-4 text-[#C89F58] shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-[#94676E] shrink-0" />
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

    <BreathingModal
      isOpen={isBreathingOpen}
      onClose={() => setIsBreathingOpen(false)}
    />
  </>
  );
}
