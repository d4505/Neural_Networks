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
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import clsx from "clsx";
import { useEffect, useState } from "react";
import useSWR from "swr";
import api from "../lib/api";

import { AntaraLogoIcon } from "./AntaraLogo";
import { BreathingModal } from "./BreathingModal";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

interface NavGroup {
  section: string;
  items: {
    name: string;
    href: string;
    icon: any;
    badge?: string;
    isClinical?: boolean;
  }[];
}

const navGroups: NavGroup[] = [
  {
    section: "Reflect & Journal",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "My Journal", href: "/journal", icon: BookOpen },
    ],
  },
  {
    section: "Clinical Affect Copilot",
    items: [
      { name: "Therapy Copilot", href: "/clinical", icon: ClipboardCheck, badge: "NEW", isClinical: true },
      { name: "Affect Insights", href: "/insights", icon: BarChart2 },
      { name: "Calendar Archive", href: "/calendar", icon: Calendar },
    ],
  },
  {
    section: "Growth & Practice",
    items: [
      { name: "Streaks & Rewards", href: "/rewards", icon: Award },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: user } = useSWR("/api/auth/me", fetcher);
  const { data: streakData } = useSWR("/api/insights/streaks", fetcher);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {}
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  const navContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <Link href="/dashboard" className="flex items-center space-x-3 mb-6 px-2 group">
        <div className="w-11 h-11 bg-gradient-to-tr from-[#FAF3E8] to-[#F7F1EE] dark:from-[#261E14] dark:to-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] rounded-2xl flex items-center justify-center p-1.5 shadow-xs group-hover:scale-105 transition-transform shrink-0">
          <AntaraLogoIcon size={30} />
        </div>
        <div>
          <span className="text-2xl font-serif font-bold tracking-tight text-[#241F1D] dark:text-[#EFEAEB] block leading-none">
            Swadhyaya
          </span>
          <span className="text-[9.5px] uppercase font-semibold tracking-wider text-[#94676E] dark:text-[#BA8E94] block mt-1">
            Clinical Affect Copilot
          </span>
        </div>
      </Link>

      {/* Mindful Breathing Reset Card */}
      <div className="mb-5">
        <button
          onClick={() => setIsBreathingOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FAF3E8] to-[#F7F1EE] dark:from-[#261E14] dark:to-[#1C1719] border border-[#EBD2A4] dark:border-[#3D2C21] text-xs font-semibold text-[#72531F] dark:text-[#F3D39B] shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-2 h-2 rounded-full bg-[#B58A46] dark:bg-[#C89F58] animate-pulse" />
            <div className="flex items-center space-x-1.5">
              <Wind className="w-3.5 h-3.5 text-[#B58A46] dark:text-[#C89F58] group-hover:rotate-45 transition-transform" />
              <span className="font-medium">Mindful Reset</span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FCFAF9] dark:bg-[#151012] border border-[#EBD2A4] dark:border-[#3D2C21] text-[#72531F] dark:text-[#DEAF60]">
            60s
          </span>
        </button>
      </div>

      {/* Grouped Navigation Links */}
      <nav className="flex-1 space-y-5 overflow-y-auto pr-1">
        {navGroups.map((group) => (
          <div key={group.section} className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#726561]/70 dark:text-[#9B8E91]/70 px-3 block mb-1">
              {group.section}
            </span>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isRewards = item.href === "/rewards";

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      "flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all text-xs font-medium group",
                      isActive
                        ? "bg-gradient-to-r from-[#F4EAE6] to-[#FAF3E8]/60 dark:from-[#2A1D20] dark:to-[#1E1719] text-[#94676E] dark:text-[#BA8E94] font-bold shadow-xs border border-[#EDE3DF] dark:border-[#332529]"
                        : "text-[#726561] dark:text-[#9B8E91] hover:bg-[#FAF3E8]/60 dark:hover:bg-[#1E1719] hover:text-[#241F1D] dark:hover:text-[#EFEAEB]"
                    )}
                  >
                    <div className="flex items-center space-x-2.5">
                      {isActive && (
                        <div className="w-1 h-3.5 rounded-full bg-[#94676E] dark:bg-[#BA8E94]" />
                      )}
                      <Icon
                        className={clsx(
                          "w-4 h-4 transition-transform group-hover:scale-110",
                          isActive
                            ? "text-[#94676E] dark:text-[#BA8E94]"
                            : "text-[#726561] dark:text-[#9B8E91]"
                        )}
                      />
                      <span>{item.name}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#FAF3E8] dark:bg-[#261E14] text-[#72531F] dark:text-[#F3D39B] border border-[#EBD2A4] dark:border-[#3D2C21]">
                          {item.badge}
                        </span>
                      )}

                      {isRewards && streakData?.current_streak > 0 && (
                        <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF3E8] text-[#72531F] dark:bg-[#261E14] dark:text-[#F3D39B] border border-[#EBD2A4] dark:border-[#3D2C21]">
                          <Flame className="w-2.5 h-2.5 text-[#B58A46] dark:text-[#C89F58] fill-current" />
                          <span>{streakData.current_streak}d</span>
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Mini Bar & Actions Dock */}
      <div className="pt-4 border-t border-[#EDE3DF] dark:border-[#2D2427] space-y-2.5 mt-auto">
        {user && (
          <div className="px-3 py-2 rounded-2xl bg-[#F7F1EE] dark:bg-[#1C1719] flex items-center space-x-3 border border-[#EDE3DF]/80 dark:border-[#2D2427]/60">
            <div className="w-8 h-8 rounded-full bg-[#94676E] dark:bg-[#BA8E94] text-white dark:text-[#150D0F] flex items-center justify-center text-xs font-bold font-serif shadow-2xs shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-[#241F1D] dark:text-[#EFEAEB] truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-[#726561] dark:text-[#9B8E91] truncate font-mono">
                {user.email}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {mounted && (
            <button
              onClick={() => {
                const currentTheme = resolvedTheme || theme;
                const nextTheme = currentTheme === "dark" ? "light" : "dark";
                setTheme(nextTheme);
              }}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#726561] dark:text-[#9B8E91] bg-[#F7F1EE] dark:bg-[#1C1719] hover:bg-[#F4EAE6] dark:hover:bg-[#241B1E] hover:text-[#241F1D] dark:hover:text-[#EFEAEB] border border-[#EDE3DF] dark:border-[#2D2427] transition-all cursor-pointer"
              title="Toggle Light / Dark Sanctuary Mode"
            >
              {(resolvedTheme || theme) === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#C89F58] shrink-0" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#94676E] shrink-0" />
                  <span>Dark</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/50 transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Navbar Header (Visible only on mobile screens < md) */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[#EDE3DF] dark:border-[#2D2427] bg-[#F8F3F1]/95 dark:bg-[#161314]/95 backdrop-blur-xs sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-gradient-to-tr from-[#FAF3E8] to-[#F7F1EE] dark:from-[#261E14] dark:to-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] rounded-xl flex items-center justify-center p-1 shrink-0">
            <AntaraLogoIcon size={20} />
          </div>
          <div>
            <span className="text-lg font-serif font-bold text-[#241F1D] dark:text-[#EFEAEB] leading-none block">
              Swadhyaya
            </span>
            <span className="text-[8px] uppercase tracking-wider text-[#94676E] dark:text-[#BA8E94] font-semibold block">
              Clinical Copilot
            </span>
          </div>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl border border-[#EDE3DF] dark:border-[#2D2427] bg-[#FCFAF9] dark:bg-[#1C1719] text-[#726561] dark:text-[#9B8E91] cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-72 bg-[#F8F3F1] dark:bg-[#161314] h-full p-5 shadow-2xl border-r border-[#EDE3DF] dark:border-[#2D2427] flex flex-col">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-[#726561] dark:text-[#9B8E91] hover:bg-[#EDE3DF] dark:hover:bg-[#2D2427]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r border-[#EDE3DF] dark:border-[#2D2427] bg-[#F8F3F1]/95 dark:bg-[#161314] h-screen p-5 shrink-0 select-none transition-colors duration-200 backdrop-blur-xs">
        {navContent}
      </div>

      {/* Mindful Breathing Modal */}
      <BreathingModal
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />
    </>
  );
}
