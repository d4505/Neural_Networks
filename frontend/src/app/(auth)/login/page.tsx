"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle, CheckCircle2, Check } from "lucide-react";
import api from "../../../lib/api";

import { AntaraLogoIcon } from "../../../components/AntaraLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Email format validation
  const emailTrimmed = email.trim();
  const emailHasAt = emailTrimmed.includes("@");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(emailTrimmed);

  const getEmailError = () => {
    if (!emailTouched || emailTrimmed.length === 0) return null;
    if (!emailHasAt) return "Email address must contain an '@' symbol (e.g. name@example.com).";
    if (!isEmailValid) return "Please enter a valid email address with a domain (e.g. name@example.com).";
    return null;
  };

  const emailError = getEmailError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);

    if (!emailTrimmed || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!isEmailValid) {
      setError(emailHasAt ? "Please enter a valid email domain." : "Email address is missing an '@' symbol.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/api/auth/login", { email: emailTrimmed, password });
      const { access_token } = response.data;

      // Set cookie for authorization
      document.cookie = `auth_token=${access_token}; path=/; max-age=86400; SameSite=Strict`;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#FCFAF7] dark:bg-[#19221C] p-8 rounded-3xl shadow-xl border border-[#E5DDD0] dark:border-[#28362D] transition-colors">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#D6E3D3] to-[#E4ECE2] dark:from-[#1D2D23] dark:to-[#141C17] border border-[#C8D7C5] dark:border-[#28362D] p-2.5 shadow-xs mb-4">
          <AntaraLogoIcon size={44} />
        </div>
        <h1 className="text-3xl font-serif font-semibold text-[#24201D] dark:text-[#F5EFE6] tracking-tight">
          Welcome to Antara
        </h1>
        <p className="text-[#68625D] dark:text-[#A6A099] mt-2 text-sm">
          A safe, multilingual sanctuary for your thoughts and emotions
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#68625D] dark:text-[#A6A099]">
              Email Address
            </label>
            {emailTouched && isEmailValid && (
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Valid
              </span>
            )}
          </div>
          <div className="relative">
            <Mail className={`absolute left-3.5 top-3 w-5 h-5 ${emailError ? "text-rose-500" : "text-[#A6A099]"}`} />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (!emailTouched && e.target.value.length > 2) setEmailTouched(true);
              }}
              onBlur={() => setEmailTouched(true)}
              placeholder="you@example.com"
              required
              className={`w-full pl-11 pr-10 py-2.5 bg-[#F4EFE6]/70 dark:bg-[#141C17] border rounded-xl text-[#24201D] dark:text-[#F5EFE6] placeholder-[#A6A099] focus:outline-none transition-all text-sm ${
                emailError
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-400 dark:border-rose-700"
                  : emailTouched && isEmailValid
                  ? "border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:border-emerald-600"
                  : "border-[#E5DDD0] dark:border-[#28362D] focus:ring-2 focus:ring-[#5F7E5C]"
              }`}
            />
            {emailTouched && isEmailValid && (
              <Check className="absolute right-3.5 top-3.5 w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
            {emailError && (
              <AlertCircle className="absolute right-3.5 top-3.5 w-4 h-4 text-rose-500" />
            )}
          </div>
          {emailError && (
            <p className="text-rose-600 dark:text-rose-400 text-xs mt-1.5 flex items-center gap-1.5 animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{emailError}</span>
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#68625D] dark:text-[#A6A099]">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-xs text-[#5F7E5C] dark:text-[#86A882] hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-5 h-5 text-[#A6A099]" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-11 pr-11 py-2.5 bg-[#F4EFE6]/70 dark:bg-[#141C17] border border-[#E5DDD0] dark:border-[#28362D] rounded-xl text-[#24201D] dark:text-[#F5EFE6] placeholder-[#A6A099] focus:outline-none focus:ring-2 focus:ring-[#5F7E5C] transition-all text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-[#A6A099] hover:text-[#24201D] dark:hover:text-[#F5EFE6] cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#5F7E5C] hover:bg-[#4D674A] dark:bg-[#86A882] dark:hover:bg-[#96B892] text-white dark:text-[#0F1713] rounded-2xl font-semibold shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          <span>{loading ? "Signing in..." : "Sign In to Antara"}</span>
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[#E5DDD0] dark:border-[#28362D] text-center">
        <p className="text-sm text-[#68625D] dark:text-[#A6A099]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#5F7E5C] dark:text-[#86A882] font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FCFAF7] dark:bg-[#19221C] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#E5DDD0] dark:border-[#28362D]">
            <h3 className="text-lg font-serif font-bold text-[#24201D] dark:text-[#F5EFE6] mb-2">Password Recovery</h3>
            <p className="text-sm text-[#68625D] dark:text-[#A6A099] mb-4">
              For privacy protection in this assessment environment, you can create a fresh account or contact support to reset.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2 bg-[#5F7E5C] hover:bg-[#4D674A] dark:bg-[#86A882] text-white dark:text-[#0F1713] rounded-xl font-semibold text-sm transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
