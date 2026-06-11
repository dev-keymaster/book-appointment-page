"use client";

import { useEffect, useMemo, useState } from "react";
import type { BookingRecord } from "@/lib/bookings";

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

export function BookingShareActions({ booking }: { booking: BookingRecord }) {
  const [snackbars, setSnackbars] = useState<Snackbar[]>([]);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);
  const eventDetails = useMemo(
    () =>
      [
        `${booking.meetingTitle} with Igor Kliuchnik`,
        `${formatDateTime(booking.startAt, booking.endAt, booking.timeZone)} ${booking.timeZone}`,
        "",
        booking.meetLink ? `Google Meet:\n${booking.meetLink}` : null,
        booking.calendarHtmlLink ? `Calendar:\n${booking.calendarHtmlLink}` : null,
        shareUrl ? `View details\n${shareUrl}` : null
      ]
        .filter(Boolean)
        .join("\n\n"),
    [
      booking.calendarHtmlLink,
      booking.endAt,
      booking.meetLink,
      booking.meetingTitle,
      booking.startAt,
      booking.timeZone,
      shareUrl
    ]
  );

  function dismissSnackbar(id: number) {
    setSnackbars((current) => current.filter((snackbar) => snackbar.id !== id));
  }

  function showSnackbar(title: string, message: string) {
    const id = Date.now();

    setSnackbars((current) => [...current, { id, title, message }]);
    window.setTimeout(() => dismissSnackbar(id), 5200);
  }

  async function saveEventFile() {
    const response = await fetch("/api/calendar-file", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        meetingTitle: booking.meetingTitle,
        start: booking.startAt,
        end: booking.endAt,
        timeZone: booking.timeZone,
        meetLink: booking.meetLink ?? undefined,
        calendarHtmlLink: booking.calendarHtmlLink ?? undefined
      })
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

  async function copyDetails() {
    await navigator.clipboard.writeText(eventDetails);
    showSnackbar("Copied", "Event details copied to your clipboard.");
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {booking.meetLink ? (
          <a
            href={booking.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 justify-center rounded-lg bg-primary px-5 py-3 font-extrabold text-white outline-none transition hover:bg-primaryHover focus-visible:ring-2 focus-visible:ring-primaryHover"
          >
            Open Google Meet
          </a>
        ) : null}

        <button
          type="button"
          onClick={() => void saveEventFile()}
          className="inline-flex min-h-12 justify-center rounded-lg border border-border px-5 py-3 font-extrabold text-slate-200 outline-none transition hover:border-primaryHover hover:text-white focus-visible:ring-2 focus-visible:ring-primaryHover"
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
    </>
  );
}
