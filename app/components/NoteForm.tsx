"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// CALLS LIB: `saveNote` and `NotePayload` come from `app/lib/notesApi.ts`.
import { saveNote, type NotePayload } from "../lib/notesApi";
// CALLS LIB: `findNoteBySlug` and `toSlug` come from `app/lib/noteHelpers.ts`.
import { findNoteBySlug, toSlug } from "../lib/noteHelper";

type NoteFormProps = {
  initialSlug?: string;
};

export default function NoteForm({ initialSlug }: NoteFormProps) {
  const queryClient = useQueryClient();

   // Tracks whether the user has typed into the form during this session so status messages
// only appear after typing starts (never initially on a blank/loaded form).
const [hasTyped, setHasTyped] = useState(false);

  // Stores the existing note's ID so saving updates that note instead of creating a duplicate.
  const [noteId, setNoteId] = useState<string | undefined>(undefined);

  // Tracks the last saved title & content to avoid re-saving unchanged values.
  const lastSavedRef = useRef<{ title: string; content: string }>({
    title: "",
    content: "",
  });

  // React Hook Form setup for managing `title` and `content` inputs.
  const { register, watch, setValue } = useForm<NotePayload>({
    defaultValues: {
      title: "",
      content: "",
    },
  });

 
  // When opening an existing note URL (like `/sample`), pre-fill the title and load
  // the matching note's `id`, `title`, and `content`.
  // When opening a new note (`/new` where `initialSlug` is undefined), reset all fields.
  useEffect(() => {
  if (!initialSlug) {
    // CALLS LIB: none (resets local form state and save status for a brand-new note).
    setNoteId(undefined);
    setValue("title", "");
    setValue("content", "");
    lastSavedRef.current = { title: "", content: "" };
    setHasTyped(false);
    mutation.reset();
    return;
  }

  setValue("title", initialSlug);
  setHasTyped(false);
  mutation.reset();
  let cancelled = false;

  // CALLS LIB: `findNoteBySlug` from `app/lib/noteHelper.ts` (which calls `listNotes` in `app/lib/notesApi.ts`).
  findNoteBySlug(initialSlug)
    .then((match) => {
      if (cancelled || !match) return;
      setNoteId(match.id);
      setValue("title", match.title);
      setValue("content", match.content);
      lastSavedRef.current = {
        title: match.title,
        content: match.content,
      };
    })
    .catch((err) => {
      console.error("Failed to load existing note:", err);
    });

  return () => {
    cancelled = true;
  };
}, [initialSlug, setValue]);
  // Watch live input values so auto-save triggers when the user types.
  const title = watch("title");
  const content = watch("content");

  // Mutation that sends the note to the backend API and updates the URL slug + notes cache.
  const mutation = useMutation({
    // CALLS LIB: `saveNote` from `app/lib/notesApi.ts` sends the POST request to Lambda.
    mutationFn: saveNote,
    onSuccess: (savedNote) => {
      setNoteId(savedNote.id);
      lastSavedRef.current = {
        title: savedNote.title,
        content: savedNote.content,
      };

      // CALLS LIB: `toSlug` from `app/lib/noteHelpers.ts` formats the title with dashes for the URL.
      const slug = encodeURIComponent(toSlug(savedNote.title) || "untitled");
      window.history.replaceState(null, "", `/${slug}`);

      // Tells TanStack Query to refresh the `["notes"]` list so changes appear on the home page.
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  // Debounced auto-save: waits 1 second after the user stops typing before saving.
  useEffect(() => {
  if (!title && !content) return;

  if (
    title === lastSavedRef.current.title &&
    content === lastSavedRef.current.content
  ) {
    return;
  }

  setHasTyped(true);

  const timer = setTimeout(() => {
    // CALLS LIB: triggers `mutation.mutate` -> `saveNote` in `app/lib/notesApi.ts`.
    mutation.mutate({
      id: noteId,
      title,
      content,
    });
  }, 400);

  return () => clearTimeout(timer);
}, [title, content, noteId, mutation]);

  return (
    <form className="flex flex-col">
      {/* Shows the save status fixed at the top-right edge of the viewport */}
      {hasTyped && (
        <p
          role="status"
          aria-live="polite"
          className="fixed right-4 top-4 z-50 text-sm text-gray-500"
        >
          {mutation.isPending && "Saving..."}
          {mutation.isSuccess && "Saved!"}
          {mutation.isError && "Failed to save."}
        </p>
      )}
      {/* Title input registered with React Hook Form */}
      <div>
        <input {...register("title")} placeholder="Note title" />
      </div>

      {/* Content textarea registered with React Hook Form */}
      <div>
        <textarea
          {...register("content")}
          placeholder="Write your note..."
          rows={10}
        />
      </div>
    </form>
  );
}