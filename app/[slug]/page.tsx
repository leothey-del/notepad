import { Suspense } from "react";
import NoteForm from "../components/NoteForm";

async function SlugNoteLoader({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const initialSlug = decoded.replace(/-/g, " ");

  return <NoteForm initialSlug={initialSlug} />;
}

export default function NoteSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SlugNoteLoader params={params} />
    </Suspense>
  );
}