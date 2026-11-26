"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SignedOut from "./components/SignedOut";
import { listNotes } from "./lib/notesApi";
import NotesList from "./components/NotesList";
import { getCognitoUserId, getCognitoUsername } from "./lib/cognito";

export default function HomePage() {
  const [userKey, setUserKey] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      setUserKey(getCognitoUserId() || getCognitoUsername() || null);
      setAuthReady(true);
    };

    syncUser();
    window.addEventListener("auth-change", syncUser);
    return () => window.removeEventListener("auth-change", syncUser);
  }, []);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes", userKey],
    queryFn: listNotes,
    enabled: authReady && Boolean(userKey),
  });

  if (!authReady) {
    return null;
  }

  if (!userKey) {
    return <SignedOut/>;
  }

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading notes...</p>;
  }

  return (
    <div>
      <NotesList />
    </div>
  );
}