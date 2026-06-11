"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CopyMeetLinkButton } from "@/components/copy-meet-link-button";

type BookingReceipt = {
  meetingTitle: string;
  durationMinutes: number;
  start: string;
  end: string;
  timeZone: string;
  shareUrl?: string;
  calendarHtmlLink?: string;
  meetLink?: string;
};

type Snackbar = {
  id: number;
  title: string;
  message: string;
};

function formatDateTime(start: string, end: string, timeZone: string) {
  const date = new Intl.DateTimeFormat("en", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(new Date(start));
  const startTime = new Intl.DateTimeFormat("en", {
    timeZone,
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(start));
  const endTime = new Intl.DateTimeFormat("en", {
    timeZone,
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(end));

  return `${date}, ${startTime}-${endTime}`;
}

function isReceipt(value: unknown): value is BookingReceipt {
  if (!value || typeof value !== "object") {
    return false;
  }

  const receipt = value as Record<string, unknown>;

  return (
    typeof receipt.meetingTitle === "string" &&
    typeof receipt.durationMinutes === "number" &&
    typeof receipt.start === "string" &&
    typeof receipt.end === "string" &&
    typeof receipt.timeZone === "string"
  );
}

export function BookingSuccessDetails() {
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null);
  const [snackbars, setSnackbars] = useState<Snackbar[]>([]);

  useEffect(() => {
    const rawReceipt = sessionStorage.getItem("booking_receipt");

    if (!rawReceipt) {
      return;
    }

    try {
      const parsed = JSON.parse(rawReceipt) as unknown;

      if (isReceipt(parsed)) {
        setReceipt(parsed);
      }
    } catch {
      setReceipt(null);
    }
  }, []);

  const eventDetails = useMemo(() => {
    if (!receipt) {
      return "";
    }

    return [
      `${receipt.meetingTitle} with Igor Kliuchnik`,
      `${formatDateTime(receipt.start, receipt.end, receipt.timeZone)} ${receipt.timeZone}`,
      "",
      receipt.shareUrl ? `View details\n${receipt.shareUrl}` : null,
      receipt.shareUrl ? "" : null,
      receipt.meetLink ? `Google Meet:\n${receipt.meetLink}` : null,
      receipt.calendarHtmlLink ? `Calendar:\n${receipt.calendarHtmlLink}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");
  }, [receipt]);

  async function copyDetails() {
    if (!eventDetails) {
      return;
    }

    await navigator.clipboard.writeText(eventDetails);
    showSnackbar("Copied", "Event details copied to your clipboard.");
  }

  function dismissSnackbar(id: number) {
    setSnackbars((current) => current.filter((snackbar) => snackbar.id !== id));
  }

  function showSnackbar(title: string, message: string) {
    const id = Date.now();

    setSnackbars((current) => [...current, { id, title, message }]);
    window.setTimeout(() => dismissSnackbar(id), 5200);
  }

  async function saveEventFile() {
    if (!receipt) {
      return;
    }

    const response = await fetch("/api/calendar-file", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(receipt)
    });

    if (!response.ok) {
      showSnackbar("File not saved", "Please copy the event details and add the meeting manually.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "igor-kliuchnik-booking.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showSnackbar("File saved", "Open the downloaded file to add this meeting to your calendar.");
  }

  if (!receipt) {
    return (
      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex rounded-lg border border-border px-4 py-3 font-bold text-slate-200 outline-none transition hover:border-primaryHover hover:text-white focus-visible:ring-2 focus-visible:ring-primaryHover"
        >
          Back to booking page
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-5">
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

      <dl className="grid gap-3">
        <div className="rounded-lg border border-border bg-background/35 px-4 py-3">
          <dt className="text-sm font-bold text-slate-400">Meeting</dt>
          <dd className="mt-1 font-semibold text-white">{receipt.meetingTitle}</dd>
        </div>
        <div className="rounded-lg border border-border bg-background/35 px-4 py-3">
          <dt className="text-sm font-bold text-slate-400">Time</dt>
          <dd className="mt-1 font-semibold text-white">
            {formatDateTime(receipt.start, receipt.end, receipt.timeZone)}
          </dd>
        </div>
        {receipt.meetLink ? (
          <div className="rounded-lg border border-border bg-background/35 px-4 py-3">
            <dt className="text-sm font-bold text-slate-400">Google Meet</dt>
            <dd className="mt-2 flex items-center gap-3">
              <span className="min-w-0 flex-1 break-words font-semibold text-blue-200">{receipt.meetLink}</span>
              <CopyMeetLinkButton value={receipt.meetLink} />
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => void saveEventFile()}
            className="inline-flex min-h-12 justify-center rounded-lg bg-primary px-5 py-3 font-extrabold text-white outline-none transition hover:bg-primaryHover focus-visible:ring-2 focus-visible:ring-primaryHover"
          >
            Save event file
          </button>

          <button
            type="button"
            onClick={() => void copyDetails()}
            className="inline-flex min-h-12 justify-center rounded-lg border border-border px-5 py-3 font-extrabold text-slate-200 outline-none transition hover:border-primaryHover hover:text-white focus-visible:ring-2 focus-visible:ring-primaryHover"
          >
            Copy event details
          </button>
        </div>

        <Link
          href="/"
          className="inline-flex min-h-12 justify-center rounded-lg border border-transparent px-5 py-3 font-extrabold text-slate-300 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-primaryHover sm:ml-auto"
        >
          Close
        </Link>
      </div>
    </div>
  );
}
