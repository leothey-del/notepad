// lib/notesApi.ts
import { getCognitoIdToken, getCognitoUserId } from "./cognito";

export interface NotePayload {
  id?: string;
  title: string;
  content: string;
  userId?: string | null;
}

export interface DeleteNotePayload {
  id: string;
  noteId?: string;
  slug?: string;
  sk?: string;
  userId?: string | null;
}

export type SavedNote = {
  id?: string;
  noteId?: string;
  title: string;
  content: string;
  userId?: string;
  updatedAt?: string;
};

function getAuthHeaders(): HeadersInit {
  const token = getCognitoIdToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function saveNote(data: NotePayload): Promise<SavedNote> {
  const userId = getCognitoUserId();

  const response = await fetch(process.env.NEXT_PUBLIC_SAVE_NOTE_API_URL!, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ...data, userId }),
  });

  if (!response.ok) {
    throw new Error("Failed to save note to Lambda");
  }

  return response.json();
}

export async function listNotes(): Promise<SavedNote[]> {
  const response = await fetch(process.env.NEXT_PUBLIC_LIST_NOTES_API_URL!, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to list notes from Lambda");
  }

  return response.json();
}

export async function deleteNote(data: DeleteNotePayload): Promise<void> {
  const userId = getCognitoUserId();
  const endpoint =
    process.env.NEXT_PUBLIC_DELETE_NOTE_API_URL ||
    process.env.NEXT_PUBLIC_SAVE_NOTE_API_URL!;

  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ...data, userId }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete note from Lambda");
  }
}