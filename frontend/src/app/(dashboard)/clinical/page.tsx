"use client";

import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import api from "../../../lib/api";
import {
  ClipboardCheck,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Calendar,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Minus,
  CheckCircle2,
  HelpCircle,
  X,
  FileText,
  UserCheck,
  HeartPulse,
  Download,
  Save,
  BookMarked,
} from "lucide-react";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function ClinicalCopilotPage() {
  const [days, setDays] = useState<number>(14);
  const [anonymize, setAnonymize] = useState<boolean>(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState<boolean>(false);
  const [activeAssessmentType, setActiveAssessmentType] = useState<"PHQ-9" | "GAD-7">("PHQ-9");
  const [assessmentAnswers, setAssessmentAnswers] = useState<number[]>(new Array(9).fill(0));
  const [assessmentNotes, setAssessmentNotes] = useState<string>("");
  const [submittingAssessment, setSubmittingAssessment] = useState<boolean>(false);
  const [assessmentSuccessMsg, setAssessmentSuccessMsg] = useState<string | null>(null);

  // SWR Hooks
  const { data: dossier, isLoading: dossierLoading } = useSWR(
    `/api/clinical/dossier?days=${days}&anonymize=${anonymize}`,
    fetcher
  );

  const { data: assessments, isLoading: assessmentsLoading } = useSWR(
    "/api/clinical/assessments",
    fetcher
  );

  const { data: questionsData } = useSWR(
    "/api/clinical/assessment-questions",
    fetcher
  );

  const [sessionNotes, setSessionNotes] = useState<string>("");
  const [sessionNotesSaved, setSessionNotesSaved] = useState<boolean>(false);

  // Initialize session notes from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("swadhyaya_session_notes");
      if (saved) setSessionNotes(saved);
    }
  }, []);

  const saveSessionNotes = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("swadhyaya_session_notes", sessionNotes);
      setSessionNotesSaved(true);
      setTimeout(() => setSessionNotesSaved(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    if (!dossier) return;
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `swadhyaya_clinical_dossier_${anonymize ? "anonymized" : "patient"}_${days}d.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openNewAssessment = (type: "PHQ-9" | "GAD-7") => {
    setActiveAssessmentType(type);
    const count = type === "PHQ-9" ? 9 : 7;
    setAssessmentAnswers(new Array(count).fill(0));
    setAssessmentNotes("");
    setAssessmentSuccessMsg(null);
    setIsAssessmentModalOpen(true);
  };

  const handleAnswerChange = (qIndex: number, value: number) => {
    const updated = [...assessmentAnswers];
    updated[qIndex] = value;
    setAssessmentAnswers(updated);
  };

  const currentTally = assessmentAnswers.reduce((sum, val) => sum + val, 0);

  const getTallySeverity = () => {
    if (activeAssessmentType === "PHQ-9") {
      if (currentTally <= 4) return { label: "Minimal Depression", color: "text-emerald-600 dark:text-emerald-400" };
      if (currentTally <= 9) return { label: "Mild Depression", color: "text-[#B58A46] dark:text-[#C89F58]" };
      if (currentTally <= 14) return { label: "Moderate Depression", color: "text-amber-600 dark:text-amber-400" };
      if (currentTally <= 19) return { label: "Moderately Severe Depression", color: "text-[#94676E] dark:text-[#BA8E94]" };
      return { label: "Severe Depression", color: "text-rose-600 dark:text-rose-400" };
    } else {
      if (currentTally <= 4) return { label: "Minimal Anxiety", color: "text-emerald-600 dark:text-emerald-400" };
      if (currentTally <= 9) return { label: "Mild Anxiety", color: "text-[#B58A46] dark:text-[#C89F58]" };
      if (currentTally <= 14) return { label: "Moderate Anxiety", color: "text-[#94676E] dark:text-[#BA8E94]" };
      return { label: "Severe Anxiety", color: "text-rose-600 dark:text-rose-400" };
    }
  };

  const submitAssessmentForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAssessment(true);
    try {
      await api.post("/api/clinical/assessments", {
        assessment_type: activeAssessmentType,
        answers: assessmentAnswers,
        notes: assessmentNotes,
      });
      setAssessmentSuccessMsg(`${activeAssessmentType} check-in saved to clinical timeline!`);
      mutate("/api/clinical/assessments");
      mutate(`/api/clinical/dossier?days=${days}&anonymize=${anonymize}`);
      setTimeout(() => {
        setIsAssessmentModalOpen(false);
        setAssessmentSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      alert("Failed to submit assessment. Please try again.");
    } finally {
      setSubmittingAssessment(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 print:p-0 print:max-w-full">
      {/* Print-Only Clinic Header */}
      <div className="hidden print:block border-b-2 border-stone-800 pb-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">
              Swadhyaya Longitudinal Affective Dossier
            </h1>
            <p className="text-xs text-stone-600">
              Multilingual Clinical Companion & Affect Monitoring Report
            </p>
          </div>
          <div className="text-right text-xs text-stone-700">
            <p className="font-semibold">Patient: {dossier?.patient?.name || "Patient Record"}</p>
            <p>ID: {dossier?.patient?.id || "SW-0001"}</p>
            <p>Generated: {dossier?.patient?.report_generated_at || new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Screen Header & Horizon Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-xl bg-[#FAF3E8] dark:bg-[#261E14] border border-[#EDE3DF] dark:border-[#2D2427] text-[#94676E] dark:text-[#BA8E94]">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#94676E] dark:text-[#BA8E94]">
              Clinical Affective Copilot
            </span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#241F1D] dark:text-[#EFEAEB] tracking-tight">
            Therapy Session Dossier
          </h1>
          <p className="text-sm text-[#726561] dark:text-[#9B8E91] mt-1">
            Synthesizing multilingual reflections, chronobiological triggers, and standardized psychometrics.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Horizon Pills */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-[#F7F1EE] dark:bg-[#1E1719] border border-[#EDE3DF] dark:border-[#2D2427] text-xs font-semibold">
            {[
              { label: "7 Days", val: 7 },
              { label: "14 Days (Session)", val: 14 },
              { label: "30 Days", val: 30 },
              { label: "All Time", val: 0 },
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => setDays(p.val)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  days === p.val
                    ? "bg-[#FCFAF9] dark:bg-[#2A1D20] text-[#94676E] dark:text-[#BA8E94] shadow-xs font-bold"
                    : "text-[#726561] dark:text-[#9B8E91] hover:text-[#241F1D] dark:hover:text-[#EFEAEB]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Privacy Anonymize Toggle */}
          <button
            onClick={() => setAnonymize(!anonymize)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
              anonymize
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                : "bg-[#FCFAF9] dark:bg-[#1C1719] border-[#EDE3DF] dark:border-[#2D2427] text-[#726561] dark:text-[#9B8E91]"
            }`}
            title="Mask patient name and email for sharing with a doctor"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{anonymize ? "Privacy Mask: ON" : "Privacy Mask"}</span>
          </button>

          {/* Download JSON */}
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#FCFAF9] hover:bg-[#F7F1EE] dark:bg-[#1C1719] dark:hover:bg-[#261E14] border border-[#EDE3DF] dark:border-[#2D2427] text-xs font-semibold text-[#726561] dark:text-[#9B8E91] shadow-2xs transition-all cursor-pointer"
            title="Download full standardized clinical JSON dossier"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          {/* Print / Export PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#94676E] hover:bg-[#83535B] dark:bg-[#BA8E94] dark:hover:bg-[#C89F58] text-white dark:text-[#181113] text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Export Clinical PDF</span>
          </button>
        </div>
      </div>

      {/* Patient & Report Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#FAF3E8]/80 dark:bg-[#261E14]/70 border border-[#EBD2A4] dark:border-[#3D2C21] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FCFAF9] dark:bg-[#1A1315] border border-[#EBD2A4] dark:border-[#3D2C21] flex items-center justify-center text-[#B58A46] dark:text-[#C89F58] font-bold shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base text-[#241F1D] dark:text-[#F3D39B]">
                {dossier?.patient?.name || "Patient Record"}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FCFAF9] dark:bg-[#161314] text-[#72531F] dark:text-[#DEAF60] border border-[#EBD2A4] dark:border-[#3D2C21]">
                {dossier?.patient?.id || "SW-0001"}
              </span>
            </div>
            <p className="text-xs text-[#72531F] dark:text-[#D4B679] mt-0.5">
              Longitudinal Affect Interval:{" "}
              <span className="font-semibold">{days > 0 ? `Last ${days} Days` : "Full History"}</span> • Total
              Qualitative Logs: <span className="font-semibold">{dossier?.total_entries || 0}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {Array.isArray(dossier?.scripts_detected) && dossier.scripts_detected.map((script: string) => (
            <span
              key={script}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-xl bg-[#FCFAF9] dark:bg-[#161314] text-[#726561] dark:text-[#BA8E94] border border-[#EDE3DF] dark:border-[#2D2427]"
            >
              {script}
            </span>
          ))}
        </div>
      </div>

      {/* Section 1: Executive Clinical Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Mood Balance */}
        <div className="p-5 rounded-3xl bg-[#FCFAF9] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#726561] dark:text-[#9B8E91]">
            <span>Overall Mood Balance</span>
            <Activity className="w-4 h-4 text-[#94676E] dark:text-[#BA8E94]" />
          </div>
          <div>
            <span className="text-2xl font-serif font-bold text-[#241F1D] dark:text-[#EFEAEB] block">
              {(dossier?.mean_valence || 0) > 0.15
                ? "Gentle Positivity"
                : (dossier?.mean_valence || 0) < -0.15
                ? "Carrying Heaviness"
                : "Calm Equilibrium"}
            </span>
            <span className="text-[11px] text-[#726561] dark:text-[#9B8E91] font-medium block mt-0.5">
              Score: {dossier?.mean_valence !== undefined ? (dossier.mean_valence > 0 ? `+${dossier.mean_valence}` : dossier.mean_valence) : "0.0"}
            </span>
          </div>
          {/* Mood Bar */}
          <div className="space-y-1 pt-1">
            <div className="w-full bg-[#EDE3DF] dark:bg-[#2D2427] h-2 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all rounded-full ${
                  (dossier?.mean_valence || 0) >= 0 ? "bg-[#B58A46] dark:bg-[#C89F58]" : "bg-[#94676E] dark:bg-[#BA8E94]"
                }`}
                style={{
                  width: `${Math.min(100, Math.max(15, ((dossier?.mean_valence || 0) + 1) * 50))}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-[#726561]/80 dark:text-[#9B8E91]/80 font-medium px-0.5">
              <span>Heavy</span>
              <span>Balanced</span>
              <span>Uplifted</span>
            </div>
          </div>
          <p className="text-[11px] text-[#726561] dark:text-[#9B8E91] pt-0.5 leading-relaxed">
            Overall emotional sentiment from your reflections.
          </p>
        </div>

        {/* Emotional Steadiness */}
        <div className="p-5 rounded-3xl bg-[#FCFAF9] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#726561] dark:text-[#9B8E91]">
            <span>Emotional Steadiness</span>
            <HeartPulse className="w-4 h-4 text-[#B58A46] dark:text-[#C89F58]" />
          </div>
          <div>
            <span className="text-2xl font-serif font-bold text-[#241F1D] dark:text-[#EFEAEB] block">
              {(dossier?.volatility_score || 0) < 0.25
                ? "Very Steady"
                : (dossier?.volatility_score || 0) < 0.45
                ? "Mild Daily Shifts"
                : "Frequent Highs & Lows"}
            </span>
            <span className="inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-lg bg-[#FAF3E8] dark:bg-[#261E14] text-[#72531F] dark:text-[#F3D39B] border border-[#EBD2A4] dark:border-[#3D2C21] mt-1.5">
              {(dossier?.volatility_score || 0) < 0.25 ? "Calm Consistency" : (dossier?.volatility_score || 0) < 0.45 ? "Natural Variation" : "Active Fluctuations"}
            </span>
          </div>
          <p className="text-[11px] text-[#726561] dark:text-[#9B8E91] leading-relaxed pt-2">
            Measures how smoothly your emotions transition day by day.
          </p>
        </div>

        {/* Recent Trend */}
        <div className="p-5 rounded-3xl bg-[#FCFAF9] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#726561] dark:text-[#9B8E91]">
            <span>Recent Trend</span>
            {(dossier?.slope_angle || 0) > 0.03 ? (
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (dossier?.slope_angle || 0) < -0.03 ? (
              <TrendingDown className="w-4 h-4 text-[#94676E] dark:text-[#BA8E94]" />
            ) : (
              <Minus className="w-4 h-4 text-stone-400" />
            )}
          </div>
          <div>
            <span className="text-2xl font-serif font-bold text-[#241F1D] dark:text-[#EFEAEB] block">
              {(dossier?.slope_angle || 0) > 0.03
                ? "Gradually Lifting"
                : (dossier?.slope_angle || 0) < -0.03
                ? "Feeling Heavier"
                : "Steady Horizon"}
            </span>
            <span className="text-[11px] text-[#726561] dark:text-[#9B8E91] font-medium block mt-0.5">
              {(dossier?.slope_angle || 0) > 0.03
                ? "Consistent positive momentum"
                : (dossier?.slope_angle || 0) < -0.03
                ? "Mild strain over recent days"
                : "Even emotional pattern"}
            </span>
          </div>
          <p className="text-[11px] text-[#726561] dark:text-[#9B8E91] leading-relaxed pt-2">
            The general direction your feelings are moving over this period.
          </p>
        </div>

        {/* Wellbeing Support */}
        <div className="p-5 rounded-3xl bg-[#FCFAF9] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#726561] dark:text-[#9B8E91]">
            <span>Care & Support Guide</span>
            <ShieldCheck className="w-4 h-4 text-[#94676E] dark:text-[#BA8E94]" />
          </div>
          <div>
            <span
              className={`inline-block text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-xl ${
                dossier?.clinical_risk_tier === "High"
                  ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300"
                  : dossier?.clinical_risk_tier === "Elevated"
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300"
                  : dossier?.clinical_risk_tier === "Guarded"
                  ? "bg-[#FAF3E8] dark:bg-[#261E14] text-[#72531F] dark:text-[#F3D39B] border border-[#EBD2A4]"
                  : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200"
              }`}
            >
              {dossier?.clinical_risk_tier === "High"
                ? "Support Recommended"
                : dossier?.clinical_risk_tier === "Elevated"
                ? "Extra Care Helpful"
                : dossier?.clinical_risk_tier === "Guarded"
                ? "Gentle Check-in"
                : "Emotionally Balanced"}
            </span>
          </div>
          <p className="text-[11px] text-[#726561] dark:text-[#9B8E91] leading-relaxed pt-1">
            {dossier?.clinical_risk_tier === "High"
              ? "Consider discussing recent heavy moments with a counselor or trusted friend."
              : dossier?.clinical_risk_tier === "Elevated"
              ? "A supportive prompt to explore recent stressors in your next session."
              : dossier?.clinical_risk_tier === "Guarded"
              ? "Mild fluctuations observed; taking restful pauses can help."
              : "Your emotional baseline is stable and regulated."}
          </p>
        </div>
      </div>

      {/* Section 2: Standardized Psychometric Assessment Center (PHQ-9 & GAD-7) */}
      <div className="p-6 rounded-3xl bg-[#FCFAF9] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EDE3DF] dark:border-[#2D2427] pb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#241F1D] dark:text-[#EFEAEB] flex items-center gap-2">
              Standardized Psychometrics
              <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full bg-[#FAF3E8] dark:bg-[#261E14] text-[#B58A46] dark:text-[#C89F58] border border-[#EBD2A4] dark:border-[#3D2C21]">
                Validated Screening Tools
              </span>
            </h2>
            <p className="text-xs text-[#726561] dark:text-[#9B8E91] mt-1">
              Periodic clinical check-ins bridging qualitative code-mixed journaling with clinical scoring.
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={() => openNewAssessment("PHQ-9")}
              className="px-3.5 py-2 rounded-xl bg-[#FAF3E8] hover:bg-[#F5EAD7] dark:bg-[#261E14] dark:hover:bg-[#33271A] border border-[#EBD2A4] dark:border-[#3D2C21] text-xs font-bold text-[#72531F] dark:text-[#F3D39B] shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>+ Take PHQ-9 (Depression)</span>
            </button>
            <button
              onClick={() => openNewAssessment("GAD-7")}
              className="px-3.5 py-2 rounded-xl bg-[#F7F1EE] hover:bg-[#EDE3DF] dark:bg-[#1E1719] dark:hover:bg-[#2A1D20] border border-[#EDE3DF] dark:border-[#2D2427] text-xs font-bold text-[#94676E] dark:text-[#BA8E94] shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>+ Take GAD-7 (Anxiety)</span>
            </button>
          </div>
        </div>

        {/* Latest Scores Quick Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PHQ-9 Dial Card */}
          <div className="p-4 rounded-2xl bg-[#F7F1EE]/60 dark:bg-[#161314] border border-[#EDE3DF] dark:border-[#2D2427] flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#726561] dark:text-[#9B8E91] block">
                Latest PHQ-9 (Depression)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-serif font-bold text-[#241F1D] dark:text-[#EFEAEB]">
                  {dossier?.psychometrics_recent?.phq9 ? `${dossier.psychometrics_recent.phq9.score}/27` : "No Record"}
                </span>
                {dossier?.psychometrics_recent?.phq9 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#FAF3E8] dark:bg-[#261E14] text-[#B58A46] dark:text-[#C89F58] border border-[#EBD2A4] dark:border-[#3D2C21]">
                    {dossier.psychometrics_recent.phq9.severity}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#726561] dark:text-[#9B8E91] block mt-1">
                {dossier?.psychometrics_recent?.phq9
                  ? `Recorded: ${dossier.psychometrics_recent.phq9.date}`
                  : "Tap '+ Take PHQ-9' to complete baseline"}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FAF3E8] to-[#F7F1EE] dark:from-[#261E14] dark:to-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] flex items-center justify-center text-lg font-bold text-[#94676E] dark:text-[#BA8E94] shrink-0 font-serif">
              9
            </div>
          </div>

          {/* GAD-7 Dial Card */}
          <div className="p-4 rounded-2xl bg-[#F7F1EE]/60 dark:bg-[#161314] border border-[#EDE3DF] dark:border-[#2D2427] flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#726561] dark:text-[#9B8E91] block">
                Latest GAD-7 (Anxiety)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-serif font-bold text-[#241F1D] dark:text-[#EFEAEB]">
                  {dossier?.psychometrics_recent?.gad7 ? `${dossier.psychometrics_recent.gad7.score}/21` : "No Record"}
                </span>
                {dossier?.psychometrics_recent?.gad7 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#FAF3E8] dark:bg-[#261E14] text-[#B58A46] dark:text-[#C89F58] border border-[#EBD2A4] dark:border-[#3D2C21]">
                    {dossier.psychometrics_recent.gad7.severity}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#726561] dark:text-[#9B8E91] block mt-1">
                {dossier?.psychometrics_recent?.gad7
                  ? `Recorded: ${dossier.psychometrics_recent.gad7.date}`
                  : "Tap '+ Take GAD-7' to complete baseline"}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FAF3E8] to-[#F7F1EE] dark:from-[#261E14] dark:to-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] flex items-center justify-center text-lg font-bold text-[#B58A46] dark:text-[#C89F58] shrink-0 font-serif">
              7
            </div>
          </div>
        </div>

        {/* Longitudinal History Timeline */}
        {assessments && assessments.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#726561] dark:text-[#9B8E91]">
              Longitudinal Assessment Timeline
            </h3>
            <div className="divide-y divide-[#EDE3DF] dark:divide-[#2D2427] border border-[#EDE3DF] dark:border-[#2D2427] rounded-2xl overflow-hidden bg-[#FCFAF9] dark:bg-[#161314]">
              {assessments.slice(0, 4).map((item: any) => (
                <div key={item.id} className="p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold px-2.5 py-1 rounded-lg ${
                        item.assessment_type === "PHQ-9"
                          ? "bg-[#FAF3E8] text-[#72531F] dark:bg-[#261E14] dark:text-[#F3D39B]"
                          : "bg-[#F7F1EE] text-[#94676E] dark:bg-[#1E1719] dark:text-[#BA8E94]"
                      }`}
                    >
                      {item.assessment_type}
                    </span>
                    <div>
                      <span className="font-semibold text-[#241F1D] dark:text-[#EFEAEB]">
                        Score: {item.total_score} ({item.severity})
                      </span>
                      {item.notes && (
                        <p className="text-[11px] text-[#726561] dark:text-[#9B8E91] italic mt-0.5">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-[#726561] dark:text-[#9B8E91] font-mono">
                    {item.created_at}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Life Domain Trigger & Vulnerability Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Life Domains Impact */}
        <div className="p-6 rounded-3xl bg-[#FCFAF9] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EDE3DF] dark:border-[#2D2427] pb-3">
            <div>
              <h2 className="text-base font-serif font-bold text-[#241F1D] dark:text-[#EFEAEB] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#94676E] dark:text-[#BA8E94]" />
                Life Domain Trigger Correlation
              </h2>
              <p className="text-xs text-[#726561] dark:text-[#9B8E91] mt-0.5">
                Mapping emotional valence across multi-language code-mixed themes.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {Array.isArray(dossier?.life_domains) && dossier.life_domains.length > 0 ? (
              dossier.life_domains.map((dom: any) => (
                <div
                  key={dom.domain}
                  className="p-3.5 rounded-2xl bg-[#F7F1EE]/60 dark:bg-[#161314] border border-[#EDE3DF] dark:border-[#2D2427] flex items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#241F1D] dark:text-[#EFEAEB]">
                        {dom.domain}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          dom.status === "Resilient"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : dom.status === "Vulnerable"
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                            : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                        }`}
                      >
                        {dom.status} ({dom.avg_valence > 0 ? `+${dom.avg_valence}` : dom.avg_valence})
                      </span>
                    </div>
                    {/* Valence mini bar */}
                    <div className="w-full bg-[#EDE3DF] dark:bg-[#2D2427] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          dom.avg_valence >= 0 ? "bg-[#B58A46] dark:bg-[#C89F58]" : "bg-[#94676E] dark:bg-[#BA8E94]"
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(10, Math.abs(dom.avg_valence) * 100))}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-[#726561] dark:text-[#9B8E91] mt-1 block">
                      Mentioned in {dom.count} reflection{dom.count > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#726561] dark:text-[#9B8E91] italic">
                No life domain triggers detected in this interval.
              </p>
            )}
          </div>
        </div>

        {/* Chronobiological Affect Heatmap */}
        <div className="p-6 rounded-3xl bg-[#FCFAF9] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EDE3DF] dark:border-[#2D2427] pb-3">
            <div>
              <h2 className="text-base font-serif font-bold text-[#241F1D] dark:text-[#EFEAEB] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#B58A46] dark:text-[#C89F58]" />
                Chronobiological Affect Windows
              </h2>
              <p className="text-xs text-[#726561] dark:text-[#9B8E91] mt-0.5">
                Identifying diurnal and weekday emotional vulnerability cycles.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#726561] dark:text-[#9B8E91] block">
              Time of Day Breakdown
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {Array.isArray(dossier?.chronobiology?.time_of_day) && dossier.chronobiology.time_of_day.length > 0 ? (
                dossier.chronobiology.time_of_day.map((tod: any) => (
                  <div
                    key={tod.period}
                    className="p-3 rounded-2xl bg-[#F7F1EE]/60 dark:bg-[#161314] border border-[#EDE3DF] dark:border-[#2D2427] space-y-1"
                  >
                    <span className="text-[11px] font-semibold text-[#241F1D] dark:text-[#EFEAEB] block truncate">
                      {tod.period.split(" ")[0]}
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-bold font-serif text-[#94676E] dark:text-[#BA8E94]">
                        {tod.count > 0 ? (tod.avg_valence > 0 ? `+${tod.avg_valence}` : tod.avg_valence) : "—"}
                      </span>
                      <span className="text-[10px] text-[#726561] dark:text-[#9B8E91]">{tod.count} logs</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-3 text-center text-xs text-[#726561] dark:text-[#9B8E91] italic bg-[#F7F1EE]/40 dark:bg-[#161314] rounded-xl border border-[#EDE3DF] dark:border-[#2D2427]">
                  No time-of-day data available
                </div>
              )}
            </div>

            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#726561] dark:text-[#9B8E91] block pt-2">
              Day of Week Vulnerability
            </span>
            <div className="flex items-end justify-between gap-1 pt-1 h-20 border-b border-[#EDE3DF] dark:border-[#2D2427] pb-1">
              {Array.isArray(dossier?.chronobiology?.day_of_week) && dossier.chronobiology.day_of_week.length > 0 ? (
                dossier.chronobiology.day_of_week.map((dow: any) => {
                  const heightPct = Math.min(100, Math.max(15, Math.abs(dow.avg_valence) * 100));
                  const isPos = dow.avg_valence >= 0;
                  return (
                    <div key={dow.day} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full max-w-[18px] rounded-t-sm transition-all ${
                          dow.count === 0
                            ? "bg-stone-200 dark:bg-stone-800 h-2"
                            : isPos
                            ? "bg-[#B58A46] dark:bg-[#C89F58]"
                            : "bg-[#94676E] dark:bg-[#BA8E94]"
                        }`}
                        style={{ height: dow.count === 0 ? "4px" : `${heightPct * 0.55}px` }}
                        title={`${dow.day}: ${dow.avg_valence} (${dow.count} entries)`}
                      />
                      <span className="text-[9px] text-[#726561] dark:text-[#9B8E91]">
                        {dow.day.slice(0, 2)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full text-center text-xs text-[#726561] dark:text-[#9B8E91] italic py-4">
                  No day-of-week data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Therapy Session Agenda & Discussion Guide */}
      <div className="p-6 rounded-3xl bg-[#FAF3E8]/50 dark:bg-[#261E14]/40 border border-[#EBD2A4] dark:border-[#3D2C21] shadow-xs space-y-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-[#B58A46] dark:text-[#C89F58] block mb-1">
            Clinical Preparation
          </span>
          <h2 className="text-xl font-serif font-bold text-[#241F1D] dark:text-[#F3D39B] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#B58A46] dark:text-[#C89F58]" />
            Therapy Session Agenda & Socratic Focus Areas
          </h2>
          <p className="text-xs text-[#72531F] dark:text-[#D4B679] mt-0.5">
            AI-synthesized talking points and significant qualitative events to review with your psychologist or counselor.
          </p>
        </div>

        {/* Curated Socratic Questions */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#72531F] dark:text-[#F3D39B]">
            Recommended In-Session Discussion Prompts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.isArray(dossier?.therapeutic_agenda) && dossier.therapeutic_agenda.map((agenda: string, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#FCFAF9] dark:bg-[#1A1315] border border-[#EBD2A4] dark:border-[#3D2C21] flex items-start gap-3 shadow-2xs"
              >
                <div className="w-6 h-6 rounded-full bg-[#FAF3E8] dark:bg-[#261E14] border border-[#EBD2A4] text-[#B58A46] dark:text-[#C89F58] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs font-medium text-[#241F1D] dark:text-[#EFEAEB] leading-relaxed">
                  {agenda}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Significant Clinical Episodes for Review */}
        {Array.isArray(dossier?.key_clinical_episodes) && dossier.key_clinical_episodes.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#72531F] dark:text-[#F3D39B]">
              Significant Emotional Episodes for Review
            </h3>
            <div className="space-y-3">
              {dossier.key_clinical_episodes.map((ep: any) => (
                <div
                  key={ep.id}
                  className="p-4 rounded-2xl bg-[#FCFAF9] dark:bg-[#1A1315] border border-[#EDE3DF] dark:border-[#2D2427] space-y-2 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        {ep.primary_emotion} ({ep.valence > 0 ? `+${ep.valence}` : ep.valence})
                      </span>
                      {ep.is_safety_flagged && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-600 text-white">
                          Safety Flag
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#726561] dark:text-[#9B8E91] font-mono">
                      {ep.date}
                    </span>
                  </div>
                  <p className="text-xs text-[#241F1D] dark:text-[#EFEAEB] italic leading-relaxed">
                    "{ep.excerpt}"
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-[#726561] dark:text-[#9B8E91]">Detected context:</span>
                    {ep.detected_domains?.map((d: string) => (
                      <span
                        key={d}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F7F1EE] dark:bg-[#1E1719] text-[#94676E] dark:text-[#BA8E94]"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 5: In-Session Clinician Notes & Action Plan */}
      <div className="p-6 rounded-3xl bg-[#FCFAF9] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EDE3DF] dark:border-[#2D2427] pb-3">
          <div>
            <h2 className="text-base font-serif font-bold text-[#241F1D] dark:text-[#EFEAEB] flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-[#94676E] dark:text-[#BA8E94]" />
              Therapist Notes & Collaborative Action Plan
            </h2>
            <p className="text-xs text-[#726561] dark:text-[#9B8E91] mt-0.5">
              Record insights, homework exercises, and therapeutic commitments established during your appointment.
            </p>
          </div>
          <button
            onClick={saveSessionNotes}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FAF3E8] hover:bg-[#F5EAD7] dark:bg-[#261E14] dark:hover:bg-[#33271A] border border-[#EBD2A4] dark:border-[#3D2C21] text-xs font-bold text-[#72531F] dark:text-[#F3D39B] transition-all cursor-pointer self-start sm:self-auto print:hidden"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{sessionNotesSaved ? "Saved to Record!" : "Save Notes"}</span>
          </button>
        </div>

        <div>
          <textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Type clinical session takeaways, homework assignments (e.g. 60-second breathing, sleep schedule, cognitive thought reframing), or therapist observations..."
            rows={4}
            className="w-full p-4 bg-[#F7F1EE]/60 dark:bg-[#161314] border border-[#EDE3DF] dark:border-[#2D2427] rounded-2xl text-xs text-[#241F1D] dark:text-[#EFEAEB] placeholder-[#9B8E91] focus:outline-none focus:ring-2 focus:ring-[#94676E] leading-relaxed"
          />
        </div>

        {/* Print-Only Signature Line */}
        <div className="hidden print:flex justify-between items-end pt-12 text-xs text-stone-700">
          <div>
            <div className="w-48 border-b border-stone-800 mb-1"></div>
            <span>Patient Signature</span>
          </div>
          <div>
            <div className="w-48 border-b border-stone-800 mb-1"></div>
            <span>Licensed Clinician / Therapist Signature</span>
          </div>
        </div>
      </div>

      {/* Assessment Modal (PHQ-9 or GAD-7) */}
      {isAssessmentModalOpen && questionsData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs print:hidden animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] bg-[#FCFAF9] dark:bg-[#191416] border border-[#EDE3DF] dark:border-[#2D2427] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#EDE3DF] dark:border-[#2D2427] flex items-center justify-between bg-[#F8F3F1] dark:bg-[#161113]">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-[#94676E] dark:text-[#BA8E94]">
                  Clinical Check-In
                </span>
                <h2 className="text-xl font-serif font-bold text-[#241F1D] dark:text-[#EFEAEB] mt-0.5">
                  {activeAssessmentType === "PHQ-9"
                    ? questionsData.phq9.title
                    : questionsData.gad7.title}
                </h2>
                <p className="text-xs text-[#726561] dark:text-[#9B8E91] mt-1">
                  {activeAssessmentType === "PHQ-9"
                    ? questionsData.phq9.description
                    : questionsData.gad7.description}
                </p>
              </div>
              <button
                onClick={() => setIsAssessmentModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#726561] dark:text-[#9B8E91] hover:bg-[#EDE3DF] dark:hover:bg-[#2D2427] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions List */}
            <form onSubmit={submitAssessmentForm} className="p-6 overflow-y-auto space-y-6 flex-1">
              {assessmentSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{assessmentSuccessMsg}</span>
                </div>
              )}

              {(activeAssessmentType === "PHQ-9"
                ? questionsData.phq9.questions
                : questionsData.gad7.questions
              ).map((q: any, qIdx: number) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-[#F7F1EE]/60 dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] space-y-3"
                >
                  <p className="text-xs font-semibold text-[#241F1D] dark:text-[#EFEAEB] leading-relaxed">
                    {qIdx + 1}. {q.text}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {questionsData.response_options.map((opt: any) => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => handleAnswerChange(qIdx, opt.value)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs ${
                          assessmentAnswers[qIdx] === opt.value
                            ? "bg-[#94676E] text-white border-[#94676E] dark:bg-[#BA8E94] dark:text-[#181113] font-bold shadow-xs"
                            : "bg-[#FCFAF9] dark:bg-[#161113] border-[#EDE3DF] dark:border-[#2D2427] text-[#726561] dark:text-[#9B8E91] hover:border-[#94676E]"
                        }`}
                      >
                        <span className="block text-[10px] font-mono opacity-80 mb-0.5">
                          {opt.value} pts
                        </span>
                        <span className="font-medium text-[11px] leading-tight block">
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Optional User Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#726561] dark:text-[#9B8E91] mb-2">
                  Self-Reflection / Trigger Notes (Optional)
                </label>
                <textarea
                  value={assessmentNotes}
                  onChange={(e) => setAssessmentNotes(e.target.value)}
                  placeholder="Note any specific triggers or thoughts (e.g. work stress, sleep deprivation)..."
                  rows={2}
                  className="w-full p-3 bg-[#F7F1EE]/60 dark:bg-[#161113] border border-[#EDE3DF] dark:border-[#2D2427] rounded-xl text-xs text-[#241F1D] dark:text-[#EFEAEB] placeholder-[#9B8E91] focus:outline-none focus:ring-2 focus:ring-[#94676E]"
                />
              </div>

              {/* Running Tally Bar */}
              <div className="p-4 rounded-2xl bg-[#FAF3E8] dark:bg-[#261E14] border border-[#EBD2A4] dark:border-[#3D2C21] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#72531F] dark:text-[#DEAF60] block">
                    Calculated Score
                  </span>
                  <span className="text-xl font-serif font-bold text-[#241F1D] dark:text-[#F3D39B]">
                    {currentTally} / {activeAssessmentType === "PHQ-9" ? 27 : 21}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold ${getTallySeverity().color}`}>
                    {getTallySeverity().label}
                  </span>
                  <span className="text-[10px] text-[#72531F] dark:text-[#DEAF60] block mt-0.5">
                    Standardized Severity
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssessmentModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#EDE3DF] dark:border-[#2D2427] text-xs font-semibold text-[#726561] dark:text-[#9B8E91] hover:bg-[#F7F1EE] dark:hover:bg-[#1C1719] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAssessment}
                  className="px-5 py-2.5 rounded-xl bg-[#94676E] hover:bg-[#83535B] dark:bg-[#BA8E94] dark:hover:bg-[#C89F58] text-white dark:text-[#181113] text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingAssessment ? "Saving Check-In..." : "Submit Clinical Assessment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
