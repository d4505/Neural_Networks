"use client";

import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import {
  Save,
  Loader2,
  Trash2,
  Edit3,
  Search,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  Globe,
  X,
} from "lucide-react";
import api from "../../../lib/api";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function JournalPage() {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");

  // Edit State
  const [editingEntry, setEditingEntry] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: entries, error, mutate } = useSWR("/api/journal/", fetcher);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time language detection preview based on script/keywords
  const detectedLanguagePreview = useMemo(() => {
    if (!content.trim()) return null;
    const text = content.toLowerCase();
    const langs: string[] = [];

    if (/[\u0900-\u097f]/.test(content)) langs.push("Hindi (Devanagari)");
    if (/[\u0b80-\u0bff]/.test(content)) langs.push("Tamil");
    if (/[\u0c00-\u0c7f]/.test(content)) langs.push("Telugu");
    if (/[\u0d00-\u0d7f]/.test(content)) langs.push("Malayalam");

    if (/(romba|inniki|inniku|enaku|enakku|irundhuchu|pesina|kashtam|panninen|nalla|bayama|mudiyala|theriyala|manasu|amaidhi|nimmathi|pudikala|pudikkala|kooda)/.test(text)) langs.push("Tamil-English (Tanglish)");
    if (/(aaj|mujhe|mera|meri|bohot|bahut|accha|theek|sukoon|pareshan|hai|tha|thi|the|kuch|kya|rha|raha|rahi|samajh|karu|gaya|bechaini)/.test(text)) langs.push("Hindi-English (Hinglish)");
    if (/(naaku|naku|chaala|chala|nenu|manaki|meeku|maku|bagundi|bagundhi|bagoledu|badhaga|undi|undhi|undindi|chesamu|chesanu|chestunna|chesthunna|alasipoyanu|alasata|anipistondi|anipisthondi|eeroju|eroju|ninna|repu|telidu|ardham|nachaledu|nachatledu|nachindi|santhosham|aanandam)/.test(text)) langs.push("Telugu-English (Tenglish)");
    if (/(njan|enikku|ennikku|valare|innu|innale|santhoshavan|aanu|aayirunnu|kashtapadanu|pedi|aakulam|thala|vedhana|manassil|ashwasam|ishtamayilla)/.test(text)) langs.push("Malayalam-English (Manglish)");

    if (/[a-zA-Z]/.test(content) && langs.length === 0) langs.push("English");
    return langs.length > 0 ? langs.join(" • ") : "English";
  }, [content]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await api.post("/api/journal/", {
        title: title.trim() || "Personal Reflection",
        content: content.trim(),
      });
      setTitle("");
      setContent("");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      mutate();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to analyze and save entry.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEdit = (entry: any) => {
    setEditingEntry(entry);
    setEditTitle(entry.title || "");
    setEditContent(entry.content || "");
  };

  const handleSaveEdit = async () => {
    if (!editingEntry || !editContent.trim()) return;
    setIsUpdating(true);
    try {
      await api.put(`/api/journal/${editingEntry.id}`, {
        title: editTitle.trim() || "Personal Reflection",
        content: editContent.trim(),
      });
      setEditingEntry(null);
      mutate();
    } catch (err) {
      alert("Failed to update entry.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this reflection and its AI analysis?")) return;
    try {
      await api.delete(`/api/journal/${id}`);
      mutate();
    } catch (err) {
      alert("Failed to delete entry.");
    }
  };

  const getEmotionBadge = (emotion: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      joy: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-800 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800/60" },
      calm: { bg: "bg-[#D6E3D3] dark:bg-[#1D2D23]", text: "text-[#263825] dark:text-[#B4D4B0]", border: "border-[#C8D7C5] dark:border-[#2D4434]" },
      hopeful: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-800 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800/60" },
      stress: { bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-800 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800/60" },
      anxiety: { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-800 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800/60" },
      sadness: { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-800 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800/60" },
    };
    return colors[emotion?.toLowerCase()] || { bg: "bg-[#DCE7DA] dark:bg-[#1E2822]", text: "text-[#24201D] dark:text-[#F5EFE6]", border: "border-[#C8D7C5] dark:border-[#28362D]" };
  };

  // Filtered reflections
  const filteredEntries = useMemo(() => {
    if (!entries) return [];
    return entries.filter((e: any) => {
      const matchSearch =
        searchTerm === "" ||
        e.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.title?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEmotion =
        selectedEmotion === "" ||
        e.analysis?.primary_emotion?.toLowerCase() === selectedEmotion.toLowerCase();

      const matchLanguage =
        selectedLanguage === "" ||
        (e.analysis?.languages_detected &&
          e.analysis.languages_detected.toLowerCase().includes(selectedLanguage.toLowerCase()));

      return matchSearch && matchEmotion && matchLanguage;
    });
  }, [entries, searchTerm, selectedEmotion, selectedLanguage]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#24201D] dark:text-[#F5EFE6]">
            My Journal
          </h1>
          <p className="text-[#596557] dark:text-[#A6A099] text-sm mt-1">
            Express yourself naturally in English, Hindi, Tamil, Malayalam, Telugu, or conversational mixes.
          </p>
        </div>
      </header>

      {/* Write New Reflection Card */}
      <div className="bg-[#E4ECE2]/80 dark:bg-[#19221C] rounded-3xl shadow-xs border border-[#C8D7C5] dark:border-[#28362D] p-6 sm:p-8 space-y-4 transition-colors backdrop-blur-xs">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title / Theme of reflection (optional)..."
            className="w-full text-lg sm:text-xl font-medium bg-transparent border-b border-transparent focus:border-[#5F7E5C] dark:focus:border-[#86A882] focus:outline-none text-[#24201D] dark:text-[#F5EFE6] placeholder-[#596557]/70 dark:placeholder-[#A6A099] pb-1 transition-colors"
          />
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          placeholder="What is flowing through your mind today? Write freely in English or any Indian language/script..."
          className="w-full resize-none outline-none bg-transparent text-[#24201D] dark:text-[#F5EFE6] placeholder-[#596557]/70 dark:placeholder-[#A6A099] leading-relaxed text-base"
        />

        {/* Live Status Bar */}
        <div className="pt-4 border-t border-[#C8D7C5]/60 dark:border-[#28362D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#596557] dark:text-[#A6A099]">
          <div className="flex items-center space-x-4">
            <span>{wordCount} words</span>
            <span>{content.length} characters</span>
          </div>

          <div className="flex items-center space-x-3">
            {saveSuccess && (
              <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Analyzed & Persisted</span>
              </span>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving || !content.trim()}
              suppressHydrationWarning
              className="inline-flex items-center space-x-2 bg-[#5F7E5C] hover:bg-[#4D674A] dark:bg-[#86A882] dark:hover:bg-[#96B892] disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-[#0F1713] px-5 py-2.5 rounded-2xl font-semibold shadow-xs transition-all text-sm cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? "Running ML Inference..." : "Save & Analyze"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Past Reflections Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-serif text-[#24201D] dark:text-[#F5EFE6]">
            Journal History
          </h2>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#596557] dark:text-[#A6A099]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reflections..."
                className="pl-9 pr-3 py-2 bg-[#E4ECE2]/80 dark:bg-[#19221C] border border-[#C8D7C5] dark:border-[#28362D] rounded-xl text-xs sm:text-sm text-[#24201D] dark:text-[#F5EFE6] placeholder-[#596557]/70 dark:placeholder-[#A6A099] focus:outline-none focus:ring-1 focus:ring-[#5F7E5C]"
              />
            </div>

            <select
              value={selectedEmotion}
              onChange={(e) => setSelectedEmotion(e.target.value)}
              className="px-3 py-2 bg-[#E4ECE2]/80 dark:bg-[#19221C] border border-[#C8D7C5] dark:border-[#28362D] rounded-xl text-xs sm:text-sm text-[#24201D] dark:text-[#F5EFE6] focus:outline-none"
            >
              <option value="">All Emotions</option>
              <option value="joy">Joy</option>
              <option value="calm">Calm</option>
              <option value="hopeful">Hopeful</option>
              <option value="stress">Stress</option>
              <option value="anxiety">Anxiety</option>
              <option value="sadness">Sadness</option>
            </select>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 bg-[#E4ECE2]/80 dark:bg-[#19221C] border border-[#C8D7C5] dark:border-[#28362D] rounded-xl text-xs sm:text-sm text-[#24201D] dark:text-[#F5EFE6] focus:outline-none"
            >
              <option value="">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi / Hinglish</option>
              <option value="Tamil">Tamil / Tanglish</option>
              <option value="Telugu">Telugu / Tenglish</option>
              <option value="Malayalam">Malayalam / Manglish</option>
            </select>
          </div>
        </div>

        {!entries && !error ? (
          <div className="flex justify-center py-16 text-[#A6A099]">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-[#C8D7C5] dark:border-[#28362D] bg-[#E4ECE2]/40 dark:bg-[#19221C]/50 text-[#596557] dark:text-[#A6A099]">
            {searchTerm || selectedEmotion || selectedLanguage
              ? "No reflections match your current filters."
              : "No reflections written yet. Start by typing above."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredEntries.map((entry: any) => {
              const parsedLangs = entry.analysis?.languages_detected
                ? JSON.parse(entry.analysis.languages_detected)
                : ["English"];
              const isFlagged = entry.analysis?.is_safety_flagged;

              return (
                <div
                  key={entry.id}
                  className="bg-[#E4ECE2]/80 dark:bg-[#19221C] rounded-3xl p-6 sm:p-7 shadow-xs border border-[#C8D7C5] dark:border-[#28362D] space-y-4 transition-colors backdrop-blur-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-[#24201D] dark:text-[#F5EFE6]">
                        {entry.title || "Personal Reflection"}
                      </h3>
                      <p className="text-xs text-[#596557] dark:text-[#A6A099] mt-0.5" suppressHydrationWarning>
                        {new Date(entry.created_at).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenEdit(entry)}
                        className="p-2 text-[#596557] dark:text-[#A6A099] hover:text-[#5F7E5C] dark:hover:text-[#86A882] hover:bg-[#D6E3D3] dark:hover:bg-[#1E2822] rounded-lg transition-colors cursor-pointer"
                        title="Edit reflection"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 text-[#596557] dark:text-[#A6A099] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Delete reflection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[#24201D] dark:text-[#F5EFE6] leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                    {entry.content}
                  </p>

                  {/* Safety Alert (Section 18 requirement) */}
                  {isFlagged && (
                    <div className="p-4 rounded-2xl bg-rose-50/90 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 text-xs space-y-2">
                      <div className="flex items-center space-x-2 font-semibold text-rose-700 dark:text-rose-400">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Supportive Wellbeing Notice</span>
                      </div>
                      <p>{entry.analysis.safety_message || "It sounds like you may be carrying heavy thoughts. Please consider speaking with a trusted helpline or friend."}</p>
                      <div className="flex flex-wrap gap-3 pt-1">
                        <span className="font-medium">KIRAN: 1800-599-0019</span>
                        <span className="font-medium">Tele-MANAS: 14416</span>
                        <span className="font-medium">Vandrevala: +91 9999 666 555</span>
                      </div>
                    </div>
                  )}

                  {/* AI Analysis Card */}
                  {entry.analysis && (
                    <div className="bg-[#D6E3D3]/80 dark:bg-[#141C17] rounded-2xl p-4 sm:p-5 border border-[#C8D7C5] dark:border-[#28362D] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-[#5F7E5C] dark:text-[#86A882]" />
                          <span className="text-xs font-bold uppercase tracking-wider text-[#596557] dark:text-[#A6A099]">
                            Antara AI NLP Analysis
                          </span>
                        </div>
                        <span className="text-[11px] text-[#596557] dark:text-[#A6A099] font-mono">
                          {entry.analysis.model_version}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                        <div className="bg-[#E4ECE2] dark:bg-[#19221C] p-3 rounded-xl border border-[#C8D7C5] dark:border-[#28362D]">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#596557] dark:text-[#A6A099]">Primary Emotion</p>
                          <p className="font-semibold text-sm capitalize mt-0.5 text-[#5F7E5C] dark:text-[#86A882]">
                            {entry.analysis.primary_emotion}
                          </p>
                        </div>

                        <div className="bg-[#E4ECE2] dark:bg-[#19221C] p-3 rounded-xl border border-[#C8D7C5] dark:border-[#28362D]">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#596557] dark:text-[#A6A099]">Sentiment & Score</p>
                          <p className="font-semibold text-sm capitalize mt-0.5 text-[#24201D] dark:text-[#F5EFE6]">
                            {entry.analysis.sentiment} ({entry.analysis.emotion_score > 0 ? `+${entry.analysis.emotion_score.toFixed(2)}` : entry.analysis.emotion_score.toFixed(2)})
                          </p>
                        </div>

                        <div className="bg-[#E4ECE2] dark:bg-[#19221C] p-3 rounded-xl border border-[#C8D7C5] dark:border-[#28362D]">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#596557] dark:text-[#A6A099]">Model Confidence</p>
                          <p className="font-semibold text-sm mt-0.5 text-[#24201D] dark:text-[#F5EFE6]">
                            {Math.round(entry.analysis.confidence * 100)}%
                          </p>
                        </div>

                        <div className="bg-[#E4ECE2] dark:bg-[#19221C] p-3 rounded-xl border border-[#C8D7C5] dark:border-[#28362D]">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#596557] dark:text-[#A6A099]">Languages</p>
                          <p className="font-semibold text-xs mt-0.5 text-[#24201D] dark:text-[#F5EFE6] truncate" title={parsedLangs.join(", ")}>
                            {parsedLangs.join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#E4ECE2] dark:bg-[#19221C] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#C8D7C5] dark:border-[#28362D] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-serif font-bold text-[#24201D] dark:text-[#F5EFE6]">
                Edit Reflection
              </h3>
              <button
                onClick={() => setEditingEntry(null)}
                className="p-1.5 text-[#596557] hover:text-[#24201D] dark:text-[#A6A099] dark:hover:text-[#F5EFE6] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title..."
              className="w-full text-base font-medium p-3 bg-[#D6E3D3]/80 dark:bg-[#141C17] rounded-xl border border-[#C8D7C5] dark:border-[#28362D] text-[#24201D] dark:text-[#F5EFE6] focus:outline-none"
            />

            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={6}
              className="w-full text-sm leading-relaxed p-3 bg-[#D6E3D3]/80 dark:bg-[#141C17] rounded-xl border border-[#C8D7C5] dark:border-[#28362D] text-[#24201D] dark:text-[#F5EFE6] focus:outline-none resize-none"
            />

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setEditingEntry(null)}
                className="px-4 py-2 text-sm font-semibold text-[#596557] dark:text-[#A6A099] hover:bg-[#D6E3D3] dark:hover:bg-[#1E2822] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isUpdating || !editContent.trim()}
                className="px-5 py-2 text-sm font-semibold text-white dark:text-[#0F1713] bg-[#5F7E5C] hover:bg-[#4D674A] dark:bg-[#86A882] dark:hover:bg-[#96B892] rounded-xl flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isUpdating ? "Re-analyzing..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
