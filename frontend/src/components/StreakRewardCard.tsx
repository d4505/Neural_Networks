"use client";

import Link from "next/link";
import useSWR from "swr";
import { Flame, Sprout, Award, ChevronRight, Check, Clock, Zap } from "lucide-react";
import clsx from "clsx";
import api from "../lib/api";
import { BadgeIcon } from "./BadgeIcon";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function StreakRewardCard() {
  const { data: streakData, isLoading } = useSWR("/api/insights/streaks", fetcher);

  if (isLoading || !streakData) {
    return (
      <div className="bg-[#E4ECE2]/80 dark:bg-[#19221C] p-6 rounded-3xl border border-[#C8D7C5] dark:border-[#28362D] animate-pulse h-60 flex items-center justify-center">
        <div className="text-xs text-[#596557] dark:text-[#A6A099]">Loading mindful habits...</div>
      </div>
    );
  }

  const {
    current_streak = 0,
    longest_streak = 0,
    total_entries = 0,
    streak_active_today = false,
    grace_period_active = false,
    habit_matrix = [],
    badges = [],
    unlocked_count = 0,
    level = 1,
    xp = 0,
    next_level_xp = 150,
  } = streakData;

  const nextBadge = badges.find((b: { unlocked: boolean }) => !b.unlocked);
  const xpPercent = Math.min(100, Math.round((xp / next_level_xp) * 100));

  return (
    <div className="bg-[#E4ECE2]/80 dark:bg-[#19221C] p-6 rounded-3xl shadow-xs border border-[#C8D7C5] dark:border-[#28362D] space-y-5 transition-colors backdrop-blur-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className={clsx(
            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs border transition-transform shrink-0",
            current_streak > 0 
              ? "bg-[#D6E3D3] dark:bg-[#1D2D23] border-[#B4D4B0] dark:border-[#2D4434]"
              : "bg-[#D6E3D3] dark:bg-[#1D2D23] border-[#C8D7C5] dark:border-[#2D4434]"
          )}>
            {current_streak > 0 ? (
              <Flame className="w-6 h-6 text-amber-700 dark:text-amber-400 fill-amber-700/20 stroke-[2.2]" />
            ) : (
              <Sprout className="w-6 h-6 text-[#5F7E5C] dark:text-[#86A882] stroke-[2.2]" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-serif font-bold text-xl text-[#24201D] dark:text-[#F5EFE6]">
                {current_streak} {current_streak === 1 ? "Day" : "Days"} Streak
              </h3>
              {streak_active_today && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D6E3D3] text-[#263825] dark:bg-[#1D2D23] dark:text-[#B4D4B0] border border-[#B4D4B0] dark:border-[#2D4434]">
                  Active Today
                </span>
              )}
            </div>
            <p className="text-xs text-[#596557] dark:text-[#A6A099] mt-0.5">
              {streak_active_today
                ? "Reflection completed today. Tomorrow keeps the momentum alive."
                : grace_period_active
                ? "Grace day active: write today to preserve your continuous streak."
                : total_entries === 0
                ? "Write your first entry to start your mindful streak."
                : "Pause and write today to rekindle your reflection habit."}
            </p>
          </div>
        </div>

        <Link
          href="/rewards"
          className="inline-flex items-center space-x-1 text-xs font-semibold text-[#5F7E5C] dark:text-[#86A882] hover:underline shrink-0"
        >
          <span>Rewards & Badges</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Level & XP Bar */}
      <div className="p-3.5 rounded-2xl bg-[#D6E3D3]/60 dark:bg-[#141C17] border border-[#C8D7C5] dark:border-[#28362D] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-[#24201D] dark:text-[#F5EFE6]">
            <Zap className="w-3.5 h-3.5 text-[#5F7E5C] dark:text-[#86A882] fill-current" />
            <span>Mindful Level {level}</span>
          </div>
          <span className="text-[#596557] dark:text-[#A6A099] font-medium text-[11px]">
            {xp} / {next_level_xp} XP
          </span>
        </div>
        <div className="w-full h-2 bg-[#C8D7C5]/50 dark:bg-[#1D2D23] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#5F7E5C] to-[#4D674A] dark:from-[#86A882] dark:to-[#A4C4A0] rounded-full transition-all duration-700"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      {/* 7-Day Habit Tracker */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-[#596557] dark:text-[#A6A099]">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Past 7 Days Rhythm</span>
          <span>Best: {longest_streak} days</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {habit_matrix.map((day: { date: string; day_name: string; has_entry: boolean; is_today: boolean }) => (
            <div
              key={day.date}
              className={clsx(
                "flex flex-col items-center py-2 px-1 rounded-2xl border text-center transition-all",
                day.has_entry
                  ? "bg-[#D6E3D3] dark:bg-[#1D2D23] border-[#B4D4B0] dark:border-[#2D4434] text-[#24201D] dark:text-[#F5EFE6]"
                  : day.is_today
                  ? "bg-[#EAEFE8]/50 dark:bg-[#141C17] border-dashed border-[#5F7E5C] dark:border-[#86A882] text-[#596557] dark:text-[#A6A099]"
                  : "bg-[#EAEFE8]/30 dark:bg-[#141C17]/40 border-[#C8D7C5]/40 dark:border-[#28362D]/40 text-[#596557]/60 dark:text-[#A6A099]/60"
              )}
            >
              <span className="text-[10px] font-bold">{day.day_name}</span>
              <div className="mt-1.5 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                {day.has_entry ? (
                  <Check className="w-3.5 h-3.5 text-[#5F7E5C] dark:text-[#86A882] stroke-[3]" />
                ) : day.is_today ? (
                  <Clock className="w-3 h-3 text-[#5F7E5C] dark:text-[#86A882] animate-pulse" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8D7C5] dark:bg-[#28362D]" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Milestone & Badges Preview */}
      {nextBadge && (
        <div className="pt-2 flex items-center justify-between border-t border-[#C8D7C5]/60 dark:border-[#28362D] text-xs">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="p-1.5 rounded-xl bg-[#D6E3D3] dark:bg-[#1D2D23] border border-[#C8D7C5] dark:border-[#2D4434] shrink-0">
              <BadgeIcon badgeId={nextBadge.id} iconName={nextBadge.icon} className="w-4 h-4" isUnlocked={false} />
            </div>
            <div className="truncate">
              <span className="font-semibold text-[#24201D] dark:text-[#F5EFE6] block truncate">
                Next: {nextBadge.title}
              </span>
              <span className="text-[11px] text-[#596557] dark:text-[#A6A099]">
                {nextBadge.description} ({nextBadge.progress}/{nextBadge.max_progress})
              </span>
            </div>
          </div>
          <span className="font-bold text-[#5F7E5C] dark:text-[#86A882] shrink-0 pl-2">
            {unlocked_count}/{badges.length} Badges
          </span>
        </div>
      )}
    </div>
  );
}
