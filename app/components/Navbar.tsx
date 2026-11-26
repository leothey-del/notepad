"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Home, LogIn, Plus } from "lucide-react";
import LogoutMenu from "./LogoutMenu";

import {
  clearCognitoTokens,
  getCognitoUserId,
  getCognitoUsername,
} from "../lib/cognito";
import DeleteNoteButton from "./DeleteNoteButton";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState<string | null>(null);
  const lastUserKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const syncUser = () => {
      const nextUser = getCognitoUsername();
      const nextUserKey = getCognitoUserId() || nextUser || null;

      if (
        lastUserKeyRef.current !== null &&
        lastUserKeyRef.current !== nextUserKey
      ) {
        queryClient.removeQueries({ queryKey: ["notes"] });
      }

      lastUserKeyRef.current = nextUserKey;
      setUsername(nextUser);
    };

    syncUser();

    window.addEventListener("auth-change", syncUser);
    return () => window.removeEventListener("auth-change", syncUser);
  }, [pathname, queryClient]);

  if (pathname === "/login") return null;

  const handleLogout = () => {
    lastUserKeyRef.current = null;
    router.replace("/login");
    clearCognitoTokens();
    queryClient.removeQueries({ queryKey: ["notes"] });
    setUsername(null);
  };

  return (
    <nav
      aria-label="Main navigation"
      className="mb-6 flex h-14 items-center justify-between rounded-2xl border border-gray-200/80 bg-white px-3 shadow-[0_8px_30px_rgba(17,24,39,0.06)]"
    >
      <Link
        href="/"
        aria-label="Noted home"
        className="group flex items-center rounded-xl px-1.5 py-1"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-950 text-white shadow-sm transition-transform duration-200 group-hover:-rotate-3">
          <Home aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
        </span>
      </Link>

      {username ? (
        <div className="flex items-center gap-1.5">
          <DeleteNoteButton />

          {pathname === "/" && (
            <Link
              href="/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-gray-900 px-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-700"
            >
              <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} />
              <span className="hidden sm:inline">New note</span>
            </Link>
          )}

          <div className="ml-1 h-5 w-px bg-gray-200" />

          <LogoutMenu username={username} onLogout={handleLogout} />
        </div>
      ) : (
        <Link
          href="/login"
          className="inline-flex h-9 items-center gap-2 rounded-xl bg-gray-950 px-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-700"
        >
          <LogIn aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
          Log in
        </Link>
      )}
    </nav>
  );
}