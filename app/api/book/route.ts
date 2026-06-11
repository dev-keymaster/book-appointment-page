import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/availability";
import { calendarErrorPayload, createCalendarEvent } from "@/lib/google-calendar";
import { getMeeting } from "@/lib/meetings";
import { slotIsAvailable } from "@/lib/time";
import { bookingRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bookingRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the booking details and try again.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { type, slot, timeZone, details } = parsed.data;
  const meeting = getMeeting(type);
  const start = new Date(slot);
  const end = new Date(start.getTime() + meeting.durationMinutes * 60_000);

  if (Number.isNaN(start.getTime()) || start <= new Date()) {
    return NextResponse.json({ error: "This time slot has expired. Select another time." }, { status: 409 });
  }

  try {
    const days = await getAvailability(type, timeZone);
    const availableSlots = days.flatMap((day) => day.slots);

    if (!slotIsAvailable(slot, availableSlots)) {
      return NextResponse.json(
        { error: "This time was just booked. Please select another slot.", code: "SLOT_UNAVAILABLE" },
        { status: 409 }
      );
    }

    const event = await createCalendarEvent({
      title: meeting.title,
      description: meeting.description,
      start,
      end,
      attendee: details,
      timeZone
    });

    const response = NextResponse.json({
      ok: true,
      receipt: {
        meetingTitle: meeting.title,
        durationMinutes: meeting.durationMinutes,
        start: start.toISOString(),
        end: end.toISOString(),
        timeZone,
        calendarHtmlLink: event.htmlLink,
        meetLink: event.hangoutLink,
        attendeeStatus: event.attendees?.find((attendee) => attendee.email === details.email)?.responseStatus
      }
    });
    response.cookies.set("booking_success", "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10,
      path: "/book/success"
    });

    return response;
  } catch (error) {
    const debug = calendarErrorPayload(error);

    return NextResponse.json(
      {
        error: "The meeting could not be booked. Please try again shortly.",
        ...(process.env.NODE_ENV === "development" ? { debug } : {})
      },
      { status: 502 }
    );
  }
}
