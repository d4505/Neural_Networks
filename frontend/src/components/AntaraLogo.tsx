"use client";

import React from "react";

interface AntaraLogoProps {
  className?: string;
  size?: number | string;
  variant?: "mark" | "badge" | "full";
  accentColor?: string;
  showText?: boolean;
}

export function AntaraLogoIcon({
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
      className={className}
    >
      <defs>
        <linearGradient id="antaraWarmGold" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D4A373" />
          <stop offset="100%" stopColor="#E6C280" />
        </linearGradient>
      </defs>

      {/* 1. The Sanctuary Arch (Outer Portal Frame) */}
      <path
        d="M20 84 V42 C20 25.4315 33.4315 12 50 12 C66.5685 12 80 25.4315 80 42 V84"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[#5F7E5C] dark:text-[#86A882]"
      />

      {/* Grounding Baseline */}
      <path
        d="M14 84 H86"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        className="text-[#5F7E5C] dark:text-[#86A882]"
      />

      {/* 2. Radiating Sunbeams from Inner Horizon */}
      <line
        x1="50"
        y1="62"
        x2="29"
        y2="44"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-[#8FA88B] dark:text-[#5E7F5B] opacity-75"
      />
      <line
        x1="50"
        y1="62"
        x2="38"
        y2="28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-[#8FA88B] dark:text-[#5E7F5B] opacity-75"
      />
      <line
        x1="50"
        y1="62"
        x2="50"
        y2="22"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="text-[#8FA88B] dark:text-[#5E7F5B] opacity-85"
      />
      <line
        x1="50"
        y1="62"
        x2="62"
        y2="28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-[#8FA88B] dark:text-[#5E7F5B] opacity-75"
      />
      <line
        x1="50"
        y1="62"
        x2="71"
        y2="44"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-[#8FA88B] dark:text-[#5E7F5B] opacity-75"
      />

      {/* 3. Celestial Star & Planetary Orbs */}
      <path
        d="M50 21 L51.2 25.2 L55 26.5 L51.2 27.8 L50 32 L48.8 27.8 L45 26.5 L48.8 25.2 Z"
        fill="url(#antaraWarmGold)"
      />
      <circle cx="33" cy="38" r="2.2" fill="url(#antaraWarmGold)" />
      <circle cx="67" cy="38" r="2.2" fill="url(#antaraWarmGold)" />

      {/* 4. Inner Rising Sun / Lotus Base (Semi-circle) */}
      <path
        d="M34 84 C34 75.1634 41.1634 68 50 68 C58.8366 68 66 75.1634 66 84"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        className="text-[#5F7E5C] dark:text-[#86A882]"
      />

      {/* 5. Seated Meditative Core / Lotus Heart Silhouette */}
      <circle
        cx="50"
        cy="51"
        r="4.2"
        fill="currentColor"
        className="text-[#5F7E5C] dark:text-[#86A882]"
      />

      <path
        d="M44 65 C44 58 46.5 56 50 56 C53.5 56 56 58 56 65"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        className="text-[#5F7E5C] dark:text-[#86A882]"
      />

      {/* Diamond Essence (Inner Self / Antara Core) */}
      <path
        d="M50 63 L52.5 66 L50 69 L47.5 66 Z"
        fill="url(#antaraWarmGold)"
      />

      {/* Intertwined Lotus / Infinity Seated Legs */}
      <path
        d="M37 81 C37 75.5 45 75.5 50 78 C55 75.5 63 75.5 63 81 C63 84.5 56 84.5 50 81.5 C44 84.5 37 84.5 37 81 Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="text-[#5F7E5C] dark:text-[#86A882]"
      />
    </svg>
  );
}

export function AntaraLogo({
  size = 36,
  className = "",
  variant = "mark",
  showText = false,
}: AntaraLogoProps) {
  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#E4ECE2] to-[#D6E3D3] dark:from-[#1D2D23] dark:to-[#141C17] border border-[#C8D7C5] dark:border-[#28362D] p-2 shadow-xs transition-transform ${className}`}
      >
        <AntaraLogoIcon size={size} />
      </div>
    );
  }

  if (variant === "full" || showText) {
    return (
      <div className={`inline-flex items-center space-x-3 select-none ${className}`}>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E4ECE2] to-[#D6E3D3] dark:from-[#1D2D23] dark:to-[#141C17] border border-[#C8D7C5] dark:border-[#28362D] flex items-center justify-center p-1.5 shadow-xs shrink-0">
          <AntaraLogoIcon size={28} />
        </div>
        <div>
          <span className="text-2xl font-serif font-bold tracking-tight text-[#24201D] dark:text-[#F5EFE6] block leading-none">
            Antara
          </span>
          <span className="text-[10px] text-[#596557] dark:text-[#86A882] uppercase tracking-widest font-semibold block mt-1">
            Multilingual Journal
          </span>
        </div>
      </div>
    );
  }

  return <AntaraLogoIcon size={size} className={className} />;
}
