import { google } from "googleapis";
import type { calendar_v3 } from "googleapis";
import type { BusyBlock } from "@/lib/time";
import type { BookingDetails } from "@/lib/validation";

export class CalendarIntegrationError extends Error {
  readonly status?: number;
  readonly code?: string | number;

  constructor(message: string, options?: { status?: number; code?: string | number; cause?: unknown }) {
    super(message);
    this.name = "CalendarIntegrationError";
    this.status = options?.status;
    this.code = options?.code;
    this.cause = options?.cause;
  }
}

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new CalendarIntegrationError(`${name} is not configured.`, {
      code: "MISSING_ENV"
    });
  }

  return value;
}

function toCalendarError(error: unknown, fallback: string): CalendarIntegrationError {
  if (error instanceof CalendarIntegrationError) {
    return error;
  }

  if (typeof error === "object" && error !== null) {
    type GoogleErrorData = {
      error?: unknown;
      error_description?: unknown;
      errorDetails?: Array<{ reason?: string }>;
      details?: Array<{ reason?: string; metadata?: Record<string, string> }>;
      message?: unknown;
    };
    const candidate = error as {
      code?: unknown;
      status?: number;
      response?: {
        status?: number;
        data?: GoogleErrorData;
      };
      message?: string;
    };
    const data = candidate.response?.data;
    const status = candidate.status ?? candidate.response?.status;
    const reason =
      data?.errorDetails?.[0]?.reason ??
      data?.details?.find((detail) => detail.reason)?.reason ??
      data?.details?.find((detail) => detail.metadata?.method)?.metadata?.method;
    const rawCode = reason ?? data?.error ?? candidate.code;
    const code = typeof rawCode === "string" || typeof rawCode === "number" ? rawCode : undefined;
    const dataMessage = typeof data?.message === "string" ? data.message : undefined;
    const description = typeof data?.error_description === "string" ? data.error_description : undefined;
    const rawMessage = description ?? dataMessage ?? candidate.message ?? fallback;
    const isMissingScope =
      code === "ACCESS_TOKEN_SCOPE_INSUFFICIENT" ||
      reason === "insufficientPermissions" ||
      (status === 403 && rawMessage.toLowerCase().includes("insufficient permission"));
    const message =
      isMissingScope
        ? "Google refresh token is missing Calendar scopes. Generate a new refresh token with Calendar API scopes."
        : rawMessage;

    return new CalendarIntegrationError(message, {
      status,
      code,
      cause: error
    });
  }

  return new CalendarIntegrationError(fallback, { cause: error });
}

export function calendarErrorPayload(error: unknown) {
  const calendarError = toCalendarError(error, "Google Calendar request failed.");

  return {
    message: calendarError.message,
    status: calendarError.status,
    code: calendarError.code
  };
}

function calendarClient() {
  const oauth2Client = new google.auth.OAuth2(
    requiredEnv("GOOGLE_CLIENT_ID"),
    requiredEnv("GOOGLE_CLIENT_SECRET")
  );

  oauth2Client.setCredentials({
    refresh_token: requiredEnv("GOOGLE_REFRESH_TOKEN")
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function getBusyBlocks({ start, end }: { start: Date; end: Date }): Promise<BusyBlock[]> {
  const calendar = calendarClient();
  const calendarId = requiredEnv("GOOGLE_CALENDAR_ID");

  try {
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        items: [{ id: calendarId }]
      }
    });

    return response.data.calendars?.[calendarId]?.busy?.flatMap((block) => {
      if (!block.start || !block.end) {
        return [];
      }

      return [{ start: block.start, end: block.end }];
    }) ?? [];
  } catch (error) {
    throw toCalendarError(error, "Google FreeBusy request failed.");
  }
}

export async function getCalendarEventStatus(eventId: string): Promise<calendar_v3.Schema$Event["status"] | null> {
  const calendar = calendarClient();
  const calendarId = requiredEnv("GOOGLE_CALENDAR_ID");

  try {
    const response = await calendar.events.get({
      calendarId,
      eventId
    });

    return response.data.status ?? null;
  } catch (error) {
    const calendarError = toCalendarError(error, "Google Calendar event lookup failed.");

    if (calendarError.status === 404) {
      return "cancelled";
    }

    throw calendarError;
  }
}

export async function createCalendarEvent({
  title,
  description,
  start,
  end,
  attendee,
  timeZone
}: {
  title: string;
  description: string;
  start: Date;
  end: Date;
  attendee: BookingDetails;
  timeZone: string;
}): Promise<calendar_v3.Schema$Event> {
  const calendar = calendarClient();
  const calendarId = requiredEnv("GOOGLE_CALENDAR_ID");
  const requestId = crypto.randomUUID();
  const eventDescription = [
    description,
    "",
    `Name: ${attendee.name}`,
    attendee.company ? `Company: ${attendee.company}` : null,
    attendee.linkedin ? `LinkedIn: ${attendee.linkedin}` : null,
    attendee.message ? `Message: ${attendee.message}` : null
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      sendUpdates: "all",
      requestBody: {
        summary: `${title} with ${attendee.name}`,
        description: eventDescription,
        start: {
          dateTime: start.toISOString(),
          timeZone
        },
        end: {
          dateTime: end.toISOString(),
          timeZone
        },
        attendees: [
        {
          email: attendee.email,
          displayName: attendee.name,
          responseStatus: "accepted"
        }
      ],
        conferenceData: {
          createRequest: {
            requestId,
            conferenceSolutionKey: {
              type: "hangoutsMeet"
            }
          }
        }
      }
    });

    return response.data;
  } catch (error) {
    throw toCalendarError(error, "Google Calendar event creation failed.");
  }
}
