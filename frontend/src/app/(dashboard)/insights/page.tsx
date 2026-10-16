"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import {
  Info,
  X,
  TrendingDown,
  Activity,
  Sparkles,
  Loader2,
  HeartHandshake,
  BarChart3,
  BookOpen,
} from "lucide-react";
import api from "../../../lib/api";
import Link from "next/link";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    const scoreVal = typeof item.score === "number" ? item.score : 0;
    const sign = scoreVal > 0 ? "+" : "";
    const emotionStr = item.primary_emotion || "neutral";
    const dateObj = item.datetime ? new Date(item.datetime) : new Date(item.date);
    
    const formattedDate = isNaN(dateObj.getTime())
      ? item.date
      : dateObj.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
    const formattedTime = item.time || (!isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }) : "");

    return (
      <div className="bg-[#19221C]/95 backdrop-blur-md rounded-2xl border border-[#C8D7C5]/30 text-[#F5EFE6] text-xs p-3.5 shadow-xl space-y-2 min-w-[170px]">
        <div className="text-[#A6A099] font-medium text-[11px] flex items-center justify-between gap-3 border-b border-[#28362D] pb-1.5">
          <span>{formattedDate}</span>
          {formattedTime && <span className="text-[#86A882]">{formattedTime}</span>}
        </div>
        {item.title && (
          <div className="font-serif font-semibold text-[#F5EFE6] truncate max-w-[200px]">
            {item.title}
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#A6A099]">Valence:</span>
          <span className={`font-semibold font-mono ${scoreVal >= 0 ? "text-emerald-400" : "text-indigo-300"}`}>
            {sign}{scoreVal.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#A6A099]">Emotion:</span>
          <span className="capitalize font-semibold text-[#F5EFE6] px-2 py-0.5 rounded-lg bg-[#28362D] text-[11px]">
            {emotionStr}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function InsightsPage() {
  const [range, setRange] = useState(7);
  const [dismissNudge, setDismissNudge] = useState(false);

  const { data, error } = useSWR(`/api/insights/trajectory?days=${range}`, fetcher);
  const { data: weeklyData } = useSWR("/api/insights/weekly", fetcher);

  const formatDay = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      joy: "bg-amber-400 dark:bg-amber-500",
      calm: "bg-emerald-400 dark:bg-emerald-500",
      hopeful: "bg-teal-400 dark:bg-teal-500",
      stress: "bg-indigo-400 dark:bg-indigo-500",
      anxiety: "bg-purple-400 dark:bg-purple-500",
      sadness: "bg-blue-400 dark:bg-blue-500",
    };
    return colors[emotion?.toLowerCase()] || "bg-slate-400";
  };

  const hasData = data?.trajectory && data.trajectory.length > 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#24201D] dark:text-[#F5EFE6]">
            Insights & Analytics
          </h1>
          <p className="text-[#68625D] dark:text-[#A6A099] text-sm mt-1">
            Track your emotional trajectory, language cadence, and long-term reflection patterns.
          </p>
        </div>

        <div className="flex bg-[#D6E3D3] dark:bg-[#141C17] p-1.5 rounded-2xl border border-[#C8D7C5] dark:border-[#28362D] self-start sm:self-auto">
          {[
            { label: "7 Days", value: 7 },
            { label: "30 Days", value: 30 },
            { label: "3 Months", value: 90 },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                range === r.value
                  ? "bg-[#5F7E5C] dark:bg-[#86A882] text-white dark:text-[#0F1713] shadow-xs"
                  : "text-[#596557] dark:text-[#A6A099] hover:text-[#24201D] dark:hover:text-[#F5EFE6]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {!data && !error ? (
        <div className="flex justify-center py-20 text-[#A6A099]">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : !hasData ? (
        /* Empty State */
        <div className="text-center py-16 px-6 border border-dashed border-[#C8D7C5] dark:border-[#28362D] rounded-3xl bg-[#E4ECE2]/80 dark:bg-[#19221C]/60 shadow-xs max-w-lg mx-auto space-y-4 backdrop-blur-xs">
          <div className="w-14 h-14 bg-[#D6E3D3] dark:bg-[#1D2D23] text-[#5F7E5C] dark:text-[#86A882] rounded-2xl mx-auto flex items-center justify-center">
            <BarChart3 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-serif font-semibold text-[#24201D] dark:text-[#F5EFE6]">
            No reflections in this time frame
          </h2>
          <p className="text-[#596557] dark:text-[#A6A099] text-sm leading-relaxed">
            Write journal reflections to view real emotional trajectories and patterns. Antara never fabricates sample analytics.
          </p>
          <Link
            href="/journal"
            className="inline-block bg-[#5F7E5C] hover:bg-[#4D674A] dark:bg-[#86A882] dark:hover:bg-[#96B892] text-white dark:text-[#0F1713] px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all shadow-xs"
          >
            Write a Reflection
          </Link>
        </div>
      ) : (
        <>
          {/* Gentle Wellbeing Nudge Banner (Section 17) */}
          {data?.show_nudge && !dismissNudge && (
            <div className="bg-[#D6E3D3]/90 dark:bg-[#1D2D23] border border-[#C8D7C5] dark:border-[#2D4434] rounded-3xl p-6 relative overflow-hidden shadow-xs">
              <button
                onClick={() => setDismissNudge(true)}
                className="absolute top-4 right-4 text-[#596557] hover:text-[#24201D] dark:text-[#A6A099] dark:hover:text-[#F5EFE6] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-start space-x-4">
                <div className="bg-[#E4ECE2] dark:bg-[#141C17] p-3 rounded-2xl shadow-xs text-[#5F7E5C] dark:text-[#86A882] shrink-0">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div className="space-y-2 pr-6">
                  <h3 className="font-serif font-semibold text-[#24201D] dark:text-[#F5EFE6] text-lg">
                    Gentle Wellbeing Check-in
                  </h3>
                  <p className="text-[#596557] dark:text-[#A6A099] text-sm leading-relaxed">
                    {data.nudge_message ||
                      "We noticed your reflections have shown a sustained downward pattern over the past week. Please remember to take things one step at a time, grant yourself rest, and reach out to someone who cares."}
                  </p>
                  <p className="text-xs text-[#5F7E5C] dark:text-[#86A882]">
                    Antara is a supportive reflection companion, not a clinical diagnostic system.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Emotional Trajectory Chart */}
          <div className="bg-[#E4ECE2]/80 dark:bg-[#19221C] border border-[#C8D7C5] dark:border-[#28362D] rounded-3xl p-6 sm:p-7 shadow-xs space-y-6 transition-colors backdrop-blur-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-[#D6E3D3] dark:bg-[#1D2D23] text-[#5F7E5C] dark:text-[#86A882]">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-semibold text-[#24201D] dark:text-[#F5EFE6]">
                    Emotional Trajectory ({range} Days)
                  </h2>
                  <p className="text-xs text-[#596557] dark:text-[#A6A099]">
                    Valence scale: -1.0 (strongly negative) to +1.0 (strongly positive)
                  </p>
                </div>
              </div>

              {data?.observed_pattern && (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#D6E3D3] dark:bg-[#141C17] text-xs font-semibold text-[#24201D] dark:text-[#F5EFE6] self-start sm:self-auto border border-[#C8D7C5] dark:border-[#28362D]">
                  <Sparkles className="w-3.5 h-3.5 text-[#5F7E5C] dark:text-[#86A882]" />
                  <span>Pattern: {data.observed_pattern}</span>
                </div>
              )}
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.trajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5F7E5C" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#5F7E5C" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#C8D7C5" opacity={0.6} />
                  <XAxis
                    dataKey="datetime"
                    tickFormatter={formatDay}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#596557", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    domain={[-1, 1]}
                    ticks={[-1, -0.5, 0, 0.5, 1]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#596557", fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0} stroke="#596557" strokeDasharray="3 3" opacity={0.6} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#5F7E5C"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                    dot={{ r: 4, strokeWidth: 2, fill: "#E4ECE2", stroke: "#5F7E5C" }}
                    activeDot={{ r: 6, stroke: "#5F7E5C", strokeWidth: 0, fill: "#5F7E5C" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Grid: Weekly Summary & Emotion Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Summary Card */}
            <div className="bg-[#E4ECE2]/80 dark:bg-[#19221C] border border-[#C8D7C5] dark:border-[#28362D] rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4 transition-colors backdrop-blur-xs">
              <div>
                <div className="flex items-center space-x-2.5 mb-4">
                  <div className="p-2 rounded-xl bg-[#D6E3D3] dark:bg-[#1D2D23] text-[#5F7E5C] dark:text-[#86A882]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-[#24201D] dark:text-[#F5EFE6]">
                    Weekly Narrative Reflection
                  </h3>
                </div>

                <div className="p-5 rounded-2xl bg-[#D6E3D3]/80 dark:bg-[#141C17] border border-[#C8D7C5] dark:border-[#28362D]">
                  <p className="text-[#24201D] dark:text-[#F5EFE6] leading-relaxed text-sm sm:text-base">
                    {weeklyData?.weekly_summary ||
                      "Your reflections this week provide rich insight into your inner journey. Continue writing regularly to deepen your longitudinal insights."}
                  </p>
                </div>
              </div>

              <div className="pt-2 text-xs text-[#596557] dark:text-[#A6A099] italic">
                {data?.disclaimer ||
                  "Observed emotional patterns are derived from self-reflections and are not a clinical diagnosis."}
              </div>
            </div>

            {/* Emotion Distribution */}
            <div className="bg-[#E4ECE2]/80 dark:bg-[#19221C] border border-[#C8D7C5] dark:border-[#28362D] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4 transition-colors backdrop-blur-xs">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-[#D6E3D3] dark:bg-[#1D2D23] text-[#5F7E5C] dark:text-[#86A882]">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-[#24201D] dark:text-[#F5EFE6]">
                  Emotion Distribution
                </h3>
              </div>

              <div className="space-y-3.5 pt-2">
                {data?.emotion_distribution && Object.keys(data.emotion_distribution).length > 0 ? (
                  Object.entries(data.emotion_distribution).map(
                    ([emotion, percentage]: [string, any]) => (
                      <div key={emotion} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="capitalize text-[#24201D] dark:text-[#F5EFE6]">
                            {emotion}
                          </span>
                          <span className="text-[#596557] dark:text-[#A6A099]">{percentage}%</span>
                        </div>
                        <div className="w-full bg-[#D6E3D3] dark:bg-[#141C17] rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full ${getEmotionColor(emotion)} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <p className="text-[#A6A099] text-sm">No emotion distribution available.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
