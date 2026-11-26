"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteNote, listNotes } from "../lib/notesApi";
import { getCognitoUserId, getCognitoUsername } from "../lib/cognito";

type NoteItem = {
  id?: string;
  noteId?: string;
  title?: string;
  slug?: string;
  SK?: string;
};

type DeleteNoteButtonProps = {
  noteId?: string;
  slug?: string;
};

export default function DeleteNoteButton({
  noteId,
  slug,
}: DeleteNoteButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);

  const userKey =
    typeof window === "undefined"
      ? null
      : getCognitoUserId() || getCognitoUsername() || null;

  const { data: notes = [] } = useQuery<NoteItem[]>({
    queryKey: ["notes", userKey],
    queryFn: listNotes,
    enabled: Boolean(userKey && noteId),
    staleTime: 15_000,
  });

  const matchedNote = notes.find(
    (item) => (item.id ?? item.noteId) === noteId
  );

  const resolvedNoteId = noteId ?? matchedNote?.id ?? matchedNote?.noteId;

  const mutation = useMutation({
    mutationFn: async () => {
      const targetId = resolvedNoteId ?? slug;
      if (!targetId) {
        throw new Error("Note identifier missing");
      }
      return deleteNote({
        id: targetId,
        noteId: resolvedNoteId ?? targetId,
        slug: matchedNote?.slug || slug,
        sk: matchedNote?.SK,
      });
    },
    onSuccess: async () => {
      const cacheId = resolvedNoteId;
      if (userKey && cacheId) {
        queryClient.setQueryData<NoteItem[]>(["notes", userKey], (prev = []) =>
          prev.filter((item) => (item.id ?? item.noteId) !== cacheId)
        );
      }
      setConfirming(false);
      await queryClient.invalidateQueries({ queryKey: ["notes", userKey] });
      router.push("/");
    },
  });

  if (!noteId && !slug) return null;

  if (confirming) {
    return (
      <div
        className="flex items-center gap-1.5"
        role="group"
        aria-label="Confirm note deletion"
      >
        <span className="hidden text-xs font-medium text-gray-600 sm:inline">
          Delete this note?
        </span>
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="inline-flex h-7 cursor-pointer items-center rounded-lg bg-red-600 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mutation.isPending ? "Deleting..." : "Delete"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={mutation.isPending}
          className="inline-flex h-7 cursor-pointer items-center rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      disabled={mutation.isPending}
      title="Delete note"
      aria-label="Delete note"
      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </svg>
    </button>
  );
}