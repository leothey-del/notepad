"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { type NotePayload } from "../lib/notesApi";
import { findNoteBySlug } from "../lib/noteHelper";
import { getCognitoUserId, getCognitoUsername } from "../lib/cognito/tokens";
import { useAutoSaveNote } from "../hooks/useAutoSaveNote";
import SaveStatus from "./SaveStatus";
import DeleteNoteButton from "./DeleteNoteButton";
import NoteEditor from "./NoteEditor";

type NoteFormProps = {
  initialSlug?: string;
};

function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(getCognitoUserId() || getCognitoUsername());
}

export default function NoteForm({ initialSlug }: NoteFormProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [isVerifyingNote, setIsVerifyingNote] = useState<boolean>(
    Boolean(initialSlug)
  );
  const [noteId, setNoteId] = useState<string | undefined>(undefined);

  const { register, watch, setValue } = useForm<NotePayload>({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const title = watch("title");
  const content = watch("content");

  const { hasTyped, saveStatus, syncSavedSnapshot } = useAutoSaveNote({
    noteId,
    setNoteId,
    title,
    content,
  });

  useEffect(() => {
    const syncAuth = () => {
      const authed = isAuthenticated();
      setAuthorized(authed);
      setAuthChecked(true);
      if (!authed) {
        router.replace("/login");
      }
    };

    syncAuth();
    window.addEventListener("auth-change", syncAuth);
    return () => window.removeEventListener("auth-change", syncAuth);
  }, [router]);

  useEffect(() => {
    if (!authChecked || !authorized) return;

    if (!initialSlug) {
      setIsVerifyingNote(false);
      setNoteId(undefined);
      setValue("title", "");
      setValue("content", "");
      syncSavedSnapshot("", "");
      return;
    }

    let cancelled = false;
    setIsVerifyingNote(true);

    findNoteBySlug(initialSlug)
      .then((match) => {
        if (cancelled || !isAuthenticated()) return;

        if (!match) {
          router.replace("/");
          return;
        }

        setNoteId(match.id);
        setValue("title", match.title);
        setValue("content", match.content);
        syncSavedSnapshot(match.title, match.content);
        setIsVerifyingNote(false);
      })
      .catch((err) => {
        console.error("Failed to verify note slug:", err);
        if (!cancelled) {
          router.replace("/");
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, authorized, initialSlug, router, setValue]);

  if (!authChecked || !authorized || isVerifyingNote) {
    return null;
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-3xl px-4 pt-1 pb-24">
        <div className="mb-2 flex min-h-7 items-center justify-between gap-2">
          {initialSlug ? (
            <DeleteNoteButton noteId={noteId} slug={initialSlug} />
          ) : (
            <span />
          )}
          <SaveStatus visible={hasTyped} status={saveStatus} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="space-y-1"
        >
          <input
            type="text"
            placeholder="Title"
            {...register("title")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            className="w-full rounded-none bg-white px-2.5 py-1.5 font-serif text-xl font-semibold text-gray-900 placeholder:text-gray-500 focus:outline-none"
          />

          <NoteEditor
            value={content}
            onChange={(html) => setValue("content", html, { shouldDirty: true })}
          />
        </form>
      </div>
    </main>
  );
}