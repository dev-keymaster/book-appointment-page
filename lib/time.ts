const ownerTimeZone = "Asia/Tbilisi";
const openingHour = 9;
const closingHour = 18;
const availabilityWindowDays = 14;
const minimumLeadTimeHours = 4;
const slotStepMinutes = 60;

export type BusyBlock = {
  start: string;
  end: string;
};

export type AvailabilitySlot = {
  start: string;
  end: string;
};

export type AvailabilityDay = {
  date: string;
  label: string;
  disabled: boolean;
  slots: AvailabilitySlot[];
};

function datePartsInTimeZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });

  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second)
  };
}

function zonedTimeToUtc(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0
) {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);
  const zonedParts = datePartsInTimeZone(new Date(utcGuess), timeZone);
  const zonedAsUtc = Date.UTC(
    zonedParts.year,
    zonedParts.month - 1,
    zonedParts.day,
    zonedParts.hour,
    zonedParts.minute,
    zonedParts.second
  );
  const offset = zonedAsUtc - utcGuess;

  return new Date(utcGuess - offset);
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

function overlapsBusy(start: Date, end: Date, busy: BusyBlock[]) {
  return busy.some((block) => {
    const busyStart = new Date(block.start);
    const busyEnd = new Date(block.end);
    return start < busyEnd && end > busyStart;
  });
}

function dateKey(date: Date, timeZone: string) {
  const parts = datePartsInTimeZone(date, timeZone);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function dayLabel(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(date);
}

function isWeekend(date: Date, timeZone: string) {
  const weekday = new Intl.DateTimeFormat("en", {
    timeZone,
    weekday: "short"
  }).format(date);

  return weekday === "Sat" || weekday === "Sun";
}

export function availabilityRange(timeZone: string) {
  const now = new Date();
  const today = datePartsInTimeZone(now, ownerTimeZone);
  const start = zonedTimeToUtc(ownerTimeZone, today.year, today.month, today.day, openingHour);
  const endBase = new Date(start);
  endBase.setUTCDate(endBase.getUTCDate() + availabilityWindowDays);
  const endParts = datePartsInTimeZone(endBase, ownerTimeZone);
  const end = zonedTimeToUtc(ownerTimeZone, endParts.year, endParts.month, endParts.day, closingHour);

  return { start, end };
}

export function buildAvailabilityDays({
  busy,
  durationMinutes,
  timeZone
}: {
  busy: BusyBlock[];
  durationMinutes: number;
  timeZone: string;
}): AvailabilityDay[] {
  const now = new Date();
  const earliestStart = addMinutes(now, minimumLeadTimeHours * 60);
  const displayToday = datePartsInTimeZone(now, timeZone);
  const today = datePartsInTimeZone(now, timeZone);
  const ownerToday = datePartsInTimeZone(now, ownerTimeZone);
  const slotsByDisplayDate = new Map<string, AvailabilitySlot[]>();

  for (let index = 0; index < availabilityWindowDays; index += 1) {
    const noon = zonedTimeToUtc(ownerTimeZone, ownerToday.year, ownerToday.month, ownerToday.day + index, 12);
    const parts = datePartsInTimeZone(noon, ownerTimeZone);

    if (isWeekend(noon, ownerTimeZone)) {
      continue;
    }

    const dayStart = zonedTimeToUtc(ownerTimeZone, parts.year, parts.month, parts.day, openingHour);
    const dayEnd = zonedTimeToUtc(ownerTimeZone, parts.year, parts.month, parts.day, closingHour);

    for (let cursor = dayStart; addMinutes(cursor, durationMinutes) <= dayEnd; cursor = addMinutes(cursor, slotStepMinutes)) {
      const slotEnd = addMinutes(cursor, durationMinutes);

      if (cursor <= earliestStart) {
        continue;
      }

      if (!overlapsBusy(cursor, slotEnd, busy)) {
        const displayDate = dateKey(cursor, timeZone);
        const slots = slotsByDisplayDate.get(displayDate) ?? [];

        slots.push({
          start: cursor.toISOString(),
          end: slotEnd.toISOString()
        });
        slotsByDisplayDate.set(displayDate, slots);
      }
    }
  }

  const days: AvailabilityDay[] = [];

  for (let index = 0; index < availabilityWindowDays; index += 1) {
    const noon = zonedTimeToUtc(timeZone, displayToday.year, displayToday.month, displayToday.day + index, 12);
    const key = dateKey(noon, timeZone);
    const slots = slotsByDisplayDate.get(key) ?? [];
    days.push({
      date: key,
      label: dayLabel(noon, timeZone),
      disabled: slots.length === 0,
      slots
    });
  }

  return days;
}

export function slotIsAvailable(slot: string, slots: AvailabilitySlot[]) {
  return slots.some((availableSlot) => availableSlot.start === slot);
}
