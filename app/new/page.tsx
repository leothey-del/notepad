import Link from "next/link";
import NoteForm from "../components/NoteForm";

export default function NewNotePage() {
  return (
    <main>
      <div>
        <Link href="/">← Back to Notes</Link>
      </div>
      <NoteForm />
    </main>
  );
}