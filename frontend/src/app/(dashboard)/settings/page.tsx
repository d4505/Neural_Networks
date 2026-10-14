"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import useSWR from "swr";
import {
  User as UserIcon,
  Download,
  Database,
  Trash2,
  Moon,
  Sun,
  Monitor,
  ShieldCheck,
  PhoneCall,
  Loader2,
  FileText,
  FileJson,
} from "lucide-react";
import clsx from "clsx";
import api from "../../../lib/api";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: user, mutate } = useSWR("/api/auth/me", fetcher);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConsentToggle = async () => {
    if (!user) return;
    try {
      const newConsent = !user.consent_model_training;
      await api.post("/api/auth/consent", { consent: newConsent });
      mutate();
    } catch (err) {
      alert("Failed to update consent preferences.");
    }
  };

  const handleExportData = async (format: "json" | "csv") => {
    setIsExporting(format);
    try {
      if (format === "csv") {
        const response = await api.get("/api/auth/export?format=csv", {
          responseType: "blob",
        });
        const blob = new Blob([response.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `swadhyaya_journal_reflections_${user?.id || "export"}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const response = await api.get("/api/auth/export?format=json");
        const jsonStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `swadhyaya_journal_reflections_${user?.id || "export"}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      alert("Failed to export journal data.");
    } finally {
      setIsExporting(null);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.delete("/api/auth/account");
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/login");
    } catch (err) {
      alert("Failed to delete account.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#241F1D] dark:text-[#EFEAEB]">
          Settings & Privacy
        </h1>
        <p className="text-[#726561] dark:text-[#9B8E91] text-sm mt-1">
          Manage your account profile, theme appearance, data sovereignty, and AI consent.
        </p>
      </div>

      {/* Profile Section */}
      <section className="bg-[#FCFAF9] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] rounded-3xl p-6 sm:p-7 shadow-xs space-y-6 transition-colors backdrop-blur-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#F7EFF1] dark:bg-[#2D2226] text-[#94676E] dark:text-[#BA8E94] border border-[#EDE3DF] dark:border-[#3B282F]">
            <UserIcon className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-serif font-semibold text-[#241F1D] dark:text-[#EFEAEB]">
            User Profile
          </h2>
        </div>

        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#94676E] to-[#B58A46] text-white flex items-center justify-center text-2xl font-bold font-serif shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-[#241F1D] dark:text-[#EFEAEB]">
              {user?.name || "Loading..."}
            </h3>
            <p className="text-sm text-[#726561] dark:text-[#9B8E91]">{user?.email}</p>
            <p className="text-xs text-[#9B8E91] mt-1">
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Recently"}
            </p>
          </div>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="bg-[#FCFAF9] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] rounded-3xl p-6 sm:p-7 shadow-xs space-y-6 transition-colors backdrop-blur-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#FAF3E8] dark:bg-[#261E14] text-[#B58A46] dark:text-[#C89F58] border border-[#EBD2A4] dark:border-[#3D2C21]">
            <Sun className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-serif font-semibold text-[#241F1D] dark:text-[#EFEAEB]">
            Theme & Appearance
          </h2>
        </div>

        {mounted && (
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setTheme("light")}
              className={clsx(
                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer",
                theme === "light"
                  ? "border-[#94676E] bg-[#F7EFF1] text-[#94676E] shadow-xs"
                  : "border-[#EDE3DF] dark:border-[#2D2427] hover:border-[#94676E] text-[#726561] dark:text-[#9B8E91]"
              )}
            >
              <Sun className="w-6 h-6 mb-2" />
              <span className="text-xs sm:text-sm font-semibold">Light (Rosewater)</span>
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={clsx(
                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer",
                theme === "dark"
                  ? "border-[#BA8E94] bg-[#2D2226] text-[#BA8E94] shadow-xs"
                  : "border-[#EDE3DF] dark:border-[#2D2427] hover:border-[#BA8E94] text-[#726561] dark:text-[#9B8E91]"
              )}
            >
              <Moon className="w-6 h-6 mb-2" />
              <span className="text-xs sm:text-sm font-semibold">Dark (Midnight Rose)</span>
            </button>

            <button
              onClick={() => setTheme("system")}
              className={clsx(
                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer",
                theme === "system"
                  ? "border-[#94676E] dark:border-[#BA8E94] bg-[#FAF3E8] dark:bg-[#261E14] text-[#B58A46] dark:text-[#C89F58]"
                  : "border-[#EDE3DF] dark:border-[#2D2427] hover:border-[#94676E] text-[#726561] dark:text-[#9B8E91]"
              )}
            >
              <Monitor className="w-6 h-6 mb-2" />
              <span className="text-xs sm:text-sm font-semibold">System Default</span>
            </button>
          </div>
        )}
      </section>

      {/* Privacy & Data Ownership */}
      <section className="bg-[#FCFAF9] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] rounded-3xl p-6 sm:p-7 shadow-xs space-y-6 transition-colors backdrop-blur-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#F7EFF1] dark:bg-[#2D2226] text-[#94676E] dark:text-[#BA8E94] border border-[#EDE3DF] dark:border-[#3B282F]">
            <Database className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-serif font-semibold text-[#241F1D] dark:text-[#EFEAEB]">
            Data Ownership & Export
          </h2>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#FAF3E8]/80 dark:bg-[#161314] border border-[#EBD2A4] dark:border-[#3D2C21]">
            <div>
              <h3 className="font-semibold text-[#241F1D] dark:text-[#EFEAEB] text-sm">
                Export Journal Reflections
              </h3>
              <p className="text-xs text-[#726561] dark:text-[#9B8E91] mt-0.5">
                Download all your reflections and AI emotion metrics in portable JSON or CSV.
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => handleExportData("json")}
                disabled={isExporting !== null}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#FCFAF9] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] rounded-xl text-xs font-semibold text-[#241F1D] dark:text-[#EFEAEB] hover:bg-[#F7EFF1] dark:hover:bg-[#2D2226] shadow-xs cursor-pointer transition-colors"
              >
                {isExporting === "json" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileJson className="w-3.5 h-3.5" />}
                <span>JSON Export</span>
              </button>

              <button
                onClick={() => handleExportData("csv")}
                disabled={isExporting !== null}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#FCFAF9] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] rounded-xl text-xs font-semibold text-[#241F1D] dark:text-[#EFEAEB] hover:bg-[#F7EFF1] dark:hover:bg-[#2D2226] shadow-xs cursor-pointer transition-colors"
              >
                {isExporting === "csv" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                <span>CSV Export</span>
              </button>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 pt-2">
            <div className="space-y-1">
              <h3 className="font-semibold text-[#241F1D] dark:text-[#EFEAEB] text-sm">
                Model Training Data Consent
              </h3>
              <p className="text-xs text-[#726561] dark:text-[#9B8E91] leading-relaxed max-w-xl">
                Allow your encrypted, de-identified reflections to be anonymously included in fine-tuning multilingual emotional understanding models. No personally identifiable data is ever used.
              </p>
            </div>

            <button
              onClick={handleConsentToggle}
              className={clsx(
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none cursor-pointer",
                user?.consent_model_training ? "bg-[#94676E] dark:bg-[#BA8E94]" : "bg-[#EDE3DF] dark:bg-[#2D2427]"
              )}
            >
              <span
                className={clsx(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs",
                  user?.consent_model_training ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Crisis Helplines Directory */}
      <section className="bg-[#FCFAF9] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4 transition-colors backdrop-blur-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#F7EFF1] dark:bg-[#2D2226] text-[#94676E] dark:text-[#BA8E94] border border-[#EDE3DF] dark:border-[#3B282F]">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-serif font-semibold text-[#241F1D] dark:text-[#EFEAEB]">
            Emergency & Mental Health Helplines
          </h2>
        </div>

        <p className="text-xs text-[#726561] dark:text-[#9B8E91] leading-relaxed">
          Swadhyaya is a personal self-reflection journal and does not provide clinical interventions. If you or someone you know is in crisis, free, confidential 24/7 human support is always available:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-[#FAF3E8]/80 dark:bg-[#161314] border border-[#EBD2A4] dark:border-[#3D2C21]">
            <p className="font-semibold text-xs text-[#241F1D] dark:text-[#EFEAEB]">KIRAN (Govt. of India)</p>
            <p className="text-[#94676E] dark:text-[#BA8E94] font-mono text-sm font-semibold mt-0.5">1800-599-0019</p>
            <p className="text-[11px] text-[#726561] dark:text-[#9B8E91]">24/7 Multilingual Support</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF3E8]/80 dark:bg-[#161314] border border-[#EBD2A4] dark:border-[#3D2C21]">
            <p className="font-semibold text-xs text-[#241F1D] dark:text-[#EFEAEB]">Tele-MANAS</p>
            <p className="text-[#94676E] dark:text-[#BA8E94] font-mono text-sm font-semibold mt-0.5">14416 / 1800 891 4416</p>
            <p className="text-[11px] text-[#726561] dark:text-[#9B8E91]">Toll-Free National Helpline</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF3E8]/80 dark:bg-[#161314] border border-[#EBD2A4] dark:border-[#3D2C21]">
            <p className="font-semibold text-xs text-[#241F1D] dark:text-[#EFEAEB]">Vandrevala Foundation</p>
            <p className="text-[#94676E] dark:text-[#BA8E94] font-mono text-sm font-semibold mt-0.5">+91 9999 666 555</p>
            <p className="text-[11px] text-[#726561] dark:text-[#9B8E91]">24/7 Crisis Counseling</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF3E8]/80 dark:bg-[#161314] border border-[#EBD2A4] dark:border-[#3D2C21]">
            <p className="font-semibold text-xs text-[#241F1D] dark:text-[#EFEAEB]">AASRA</p>
            <p className="text-[#94676E] dark:text-[#BA8E94] font-mono text-sm font-semibold mt-0.5">+91-9820466726</p>
            <p className="text-[11px] text-[#726561] dark:text-[#9B8E91]">24/7 Suicide Prevention</p>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <h2 className="text-lg font-serif font-bold text-rose-700 dark:text-rose-400">
          Danger Zone
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm text-[#241F1D] dark:text-[#EFEAEB]">
              Permanently Delete Account
            </p>
            <p className="text-xs text-[#726561] dark:text-[#9B8E91] mt-0.5">
              Permanently deletes your account, personal data, and all journal reflections. This action cannot be undone.
            </p>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-[#FCFAF9] dark:bg-[#1C1719] text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl text-xs sm:text-sm font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shadow-xs self-start sm:self-auto shrink-0 cursor-pointer"
            >
              Delete Account
            </button>
          ) : (
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-2 bg-[#FAF3E8] dark:bg-[#261E14] text-[#241F1D] dark:text-[#EFEAEB] rounded-xl text-xs font-semibold cursor-pointer border border-[#EBD2A4] dark:border-[#3D2C21]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
