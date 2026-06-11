import { neon } from "@neondatabase/serverless";
import type { BookingDetails } from "@/lib/validation";

export type BookingRecord = {
  token: string;
  status: "confirmed" | "canceled";
  googleEventId: string | null;
  meetingTitle: string;
  durationMinutes: number;
  startAt: string;
  endAt: string;
  timeZone: string;
  meetLink: string | null;
  calendarHtmlLink: string | null;
  attendeeName: string;
  attendeeEmail: string;
  attendeeCompany: string | null;
  attendeeLinkedin: string | null;
  attendeeMessage: string | null;
  createdAt: string;
};

type CreateBookingRecordInput = {
  meetingTitle: string;
  durationMinutes: number;
  start: Date;
  end: Date;
  timeZone: string;
  meetLink?: string | null;
  calendarHtmlLink?: string | null;
  googleEventId?: string | null;
  attendee: BookingDetails;
};

function databaseUrl() {
  return process.env.DATABASE_URL?.trim();
}

function bookingToken() {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 24);
}

function rowToBooking(row: Record<string, unknown>): BookingRecord {
  return {
    token: String(row.token),
    status: row.status === "canceled" ? "canceled" : "confirmed",
    googleEventId: row.google_event_id ? String(row.google_event_id) : null,
    meetingTitle: String(row.meeting_title),
    durationMinutes: Number(row.duration_minutes),
    startAt: new Date(String(row.start_at)).toISOString(),
    endAt: new Date(String(row.end_at)).toISOString(),
    timeZone: String(row.time_zone),
    meetLink: row.meet_link ? String(row.meet_link) : null,
    calendarHtmlLink: row.calendar_html_link ? String(row.calendar_html_link) : null,
    attendeeName: String(row.attendee_name),
    attendeeEmail: String(row.attendee_email),
    attendeeCompany: row.attendee_company ? String(row.attendee_company) : null,
    attendeeLinkedin: row.attendee_linkedin ? String(row.attendee_linkedin) : null,
    attendeeMessage: row.attendee_message ? String(row.attendee_message) : null,
    createdAt: new Date(String(row.created_at)).toISOString()
  };
}

export async function createBookingRecord(input: CreateBookingRecordInput): Promise<BookingRecord | null> {
  const url = databaseUrl();

  if (!url) {
    return null;
  }

  const sql = neon(url);
  const rows = await sql`
    insert into bookings (
      token,
      status,
      google_event_id,
      meeting_title,
      duration_minutes,
      start_at,
      end_at,
      time_zone,
      meet_link,
      calendar_html_link,
      attendee_name,
      attendee_email,
      attendee_company,
      attendee_linkedin,
      attendee_message
    )
    values (
      ${bookingToken()},
      ${"confirmed"},
      ${input.googleEventId ?? null},
      ${input.meetingTitle},
      ${input.durationMinutes},
      ${input.start.toISOString()},
      ${input.end.toISOString()},
      ${input.timeZone},
      ${input.meetLink ?? null},
      ${input.calendarHtmlLink ?? null},
      ${input.attendee.name},
      ${input.attendee.email},
      ${input.attendee.company || null},
      ${input.attendee.linkedin || null},
      ${input.attendee.message || null}
    )
    returning *
  `;

  return rows[0] ? rowToBooking(rows[0] as Record<string, unknown>) : null;
}

export async function markBookingCanceled(token: string): Promise<BookingRecord | null> {
  const url = databaseUrl();

  if (!url || !/^[a-f0-9]{24}$/i.test(token)) {
    return null;
  }

  const sql = neon(url);
  const rows = await sql`
    update bookings
    set status = ${"canceled"}
    where token = ${token}
    returning *
  `;

  return rows[0] ? rowToBooking(rows[0] as Record<string, unknown>) : null;
}

export async function getBookingByToken(token: string): Promise<BookingRecord | null> {
  const url = databaseUrl();

  if (!url || !/^[a-f0-9]{24}$/i.test(token)) {
    return null;
  }

  const sql = neon(url);
  const rows = await sql`
    select *
    from bookings
    where token = ${token}
    limit 1
  `;

  return rows[0] ? rowToBooking(rows[0] as Record<string, unknown>) : null;
}
