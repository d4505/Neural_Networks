"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  TrendingDown,
  Activity,
  Sparkles,
  Loader2,
  HeartHandshake,
  BarChart3,
  BookOpen,
  X,
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
    const formattedTime =
      item.time ||
      (!isNaN(dateObj.getTime())
        ? dateObj.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "");

    return (
      <div className="bg-[#1C1719]/95 backdrop-blur-md rounded-2xl border border-[#EDE3DF]/40 dark:border-[#2D2427] text-[#EFEAEB] text-xs p-3.5 shadow-xl space-y-2 min-w-[170px]">
        <div className="text-[#9B8E91] font-medium text-[11px] flex items-center justify-between gap-3 border-b border-[#2D2427] pb-1.5">
          <span>{formattedDate}</span>
          {formattedTime && <span className="text-[#C89F58]">{formattedTime}</span>}
        </div>
        {item.title && (
          <div className="font-serif font-semibold text-[#EFEAEB] truncate max-w-[200px]">
            {item.title}
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#9B8E91]">Valence:</span>
          <span
            className={`font-semibold font-mono ${
              scoreVal >= 0 ? "text-[#C89F58]" : "text-[#BA8E94]"
            }`}
          >
            {sign}
            {scoreVal.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#9B8E91]">Emotion:</span>
          <span className="capitalize font-semibold text-[#72531F] dark:text-[#F3D39B] px-2 py-0.5 rounded-lg bg-[#FAF3E8] dark:bg-[#261E14] border border-[#EBD2A4] dark:border-[#3D2C21] text-[11px]">
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
      joy: "bg-[#C89F58]",
      calm: "bg-[#BA8E94]",
      hopeful: "bg-[#B58A46]",
      stress: "bg-[#94676E]",
      anxiety: "bg-[#83535B]",
      sadness: "bg-[#6E4B52]",
    };
    return colors[emotion?.toLowerCase()] || "bg-[#BA8E94]";
  };

  const hasData = data?.trajectory && data.trajectory.length > 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#241F1D] dark:text-[#EFEAEB] tracking-tight">
            Insights & Analytics
          </h1>
          <p className="text-[#726561] dark:text-[#9B8E91] text-sm mt-1">
            Track your emotional trajectory, language cadence, and long-term reflection patterns.
          </p>
        </div>

        {/* Range Selector Pills in Rosewater & Honey */}
        <div className="flex bg-[#F7F1EE] dark:bg-[#1E1719] p-1.5 rounded-2xl border border-[#EDE3DF] dark:border-[#2D2427] self-start sm:self-auto shadow-2xs">
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
                  ? "bg-[#94676E] dark:bg-[#BA8E94] text-white dark:text-[#181113] shadow-xs font-bold"
                  : "text-[#726561] dark:text-[#9B8E91] hover:text-[#241F1D] dark:hover:text-[#EFEAEB]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {!data && !error ? (
        <div className="flex justify-center py-20 text-[#9B8E91]">
          <Loader2 className="animate-spin w-8 h-8 text-[#94676E] dark:text-[#BA8E94]" />
        </div>
      ) : !hasData ? (
        /* Empty State Card in Rosewater & Honey */
        <div className="text-center py-16 px-6 border border-dashed border-[#EDE3DF] dark:border-[#2D2427] rounded-3xl bg-[#FAF3E8]/80 dark:bg-[#1C1719]/80 shadow-xs max-w-lg mx-auto space-y-4 backdrop-blur-xs">
          <div className="w-14 h-14 bg-[#FAF3E8] dark:bg-[#261E14] text-[#B58A46] dark:text-[#C89F58] border border-[#EBD2A4] dark:border-[#3D2C21] rounded-2xl mx-auto flex items-center justify-center shadow-2xs">
            <BarChart3 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-serif font-semibold text-[#241F1D] dark:text-[#EFEAEB]">
            No reflections in this time frame
          </h2>
          <p className="text-[#726561] dark:text-[#9B8E91] text-sm leading-relaxed">
            Write journal reflections to view real emotional trajectories and patterns. Swadhyaya never fabricates sample analytics.
          </p>
          <div className="pt-2">
            <Link
              href="/journal"
              className="inline-block bg-[#94676E] hover:bg-[#83535B] dark:bg-[#BA8E94] dark:hover:bg-[#C89F58] text-white dark:text-[#181113] px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all shadow-xs cursor-pointer"
            >
              Write a Reflection
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Gentle Wellbeing Nudge Banner */}
          {data?.show_nudge && !dismissNudge && (
            <div className="bg-[#FAF3E8] dark:bg-[#261E14] border border-[#EBD2A4] dark:border-[#3D2C21] rounded-3xl p-6 relative overflow-hidden shadow-xs">
              <button
                onClick={() => setDismissNudge(true)}
                className="absolute top-4 right-4 text-[#72531F] hover:text-[#241F1D] dark:text-[#F3D39B] dark:hover:text-[#EFEAEB] p-1 cursor-pointer"
                aria-label="Dismiss banner"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-start space-x-4">
                <div className="bg-[#FCFAF9] dark:bg-[#1A1315] p-3 rounded-2xl shadow-xs text-[#B58A46] dark:text-[#C89F58] border border-[#EBD2A4] dark:border-[#3D2C21] shrink-0">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div className="space-y-2 pr-6">
                  <h3 className="font-serif font-semibold text-[#241F1D] dark:text-[#EFEAEB] text-lg">
                    Gentle Wellbeing Check-in
                  </h3>
                  <p className="text-[#726561] dark:text-[#9B8E91] text-sm leading-relaxed">
                    {data.nudge_message ||
                      "We noticed your reflections have shown a sustained downward pattern over the past week. Please remember to take things one step at a time, grant yourself rest, and reach out to someone who cares."}
                  </p>
                  <p className="text-xs text-[#B58A46] dark:text-[#C89F58]">
                    Swadhyaya is a supportive reflection companion, not a clinical diagnostic system.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Emotional Trajectory Chart in Rosewater & Honey */}
          <div className="bg-[#FCFAF9] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] rounded-3xl p-6 sm:p-7 shadow-xs space-y-6 transition-colors backdrop-blur-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-[#FAF3E8] dark:bg-[#261E14] border border-[#EDE3DF] dark:border-[#2D2427] text-[#94676E] dark:text-[#BA8E94]">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-semibold text-[#241F1D] dark:text-[#EFEAEB]">
                    Emotional Trajectory ({range} Days)
                  </h2>
                  <p className="text-xs text-[#726561] dark:text-[#9B8E91]">
                    Valence scale: -1.0 (heavier emotions) to +1.0 (peaceful & joyful)
                  </p>
                </div>
              </div>

              {data?.observed_pattern && (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FAF3E8] dark:bg-[#261E14] text-xs font-semibold text-[#72531F] dark:text-[#F3D39B] self-start sm:self-auto border border-[#EBD2A4] dark:border-[#3D2C21]">
                  <Sparkles className="w-3.5 h-3.5 text-[#B58A46] dark:text-[#C89F58]" />
                  <span>Pattern: {data.observed_pattern}</span>
                </div>
              )}
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.trajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94676E" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#94676E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDE3DF" opacity={0.6} />
                  <XAxis
                    dataKey="datetime"
                    tickFormatter={formatDay}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#726561", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    domain={[-1, 1]}
                    ticks={[-1, -0.5, 0, 0.5, 1]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#726561", fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0} stroke="#B58A46" strokeDasharray="3 3" opacity={0.6} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#94676E"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                    dot={{ r: 4, strokeWidth: 2, fill: "#FAF3E8", stroke: "#94676E" }}
                    activeDot={{ r: 6, stroke: "#FAF3E8", strokeWidth: 2, fill: "#94676E" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Grid: Weekly Summary & Emotion Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Summary Card */}
            <div className="bg-[#FCFAF9] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4 transition-colors backdrop-blur-xs">
              <div>
                <div className="flex items-center space-x-2.5 mb-4">
                  <div className="p-2 rounded-xl bg-[#FAF3E8] dark:bg-[#261E14] text-[#B58A46] dark:text-[#C89F58] border border-[#EBD2A4] dark:border-[#3D2C21]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-[#241F1D] dark:text-[#EFEAEB]">
                    Weekly Narrative Reflection
                  </h3>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAF3E8]/80 dark:bg-[#161314] border border-[#EBD2A4] dark:border-[#3D2C21]">
                  <p className="text-[#241F1D] dark:text-[#EFEAEB] leading-relaxed text-sm sm:text-base">
                    {weeklyData?.weekly_summary ||
                      "Your reflections this week provide rich insight into your inner journey. Continue writing regularly to deepen your longitudinal insights."}
                  </p>
                </div>
              </div>

              <div className="pt-2 text-xs text-[#726561] dark:text-[#9B8E91] italic">
                {data?.disclaimer ||
                  "Observed emotional patterns are derived from self-reflections and are not a clinical diagnosis."}
              </div>
            </div>

            {/* Emotion Distribution */}
            <div className="bg-[#FCFAF9] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4 transition-colors backdrop-blur-xs">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-[#FAF3E8] dark:bg-[#261E14] text-[#94676E] dark:text-[#BA8E94] border border-[#EDE3DF] dark:border-[#2D2427]">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-[#241F1D] dark:text-[#EFEAEB]">
                  Emotion Distribution
                </h3>
              </div>

              <div className="space-y-3.5 pt-2">
                {data?.emotion_distribution && Object.keys(data.emotion_distribution).length > 0 ? (
                  Object.entries(data.emotion_distribution).map(
                    ([emotion, percentage]: [string, any]) => (
                      <div key={emotion} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="capitalize text-[#241F1D] dark:text-[#EFEAEB]">
                            {emotion}
                          </span>
                          <span className="text-[#726561] dark:text-[#9B8E91]">{percentage}%</span>
                        </div>
                        <div className="w-full bg-[#EDE3DF] dark:bg-[#2D2427] rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full ${getEmotionColor(emotion)} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <p className="text-[#9B8E91] text-sm italic">No emotion distribution available.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
