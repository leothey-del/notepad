"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveNote, type NotePayload, type SavedNote } from "../lib/notesApi";
import { toSlug } from "../lib/noteHelper";

type UseAutoSaveNoteParams = {
  noteId: string | undefined;
  setNoteId: (id: string | undefined) => void;
  title: string;
  content: string;
};

export function useAutoSaveNote({
  noteId,
  setNoteId,
  title,
  content,
}: UseAutoSaveNoteParams) {
  const queryClient = useQueryClient();

  const [hasTyped, setHasTyped] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  // Keeps the latest note ID immediately available without waiting for a re-render.
  const activeIdRef = useRef<string | undefined>(noteId);

  // Prevents re-saving values that already match the last saved state.
  const lastSavedRef = useRef<{ title: string; content: string }>({
    title: "",
    content: "",
  });

  useEffect(() => {
    activeIdRef.current = noteId;
  }, [noteId]);

  const mutation = useMutation({
    mutationFn: saveNote,
    onMutate: () => {
      setSaveStatus("saving");
    },
    onSuccess: (savedNote: SavedNote) => {
      setSaveStatus("saved");
      const resolvedId = savedNote.id ?? savedNote.noteId ?? activeIdRef.current;

      if (resolvedId) {
        activeIdRef.current = resolvedId;
        setNoteId(resolvedId);
      }

      lastSavedRef.current = {
        title: savedNote.title ?? lastSavedRef.current.title,
        content: savedNote.content ?? lastSavedRef.current.content,
      };

      const slug = encodeURIComponent(
        toSlug(savedNote.title ?? lastSavedRef.current.title) || "untitled"
      );
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `/${slug}`);
      }

      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: () => {
      setSaveStatus("error");
    },
  });

  const mutateRef = useRef(mutation.mutate);
  useEffect(() => {
    mutateRef.current = mutation.mutate;
  }, [mutation.mutate]);

  const syncSavedSnapshot = (nextTitle: string, nextContent: string) => {
    lastSavedRef.current = { title: nextTitle, content: nextContent };
    setHasTyped(false);
    setSaveStatus("idle");
    mutation.reset();
  };

  useEffect(() => {
    if (!title && !content) return;

    if (
      title === lastSavedRef.current.title &&
      content === lastSavedRef.current.content
    ) {
      return;
    }

    setHasTyped(true);
    setSaveStatus("saving");

    const timer = setTimeout(() => {
      const payload: NotePayload = {
        ...(activeIdRef.current ? { id: activeIdRef.current } : {}),
        title,
        content,
      };
      mutateRef.current(payload);
    }, 400);

    return () => clearTimeout(timer);
  }, [title, content]);

  return {
    hasTyped,
    saveStatus,
    syncSavedSnapshot,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
  };
}