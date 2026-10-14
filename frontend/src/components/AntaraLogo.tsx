"use client";

import React from "react";

interface SwadhyayaLogoProps {
  className?: string;
  size?: number | string;
  variant?: "mark" | "badge" | "full";
  accentColor?: string;
  showText?: boolean;
}

export function SwadhyayaLogoIcon({
  size = 36,
  className = "",
}: {
  size?: number | string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Swadhyaya - Sacred Introspection Logo"
      className={`transition-colors shrink-0 ${className}`}
    >
      <defs>
        {/* Rosewater Gradient */}
        <linearGradient id="swadhyayaRoseGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94676E" />
          <stop offset="100%" stopColor="#BA8E94" />
        </linearGradient>

        {/* Honey Amber Gradient */}
        <linearGradient id="swadhyayaHoneyGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B58A46" />
          <stop offset="100%" stopColor="#DEAF60" />
        </linearGradient>
      </defs>

      {/* 1. Halo of Contemplative Awareness (Subtle Wisdom Orbit) */}
      <path
        d="M22 46 C22 28 34.5 15 50 15 C65.5 15 78 28 78 46"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray="3 3"
        strokeLinecap="round"
        className="text-[#94676E]/50 dark:text-[#BA8E94]/45"
      />

      {/* 2. Grounding Baseline Arc (Earth Connection & Equanimity) */}
      <path
        d="M25 82 C42 88 58 88 75 82"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        className="text-[#94676E] dark:text-[#BA8E94]"
      />

      {/* 3. Open Manuscript Pages / Lotus Petals (External Knowledge into Inner Wisdom) */}
      {/* Left Wing / Page */}
      <path
        d="M50 78 C38 78 20 70 18 50 C16 38 27 31 36 34 C44 37 48 48 50 62"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[#94676E] dark:text-[#BA8E94]"
      />

      {/* Right Wing / Page */}
      <path
        d="M50 78 C62 78 80 70 82 50 C84 38 73 31 64 34 C56 37 52 48 50 62"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[#94676E] dark:text-[#BA8E94]"
      />

      {/* 4. Inner Mirror Ribs (Introspective Layering) */}
      <path
        d="M50 69 C41 65 30 56 34 43 C38 34 46 41 49 54"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="text-[#94676E] dark:text-[#BA8E94] opacity-80"
      />
      <path
        d="M50 69 C59 65 70 56 66 43 C62 34 54 41 51 54"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="text-[#94676E] dark:text-[#BA8E94] opacity-80"
      />

      {/* 5. Central Jyoti (Ascending Flame of Self-Inquiry / Atma) */}
      <path
        d="M50 19 C45 30 43 40 47 48 C49 52 50 54 50 54 C50 54 51 52 53 48 C57 40 55 30 50 19 Z"
        fill="url(#swadhyayaHoneyGrad)"
      />

      {/* 6. Inner Core Brilliance */}
      <path
        d="M50 26 C47.5 33 46 39 49 44 C49.6 45.5 50 46.5 50 46.5 C50 46.5 50.4 45.5 51 44 C54 39 52.5 33 50 26 Z"
        fill="#FFF7EB"
        className="dark:fill-[#FFEFCB] opacity-90"
      />

      {/* 7. Top Bindu (Point of Pure Consciousness) */}
      <circle cx="50" cy="11.5" r="3.2" fill="url(#swadhyayaHoneyGrad)" />
      <circle cx="50" cy="11.5" r="1.3" fill="#FFFFFF" />

      {/* 8. Twin Subtle Sparks of Intuition */}
      <circle
        cx="28"
        cy="27"
        r="1.6"
        fill="url(#swadhyayaHoneyGrad)"
        className="opacity-75"
      />
      <circle
        cx="72"
        cy="27"
        r="1.6"
        fill="url(#swadhyayaHoneyGrad)"
        className="opacity-75"
      />
    </svg>
  );
}

export function SwadhyayaLogo({
  size = 36,
  className = "",
  variant = "mark",
  showText = false,
}: SwadhyayaLogoProps) {
  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FAF3E8] to-[#F7F1EE] dark:from-[#261E14] dark:to-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] p-2 shadow-xs transition-transform ${className}`}
      >
        <SwadhyayaLogoIcon size={size} />
      </div>
    );
  }

  if (variant === "full" || showText) {
    return (
      <div className={`inline-flex items-center space-x-3 select-none ${className}`}>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FAF3E8] to-[#F7F1EE] dark:from-[#261E14] dark:to-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] flex items-center justify-center p-1.5 shadow-xs shrink-0">
          <SwadhyayaLogoIcon size={26} />
        </div>
        <div>
          <span className="text-2xl font-serif font-bold tracking-tight text-[#241F1D] dark:text-[#EFEAEB] block leading-none">
            Swadhyaya
          </span>
          <span className="text-[10px] text-[#94676E] dark:text-[#BA8E94] uppercase tracking-widest font-semibold block mt-1">
            Self-Inquiry & Mindfulness
          </span>
        </div>
      </div>
    );
  }

  return <SwadhyayaLogoIcon size={size} className={className} />;
}

// Backward-compatible aliases for smooth transition across the app
export const AntaraLogo = SwadhyayaLogo;
export const AntaraLogoIcon = SwadhyayaLogoIcon;
