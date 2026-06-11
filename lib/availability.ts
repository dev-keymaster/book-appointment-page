import { getBusyBlocks } from "@/lib/google-calendar";
import { getMeeting, type MeetingType } from "@/lib/meetings";
import { availabilityRange, buildAvailabilityDays } from "@/lib/time";

export async function getAvailability(type: MeetingType, timeZone: string) {
  const meeting = getMeeting(type);
  const range = availabilityRange(timeZone);
  const busy = await getBusyBlocks(range);

  return buildAvailabilityDays({
    busy,
    durationMinutes: meeting.durationMinutes,
    timeZone
  });
}
