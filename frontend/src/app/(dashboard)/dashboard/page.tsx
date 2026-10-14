"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { PlusCircle, Loader2, HeartHandshake, TrendingDown, Sparkles, BookOpen, Calendar as CalendarIcon, ArrowRight, ShieldAlert, Wind, ClipboardCheck } from "lucide-react";
import api from "../../../lib/api";
import { StreakRewardCard } from "../../../components/StreakRewardCard";
import { BreathingModal } from "../../../components/BreathingModal";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function DashboardPage() {
  const { data: entries, error: entriesError } = useSWR("/api/journal/", fetcher);
  const { data: trajectoryData } = useSWR("/api/insights/trajectory?days=7", fetcher);
  const { data: user } = useSWR("/api/auth/me", fetcher);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);

  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  const getEmotionBadge = (emotion: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      joy: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-800 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800/60" },
      calm: { bg: "bg-[#EAEFE8] dark:bg-[#1D2D23]", text: "text-[#2D422B] dark:text-[#B4D4B0]", border: "border-[#D4DDD0] dark:border-[#2D4434]" },
      hopeful: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-800 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800/60" },
      stress: { bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-800 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800/60" },
      anxiety: { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-800 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800/60" },
      sadness: { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-800 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800/60" },
    };
    return colors[emotion?.toLowerCase()] || { bg: "bg-[#EAE3D6] dark:bg-[#1E2822]", text: "text-[#24201D] dark:text-[#F5EFE6]", border: "border-[#E5DDD0] dark:border-[#28362D]" };
  };

  const latestEntry = entries?.[0];
  const hasEntries = Array.isArray(entries) && entries.length > 0;
  const showNudge = trajectoryData?.show_nudge;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-[#24201D] dark:text-[#F5EFE6]">
            {greeting}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
          </h1>
          <p className="text-[#68625D] dark:text-[#A6A099] mt-1 text-sm sm:text-base">
            Take a gentle pause. How has your day been feeling?
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsBreathingOpen(true)}
            className="inline-flex items-center justify-center space-x-2 bg-[#FAF3E8] hover:bg-[#F5EAD7] dark:bg-[#261E14] dark:hover:bg-[#33271A] text-[#72531F] dark:text-[#F3D39B] border border-[#EBD2A4] dark:border-[#3D2C21] px-4 py-2.5 rounded-2xl font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Wind className="w-4 h-4 text-[#B58A46] dark:text-[#C89F58]" />
            <span>60s Breath</span>
          </button>

          <Link
            href="/journal"
            className="inline-flex items-center justify-center space-x-2 bg-[#94676E] hover:bg-[#83585F] dark:bg-[#BA8E94] dark:hover:bg-[#C99FA5] text-white dark:text-[#150D0F] px-5 py-2.5 rounded-2xl font-semibold shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Write New Reflection</span>
          </Link>
        </div>
      </header>

      {/* Mindful Streak & Consistency Widget */}
      <StreakRewardCard />

      {/* Therapy Copilot Quick Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#FCFAF9] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF3E8] dark:bg-[#261E14] border border-[#EBD2A4] dark:border-[#3D2C21] flex items-center justify-center text-[#B58A46] dark:text-[#C89F58] shrink-0">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-[#241F1D] dark:text-[#EFEAEB]">
              Therapy Copilot & Longitudinal Dossier
            </h3>
            <p className="text-xs text-[#726561] dark:text-[#9B8E91] mt-0.5">
              Standardized PHQ-9/GAD-7 check-ins and session prep summary ready for clinical review.
            </p>
          </div>
        </div>
        <Link
          href="/clinical"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#94676E] hover:bg-[#83535B] dark:bg-[#BA8E94] dark:hover:bg-[#C89F58] text-white dark:text-[#181113] text-xs font-bold transition-all shadow-2xs shrink-0"
        >
          <span>Open Clinical Dossier</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Gentle Wellbeing Nudge Banner (Section 17 requirement) */}
      {showNudge && (
        <div className="p-5 rounded-3xl bg-[#FAF3E8] dark:bg-[#261E14] border border-[#EBD2A4] dark:border-[#3D2C21] shadow-xs flex items-start space-x-4">
          <div className="p-2.5 rounded-2xl bg-[#FCFAF9] dark:bg-[#151112] text-[#B58A46] dark:text-[#C89F58] shrink-0 shadow-xs border border-[#EDE3DF] dark:border-[#2D2427]">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#241F1D] dark:text-[#EFEAEB] text-sm sm:text-base">
              A Gentle Check-in from Swadhyaya
            </h3>
            <p className="text-[#726561] dark:text-[#9B8E91] text-sm mt-1 leading-relaxed">
              {trajectoryData?.nudge_message ||
                "We noticed your reflections have felt progressively heavier over the past week. Remember to be gentle with yourself today. Taking a short walk, speaking with someone you trust, or resting can make a difference."}
            </p>
            <p className="text-xs text-[#726561]/80 dark:text-[#9B8E91] mt-2">
              Non-clinical observation derived from journal emotional trends.
            </p>
          </div>
        </div>
      )}

      {!entries && !entriesError ? (
        <div className="flex justify-center py-20 text-[#A6A099]">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : !hasEntries ? (
        /* Honest Empty State (Section 10 requirement) */
        <div className="bg-[#FFFFFF] dark:bg-[#1C1719] border border-dashed border-[#EDE3DF] dark:border-[#2D2427] rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs backdrop-blur-xs">
          <div className="w-16 h-16 bg-[#FAF3E8] dark:bg-[#261E14] text-[#B58A46] dark:text-[#C89F58] rounded-2xl mx-auto flex items-center justify-center border border-[#EDE3DF] dark:border-[#3D2C21]">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-serif font-semibold text-[#241F1D] dark:text-[#EFEAEB]">
            Your reflection space is ready
          </h2>
          <p className="text-[#726561] dark:text-[#9B8E91] text-sm leading-relaxed">
            Swadhyaya analyzes your authentic thoughts across English, Hindi, Tamil, Malayalam, and Telugu without fabricated data. Write your first reflection to begin your journey.
          </p>
          <div className="pt-2">
            <Link
              href="/journal"
              className="inline-flex items-center space-x-2 bg-[#94676E] hover:bg-[#83585F] dark:bg-[#BA8E94] dark:hover:bg-[#C99FA5] text-white dark:text-[#150D0F] px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Write First Entry</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Latest State */}
            <div className="bg-[#FFFFFF] dark:bg-[#1C1719] p-6 rounded-3xl shadow-xs border border-[#EDE3DF] dark:border-[#2D2427] flex flex-col justify-between transition-colors backdrop-blur-xs">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#726561] dark:text-[#9B8E91]">
                  Latest Emotional State
                </span>
                {latestEntry?.analysis ? (
                  <div className="mt-4 flex items-center space-x-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold border-2 ${
                        getEmotionBadge(latestEntry.analysis.primary_emotion).bg
                      } ${getEmotionBadge(latestEntry.analysis.primary_emotion).text} ${
                        getEmotionBadge(latestEntry.analysis.primary_emotion).border
                      }`}
                    >
                      {latestEntry.analysis.primary_emotion.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-xl capitalize text-[#241F1D] dark:text-[#EFEAEB]">
                        {latestEntry.analysis.primary_emotion}
                      </p>
                      <p className="text-xs text-[#726561] dark:text-[#9B8E91] capitalize">
                        Sentiment: {latestEntry.analysis.sentiment} ({latestEntry.analysis.emotion_score > 0 ? `+${latestEntry.analysis.emotion_score.toFixed(2)}` : latestEntry.analysis.emotion_score.toFixed(2)})
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#9B8E91] text-sm mt-3">No analysis available</p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-[#EDE3DF] dark:border-[#2D2427] text-xs text-[#726561] dark:text-[#9B8E91] flex justify-between">
                <span>Confidence: {latestEntry?.analysis?.confidence ? `${Math.round(latestEntry.analysis.confidence * 100)}%` : "N/A"}</span>
                <span>Language: {latestEntry?.analysis?.languages_detected ? JSON.parse(latestEntry.analysis.languages_detected)[0] : "English"}</span>
              </div>
            </div>

            {/* Total Reflections */}
            <div className="bg-[#FFFFFF] dark:bg-[#1C1719] p-6 rounded-3xl shadow-xs border border-[#EDE3DF] dark:border-[#2D2427] flex flex-col justify-between transition-colors backdrop-blur-xs">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#726561] dark:text-[#9B8E91]">
                  Journal Reflections
                </span>
                <div className="mt-4 flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-[#241F1D] dark:text-[#EFEAEB]">
                    {entries.length}
                  </span>
                  <span className="text-[#726561] dark:text-[#9B8E91] text-sm">entries recorded</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#EDE3DF] dark:border-[#2D2427] text-xs text-[#726561] dark:text-[#9B8E91] flex items-center justify-between">
                <span>Pattern: {trajectoryData?.observed_pattern || "Steady"}</span>
                <Link href="/insights" className="text-[#94676E] dark:text-[#BA8E94] font-semibold hover:underline inline-flex items-center gap-1">
                  View Insights <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Weekly Overview */}
            <div className="bg-[#FFFFFF] dark:bg-[#1C1719] p-6 rounded-3xl shadow-xs border border-[#EDE3DF] dark:border-[#2D2427] flex flex-col justify-between transition-colors backdrop-blur-xs">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#726561] dark:text-[#9B8E91]">
                  Weekly Trajectory
                </span>
                <p className="text-sm text-[#241F1D] dark:text-[#EFEAEB] mt-3 line-clamp-3 leading-relaxed">
                  {trajectoryData?.nudge_message ||
                    (trajectoryData?.observed_pattern === "Gradually Improving"
                      ? "Your reflections show encouraging upward emotional momentum over the past week."
                      : "Your reflections show a grounded and reflective rhythm this week.")}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#EDE3DF] dark:border-[#2D2427] text-xs text-[#726561] dark:text-[#9B8E91] flex justify-between">
                <span>Avg Valence: {trajectoryData?.average_score !== undefined ? (trajectoryData.average_score > 0 ? `+${trajectoryData.average_score}` : trajectoryData.average_score) : "0.0"}</span>
                <Link href="/calendar" className="text-[#94676E] dark:text-[#BA8E94] font-semibold hover:underline inline-flex items-center gap-1">
                  Calendar <CalendarIcon className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Latest Entry Card */}
          <div className="bg-[#FFFFFF] dark:bg-[#1C1719] p-7 rounded-3xl shadow-xs border border-[#EDE3DF] dark:border-[#2D2427] space-y-4 transition-colors backdrop-blur-xs">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#726561] dark:text-[#9B8E91]">
                Most Recent Reflection
              </h2>
              <span className="text-xs text-[#726561] dark:text-[#9B8E91]" suppressHydrationWarning>
                {new Date(latestEntry.created_at).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F1EE] dark:bg-[#151112] border border-[#EDE3DF] dark:border-[#2D2427] space-y-4">
              <h3 className="font-semibold text-lg text-[#241F1D] dark:text-[#EFEAEB]">
                {latestEntry.title || "Personal Reflection"}
              </h3>
              <p className="text-[#241F1D] dark:text-[#EFEAEB] leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                &ldquo;{latestEntry.content}&rdquo;
              </p>

              {latestEntry.analysis && (
                <div className="pt-4 border-t border-[#EDE3DF] dark:border-[#2D2427] flex flex-wrap gap-2 items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEmotionBadge(latestEntry.analysis.primary_emotion).bg} ${getEmotionBadge(latestEntry.analysis.primary_emotion).text} ${getEmotionBadge(latestEntry.analysis.primary_emotion).border}`}>
                    Primary: {latestEntry.analysis.primary_emotion}
                  </span>
                  {latestEntry.analysis.secondary_emotion && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF3E8] dark:bg-[#261E14] text-[#72531F] dark:text-[#F3D39B] border border-[#EBD2A4] dark:border-[#3D2C21]">
                      Secondary: {latestEntry.analysis.secondary_emotion}
                    </span>
                  )}
                  {latestEntry.analysis.languages_detected && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F4EAE6] dark:bg-[#251C1F] text-[#94676E] dark:text-[#BA8E94] border border-[#EDE3DF] dark:border-transparent">
                      {JSON.parse(latestEntry.analysis.languages_detected).join(" • ")}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <BreathingModal
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />
    </div>
  );
}
