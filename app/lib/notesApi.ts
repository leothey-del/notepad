// lib/notesApi.ts
export interface NotePayload {
  id?: string;
  title: string;
  content: string;
}

export interface SavedNote {
  id: string;
  title: string;
  content: string;
}

export async function saveNote(data: NotePayload): Promise<SavedNote> {
  const response = await fetch(process.env.NEXT_PUBLIC_SAVE_NOTE_API_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to save note to Lambda");
  }

  return response.json();
}

export async function listNotes(): Promise<SavedNote[]> {
  const response = await fetch(process.env.NEXT_PUBLIC_LIST_NOTES_API_URL!, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to list notes from Lambda");
  }

  return response.json();
}