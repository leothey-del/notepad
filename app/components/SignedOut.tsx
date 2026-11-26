"use client";

import Link from "next/link";
import { Lock, LogIn } from "lucide-react";

export default function SignedOut() {
  return (
    <div className="flex min-h-[calc(100vh-11rem)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200/80 bg-white px-8 py-10 text-center shadow-[0_8px_30px_rgba(17,24,39,0.05)]">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200/90 bg-gray-50/70 text-gray-800">
          <Lock aria-hidden="true" className="h-5 w-5" strokeWidth={1.85} />
        </div>

        <h1 className="text-xl font-semibold tracking-tight text-gray-900">
          Sign in to view your notes
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Access your personal workspace, thoughts, and ideas.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800"
        >
          <LogIn aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
          Log in
        </Link>

        <p className="mt-4 text-xs text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/login?mode=signup"
            className="font-semibold text-gray-900 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}