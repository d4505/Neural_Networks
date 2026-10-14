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
      <div className="bg-[#FFFFFF] dark:bg-[#1C1719] p-6 rounded-3xl border border-[#EDE3DF] dark:border-[#2D2427] animate-pulse h-60 flex items-center justify-center">
        <div className="text-xs text-[#726561] dark:text-[#9B8E91]">Loading mindful habits...</div>
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
    <div className="bg-[#FFFFFF] dark:bg-[#1C1719] p-6 rounded-3xl shadow-xs border border-[#EDE3DF] dark:border-[#2D2427] space-y-5 transition-colors backdrop-blur-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className={clsx(
            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs border transition-transform shrink-0",
            current_streak > 0 
              ? "bg-[#FAF3E8] dark:bg-[#261E14] border-[#EBD2A4] dark:border-[#3D2C21]"
              : "bg-[#FAF3E8] dark:bg-[#261E14] border-[#EDE3DF] dark:border-[#3D2C21]"
          )}>
            {current_streak > 0 ? (
              <Flame className="w-6 h-6 text-[#B58A46] dark:text-[#C89F58] fill-[#B58A46]/20 stroke-[2.2]" />
            ) : (
              <Sprout className="w-6 h-6 text-[#94676E] dark:text-[#BA8E94] stroke-[2.2]" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-serif font-bold text-xl text-[#241F1D] dark:text-[#EFEAEB]">
                {current_streak} {current_streak === 1 ? "Day" : "Days"} Streak
              </h3>
              {streak_active_today && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF3E8] text-[#72531F] dark:bg-[#261E14] dark:text-[#F3D39B] border border-[#EBD2A4] dark:border-[#3D2C21]">
                  Active Today
                </span>
              )}
            </div>
            <p className="text-xs text-[#726561] dark:text-[#9B8E91] mt-0.5">
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
          className="inline-flex items-center space-x-1 text-xs font-semibold text-[#94676E] dark:text-[#BA8E94] hover:underline shrink-0"
        >
          <span>Rewards & Badges</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Level & XP Bar */}
      <div className="p-3.5 rounded-2xl bg-[#F7F1EE] dark:bg-[#151112] border border-[#EDE3DF] dark:border-[#2D2427] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-[#241F1D] dark:text-[#EFEAEB]">
            <Zap className="w-3.5 h-3.5 text-[#B58A46] dark:text-[#C89F58] fill-current" />
            <span>Mindful Level {level}</span>
          </div>
          <span className="text-[#726561] dark:text-[#9B8E91] font-medium text-[11px]">
            {xp} / {next_level_xp} XP
          </span>
        </div>
        <div className="w-full h-2 bg-[#EDE3DF] dark:bg-[#251C1F] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#94676E] to-[#B58A46] dark:from-[#BA8E94] dark:to-[#C89F58] rounded-full transition-all duration-700"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      {/* 7-Day Habit Tracker */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-[#726561] dark:text-[#9B8E91]">
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
                  ? "bg-[#FAF3E8] dark:bg-[#261E14] border-[#EBD2A4] dark:border-[#3D2C21] text-[#241F1D] dark:text-[#EFEAEB]"
                  : day.is_today
                  ? "bg-[#F7F1EE] dark:bg-[#151112] border-dashed border-[#94676E] dark:border-[#BA8E94] text-[#726561] dark:text-[#9B8E91]"
                  : "bg-[#FCFAF9]/50 dark:bg-[#151112]/40 border-[#EDE3DF]/60 dark:border-[#2D2427]/50 text-[#726561]/60 dark:text-[#9B8E91]/60"
              )}
            >
              <span className="text-[10px] font-bold">{day.day_name}</span>
              <div className="mt-1.5 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                {day.has_entry ? (
                  <Check className="w-3.5 h-3.5 text-[#B58A46] dark:text-[#C89F58] stroke-[3]" />
                ) : day.is_today ? (
                  <Clock className="w-3 h-3 text-[#94676E] dark:text-[#BA8E94] animate-pulse" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EDE3DF] dark:bg-[#2D2427]" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Milestone & Badges Preview */}
      {nextBadge && (
        <div className="pt-2 flex items-center justify-between border-t border-[#EDE3DF] dark:border-[#2D2427] text-xs">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="p-1.5 rounded-xl bg-[#FAF3E8] dark:bg-[#261E14] border border-[#EDE3DF] dark:border-[#3D2C21] shrink-0">
              <BadgeIcon badgeId={nextBadge.id} iconName={nextBadge.icon} className="w-4 h-4" isUnlocked={false} />
            </div>
            <div className="truncate">
              <span className="font-semibold text-[#241F1D] dark:text-[#EFEAEB] block truncate">
                Next: {nextBadge.title}
              </span>
              <span className="text-[11px] text-[#726561] dark:text-[#9B8E91]">
                {nextBadge.description} ({nextBadge.progress}/{nextBadge.max_progress})
              </span>
            </div>
          </div>
          <span className="font-bold text-[#94676E] dark:text-[#BA8E94] shrink-0 pl-2">
            {unlocked_count}/{badges.length} Badges
          </span>
        </div>
      )}
    </div>
  );
}
