"use client";

import { useState, useEffect, useRef } from "react";
import { X, Play, Pause, RotateCcw, Wind, Sparkles, Volume2, VolumeX, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BreathingTechnique = "box" | "relax478" | "calm";

interface TechniqueInfo {
  name: string;
  tagline: string;
  description: string;
  pattern: {
    inhale: number;
    hold1: number;
    exhale: number;
    hold2: number;
  };
}

const TECHNIQUES: Record<BreathingTechnique, TechniqueInfo> = {
  box: {
    name: "Box Breathing (4-4-4-4)",
    tagline: "Navy SEAL technique for grounding & stress relief",
    description: "Equal-ratio breath that regulates the nervous system and rapidly lowers acute anxiety.",
    pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  },
  relax478: {
    name: "4-7-8 Deep Relaxation",
    tagline: "Natural tranquilizer for mind & body",
    description: "Extended exhale triggers the parasympathetic response, ideal for evening decompression.",
    pattern: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  },
  calm: {
    name: "Calm Rhythm (4-6)",
    tagline: "Gentle restorative flow",
    description: "Simple soothing rhythm that brings heart rate variability into an optimal coherent state.",
    pattern: { inhale: 4, hold1: 0, exhale: 6, hold2: 0 },
  },
};

export function BreathingModal({ isOpen, onClose }: BreathingModalProps) {
  const [technique, setTechnique] = useState<BreathingTechnique>("box");
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"ready" | "inhale" | "hold1" | "exhale" | "hold2" | "complete">("ready");
  const [countdown, setCountdown] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [targetCycles, setTargetCycles] = useState(4); // default ~1-2 min
  const [soundEnabled, setSoundEnabled] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  const currentPattern = TECHNIQUES[technique].pattern;

  // Play gentle harmonic tone
  const playTone = (frequency: number, duration: number) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted before user interaction
    }
  };

  // Reset when technique changes or closed
  useEffect(() => {
    if (!isOpen) {
      setIsActive(false);
      setPhase("ready");
      setCompletedCycles(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setIsActive(false);
    setPhase("ready");
    setCountdown(TECHNIQUES[technique].pattern.inhale);
  }, [technique]);

  // Main breathing loop
  useEffect(() => {
    if (!isActive || phase === "ready" || phase === "complete") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Phase Transition Logic
        if (phase === "inhale") {
          if (currentPattern.hold1 > 0) {
            setPhase("hold1");
            playTone(396, 0.4);
            return currentPattern.hold1;
          } else {
            setPhase("exhale");
            playTone(320, 0.5);
            return currentPattern.exhale;
          }
        } else if (phase === "hold1") {
          setPhase("exhale");
          playTone(320, 0.5);
          return currentPattern.exhale;
        } else if (phase === "exhale") {
          if (currentPattern.hold2 > 0) {
            setPhase("hold2");
            playTone(360, 0.3);
            return currentPattern.hold2;
          } else {
            const nextCycle = completedCycles + 1;
            setCompletedCycles(nextCycle);
            if (nextCycle >= targetCycles) {
              setPhase("complete");
              setIsActive(false);
              playTone(528, 1.2); // Solfeggio 528Hz clarity
              return 0;
            }
            setPhase("inhale");
            playTone(440, 0.5);
            return currentPattern.inhale;
          }
        } else if (phase === "hold2") {
          const nextCycle = completedCycles + 1;
          setCompletedCycles(nextCycle);
          if (nextCycle >= targetCycles) {
            setPhase("complete");
            setIsActive(false);
            playTone(528, 1.2);
            return 0;
          }
          setPhase("inhale");
          playTone(440, 0.5);
          return currentPattern.inhale;
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, currentPattern, completedCycles, targetCycles, soundEnabled]);

  const handleStart = () => {
    setIsActive(true);
    setPhase("inhale");
    setCountdown(currentPattern.inhale);
    playTone(440, 0.5);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase("ready");
    setCompletedCycles(0);
    setCountdown(currentPattern.inhale);
  };

  if (!isOpen) return null;

  // Visual circle scale & text instruction
  let instruction = "Prepare to begin";
  let circleScale = "scale-90 opacity-70";
  let ringColor = "border-[#C8D7C5] dark:border-[#28362D]";
  let glowColor = "bg-[#D6E3D3]/40 dark:bg-[#1D2D23]/50";

  if (phase === "inhale") {
    instruction = "Breathe In Slowly";
    circleScale = "scale-125 opacity-100";
    ringColor = "border-[#5F7E5C] dark:border-[#86A882]";
    glowColor = "bg-[#B4D4B0]/60 dark:bg-[#2D4434]/80 shadow-[0_0_50px_rgba(95,126,92,0.3)]";
  } else if (phase === "hold1" || phase === "hold2") {
    instruction = "Hold & Be Still";
    circleScale = "scale-125 opacity-90";
    ringColor = "border-amber-400/80 dark:border-amber-500/80";
    glowColor = "bg-amber-100/50 dark:bg-amber-950/40 shadow-[0_0_40px_rgba(251,191,36,0.2)]";
  } else if (phase === "exhale") {
    instruction = "Release & Let Go";
    circleScale = "scale-75 opacity-60";
    ringColor = "border-[#5F7E5C]/70 dark:border-[#86A882]/70";
    glowColor = "bg-[#E4ECE2]/80 dark:bg-[#141C17]/90";
  } else if (phase === "complete") {
    instruction = "Mindful Pause Complete";
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] dark:bg-[#141C17] border border-[#C8D7C5] dark:border-[#28362D] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C8D7C5] dark:border-[#28362D] bg-[#E8EFE6]/60 dark:bg-[#19221C]/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#D6E3D3] dark:bg-[#1D2D23] text-[#5F7E5C] dark:text-[#86A882]">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#24201D] dark:text-[#F5EFE6]">
                Mindful Breathing Space
              </h2>
              <p className="text-[11px] text-[#596557] dark:text-[#A6A099]">
                Ground your nervous system in 60 seconds
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute audio tones" : "Enable calming tones"}
              className="p-2 rounded-xl text-[#596557] dark:text-[#A6A099] hover:bg-[#D6E3D3] dark:hover:bg-[#1D2D23] transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#5F7E5C] dark:text-[#86A882]" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#596557] dark:text-[#A6A099] hover:bg-[#D6E3D3] dark:hover:bg-[#1D2D23] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 flex flex-col items-center">
          {/* Technique Selector Pills */}
          <div className="flex flex-wrap gap-2 justify-center w-full">
            {(Object.keys(TECHNIQUES) as BreathingTechnique[]).map((key) => {
              const tech = TECHNIQUES[key];
              const isSelected = technique === key;
              return (
                <button
                  key={key}
                  disabled={isActive}
                  onClick={() => setTechnique(key)}
                  className={clsx(
                    "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border",
                    isSelected
                      ? "bg-[#5F7E5C] dark:bg-[#86A882] text-white dark:text-[#0F1713] border-transparent shadow-xs"
                      : "bg-[#E4ECE2] dark:bg-[#19221C] text-[#596557] dark:text-[#A6A099] border-[#C8D7C5] dark:border-[#28362D] hover:bg-[#D6E3D3] dark:hover:bg-[#1E2822]",
                    isActive && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {tech.name}
                </button>
              );
            })}
          </div>

          {/* Central Interactive Breathing Circle */}
          <div className="relative w-64 h-64 my-4 flex items-center justify-center">
            {/* Outer pulsating backdrop glow */}
            <div
              className={clsx(
                "absolute inset-0 rounded-full transition-all duration-1000 ease-in-out blur-xl",
                glowColor
              )}
            />

            {/* Main Breathing Orb */}
            <div
              className={clsx(
                "relative w-52 h-52 rounded-full border-4 flex flex-col items-center justify-center p-6 text-center shadow-lg transition-all ease-in-out",
                phase === "inhale" ? "duration-[4000ms]" : phase === "exhale" ? (technique === "relax478" ? "duration-[8000ms]" : "duration-[4000ms]") : "duration-700",
                circleScale,
                ringColor,
                glowColor
              )}
            >
              {phase === "complete" ? (
                <div className="space-y-1 animate-in zoom-in-50 duration-300">
                  <CheckCircle2 className="w-10 h-10 text-[#5F7E5C] dark:text-[#86A882] mx-auto" />
                  <p className="font-serif font-bold text-sm text-[#24201D] dark:text-[#F5EFE6]">Centered</p>
                </div>
              ) : (
                <>
                  <span className="text-4xl font-serif font-bold text-[#24201D] dark:text-[#F5EFE6] tracking-tight">
                    {isActive ? countdown : "✦"}
                  </span>
                  <p className="text-xs font-semibold text-[#596557] dark:text-[#A6A099] mt-1 uppercase tracking-wider">
                    {phase === "ready" ? "Ready" : phase}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Dynamic Guidance Instructions */}
          <div className="text-center space-y-1">
            <p className="font-serif font-semibold text-xl text-[#24201D] dark:text-[#F5EFE6]">
              {instruction}
            </p>
            <p className="text-xs text-[#596557] dark:text-[#A6A099] max-w-sm">
              {phase === "complete"
                ? "Your breathing is centered. Take this calm clarity into your next reflection."
                : TECHNIQUES[technique].description}
            </p>
          </div>

          {/* Cycles & Progress Bar */}
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-xs text-[#596557] dark:text-[#A6A099] font-medium">
              <span>Cycles completed</span>
              <span>{completedCycles} / {targetCycles}</span>
            </div>
            <div className="w-full h-2 bg-[#D6E3D3] dark:bg-[#1D2D23] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5F7E5C] dark:bg-[#86A882] transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, (completedCycles / targetCycles) * 100)}%` }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            {!isActive ? (
              <button
                onClick={handleStart}
                className="inline-flex items-center space-x-2 bg-[#5F7E5C] hover:bg-[#4D674A] dark:bg-[#86A882] dark:hover:bg-[#96B892] text-white dark:text-[#0F1713] px-6 py-2.5 rounded-2xl font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{phase === "complete" ? "Begin Again" : phase === "ready" ? "Start Session" : "Resume"}</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="inline-flex items-center space-x-2 bg-[#E4ECE2] hover:bg-[#D6E3D3] dark:bg-[#1D2D23] dark:hover:bg-[#28362D] text-[#24201D] dark:text-[#F5EFE6] border border-[#C8D7C5] dark:border-[#28362D] px-6 py-2.5 rounded-2xl font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={handleReset}
              title="Reset Session"
              className="p-2.5 rounded-2xl bg-[#E4ECE2] dark:bg-[#19221C] text-[#596557] dark:text-[#A6A099] border border-[#C8D7C5] dark:border-[#28362D] hover:bg-[#D6E3D3] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
