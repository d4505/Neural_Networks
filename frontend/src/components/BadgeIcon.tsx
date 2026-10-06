"use client";

import React from "react";
import {
  Sprout,
  Flame,
  Sparkles,
  Compass,
  Crown,
  Languages,
  Feather,
  Moon,
  Sun,
  Gem,
  Award,
  BookOpen,
  Zap,
} from "lucide-react";
import clsx from "clsx";

interface BadgeIconProps {
  badgeId?: string;
  iconName?: string;
  className?: string;
  isUnlocked?: boolean;
}

export function BadgeIcon({
  badgeId = "",
  iconName = "",
  className = "w-6 h-6",
  isUnlocked = true,
}: BadgeIconProps) {
  const id = badgeId.toLowerCase();
  const name = iconName.toLowerCase();

  // Color styling based on unlock state & category
  const iconColor = isUnlocked
    ? "text-[#5F7E5C] dark:text-[#86A882]"
    : "text-[#596557]/50 dark:text-[#A6A099]/50";

  if (id.includes("first") || id.includes("seed") || name.includes("sprout") || name === "🌱") {
    return <Sprout className={clsx(className, isUnlocked ? "text-[#5F7E5C] dark:text-[#86A882]" : iconColor)} />;
  }

  if (id.includes("streak_3") || id.includes("flow") || name.includes("flame") || name === "🔥") {
    return <Flame className={clsx(className, isUnlocked ? "text-amber-700 dark:text-amber-400 fill-amber-700/20" : iconColor)} />;
  }

  if (id.includes("streak_7") || id.includes("clarity") || name.includes("sparkles") || name === "✨") {
    return <Sparkles className={clsx(className, isUnlocked ? "text-[#5F7E5C] dark:text-[#86A882]" : iconColor)} />;
  }

  if (id.includes("streak_14") || id.includes("fortitude") || name.includes("mountain") || name.includes("compass") || name === "🌿") {
    return <Compass className={clsx(className, isUnlocked ? "text-[#4D674A] dark:text-[#A4C4A0]" : iconColor)} />;
  }

  if (id.includes("streak_30") || id.includes("zen") || id.includes("master") || name.includes("crown") || name.includes("lotus") || name === "👑") {
    return <Crown className={clsx(className, isUnlocked ? "text-amber-700 dark:text-amber-400" : iconColor)} />;
  }

  if (id.includes("polyglot") || id.includes("language") || name.includes("languages") || name === "🌐") {
    return <Languages className={clsx(className, isUnlocked ? "text-[#5F7E5C] dark:text-[#86A882]" : iconColor)} />;
  }

  if (id.includes("deep") || id.includes("explorer") || name.includes("feather") || name === "📖") {
    return <Feather className={clsx(className, isUnlocked ? "text-[#4D674A] dark:text-[#A4C4A0]" : iconColor)} />;
  }

  if (id.includes("night") || id.includes("calm") || name.includes("moon") || name === "🌙") {
    return <Moon className={clsx(className, isUnlocked ? "text-indigo-700 dark:text-indigo-400 fill-indigo-700/10" : iconColor)} />;
  }

  if (id.includes("morning") || id.includes("sun") || name.includes("sunrise") || name === "🌅") {
    return <Sun className={clsx(className, isUnlocked ? "text-amber-600 dark:text-amber-400" : iconColor)} />;
  }

  if (id.includes("milestone_10") || id.includes("gem") || name.includes("gem") || name === "💎") {
    return <Gem className={clsx(className, isUnlocked ? "text-emerald-700 dark:text-emerald-400" : iconColor)} />;
  }

  return <Award className={clsx(className, iconColor)} />;
}
