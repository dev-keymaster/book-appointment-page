"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BookingReceipt = {
  meetingTitle: string;
  durationMinutes: number;
  start: string;
  end: string;
  timeZone: string;
  calendarHtmlLink?: string;
  meetLink?: string;
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
  const [copied, setCopied] = useState(false);

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
      receipt.meetLink ? `Google Meet:\n${receipt.meetLink}` : null,
      receipt.calendarHtmlLink ? `Calendar:\n${receipt.calendarHtmlLink}` : null
    ]
      .filter(Boolean)
      .join("\n\n");
  }, [receipt]);

  async function copyDetails() {
    if (!eventDetails) {
      return;
    }

    await navigator.clipboard.writeText(eventDetails);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
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
            <dd className="mt-1 break-words font-semibold text-blue-200">{receipt.meetLink}</dd>
          </div>
        ) : null}
      </dl>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          {receipt.calendarHtmlLink ? (
            <a
              href={receipt.calendarHtmlLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center rounded-lg bg-primary px-5 py-3 font-extrabold text-white outline-none transition hover:bg-primaryHover focus-visible:ring-2 focus-visible:ring-primaryHover"
            >
              Add to Google Calendar
            </a>
          ) : null}

          <button
            type="button"
            onClick={() => void copyDetails()}
            className="inline-flex justify-center rounded-lg border border-border px-5 py-3 font-extrabold text-slate-200 outline-none transition hover:border-primaryHover hover:text-white focus-visible:ring-2 focus-visible:ring-primaryHover"
          >
            {copied ? "Copied" : "Copy event details"}
          </button>
        </div>

        <Link
          href="/"
          className="inline-flex justify-center rounded-lg border border-transparent px-5 py-3 font-extrabold text-slate-300 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-primaryHover sm:ml-auto"
        >
          Close
        </Link>
      </div>
    </div>
  );
}
