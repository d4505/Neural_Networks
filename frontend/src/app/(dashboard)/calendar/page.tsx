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
      joy: "bg-amber-400 dark:bg-amber-500",
      calm: "bg-emerald-400 dark:bg-emerald-500",
      hopeful: "bg-teal-400 dark:bg-teal-500",
      stress: "bg-indigo-400 dark:bg-indigo-500",
      anxiety: "bg-purple-400 dark:bg-purple-500",
      sadness: "bg-blue-400 dark:bg-blue-500",
    };
    return colors[emotion?.toLowerCase()] || "bg-slate-400";
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
            className={`w-2 h-2 rounded-full ${getEmotionColor(entry.primary_emotion)} ring-1 ring-[#FCFAF7] dark:ring-[#19221C]`}
            title={`${entry.primary_emotion} (${entry.sentiment})`}
          />
        ))}
        {dayInfo.entries.length > 3 && (
          <span className="text-[9px] text-[#596557] dark:text-[#A6A099] font-semibold leading-none">
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
          <h1 className="text-3xl sm:text-4xl font-serif text-[#24201D] dark:text-[#F5EFE6]">
            Calendar
          </h1>
          <p className="text-[#596557] dark:text-[#A6A099] text-sm mt-1">
            Explore your reflections and longitudinal emotional cadence across dates.
          </p>
        </div>
        <button
          onClick={goToToday}
          className="self-start sm:self-auto px-4 py-2 bg-[#5F7E5C] dark:bg-[#86A882] text-white dark:text-[#0F1713] rounded-2xl text-sm font-semibold shadow-xs hover:bg-[#4D674A] dark:hover:bg-[#96B892] transition-all cursor-pointer flex items-center space-x-2"
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Jump to Today</span>
        </button>
      </div>

      {!calendarData && !error ? (
        <div className="flex justify-center py-20 text-[#A6A099]">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : (
        <div className="bg-[#E4ECE2]/80 dark:bg-[#19221C] border border-[#C8D7C5] dark:border-[#28362D] rounded-3xl shadow-xs overflow-hidden transition-colors backdrop-blur-xs">
          {/* Navigation Bar */}
          <div className="p-6 border-b border-[#C8D7C5] dark:border-[#28362D] flex items-center justify-between">
            <h2 className="text-2xl font-serif font-semibold text-[#24201D] dark:text-[#F5EFE6]">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <div className="flex items-center space-x-1">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-[#D6E3D3] dark:hover:bg-[#1E2822] rounded-xl text-[#596557] dark:text-[#A6A099] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-[#D6E3D3] dark:hover:bg-[#1E2822] rounded-xl text-[#596557] dark:text-[#A6A099] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Day of Week Header */}
          <div className="grid grid-cols-7 border-b border-[#C8D7C5] dark:border-[#28362D] bg-[#D6E3D3]/70 dark:bg-[#141C17]">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-semibold text-[#596557] dark:text-[#A6A099] tracking-wider"
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
                    "min-h-[105px] p-2 border-r border-b border-[#C8D7C5]/70 dark:border-[#28362D]/60 transition-all flex flex-col items-center justify-between cursor-pointer hover:bg-[#D6E3D3]/60 dark:hover:bg-[#1D2D23]/60",
                    !isSameMonth(day, monthStart) && "bg-[#D6E3D3]/20 dark:bg-[#0F1713]/40 text-[#A6A099]/40",
                    isToday(day) && "bg-[#D6E3D3]/90 dark:bg-[#1D2D23]/50 ring-2 ring-inset ring-[#5F7E5C]/50 dark:ring-[#86A882]/50",
                    isSelected && "bg-[#C8D7C5]/70 dark:bg-[#1D2D23] shadow-inner",
                    (i + 1) % 7 === 0 && "border-r-0"
                  )}
                >
                  <div
                    className={clsx(
                      "w-7 h-7 flex items-center justify-center rounded-full text-xs transition-all",
                      isToday(day)
                        ? "bg-[#5F7E5C] dark:bg-[#86A882] text-white dark:text-[#0F1713] font-bold shadow-xs"
                        : hasEntries
                        ? "font-bold text-[#24201D] dark:text-[#F5EFE6] bg-[#D6E3D3] dark:bg-[#1D2D23]"
                        : "text-[#596557] dark:text-[#A6A099]"
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
          <div className="bg-[#E4ECE2] dark:bg-[#19221C] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-[#C8D7C5] dark:border-[#28362D] max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#C8D7C5] dark:border-[#28362D] sticky top-0 bg-[#E4ECE2]/95 dark:bg-[#19221C]/95 backdrop-blur-md z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-[#D6E3D3] dark:bg-[#1D2D23] text-[#5F7E5C] dark:text-[#86A882]">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#24201D] dark:text-[#F5EFE6]">
                    {format(selectedDate, "MMMM d, yyyy")}
                  </h3>
                  <p className="text-xs text-[#596557] dark:text-[#A6A099]">
                    {selectedEntries.length} reflection{selectedEntries.length !== 1 ? "s" : ""} recorded
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1.5 text-[#596557] hover:text-[#24201D] dark:text-[#A6A099] dark:hover:text-[#F5EFE6] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {selectedEntries.length === 0 ? (
                <div className="text-center py-10 space-y-4">
                  <p className="text-[#596557] dark:text-[#A6A099] text-sm">
                    No reflections recorded on this date.
                  </p>
                  <a
                    href="/journal"
                    className="inline-flex items-center space-x-2 bg-[#5F7E5C] hover:bg-[#4D674A] dark:bg-[#86A882] dark:hover:bg-[#96B892] text-white dark:text-[#0F1713] px-4 py-2 rounded-2xl text-xs font-semibold shadow-xs transition-all"
                  >
                    <span>Write Reflection</span>
                  </a>
                </div>
              ) : (
                selectedEntries.map((entry: any, idx: number) => (
                  <div
                    key={entry.id}
                    className={`space-y-3 ${
                      idx !== 0 ? "pt-6 border-t border-[#C8D7C5] dark:border-[#28362D]" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs text-[#596557] dark:text-[#A6A099]">
                      <span className="font-semibold text-[#24201D] dark:text-[#F5EFE6]">
                        {entry.title || "Personal Reflection"}
                      </span>
                      <span>{entry.time}</span>
                    </div>

                    <p className="text-[#24201D] dark:text-[#F5EFE6] text-sm leading-relaxed whitespace-pre-wrap border-l-2 border-[#5F7E5C] dark:border-[#86A882] pl-3">
                      &ldquo;{entry.content}&rdquo;
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-[#D6E3D3] dark:bg-[#1D2D23] text-[#263825] dark:text-[#B4D4B0] font-semibold capitalize border border-[#C8D7C5] dark:border-[#2D4434]">
                        {entry.primary_emotion}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-[#E4ECE2] dark:bg-[#141C17] text-[#24201D] dark:text-[#F5EFE6] font-medium capitalize border border-[#C8D7C5] dark:border-[#28362D]">
                        {entry.sentiment} ({entry.emotion_score > 0 ? `+${entry.emotion_score.toFixed(2)}` : entry.emotion_score.toFixed(2)})
                      </span>
                      <span className="text-[#596557] dark:text-[#A6A099] text-[11px]">
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
