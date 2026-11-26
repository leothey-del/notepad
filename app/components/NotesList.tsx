"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { KeyRound, LogIn } from "lucide-react";
import { listNotes } from "../lib/notesApi";
import { toSlug } from "../lib/noteHelper";
import { getCognitoUserId, getCognitoUsername } from "../lib/cognito";

function getTime(updatedAt?: string): number {
  if (!updatedAt) return 0;
  const parsed = Date.parse(updatedAt);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatShortDate(updatedAt?: string): string {
  if (!updatedAt) return "";
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function NotesList() {
  const [userKey, setUserKey] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      if (window.location.pathname === "/login") return;
      setUserKey(getCognitoUserId() || getCognitoUsername() || null);
      setAuthReady(true);
    };
    syncUser();

    window.addEventListener("auth-change", syncUser);
    return () => window.removeEventListener("auth-change", syncUser);
  }, []);

  const {
    data: rawData,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["notes", userKey],
    queryFn: listNotes,
    enabled: authReady && Boolean(userKey),
    staleTime: 15_000,
  });

  if (!authReady) {
    return null;
  }

  if (!userKey) {
    return (
      <div className="flex min-h-[calc(100vh-11rem)] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200/80 bg-white px-8 py-10 text-center shadow-[0_8px_30px_rgba(17,24,39,0.05)]">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200/90 bg-gray-50/70 text-gray-800">
            <KeyRound aria-hidden="true" className="h-5 w-5" strokeWidth={1.85} />
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

  if (isPending) {
    return <p className="text-sm text-gray-500">Loading notes...</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-500">
        Could not load notes: {error instanceof Error ? error.message : "Unknown error"}
      </p>
    );
  }

  const notes = Array.isArray(rawData)
    ? rawData
    : Array.isArray((rawData as { notes?: unknown[] })?.notes)
      ? (rawData as { notes: Array<{ id?: string; noteId?: string; title?: string; updatedAt?: string }> }).notes
      : [];

  const sortedNotes = [...notes].sort(
    (a, b) => getTime(b.updatedAt) - getTime(a.updatedAt)
  );

  return (
    <section>
      <h2 className="sr-only">Saved Notes</h2>
      {sortedNotes.length === 0 ? (
        <p className="text-sm text-gray-500">No notes yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {sortedNotes.map((note, idx) => {
            const resolvedId = note.id ?? note.noteId;
            const slug = toSlug(note.title ?? "", resolvedId);
            const itemKey = `${resolvedId ?? "note"}-${slug}-${idx}`;

            return (
              <li key={itemKey} className="group">
                <Link
                  href={`/${slug}`}
                  className="flex items-baseline justify-between gap-4 py-2.5"
                >
                  <span className="truncate font-serif text-[15px] font-semibold text-gray-950 transition-colors group-hover:text-gray-600">
                    {note.title?.trim() || "untitled"}
                  </span>

                  <span className="shrink-0 text-xs tabular-nums text-gray-400">
                    {formatShortDate(note.updatedAt)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}