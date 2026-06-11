import { z } from "zod";
import { meetingTypes } from "@/lib/meetings";

export const meetingTypeSchema = z.enum(meetingTypes);

const timeZoneSchema = z
  .string()
  .min(1)
  .max(80)
  .default("UTC")
  .refine((value) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, "Use a valid IANA time zone.");

export const availabilityQuerySchema = z.object({
  type: meetingTypeSchema,
  timeZone: timeZoneSchema
});

export const bookingDetailsSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120, "Name is too long."),
  email: z.string().trim().email("Enter a valid email address.").max(180),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  linkedin: z
    .string()
    .trim()
    .max(240)
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || value.startsWith("https://") || value.startsWith("http://"),
      "Use a full URL, including https://."
    ),
  message: z.string().trim().max(1200, "Message is too long.").optional().or(z.literal(""))
});

export const bookingRequestSchema = z.object({
  type: meetingTypeSchema,
  slot: z.string().datetime("Select a valid time slot."),
  timeZone: timeZoneSchema,
  details: bookingDetailsSchema
});

export type BookingDetails = z.infer<typeof bookingDetailsSchema>;
export type BookingRequest = z.infer<typeof bookingRequestSchema>;
