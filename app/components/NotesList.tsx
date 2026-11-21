"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listNotes } from "../lib/notesApi";

function toTitleSlug(title: string): string {
  const dashed = (title.trim() || "untitled")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return encodeURIComponent(dashed || "untitled");
}

export default function NotesList() {
  const { data: notes = [], isLoading, isError } = useQuery({
    queryKey: ["notes"],
    queryFn: listNotes,
  });

  if (isLoading) return <p>Loading notes...</p>;
  if (isError) return <p>Could not load notes.</p>;

  return (
    <section>
      <h2>Saved Notes</h2>
      {notes.length === 0 ? (
        <p>No notes yet.</p>
      ) : (
        <ul>
          {notes.map((note) => {
            const slug = toTitleSlug(note.title);
            return (
              <li key={note.id}>
                <Link href={`/${slug}`}>
                  <strong>{note.title.trim() || "untitled"}</strong>
                </Link>
                {/* {note.content ? <p>{note.content}</p> : null} */}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}