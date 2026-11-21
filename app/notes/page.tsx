import Link from "next/link";
import NotesList from "../components/NotesList";

export default function NotesPage() {
  return (
    <main>
      <div>
        <Link href="/">+ New Note</Link>
      </div>
      <NotesList />
    </main>
  );
}