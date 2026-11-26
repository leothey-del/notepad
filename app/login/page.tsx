"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, KeyRound, LoaderCircle, Mail, ShieldCheck, UserRound } from "lucide-react";
import LoginForm, { LoginFormValues } from "../components/LoginForm";
import {
  completeNewPasswordChallenge,
  confirmSignUpWithCognito,
  saveCognitoTokens,
  signInWithCognito,
  signUpWithCognito,
} from "../lib/cognito";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  const [mode, setMode] = useState<"login" | "signup" | "verify">(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // First-time password challenge state
  const [session, setSession] = useState<string | null>(null);
  const [pendingUsername, setPendingUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Sign-up & verification state
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error) return err.message;
    if (
      typeof err === "object" &&
      err !== null &&
      "message" in err &&
      typeof err.message === "string"
    ) {
      return err.message;
    }
    return fallback;
  };

  const finishLogin = (tokens: {
    idToken?: string;
    accessToken?: string;
    refreshToken?: string;
  }) => {
    saveCognitoTokens(tokens);
    router.push("/");
  };

  const handleLogin = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setError("");

    try {
      const result = await signInWithCognito(values.username, values.password);

      if ("challengeName" in result && result.session) {
        setSession(result.session);
        setPendingUsername(result.username);
        return;
      }

      finishLogin(result);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Invalid username or password."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setIsSubmitting(true);
    setError("");

    try {
      const result = await completeNewPasswordChallenge(
        pendingUsername,
        newPassword,
        session
      );
      setSession(null);
      setNewPassword("");
      finishLogin(result);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not set new password."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await signUpWithCognito(signUpUsername, signUpEmail, signUpPassword);
      setMode("verify");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Sign up failed."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await confirmSignUpWithCognito(signUpUsername, verificationCode);
      const tokens = await signInWithCognito(signUpUsername, signUpPassword);
      if ("idToken" in tokens) {
        finishLogin(tokens);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Invalid verification code."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-11 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100";
  const buttonClass =
    "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-950 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-start justify-center pt-10 sm:items-center sm:pt-0">
      <section className="w-full rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.10)] sm:p-8">
        <div className="mb-7 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-950 text-white shadow-sm">
            {mode === "verify" ? (
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
            ) : (
              <KeyRound aria-hidden="true" className="h-5 w-5" />
            )}
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-950">
              {session ? "Set a new password" : mode === "signup" ? "Create account" : mode === "verify" ? "Verify account" : "Welcome back"}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {session ? "Choose a permanent password" : mode === "signup" ? "Start taking notes" : mode === "verify" ? "Check your email" : "Sign in to your notes"}
            </p>
          </div>
        </div>

        {mode !== "verify" && !session && (
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`h-9 rounded-lg text-sm font-semibold transition ${mode === "login" ? "bg-white text-gray-950 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className={`h-9 rounded-lg text-sm font-semibold transition ${mode === "signup" ? "bg-white text-gray-950 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
            >
              Sign up
            </button>
          </div>
        )}

        {session ? (
          <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-gray-700">New password</label>
              <div className="relative">
                <KeyRound aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input id="new-password" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={inputClass} />
                <button type="button" onClick={() => setShowNewPassword((visible) => !visible)} aria-label={showNewPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
                  {showNewPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className={buttonClass}>
              {isSubmitting ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <>Set password <ArrowRight aria-hidden="true" className="h-4 w-4" /></>}
            </button>
          </form>
        ) : mode === "login" ? (
          <LoginForm onSubmit={handleLogin} isSubmitting={isSubmitting} />
        ) : mode === "signup" ? (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="signup-username" className="mb-1.5 block text-sm font-medium text-gray-700">Username</label>
              <div className="relative">
                <UserRound aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input id="signup-username" type="text" autoComplete="username" value={signUpUsername} onChange={(e) => setSignUpUsername(e.target.value)} required className={inputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input id="signup-email" type="email" autoComplete="email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required className={inputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <KeyRound aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input id="signup-password" type={showSignUpPassword ? "text" : "password"} autoComplete="new-password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required className={inputClass} />
                <button type="button" onClick={() => setShowSignUpPassword((visible) => !visible)} aria-label={showSignUpPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
                  {showSignUpPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className={buttonClass}>
              {isSubmitting ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <>Create account <ArrowRight aria-hidden="true" className="h-4 w-4" /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
              Enter the 6-digit code sent to <strong className="text-gray-950">{signUpEmail}</strong>.
            </p>
            <div>
              <label htmlFor="verification-code" className="mb-1.5 block text-sm font-medium text-gray-700">Verification code</label>
              <div className="relative">
                <ShieldCheck aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input id="verification-code" type="text" inputMode="numeric" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required className={inputClass} />
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className={buttonClass}>
              {isSubmitting ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <>Verify and log in <ArrowRight aria-hidden="true" className="h-4 w-4" /></>}
            </button>
          </form>
        )}

        {error && (
          <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}