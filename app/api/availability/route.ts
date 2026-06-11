import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/availability";
import { calendarErrorPayload } from "@/lib/google-calendar";
import { availabilityQuerySchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = availabilityQuerySchema.safeParse({
    type: searchParams.get("type"),
    timeZone: searchParams.get("timeZone") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid meeting type or time zone." },
      { status: 400 }
    );
  }

  try {
    const days = await getAvailability(parsed.data.type, parsed.data.timeZone);

    return NextResponse.json({ days });
  } catch (error) {
    const debug = calendarErrorPayload(error);

    return NextResponse.json(
      {
        error: "Availability could not be loaded. Please try again shortly.",
        ...(process.env.NODE_ENV === "development" ? { debug } : {})
      },
      { status: 502 }
    );
  }
}
