// app/[slug]/page.tsx
import { Suspense } from "react";
import NoteForm from "../components/NoteForm";

type NoteSlugPageProps = {
  params: Promise<{ slug: string }>;
};

async function SlugNoteLoader({ params }: NoteSlugPageProps) {
  const { slug } = await params;
  return <NoteForm initialSlug={slug} />;
}

export default function NoteSlugPage({ params }: NoteSlugPageProps) {
  return (
    <Suspense fallback={null}>
      <SlugNoteLoader params={params} />
    </Suspense>
  );
}