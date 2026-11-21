import Link from "next/link";
import NotesList from "./components/NotesList";

export default function HomePage() {
  return (
    <main>
      <div>
        <Link href="/new">+ New Note</Link>
      </div>
      <NotesList />
    </main>
  );
}