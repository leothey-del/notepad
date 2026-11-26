import { listNotes, type SavedNote } from "./notesApi";

// Short prefix helper for symbol-only titles (e.g. "2de07f8b-..." -> "note-2de07f8b")
function shortNoteSlug(id?: string): string {
  if (!id) return "untitled";
  const cleanId = id.replace(/-/g, "").slice(0, 8);
  return cleanId ? `note-${cleanId}` : "untitled";
}

export function toSlug(value: string, fallbackId?: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) {
    return shortNoteSlug(fallbackId);
  }

  return slug;
}

export async function findNoteBySlug(
  slug: string
): Promise<SavedNote | undefined> {
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {
    decodedSlug = slug;
  }

  const normalizedSlug = toSlug(decodedSlug);
  const notes = await listNotes();

  return notes.find((note) => {
    const resolvedId = note.id ?? (note as { noteId?: string }).noteId;
    return (
      toSlug(note.title, resolvedId) === normalizedSlug ||
      toSlug(note.title, resolvedId) === decodedSlug ||
      shortNoteSlug(resolvedId) === decodedSlug ||
      resolvedId === decodedSlug
    );
  });
}