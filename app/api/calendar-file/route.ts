import { NextResponse } from "next/server";
import { z } from "zod";

const calendarFileSchema = z.object({
  meetingTitle: z.string().min(1).max(160),
  start: z.string().datetime(),
  end: z.string().datetime(),
  timeZone: z.string().min(1).max(80),
  calendarHtmlLink: z.string().url().optional(),
  meetLink: z.string().url().optional()
});

function escapeCalendarText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function toCalendarDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = calendarFileSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event details." }, { status: 400 });
  }

  const receipt = parsed.data;
  const description = [
    `${receipt.meetingTitle} with Igor Kliuchnik`,
    receipt.meetLink ? `Google Meet: ${receipt.meetLink}` : null,
    receipt.calendarHtmlLink ? `Calendar event: ${receipt.calendarHtmlLink}` : null
  ]
    .filter(Boolean)
    .join("\n");
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Igor Kliuchnik//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@igor-kliuchnik-booking`,
    `DTSTAMP:${toCalendarDate(new Date().toISOString())}`,
    `DTSTART:${toCalendarDate(receipt.start)}`,
    `DTEND:${toCalendarDate(receipt.end)}`,
    `SUMMARY:${escapeCalendarText(`${receipt.meetingTitle} with Igor Kliuchnik`)}`,
    `DESCRIPTION:${escapeCalendarText(description)}`,
    receipt.meetLink ? `LOCATION:${escapeCalendarText(receipt.meetLink)}` : null,
    "END:VEVENT",
    "END:VCALENDAR"
  ]
    .filter(Boolean)
    .join("\r\n");

  return new NextResponse(calendar, {
    headers: {
      "Content-Disposition": 'attachment; filename="igor-kliuchnik-booking.ics"',
      "Content-Type": "text/calendar; charset=utf-8"
    }
  });
}
