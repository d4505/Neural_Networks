"use client";

import { useState } from "react";
import useSWR from "swr";
import { Award, Flame, Zap, ShieldCheck, Wind, CheckCircle2, Lock, BookOpen } from "lucide-react";
import clsx from "clsx";
import api from "../../../lib/api";
import { BreathingModal } from "../../../components/BreathingModal";
import { BadgeIcon } from "../../../components/BadgeIcon";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function RewardsPage() {
  const { data: streakData, isLoading } = useSWR("/api/insights/streaks", fetcher);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);

  const categories = [
    { id: "all", label: "All Badges" },
    { id: "streak", label: "Streaks" },
    { id: "milestone", label: "Milestones" },
    { id: "expression", label: "Expression" },
    { id: "mindfulness", label: "Mindfulness" },
  ];

  const badges = streakData?.badges || [];
  const filteredBadges = selectedCategory === "all"
    ? badges
    : badges.filter((b: { category: string }) => b.category === selectedCategory);

  const {
    current_streak = 0,
    longest_streak = 0,
    total_entries = 0,
    unlocked_count = 0,
    total_badges = 10,
    level = 1,
    xp = 0,
    total_xp = 0,
    next_level_xp = 150,
    grace_period_active = false,
  } = streakData || {};

  const levelProgress = Math.min(100, Math.round((xp / next_level_xp) * 100));

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-[#241F1D] dark:text-[#EFEAEB]">
            Streaks & Mindful Rewards
          </h1>
          <p className="text-[#726561] dark:text-[#9B8E91] mt-1 text-sm sm:text-base">
            Honoring your consistency, emotional courage, and multilingual self-expression.
          </p>
        </div>

        <button
          onClick={() => setIsBreathingOpen(true)}
          className="inline-flex items-center justify-center space-x-2 bg-[#F7EFF1] hover:bg-[#F2E5E8] dark:bg-[#2D2226] dark:hover:bg-[#3B282F] text-[#94676E] dark:text-[#BA8E94] border border-[#EDE3DF] dark:border-[#3B282F] px-5 py-2.5 rounded-2xl font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Wind className="w-5 h-5 text-[#94676E] dark:text-[#BA8E94]" />
          <span>60s Mindful Breath</span>
        </button>
      </header>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Current Streak */}
        <div className="bg-[#FCFAF9] dark:bg-[#1C1719] p-6 rounded-3xl border border-[#EDE3DF] dark:border-[#2D2427] space-y-2 backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#726561] dark:text-[#9B8E91]">
              Current Streak
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FAF3E8] dark:bg-[#261E14] border border-[#EBD2A4] dark:border-[#3D2C21] flex items-center justify-center">
              <Flame className="w-5 h-5 text-[#B58A46] dark:text-[#C89F58] fill-[#B58A46]/20 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-3xl font-bold font-serif text-[#241F1D] dark:text-[#EFEAEB]">
            {current_streak} {current_streak === 1 ? "Day" : "Days"}
          </p>
          <p className="text-xs text-[#726561] dark:text-[#9B8E91]">
            {grace_period_active ? "Grace day active" : `Best streak: ${longest_streak} days`}
          </p>
        </div>

        {/* Mindful Level */}
        <div className="bg-[#FCFAF9] dark:bg-[#1C1719] p-6 rounded-3xl border border-[#EDE3DF] dark:border-[#2D2427] space-y-2 backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#726561] dark:text-[#9B8E91]">
              Mindful Level
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#F7EFF1] dark:bg-[#2D2226] border border-[#EDE3DF] dark:border-[#3B282F] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#94676E] dark:text-[#BA8E94] fill-current" />
            </div>
          </div>
          <p className="text-3xl font-bold font-serif text-[#241F1D] dark:text-[#EFEAEB]">
            Level {level}
          </p>
          <div className="space-y-1">
            <div className="w-full h-1.5 bg-[#EDE3DF] dark:bg-[#2D2427] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#94676E] to-[#B58A46] dark:from-[#BA8E94] dark:to-[#C89F58] rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#726561] dark:text-[#9B8E91]">
              <span>{xp} XP</span>
              <span>{next_level_xp} XP to Lvl {level + 1}</span>
            </div>
          </div>
        </div>

        {/* Badges Unlocked */}
        <div className="bg-[#FCFAF9] dark:bg-[#1C1719] p-6 rounded-3xl border border-[#EDE3DF] dark:border-[#2D2427] space-y-2 backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#726561] dark:text-[#9B8E91]">
              Milestones Earned
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FAF3E8] dark:bg-[#261E14] border border-[#EBD2A4] dark:border-[#3D2C21] flex items-center justify-center">
              <Award className="w-5 h-5 text-[#B58A46] dark:text-[#C89F58]" />
            </div>
          </div>
          <p className="text-3xl font-bold font-serif text-[#241F1D] dark:text-[#EFEAEB]">
            {unlocked_count} / {total_badges}
          </p>
          <p className="text-xs text-[#726561] dark:text-[#9B8E91]">
            {Math.round((unlocked_count / (total_badges || 1)) * 100)}% achievements unlocked
          </p>
        </div>

        {/* Total Reflections */}
        <div className="bg-[#FCFAF9] dark:bg-[#1C1719] p-6 rounded-3xl border border-[#EDE3DF] dark:border-[#2D2427] space-y-2 backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#726561] dark:text-[#9B8E91]">
              Total Reflections
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#F7EFF1] dark:bg-[#2D2226] border border-[#EDE3DF] dark:border-[#3B282F] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#94676E] dark:text-[#BA8E94]" />
            </div>
          </div>
          <p className="text-3xl font-bold font-serif text-[#241F1D] dark:text-[#EFEAEB]">
            {total_entries}
          </p>
          <p className="text-xs text-[#726561] dark:text-[#9B8E91]">
            Total XP: {total_xp} points
          </p>
        </div>
      </div>

      {/* Philosophy & Grace Day Card */}
      <div className="p-6 rounded-3xl bg-[#FAF3E8] dark:bg-[#261E14] border border-[#EBD2A4] dark:border-[#3D2C21] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-2xl bg-[#FCFAF9] dark:bg-[#1C1719] text-[#B58A46] dark:text-[#C89F58] shrink-0 border border-[#EBD2A4] dark:border-[#3D2C21]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-[#241F1D] dark:text-[#EFEAEB] text-base">
              Swadhyaya’s Compassionate Streak Philosophy
            </h3>
            <p className="text-xs sm:text-sm text-[#726561] dark:text-[#9B8E91] leading-relaxed max-w-2xl">
              Journaling is a practice of care, not pressure. Swadhyaya automatically includes a <strong>36-hour Grace Day</strong> so missing a single busy day never penalizes your mindful momentum.
            </p>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#241F1D] dark:text-[#EFEAEB]">
              Milestones & Badges
            </h2>
            <p className="text-xs text-[#726561] dark:text-[#9B8E91] mt-0.5">
              Unlock badges as you deepen your journaling habit and express your feelings across languages.
            </p>
          </div>

          {/* Clean Segmented Category Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#FCFAF9] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] rounded-2xl overflow-x-auto shrink-0 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={clsx(
                  "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0",
                  selectedCategory === cat.id
                    ? "bg-[#94676E] dark:bg-[#BA8E94] text-white dark:text-[#181214] shadow-xs"
                    : "text-[#726561] dark:text-[#9B8E91] hover:text-[#241F1D] dark:hover:text-[#EFEAEB] hover:bg-[#F7EFF1] dark:hover:bg-[#2D2226]"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBadges.map((badge: {
            id: string;
            title: string;
            description: string;
            icon: string;
            unlocked: boolean;
            progress: number;
            max_progress: number;
            category: string;
          }) => {
            const isUnlocked = badge.unlocked;
            const progressPercent = Math.min(100, Math.round((badge.progress / (badge.max_progress || 1)) * 100));

            return (
              <div
                key={badge.id}
                className={clsx(
                  "p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between space-y-4",
                  isUnlocked
                    ? "bg-[#FCFAF9] dark:bg-[#1C1719] border-[#EDE3DF] dark:border-[#2D2427] shadow-xs hover:border-[#BA8E94]/40"
                    : "bg-[#FCFAF9]/50 dark:bg-[#161314]/50 border-[#EDE3DF]/60 dark:border-[#2D2427]/60 opacity-80"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={clsx(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-2xs transition-transform shrink-0",
                        isUnlocked
                          ? "bg-[#F7EFF1] dark:bg-[#2D2226] border-[#EDE3DF] dark:border-[#3B282F]"
                          : "bg-[#FCFAF9]/70 dark:bg-[#1C1719]/70 border-[#EDE3DF]/60 dark:border-[#2D2427]/60"
                      )}
                    >
                      <BadgeIcon badgeId={badge.id} iconName={badge.icon} className="w-5 h-5" isUnlocked={isUnlocked} />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#241F1D] dark:text-[#EFEAEB]">
                        {badge.title}
                      </h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#94676E] dark:text-[#BA8E94]">
                        {badge.category}
                      </span>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <div className="p-1 rounded-full bg-[#F7EFF1] dark:bg-[#2D2226] text-[#94676E] dark:text-[#BA8E94] border border-[#EDE3DF] dark:border-[#3B282F]">
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  ) : (
                    <div className="p-1 rounded-full bg-[#FCFAF9] dark:bg-[#1C1719] text-[#726561]/60 dark:text-[#9B8E91]/60 border border-[#EDE3DF]/60 dark:border-[#2D2427]/60">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <p className="text-xs text-[#726561] dark:text-[#9B8E91] leading-relaxed">
                  {badge.description}
                </p>

                {/* Progress Bar & Status */}
                <div className="pt-2 border-t border-[#EDE3DF] dark:border-[#2D2427] space-y-1.5">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className={isUnlocked ? "text-[#94676E] dark:text-[#BA8E94] font-bold" : "text-[#726561] dark:text-[#9B8E91]"}>
                      {isUnlocked ? "Unlocked (+100 XP)" : "In Progress"}
                    </span>
                    <span className="text-[#726561] dark:text-[#9B8E91]">
                      {badge.progress} / {badge.max_progress}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#EDE3DF] dark:bg-[#2D2427] rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        "h-full rounded-full transition-all duration-500",
                        isUnlocked ? "bg-[#94676E] dark:bg-[#BA8E94]" : "bg-[#94676E]/50 dark:bg-[#BA8E94]/50"
                      )}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guided Breathing Modal */}
      <BreathingModal isOpen={isBreathingOpen} onClose={() => setIsBreathingOpen(false)} />
    </div>
  );
}
