"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  BookOpen,
  ClipboardCheck,
  BarChart2,
  Calendar,
  Award,
  Settings,
  Wind,
  Flame,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "next-themes";
import clsx from "clsx";
import { useEffect, useState, useRef } from "react";
import useSWR from "swr";
import api from "../lib/api";

import { AntaraLogoIcon } from "./AntaraLogo";
import { BreathingModal } from "./BreathingModal";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Journal", href: "/journal", icon: BookOpen },
  { name: "Therapy Copilot", href: "/clinical", icon: ClipboardCheck, badge: "NEW" },
  { name: "Insights", href: "/insights", icon: BarChart2 },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Rewards", href: "/rewards", icon: Award },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: user } = useSWR("/api/auth/me", fetcher);
  const { data: streakData } = useSWR("/api/insights/streaks", fetcher);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Click outside listener for user dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      <header className="sticky top-0 z-40 w-full border-b border-[#EDE3DF] dark:border-[#2D2427] bg-[#FCFAF8]/90 dark:bg-[#161314]/90 backdrop-blur-md transition-colors select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Name */}
          <Link href="/dashboard" className="flex items-center space-x-3 group shrink-0">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#FAF3E8] to-[#F7F1EE] dark:from-[#261E14] dark:to-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] rounded-2xl flex items-center justify-center p-1.5 shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <AntaraLogoIcon size={26} />
            </div>
            <div>
              <span className="text-xl font-serif font-bold tracking-tight text-[#241F1D] dark:text-[#EFEAEB] block leading-none">
                Swadhyaya
              </span>
              <span className="text-[9px] uppercase font-semibold tracking-widest text-[#94676E] dark:text-[#BA8E94] block mt-1">
                Clinical Affect Copilot
              </span>
            </div>
          </Link>

          {/* Center Navigation Pills (Desktop >= lg) */}
          <nav className="hidden lg:flex items-center space-x-1 bg-[#F7F1EE]/70 dark:bg-[#1C1719]/70 p-1.5 rounded-2xl border border-[#EDE3DF]/80 dark:border-[#2D2427]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isRewards = item.href === "/rewards";

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative",
                    isActive
                      ? "bg-[#FCFAF9] dark:bg-[#2A1D20] text-[#94676E] dark:text-[#BA8E94] shadow-xs border border-[#EDE3DF] dark:border-transparent font-bold"
                      : "text-[#726561] dark:text-[#9B8E91] hover:text-[#241F1D] dark:hover:text-[#EFEAEB] hover:bg-[#FCFAF9]/50 dark:hover:bg-[#22181B]"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.name}</span>

                  {item.badge && (
                    <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded-md bg-[#FAF3E8] dark:bg-[#261E14] text-[#72531F] dark:text-[#F3D39B] border border-[#EBD2A4] dark:border-[#3D2C21]">
                      {item.badge}
                    </span>
                  )}

                  {isRewards && streakData?.current_streak > 0 && (
                    <span className="flex items-center space-x-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#FAF3E8] text-[#72531F] dark:bg-[#261E14] dark:text-[#F3D39B] border border-[#EBD2A4] dark:border-[#3D2C21]">
                      <Flame className="w-2.5 h-2.5 text-[#B58A46] dark:text-[#C89F58] fill-current" />
                      <span>{streakData.current_streak}d</span>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Quick 60s Breath Reset Button */}
            <button
              onClick={() => setIsBreathingOpen(true)}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FAF3E8] hover:bg-[#F5EAD7] dark:bg-[#261E14] dark:hover:bg-[#33271A] border border-[#EBD2A4] dark:border-[#3D2C21] text-xs font-semibold text-[#72531F] dark:text-[#F3D39B] shadow-2xs transition-all cursor-pointer group"
              title="60-Second Mindful Breathing Pause"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#B58A46] dark:bg-[#C89F58] animate-pulse" />
              <Wind className="w-3.5 h-3.5 text-[#B58A46] dark:text-[#C89F58] group-hover:rotate-45 transition-transform" />
              <span>60s Breath</span>
            </button>

            {/* Theme Toggle (Sun / Moon) */}
            {mounted && (
              <button
                onClick={() => {
                  const currentTheme = resolvedTheme || theme;
                  const nextTheme = currentTheme === "dark" ? "light" : "dark";
                  setTheme(nextTheme);
                }}
                className="p-2 rounded-xl text-[#726561] dark:text-[#9B8E91] bg-[#F7F1EE] dark:bg-[#1C1719] hover:bg-[#F4EAE6] dark:hover:bg-[#251B1E] border border-[#EDE3DF] dark:border-[#2D2427] transition-all cursor-pointer shadow-2xs"
                title="Toggle Light / Dark Sanctuary Theme"
                aria-label="Toggle theme"
              >
                {(resolvedTheme || theme) === "dark" ? (
                  <Sun className="w-4 h-4 text-[#C89F58]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#94676E]" />
                )}
              </button>
            )}

            {/* User Profile & Menu Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 p-1 pl-1.5 pr-2 rounded-2xl bg-[#F7F1EE] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] hover:border-[#94676E] transition-all cursor-pointer shadow-2xs"
              >
                <div className="w-7 h-7 rounded-xl bg-[#94676E] dark:bg-[#BA8E94] text-white dark:text-[#150D0F] flex items-center justify-center text-xs font-bold font-serif shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="hidden md:inline-block text-xs font-semibold text-[#241F1D] dark:text-[#EFEAEB] max-w-[90px] truncate">
                  {user?.name?.split(" ")[0] || "Account"}
                </span>
                <ChevronDown className="w-3 h-3 text-[#726561] dark:text-[#9B8E91]" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#FCFAF9] dark:bg-[#191416] border border-[#EDE3DF] dark:border-[#2D2427] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3 border-b border-[#EDE3DF] dark:border-[#2D2427] mb-1">
                    <p className="text-xs font-bold text-[#241F1D] dark:text-[#EFEAEB] truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-[10px] text-[#726561] dark:text-[#9B8E91] truncate font-mono mt-0.5">
                      {user?.email || ""}
                    </p>
                  </div>

                  <Link
                    href="/settings"
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-[#726561] dark:text-[#9B8E91] hover:bg-[#FAF3E8] dark:hover:bg-[#261E14] hover:text-[#241F1D] dark:hover:text-[#EFEAEB] transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Settings & Privacy</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button (< lg) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#F7F1EE] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] text-[#726561] dark:text-[#9B8E91] cursor-pointer"
              aria-label="Open mobile navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-16 z-50 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-[#FCFAF8] dark:bg-[#161314] border-b border-[#EDE3DF] dark:border-[#2D2427] p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              
              {/* Quick Breath on Mobile */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsBreathingOpen(true);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#FAF3E8] dark:bg-[#261E14] border border-[#EBD2A4] dark:border-[#3D2C21] text-xs font-bold text-[#72531F] dark:text-[#F3D39B] cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-[#B58A46] dark:text-[#C89F58]" />
                  <span>Start 60-Second Mindful Breath</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FCFAF9] dark:bg-[#151012] border border-[#EBD2A4]">
                  60s
                </span>
              </button>

              {/* Mobile Nav Links */}
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all",
                        isActive
                          ? "bg-[#F4EAE6] dark:bg-[#2A1D20] text-[#94676E] dark:text-[#BA8E94] font-bold border border-[#EDE3DF] dark:border-[#332529]"
                          : "text-[#726561] dark:text-[#9B8E91] hover:bg-[#FAF3E8]/50 dark:hover:bg-[#1E1719]"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4 text-[#94676E] dark:text-[#BA8E94]" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#FAF3E8] dark:bg-[#261E14] text-[#72531F] dark:text-[#F3D39B] border border-[#EBD2A4]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Settings & Logout */}
              <div className="pt-3 border-t border-[#EDE3DF] dark:border-[#2D2427] space-y-1">
                <Link
                  href="/settings"
                  className="flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-medium text-[#726561] dark:text-[#9B8E91] hover:bg-[#FAF3E8] dark:hover:bg-[#1E1719]"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings & Preferences</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Breathing Modal */}
      <BreathingModal
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />
    </>
  );
}
