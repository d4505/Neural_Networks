"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User, Check, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "../../../lib/api";
import { AntaraLogoIcon } from "../../../components/AntaraLogo";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Field touch tracking
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  // Email format validation
  const emailTrimmed = email.trim();
  const emailHasAt = emailTrimmed.includes("@");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(emailTrimmed);

  const getEmailError = () => {
    if (!emailTouched || emailTrimmed.length === 0) return null;
    if (!emailHasAt) return "Email address must include an '@' symbol (e.g. name@example.com).";
    if (!isEmailValid) return "Please enter a valid email address with a domain (e.g. name@example.com).";
    return null;
  };

  const emailError = getEmailError();

  // Password rules validation (Google-style requirement: 8+ chars with mix of letters, numbers & symbols)
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasMixedCase = hasUppercase && hasLowercase;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password);
  const passwordsMatch = password && passwordConfirmation && password === passwordConfirmation;

  const strengthScore = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (!password) return { text: "", color: "bg-slate-300", textCol: "text-slate-400", width: "0%" };
    if (strengthScore <= 1) return { text: "Too Weak", color: "bg-rose-500", textCol: "text-rose-500", width: "20%" };
    if (strengthScore <= 2) return { text: "Weak", color: "bg-orange-500", textCol: "text-orange-500", width: "40%" };
    if (strengthScore <= 3) return { text: "Fair", color: "bg-amber-500", textCol: "text-amber-500", width: "65%" };
    if (strengthScore === 4) return { text: "Good", color: "bg-teal-500", textCol: "text-teal-500", width: "85%" };
    return { text: "Strong", color: "bg-emerald-600", textCol: "text-emerald-600", width: "100%" };
  };

  const isPasswordSecure = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  const isFormValid =
    name.trim() !== "" &&
    isEmailValid &&
    isPasswordSecure &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmTouched(true);

    if (!isEmailValid) {
      setError(emailHasAt ? "Please enter a valid email domain (e.g. name@example.com)." : "Email address is missing an '@' symbol.");
      return;
    }

    if (!isPasswordSecure) {
      setError("Please ensure your password meets all Google-standard security criteria (8+ characters with mixed uppercase, lowercase, numbers, and symbols).");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post("/api/auth/signup", {
        name: name.trim(),
        email: emailTrimmed,
        password,
        password_confirmation: passwordConfirmation,
        consent_model_training: consent,
      });

      // Auto login after signup
      const loginRes = await api.post("/api/auth/login", { email: emailTrimmed, password });
      const { access_token } = loginRes.data;
      document.cookie = `auth_token=${access_token}; path=/; max-age=86400; SameSite=Strict`;

      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Registration failed. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrengthLabel();

  return (
    <div className="w-full max-w-lg bg-[#FCFAF7] dark:bg-[#19221C] p-7 sm:p-9 rounded-3xl shadow-xl border border-[#E5DDD0] dark:border-[#28362D] my-8 transition-colors">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#D6E3D3] to-[#E4ECE2] dark:from-[#1D2D23] dark:to-[#141C17] border border-[#C8D7C5] dark:border-[#28362D] p-2.5 shadow-xs mb-3">
          <AntaraLogoIcon size={44} />
        </div>
        <h1 className="text-2xl font-serif font-semibold text-[#24201D] dark:text-[#F5EFE6] tracking-tight">
          Create Your Antara Journal
        </h1>
        <p className="text-[#68625D] dark:text-[#A6A099] mt-1 text-sm">
          A confidential, multilingual space for emotional wellbeing
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4.5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#68625D] dark:text-[#A6A099] mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 w-4 h-4 text-[#A6A099]" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-[#F4EFE6]/70 dark:bg-[#141C17] border border-[#E5DDD0] dark:border-[#28362D] rounded-xl text-[#24201D] dark:text-[#F5EFE6] placeholder-[#A6A099] focus:outline-none focus:ring-2 focus:ring-[#5F7E5C] transition-all text-sm"
            />
          </div>
        </div>

        {/* Email Address with Live Validation */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#68625D] dark:text-[#A6A099]">
              Email Address
            </label>
            {emailTouched && isEmailValid && (
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Valid email
              </span>
            )}
          </div>
          <div className="relative">
            <Mail className={`absolute left-3.5 top-3 w-4 h-4 ${emailError ? "text-rose-500" : "text-[#A6A099]"}`} />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (!emailTouched && e.target.value.length > 2) setEmailTouched(true);
              }}
              onBlur={() => setEmailTouched(true)}
              placeholder="name@example.com"
              required
              className={`w-full pl-10 pr-10 py-2.5 bg-[#F4EFE6]/70 dark:bg-[#141C17] border rounded-xl text-[#24201D] dark:text-[#F5EFE6] placeholder-[#A6A099] focus:outline-none transition-all text-sm ${
                emailError
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-400 dark:border-rose-700"
                  : emailTouched && isEmailValid
                  ? "border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:border-emerald-600"
                  : "border-[#E5DDD0] dark:border-[#28362D] focus:ring-2 focus:ring-[#5F7E5C]"
              }`}
            />
            {emailTouched && isEmailValid && (
              <Check className="absolute right-3.5 top-3 w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
            {emailError && (
              <AlertCircle className="absolute right-3.5 top-3 w-4 h-4 text-rose-500" />
            )}
          </div>
          {emailError && (
            <p className="text-rose-600 dark:text-rose-400 text-xs mt-1.5 flex items-center gap-1.5 animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{emailError}</span>
            </p>
          )}
        </div>

        {/* Password Creation with Google-Style Helper & Realtime Validation */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#68625D] dark:text-[#A6A099]">
              Create Password
            </label>
            {password && (
              <span className={`text-xs font-semibold ${strength.textCol}`}>
                {strength.text}
              </span>
            )}
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#A6A099]" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (!passwordTouched) setPasswordTouched(true);
              }}
              onBlur={() => setPasswordTouched(true)}
              placeholder="Mix of letters, numbers & symbols"
              required
              className={`w-full pl-10 pr-10 py-2.5 bg-[#F4EFE6]/70 dark:bg-[#141C17] border rounded-xl text-[#24201D] dark:text-[#F5EFE6] placeholder-[#A6A099] focus:outline-none transition-all text-sm ${
                password && isPasswordSecure
                  ? "border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:border-emerald-600"
                  : "border-[#E5DDD0] dark:border-[#28362D] focus:ring-2 focus:ring-[#5F7E5C]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-[#A6A099] hover:text-[#24201D] dark:hover:text-[#F5EFE6] cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Google Password Guidance Note */}
          <p className="text-[11px] text-[#68625D] dark:text-[#A6A099] mt-1.5 leading-relaxed">
            Use 8 or more characters with a mix of letters, numbers &amp; symbols.
          </p>

          {/* Google-Style Dynamic Strength Progress Bar */}
          {password && (
            <div className="mt-2 space-y-1.5">
              <div className="w-full bg-[#E5DDD0] dark:bg-[#28362D] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all duration-300 rounded-full`}
                  style={{ width: strength.width }}
                />
              </div>

              {/* Interactive Requirement Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1.5 text-xs">
                {/* 1. Length */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                    hasMinLength
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium"
                      : "bg-[#F4EFE6]/60 dark:bg-[#141C17] text-[#68625D] dark:text-[#A6A099]"
                  }`}
                >
                  {hasMinLength ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-[#A6A099] shrink-0" />
                  )}
                  <span>At least 8 characters</span>
                </div>

                {/* 2. Mixed Alphabets (Uppercase & Lowercase) */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                    hasMixedCase
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium"
                      : "bg-[#F4EFE6]/60 dark:bg-[#141C17] text-[#68625D] dark:text-[#A6A099]"
                  }`}
                >
                  {hasMixedCase ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-[#A6A099] shrink-0" />
                  )}
                  <span>Mixed letters (A-Z &amp; a-z)</span>
                </div>

                {/* 3. Numbers */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                    hasNumber
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium"
                      : "bg-[#F4EFE6]/60 dark:bg-[#141C17] text-[#68625D] dark:text-[#A6A099]"
                  }`}
                >
                  {hasNumber ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-[#A6A099] shrink-0" />
                  )}
                  <span>At least 1 number (0-9)</span>
                </div>

                {/* 4. Special Symbols */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                    hasSpecial
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium"
                      : "bg-[#F4EFE6]/60 dark:bg-[#141C17] text-[#68625D] dark:text-[#A6A099]"
                  }`}
                >
                  {hasSpecial ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-[#A6A099] shrink-0" />
                  )}
                  <span>Symbol (!@#$%^&amp;*)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password with Live Matching Feedback */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#68625D] dark:text-[#A6A099] mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#A6A099]" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={passwordConfirmation}
              onChange={(e) => {
                setPasswordConfirmation(e.target.value);
                if (!confirmTouched) setConfirmTouched(true);
              }}
              onBlur={() => setConfirmTouched(true)}
              placeholder="Re-enter password"
              required
              className={`w-full pl-10 pr-10 py-2.5 bg-[#F4EFE6]/70 dark:bg-[#141C17] border rounded-xl text-[#24201D] dark:text-[#F5EFE6] placeholder-[#A6A099] focus:outline-none transition-all text-sm ${
                passwordConfirmation && passwordsMatch
                  ? "border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:border-emerald-600"
                  : passwordConfirmation && !passwordsMatch
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-400 dark:border-rose-700"
                  : "border-[#E5DDD0] dark:border-[#28362D] focus:ring-2 focus:ring-[#5F7E5C]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-3 text-[#A6A099] hover:text-[#24201D] dark:hover:text-[#F5EFE6] cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {passwordConfirmation && !passwordsMatch && (
            <p className="text-rose-600 dark:text-rose-400 text-xs mt-1.5 flex items-center gap-1.5 animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Passwords do not match</span>
            </p>
          )}

          {passwordConfirmation && passwordsMatch && (
            <p className="text-emerald-600 dark:text-emerald-400 text-xs mt-1.5 flex items-center gap-1.5 animate-fadeIn font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Passwords match</span>
            </p>
          )}
        </div>

        {/* Model Training Consent */}
        <div className="pt-2">
          <label className="flex items-start space-x-2.5 cursor-pointer text-xs text-[#68625D] dark:text-[#A6A099]">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 rounded border-[#E5DDD0] text-[#5F7E5C] focus:ring-[#5F7E5C]"
            />
            <span>
              (Optional) I consent to anonymously contribute de-identified journal entries to help improve Antara&apos;s multilingual emotional understanding models.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full py-3 bg-[#5F7E5C] hover:bg-[#4D674A] dark:bg-[#86A882] dark:hover:bg-[#96B892] text-white dark:text-[#0F1713] rounded-2xl font-semibold shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2 cursor-pointer"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          <span>{loading ? "Creating Account..." : "Create Free Account"}</span>
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-[#E5DDD0] dark:border-[#28362D] text-center">
        <p className="text-sm text-[#68625D] dark:text-[#A6A099]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#5F7E5C] dark:text-[#86A882] font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
