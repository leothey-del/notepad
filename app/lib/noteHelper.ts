// Calls `listNotes` from `./notesApi` (which lives in `lib/`).
import { listNotes, type SavedNote } from "./notesApi";

// Converts a note title or URL slug into a clean dash-separated string (e.g. "My Note" -> "my-note").
export function toSlug(value: string): string {
  return (value.trim() || "untitled")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Finds an existing saved note that matches `slug`.
// Calls `listNotes()` from `lib/notesApi.ts` to fetch all notes, then matches using `toSlug`.
export async function findNoteBySlug(slug: string): Promise<SavedNote | undefined> {
  const normalizedSlug = toSlug(slug);
  // CALLS LIB: `listNotes()` from `app/lib/notesApi.ts`
  const notes = await listNotes();
  return notes.find((note) => toSlug(note.title) === normalizedSlug);
}