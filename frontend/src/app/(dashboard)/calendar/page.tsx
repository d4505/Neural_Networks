"use client";

import { useState } from "react";
import useSWR from "swr";
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Loader2, BookOpen, Sparkles } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from "date-fns";
import clsx from "clsx";
import api from "../../../lib/api";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: calendarData, error } = useSWR(
    `/api/calendar?year=${year}&month=${month}`,
    fetcher
  );

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      joy: "bg-[#B58A46] dark:bg-[#C89F58]",
      hopeful: "bg-[#C89F58] dark:bg-[#DEAF60]",
      calm: "bg-[#94676E] dark:bg-[#BA8E94]",
      sadness: "bg-stone-400 dark:bg-stone-500",
      anxiety: "bg-rose-400 dark:bg-rose-500",
      stress: "bg-zinc-500 dark:bg-zinc-400",
    };
    return colors[emotion?.toLowerCase()] || "bg-[#94676E]";
  };

  const daysMap = calendarData?.days || {};

  const getDayIndicator = (dateStr: string) => {
    const dayInfo = daysMap[dateStr];
    if (!dayInfo || !dayInfo.entries || dayInfo.entries.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center justify-center gap-1 mt-1.5 px-1">
        {dayInfo.entries.slice(0, 3).map((entry: any, i: number) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${getEmotionColor(entry.primary_emotion)} ring-1 ring-[#FCFAF9] dark:ring-[#1C1719]`}
            title={`${entry.primary_emotion} (${entry.sentiment})`}
          />
        ))}
        {dayInfo.entries.length > 3 && (
          <span className="text-[9px] text-[#726561] dark:text-[#9B8E91] font-semibold leading-none">
            +{dayInfo.entries.length - 3}
          </span>
        )}
      </div>
    );
  };

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedDayInfo = selectedDateStr ? daysMap[selectedDateStr] : null;
  const selectedEntries = selectedDayInfo?.entries || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#241F1D] dark:text-[#EFEAEB]">
            Calendar
          </h1>
          <p className="text-[#726561] dark:text-[#9B8E91] text-sm mt-1">
            Explore your reflections and longitudinal emotional cadence across dates.
          </p>
        </div>
        <button
          onClick={goToToday}
          className="self-start sm:self-auto px-4 py-2 bg-[#94676E] hover:bg-[#83585F] dark:bg-[#BA8E94] dark:hover:bg-[#CBA1A7] text-white dark:text-[#181214] rounded-2xl text-sm font-semibold shadow-xs transition-all cursor-pointer flex items-center space-x-2"
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Jump to Today</span>
        </button>
      </div>

      {!calendarData && !error ? (
        <div className="flex justify-center py-20 text-[#9B8E91]">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : (
        <div className="bg-[#FCFAF9] dark:bg-[#1C1719] border border-[#EDE3DF] dark:border-[#2D2427] rounded-3xl shadow-xs overflow-hidden transition-colors backdrop-blur-xs">
          {/* Navigation Bar */}
          <div className="p-6 border-b border-[#EDE3DF] dark:border-[#2D2427] flex items-center justify-between">
            <h2 className="text-2xl font-serif font-semibold text-[#241F1D] dark:text-[#EFEAEB]">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <div className="flex items-center space-x-1">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-[#F7EFF1] dark:hover:bg-[#2D2226] rounded-xl text-[#726561] dark:text-[#9B8E91] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-[#F7EFF1] dark:hover:bg-[#2D2226] rounded-xl text-[#726561] dark:text-[#9B8E91] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Day of Week Header */}
          <div className="grid grid-cols-7 border-b border-[#EDE3DF] dark:border-[#2D2427] bg-[#FAF3E8]/80 dark:bg-[#261E14]/70">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-semibold text-[#726561] dark:text-[#9B8E91] tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr">
            {days.map((day, i) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayInfo = daysMap[dateStr];
              const hasEntries = dayInfo && dayInfo.entry_count > 0;
              const isSelected = selectedDateStr === dateStr;

              return (
                <div
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={clsx(
                    "min-h-[105px] p-2 border-r border-b border-[#EDE3DF]/80 dark:border-[#2D2427]/80 transition-all flex flex-col items-center justify-between cursor-pointer hover:bg-[#F7EFF1]/70 dark:hover:bg-[#2D2226]/50",
                    !isSameMonth(day, monthStart) && "bg-[#EDE3DF]/20 dark:bg-[#161214]/40 text-[#9B8E91]/40",
                    isToday(day) && "bg-[#F7EFF1] dark:bg-[#2D2226] ring-2 ring-inset ring-[#94676E]/50 dark:ring-[#BA8E94]/50",
                    isSelected && "bg-[#FAF3E8] dark:bg-[#261E14] shadow-inner",
                    (i + 1) % 7 === 0 && "border-r-0"
                  )}
                >
                  <div
                    className={clsx(
                      "w-7 h-7 flex items-center justify-center rounded-full text-xs transition-all",
                      isToday(day)
                        ? "bg-[#94676E] dark:bg-[#BA8E94] text-white dark:text-[#181214] font-bold shadow-xs"
                        : hasEntries
                        ? "font-bold text-[#241F1D] dark:text-[#EFEAEB] bg-[#FAF3E8] dark:bg-[#261E14] border border-[#EBD2A4] dark:border-[#3D2C21]"
                        : "text-[#726561] dark:text-[#9B8E91]"
                    )}
                  >
                    {format(day, "d")}
                  </div>

                  <div className="w-full pb-1">{getDayIndicator(dateStr)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day Reflections Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FCFAF9] dark:bg-[#1C1719] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-[#EDE3DF] dark:border-[#2D2427] max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#EDE3DF] dark:border-[#2D2427] sticky top-0 bg-[#FCFAF9]/95 dark:bg-[#1C1719]/95 backdrop-blur-md z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-[#F7EFF1] dark:bg-[#2D2226] text-[#94676E] dark:text-[#BA8E94] border border-[#EDE3DF] dark:border-[#3B282F]">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#241F1D] dark:text-[#EFEAEB]">
                    {format(selectedDate, "MMMM d, yyyy")}
                  </h3>
                  <p className="text-xs text-[#726561] dark:text-[#9B8E91]">
                    {selectedEntries.length} reflection{selectedEntries.length !== 1 ? "s" : ""} recorded
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1.5 text-[#726561] hover:text-[#241F1D] dark:text-[#9B8E91] dark:hover:text-[#EFEAEB] rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {selectedEntries.length === 0 ? (
                <div className="text-center py-10 space-y-4">
                  <p className="text-[#726561] dark:text-[#9B8E91] text-sm">
                    No reflections recorded on this date.
                  </p>
                  <a
                    href="/journal"
                    className="inline-flex items-center space-x-2 bg-[#94676E] hover:bg-[#83585F] dark:bg-[#BA8E94] dark:hover:bg-[#CBA1A7] text-white dark:text-[#181214] px-4 py-2 rounded-2xl text-xs font-semibold shadow-xs transition-all"
                  >
                    <span>Write Reflection</span>
                  </a>
                </div>
              ) : (
                selectedEntries.map((entry: any, idx: number) => (
                  <div
                    key={entry.id}
                    className={`space-y-3 ${
                      idx !== 0 ? "pt-6 border-t border-[#EDE3DF] dark:border-[#2D2427]" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs text-[#726561] dark:text-[#9B8E91]">
                      <span className="font-semibold text-[#241F1D] dark:text-[#EFEAEB]">
                        {entry.title || "Personal Reflection"}
                      </span>
                      <span>{entry.time}</span>
                    </div>

                    <p className="text-[#241F1D] dark:text-[#EFEAEB] text-sm leading-relaxed whitespace-pre-wrap border-l-2 border-[#94676E] dark:border-[#BA8E94] pl-3">
                      &ldquo;{entry.content}&rdquo;
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-[#F7EFF1] dark:bg-[#2D2226] text-[#94676E] dark:text-[#BA8E94] font-semibold capitalize border border-[#EDE3DF] dark:border-[#3B282F]">
                        {entry.primary_emotion}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-[#FAF3E8] dark:bg-[#261E14] text-[#B58A46] dark:text-[#C89F58] font-medium capitalize border border-[#EBD2A4] dark:border-[#3D2C21]">
                        {entry.sentiment} ({entry.emotion_score > 0 ? `+${entry.emotion_score.toFixed(2)}` : entry.emotion_score.toFixed(2)})
                      </span>
                      <span className="text-[#726561] dark:text-[#9B8E91] text-[11px]">
                        Confidence: {Math.round(entry.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
