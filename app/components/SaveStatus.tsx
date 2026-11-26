"use client";

type SaveStatusProps = {
  visible: boolean;
  status: "idle" | "saving" | "saved" | "error";
};

// Renders the save status only after the user types.
// CALLS LIB: none (pure UI component).
export default function SaveStatus({
  visible,
  status,
}: SaveStatusProps) {
  if (!visible) return null;

  const label =
    status === "saving"
      ? "Saving..."
      : status === "saved"
        ? "Saved!"
        : status === "error"
          ? "Failed to save."
          : null;

  if (!label) return null;

  return (
    <p
      role="status"
      aria-live="polite"
      className="text-xs text-gray-500"
    >
      {label}
    </p>
  );
}