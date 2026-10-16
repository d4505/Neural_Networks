"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize, 
  FileText, 
  ExternalLink, 
  Home, 
  ShieldCheck, 
  BrainCircuit, 
  Sparkles, 
  HeartHandshake, 
  Layers, 
  Cpu, 
  BarChart3, 
  Languages 
} from "lucide-react";

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const totalSlides = 8;

  const notes: Record<number, string> = {
    1: "Respected evaluators and peers, good morning. Today, I am presenting Antara, an AI-powered mental health journaling platform designed specifically for multilingual and code-mixed linguistic environments.",
    2: "In India, people rarely express distress in formal English. They code-switch between native languages and English—typing in colloquial transliterations like Hinglish, Tanglish, and Manglish. Standard English NLP tools fail to understand this contextual nuance.",
    3: "Antara uses a 3-tier Calm Computing architecture: Next.js frontend, FastAPI backend, and a shared multitask NLP engine. Everything is designed around low latency, emotional grounding, and privacy.",
    4: "Our core research innovation is a shared-encoder Multitask MuRIL Network. A single model simultaneously predicts sentiment, 6-class emotions, and continuous valence, saving 60% memory while boosting Macro-F1.",
    5: "Key features include: longitudinal valence tracking with downward slope detection, a 60-second guided breathing space using Web Audio API Solfeggio soundscapes, and a 36-hour forgiving habit matrix.",
    6: "We benchmarked Antara across 12 model configurations. Our multitask MuRIL architecture with slang normalization achieved 92.10% accuracy and 91.40% Macro-F1, outperforming generic multilingual models by over 16 percentage points.",
    7: "Safety and ethics are paramount. Antara is strictly non-diagnostic, features deterministic crisis triage routing to Tele-MANAS (14416), and gives users complete data export and deletion sovereignty.",
    8: "In conclusion, Antara proves that culturally grounded NLP and humane design can deliver accessible mental health support. I am now open to your questions."
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setCurrentSlide((prev) => (prev < totalSlides ? prev + 1 : prev));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlide((prev) => (prev > 1 ? prev - 1 : prev));
      } else if (e.key.toLowerCase() === "s") {
        setShowNotes((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalSlides]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#232724] flex flex-col font-sans select-none">
      {/* Top Progress Bar */}
      <div className="w-full h-1 bg-[#E8E5DF] fixed top-0 left-0 z-50">
        <div 
          className="h-full bg-[#4A6B5D] transition-all duration-300"
          style={{ width: `${(currentSlide / totalSlides) * 100}%` }}
        />
      </div>

      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-[#E8E5DF] bg-[#FAF8F5]/90 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="font-serif font-bold text-xl text-[#4A6B5D] tracking-tight">Antara</span>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#EBF2EE] text-[#4A6B5D] border border-[#4A6B5D]/20">
            Interactive Presentation Deck
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowNotes(!showNotes)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
              showNotes ? "bg-[#4A6B5D] text-white border-[#4A6B5D]" : "bg-white text-[#232724] border-[#E8E5DF] hover:bg-[#F2EFEB]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Speaker Notes
          </button>
          
          <button 
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-[#E8E5DF] hover:bg-[#F2EFEB] transition"
          >
            <Maximize className="w-3.5 h-3.5" />
            Fullscreen
          </button>

          <Link 
            href="/dashboard"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#4A6B5D] text-white hover:bg-[#3c594c] transition shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Live App Demo
          </Link>
        </div>
      </header>

      {/* Main Slide Body */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-5xl bg-white border border-[#E8E5DF] rounded-2xl p-8 md:p-14 shadow-sm min-h-[580px] flex flex-col justify-between">
          
          {/* SLIDE 1 */}
          {currentSlide === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-xs font-semibold tracking-wider uppercase text-[#9C7A63]">
                Project Overview & Research Defense
              </div>
              <h1 className="font-serif text-3xl md:text-5xl font-semibold text-[#232724] leading-tight">
                Antara: AI-Powered Multilingual Mental Health Journaling Platform
              </h1>
              <p className="text-lg text-[#6B726A] max-w-3xl leading-relaxed">
                Bridging Linguistic Disparities in Digital Wellbeing with Indic Transformer Architectures & Humane Calm Computing Design.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2">
                  <div className="flex items-center gap-2 text-[#4A6B5D] font-semibold text-sm">
                    <Languages className="w-4 h-4" />
                    Multilingual & Code-Mixed
                  </div>
                  <p className="text-xs text-[#6B726A] leading-relaxed">
                    Native scripts and transliterated romanizations for English, Hindi, Tamil, Telugu, and Malayalam (Hinglish, Tanglish, Manglish, Tenglish).
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2">
                  <div className="flex items-center gap-2 text-[#4A6B5D] font-semibold text-sm">
                    <BrainCircuit className="w-4 h-4" />
                    Shared Multitask NLP
                  </div>
                  <p className="text-xs text-[#6B726A] leading-relaxed">
                    Simultaneously predicts sentiment polarity, 6-class emotions, and continuous valence regression using fine-tuned Google MuRIL.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2">
                  <div className="flex items-center gap-2 text-[#4A6B5D] font-semibold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    Ethical & Non-Diagnostic
                  </div>
                  <p className="text-xs text-[#6B726A] leading-relaxed">
                    Strict user data isolation, instant Tele-MANAS crisis routing, and a 36-hour forgiving habit matrix.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2 */}
          {currentSlide === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-xs font-semibold tracking-wider uppercase text-[#9C7A63]">
                Problem Statement & Motivation
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#232724]">
                The Linguistic Barrier in Digital Mental Health
              </h2>
              <p className="text-base text-[#6B726A]">
                Digital mental health tools assume formal English, alienating millions in linguistically diverse environments.
              </p>

              <div className="p-4 rounded-xl bg-[#EBF2EE] border-l-4 border-[#4A6B5D] text-sm text-[#232724] leading-relaxed">
                <span className="font-semibold block mb-1">The Code-Mixing Reality:</span>
                In conversational journaling, users express vulnerable feelings in hybrid Indian dialects:
                <br />
                <span className="italic text-[#4A6B5D]">
                  &ldquo;Today college la romba stressful ah irundhuchu, but friends kooda pesina apram konjam better feel panninen.&rdquo;
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF]">
                  <h4 className="font-semibold text-sm text-[#232724] mb-2">Failure of Generic English LLMs</h4>
                  <p className="text-xs text-[#6B726A] leading-relaxed">
                    Generic English BERT or mBERT misinterpret informal transliterated phrasing, confusing colloquial youth slang with noise or negative sentiment.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF]">
                  <h4 className="font-semibold text-sm text-[#232724] mb-2">Stigma & Alarmist Gamification</h4>
                  <p className="text-xs text-[#6B726A] leading-relaxed">
                    Conventional apps trigger anxiety with rigid streak penalties and intrusive pseudoclinical diagnostic labels.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3 */}
          {currentSlide === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-xs font-semibold tracking-wider uppercase text-[#9C7A63]">
                System Architecture
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#232724]">
                Three-Tier Calm Computing Architecture
              </h2>
              <p className="text-sm text-[#6B726A]">
                Stateless, low-latency API architecture engineered for user data sovereignty and offline safety.
              </p>

              <div className="bg-[#F4F1EC] p-4 rounded-xl border border-[#E8E5DF] font-mono text-[11px] md:text-xs leading-relaxed overflow-x-auto text-[#2D312E]">
                <pre>{`┌─────────────────────────────────────────────────────────────┐
│                    Antara Next.js 14 UI                     │
│    (Dashboard • My Journal • Calendar • Insights • Settings)│
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON REST API
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI Python Backend                   │
│ ┌───────────────────────┐         ┌───────────────────────┐ │
│ │   /api/auth & user    │         │  /api/journal & CRUD  │ │
│ └───────────────────────┘         └───────────────────────┘ │
│ ┌───────────────────────┐         ┌───────────────────────┐ │
│ │   /api/insights       │         │  /api/calendar        │ │
│ └───────────────────────┘         └───────────────────────┘ │
└──────────────┬───────────────────────────────────┬──────────┘
               │                                   │
┌──────────────▼──────────────┐     ┌──────────────▼──────────┐
│        SQLite Database      │     │  Multitask NLP Engine   │
│  (Users, Entries, Analysis) │     │ (MuRIL Transformer +    │
│                             │     │  Attention Salience)    │
└─────────────────────────────┘     └─────────────────────────┘`}</pre>
              </div>
            </div>
          )}

          {/* SLIDE 4 */}
          {currentSlide === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-xs font-semibold tracking-wider uppercase text-[#9C7A63]">
                Core Machine Learning Contribution
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#232724]">
                Shared-Encoder Multitask MuRIL Network
              </h2>
              <p className="text-sm text-[#6B726A]">
                Simultaneous representation learning across 3 affective tasks cuts GPU inference memory by ~60%.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                  <div className="text-xs font-bold text-[#4A6B5D]">Task 1: Sentiment</div>
                  <div className="text-xs text-[#232724] font-medium">3-Class Polarity</div>
                  <p className="text-[11px] text-[#6B726A]">Positive, Neutral, Negative with context-aware debiasing.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                  <div className="text-xs font-bold text-[#4A6B5D]">Task 2: Emotion</div>
                  <div className="text-xs text-[#232724] font-medium">6 Emotional States</div>
                  <p className="text-[11px] text-[#6B726A]">Joy, Calm, Hopeful, Sadness, Stress, and Anxiety.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                  <div className="text-xs font-bold text-[#4A6B5D]">Task 3: Valence</div>
                  <div className="text-xs text-[#232724] font-medium">Continuous Regression</div>
                  <p className="text-[11px] text-[#6B726A]">Continuous valence bounded in [-1.0, +1.0] via MSE loss.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#EBF2EE] border border-[#4A6B5D]/20 text-xs text-[#232724] space-y-1">
                <div className="font-semibold text-[#4A6B5D]">Joint Multi-Task Loss Formulation:</div>
                <code className="block font-mono bg-white p-2 rounded border border-[#E8E5DF] text-xs">
                  L_total = α · L_sentiment + β · L_emotion + γ · L_valence
                </code>
                <p className="text-[#6B726A] pt-1">
                  Trained on stratified Indic & Code-Mixed corpora with slang dictionary expansion.
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 5 */}
          {currentSlide === 5 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-xs font-semibold tracking-wider uppercase text-[#9C7A63]">
                Humane Product Experience
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#232724]">
                Calm Computing & Longitudinal Features
              </h2>
              <p className="text-sm text-[#6B726A]">
                Carefully crafted features supporting mental clarity without alarmism or guilt.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                  <div className="font-semibold text-sm text-[#232724]">Longitudinal Trajectory Analysis</div>
                  <p className="text-xs text-[#6B726A]">
                    Linear regression slope tracking over 7-day, 30-day, and 3-month windows to identify continuous downward shifts and trigger non-intrusive wellness suggestions.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                  <div className="font-semibold text-sm text-[#232724]">60s Guided Breathing Space</div>
                  <p className="text-xs text-[#6B726A]">
                    Web Audio API synthesized harmonic Solfeggio soundscapes (432Hz/528Hz) generated client-side for rapid nervous system regulation.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                  <div className="font-semibold text-sm text-[#232724]">Forgiving Habit Matrix</div>
                  <p className="text-xs text-[#6B726A]">
                    Replaces punitive zero-streak resets with a generous 36-hour grace day window to nurture sustainable reflection habits.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                  <div className="font-semibold text-sm text-[#232724]">Interactive Reflection Calendar</div>
                  <p className="text-xs text-[#6B726A]">
                    Date-indexed multi-entry color dots, full-text search, language filtering, and emotional intensity distribution.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 6 */}
          {currentSlide === 6 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-xs font-semibold tracking-wider uppercase text-[#9C7A63]">
                Empirical Evaluation
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#232724]">
                Benchmark Against 12 Model Architectures
              </h2>
              <p className="text-sm text-[#6B726A]">
                Comprehensive comparative results across Classical ML, Deep Sequence, and Transformers.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#E8E5DF] text-[#6B726A]">
                      <th className="p-2.5 font-semibold">Category</th>
                      <th className="p-2.5 font-semibold">Architecture</th>
                      <th className="p-2.5 font-semibold">Accuracy</th>
                      <th className="p-2.5 font-semibold">Macro-F1</th>
                      <th className="p-2.5 font-semibold">Valence MSE</th>
                      <th className="p-2.5 font-semibold">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E5DF]">
                    <tr>
                      <td className="p-2.5 text-[#6B726A]">Classical ML</td>
                      <td className="p-2.5 font-medium">Linear SVM (TF-IDF)</td>
                      <td className="p-2.5">98.40%</td>
                      <td className="p-2.5">98.32%</td>
                      <td className="p-2.5 font-mono">0.065</td>
                      <td className="p-2.5">1.5 ms</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-[#6B726A]">Deep Sequence</td>
                      <td className="p-2.5 font-medium">Bi-LSTM + Additive Attention</td>
                      <td className="p-2.5">98.13%</td>
                      <td className="p-2.5">98.05%</td>
                      <td className="p-2.5 font-mono">0.059</td>
                      <td className="p-2.5">9.6 ms</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-[#6B726A]">Pretrained LM</td>
                      <td className="p-2.5 font-medium">mBERT (Multilingual BERT)</td>
                      <td className="p-2.5">75.10%</td>
                      <td className="p-2.5">72.30%</td>
                      <td className="p-2.5 font-mono">0.118</td>
                      <td className="p-2.5">26.1 ms</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-[#6B726A]">Indic Backbone</td>
                      <td className="p-2.5 font-medium">Google MuRIL (Single-Task)</td>
                      <td className="p-2.5">84.10%</td>
                      <td className="p-2.5">83.20%</td>
                      <td className="p-2.5 font-mono">0.081</td>
                      <td className="p-2.5">25.8 ms</td>
                    </tr>
                    <tr className="bg-[#EBF2EE] font-semibold text-[#4A6B5D]">
                      <td className="p-2.5">Proposed</td>
                      <td className="p-2.5">Antara Net + Slang Normalization</td>
                      <td className="p-2.5">92.10%</td>
                      <td className="p-2.5">91.40%</td>
                      <td className="p-2.5 font-mono">0.052</td>
                      <td className="p-2.5">19.1 ms</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SLIDE 7 */}
          {currentSlide === 7 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-xs font-semibold tracking-wider uppercase text-[#9C7A63]">
                Ethics & Safeguards
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#232724]">
                Responsible AI & Privacy Safeguards
              </h2>
              <p className="text-sm text-[#6B726A]">
                Proactive boundaries engineered to protect user safety and personal confidentiality.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2">
                  <div className="font-semibold text-sm text-[#232724]">Non-Diagnostic Mandate</div>
                  <p className="text-xs text-[#6B726A] leading-relaxed">
                    Clear disclaimers throughout: Antara provides emotional reflections, not clinical diagnoses, prescriptions, or psychiatric evaluation.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2">
                  <div className="font-semibold text-sm text-[#232724]">Deterministic Crisis Triage</div>
                  <p className="text-xs text-[#6B726A] leading-relaxed">
                    Keyword-based safety screening instantly activates emergency banners connecting users to Tele-MANAS (14416) and KIRAN helplines.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2">
                  <div className="font-semibold text-sm text-[#232724]">Data Sovereignty</div>
                  <p className="text-xs text-[#6B726A] leading-relaxed">
                    Instant 1-click JSON/CSV journal export, password hashing with bcrypt, and GDPR-compliant cascading account deletion.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 8 */}
          {currentSlide === 8 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-xs font-semibold tracking-wider uppercase text-[#9C7A63]">
                Conclusion & Demonstration
              </div>
              <h2 className="font-serif text-3xl md:text-5xl font-semibold text-[#232724]">
                Thank You — Ready for Demonstration
              </h2>
              <p className="text-base text-[#6B726A]">
                Antara illustrates how culturally grounded NLP can create private, humane digital sanctuaries.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2">
                  <div className="font-semibold text-sm text-[#232724]">Local Access Points</div>
                  <div className="text-xs space-y-1 text-[#6B726A]">
                    <div><strong>Web UI:</strong> <a href="http://localhost:3000" className="text-[#4A6B5D] hover:underline" target="_blank">http://localhost:3000</a></div>
                    <div><strong>Backend API:</strong> <a href="http://127.0.0.1:8000" className="text-[#4A6B5D] hover:underline" target="_blank">http://127.0.0.1:8000</a></div>
                    <div><strong>Swagger Docs:</strong> <a href="http://127.0.0.1:8000/docs" className="text-[#4A6B5D] hover:underline" target="_blank">http://127.0.0.1:8000/docs</a></div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2">
                  <div className="font-semibold text-sm text-[#232724]">Pre-seeded Demo User</div>
                  <div className="text-xs space-y-1 text-[#6B726A]">
                    <div><strong>Email:</strong> <code>demo@antara.ai</code></div>
                    <div><strong>Password:</strong> <code>Password123!</code></div>
                    <div><strong>Git:</strong> <a href="https://github.com/d4505/Neural_Networks" target="_blank" className="text-[#4A6B5D] hover:underline">github.com/d4505/Neural_Networks</a></div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link 
                  href="/dashboard"
                  target="_blank"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4A6B5D] text-white text-sm font-medium hover:bg-[#3c594c] transition shadow"
                >
                  <Home className="w-4 h-4" />
                  Launch Live Dashboard Demo
                </Link>
              </div>
            </div>
          )}

          {/* Slide Indicator & Nav */}
          <div className="flex justify-between items-center pt-8 border-t border-[#E8E5DF]">
            <div className="text-xs font-semibold text-[#6B726A]">
              Slide {currentSlide} of {totalSlides}
            </div>

            <div className="flex gap-2">
              <button
                disabled={currentSlide === 1}
                onClick={() => setCurrentSlide((prev) => Math.max(1, prev - 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E8E5DF] text-xs font-medium bg-white hover:bg-[#F2EFEB] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              
              <button
                disabled={currentSlide === totalSlides}
                onClick={() => setCurrentSlide((prev) => Math.min(totalSlides, prev + 1))}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[#4A6B5D] text-white text-xs font-medium hover:bg-[#3c594c] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Speaker Notes Overlay */}
      {showNotes && (
        <div className="bg-[#2D312E] text-[#E2E8F0] p-6 border-t border-neutral-700 fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-200">
          <div className="max-w-5xl mx-auto flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">
                Speaker Script for Slide {currentSlide}
              </div>
              <p className="text-sm leading-relaxed text-neutral-200">
                {notes[currentSlide]}
              </p>
            </div>
            <button 
              onClick={() => setShowNotes(false)}
              className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
