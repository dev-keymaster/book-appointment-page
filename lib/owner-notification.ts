import { google } from "googleapis";
import type { BookingDetails } from "@/lib/validation";

type OwnerNotificationInput = {
  meetingTitle: string;
  start: Date;
  end: Date;
  timeZone: string;
  attendee: BookingDetails;
  meetLink?: string | null;
  calendarHtmlLink?: string | null;
};

type OwnerNotificationResult =
  | { sent: true; id?: string | null }
  | { sent: false; reason: "missing_env" | "request_failed"; message?: string };

function optionalEnv(name: string) {
  const value = process.env[name]?.trim();

  return value || undefined;
}

function requiredGoogleEnv(name: string) {
  const value = optionalEnv(name);

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function gmailClient() {
  const oauth2Client = new google.auth.OAuth2(
    requiredGoogleEnv("GOOGLE_CLIENT_ID"),
    requiredGoogleEnv("GOOGLE_CLIENT_SECRET")
  );

  oauth2Client.setCredentials({
    refresh_token: requiredGoogleEnv("GOOGLE_REFRESH_TOKEN")
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

function encodeEmail(raw: string) {
  return Buffer.from(raw).toString("base64url");
}

function cleanHeaderValue(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function formatDateTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone
  }).format(date);
}

function buildEmail(input: OwnerNotificationInput, ownerEmail: string) {
  const start = formatDateTime(input.start, input.timeZone);
  const end = formatDateTime(input.end, input.timeZone);
  const subject = `New booking: ${input.meetingTitle} with ${input.attendee.name}`;
  const lines = [
    "New booking confirmed",
    "",
    `Meeting: ${input.meetingTitle}`,
    `Time: ${start} - ${end}`,
    `Time zone: ${input.timeZone}`,
    "",
    `Name: ${input.attendee.name}`,
    `Email: ${input.attendee.email}`,
    input.attendee.company ? `Company: ${input.attendee.company}` : null,
    input.attendee.linkedin ? `LinkedIn: ${input.attendee.linkedin}` : null,
    input.attendee.message ? `Message: ${input.attendee.message}` : null,
    "",
    input.meetLink ? `Google Meet: ${input.meetLink}` : null,
    input.calendarHtmlLink ? `Calendar event: ${input.calendarHtmlLink}` : null
  ].filter(Boolean);

  return [
    `From: ${ownerEmail}`,
    `To: ${ownerEmail}`,
    `Subject: ${cleanHeaderValue(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    lines.join("\n")
  ].join("\r\n");
}

export async function sendOwnerBookingNotification(input: OwnerNotificationInput): Promise<OwnerNotificationResult> {
  const ownerEmail = optionalEnv("OWNER_NOTIFICATION_EMAIL");

  if (!ownerEmail) {
    return { sent: false, reason: "missing_env", message: "OWNER_NOTIFICATION_EMAIL is not configured." };
  }

  try {
    const gmail = gmailClient();
    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodeEmail(buildEmail(input, ownerEmail))
      }
    });

    return { sent: true, id: response.data.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gmail notification failed.";

    console.error("Owner booking notification failed", { message });

    return { sent: false, reason: "request_failed", message };
  }
}
