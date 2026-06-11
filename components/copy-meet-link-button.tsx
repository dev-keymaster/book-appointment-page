"use client";

import { useState } from "react";

type Snackbar = {
  id: number;
  title: string;
  message: string;
};

export function CopyMeetLinkButton({ value }: { value: string }) {
  const [snackbars, setSnackbars] = useState<Snackbar[]>([]);

  function dismissSnackbar(id: number) {
    setSnackbars((current) => current.filter((snackbar) => snackbar.id !== id));
  }

  function showSnackbar(title: string, message: string) {
    const id = Date.now();

    setSnackbars((current) => [...current, { id, title, message }]);
    window.setTimeout(() => dismissSnackbar(id), 5200);
  }

  async function copyMeetLink() {
    await navigator.clipboard.writeText(value);
    showSnackbar("Copied", "Google Meet link copied to your clipboard.");
  }

  return (
    <>
      <div className="fixed right-4 top-4 z-50 flex w-[min(100%-32px,380px)] flex-col gap-3" aria-live="polite">
        {snackbars.map((snackbar) => (
          <div
            key={snackbar.id}
            className="relative rounded-lg border border-primary/35 bg-[#101B33]/95 px-4 py-3 pr-11 text-slate-100 shadow-premium backdrop-blur"
            role="status"
          >
            <p className="text-sm font-extrabold text-white">{snackbar.title}</p>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-blue-100">{snackbar.message}</p>
            <button
              type="button"
              onClick={() => dismissSnackbar(snackbar.id)}
              className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-md text-slate-400 outline-none transition hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-primaryHover"
              aria-label="Dismiss notification"
            >
              <svg
                aria-hidden="true"
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => void copyMeetLink()}
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-slate-300 outline-none transition hover:border-primaryHover hover:text-white focus-visible:ring-2 focus-visible:ring-primaryHover"
        aria-label="Copy Google Meet link"
        title="Copy Google Meet link"
      >
        <svg
          aria-hidden="true"
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        >
          <rect width="14" height="14" x="8" y="8" rx="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      </button>
    </>
  );
}
