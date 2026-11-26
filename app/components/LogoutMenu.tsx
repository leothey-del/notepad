"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";

type LogoutMenuProps = {
  username: string;
  onLogout: () => void;
};

export default function LogoutMenu({
  username,
  onLogout,
}: LogoutMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Open account menu for ${username}`}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-sm font-semibold uppercase text-gray-900 ring-offset-2 transition-all hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
      >
        {username.charAt(0).toUpperCase()}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-44 rounded-xl border border-gray-200 bg-white p-1.5 shadow-[0_12px_30px_rgba(17,24,39,0.16)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
