"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { MeetingDefinition } from "@/lib/meetings";
import type { AvailabilityDay, AvailabilitySlot } from "@/lib/time";
import { timeZoneOptionDefinitions } from "@/lib/time-zone-options";
import { bookingDetailsSchema, type BookingDetails } from "@/lib/validation";

type Step = 0 | 1 | 2 | 3;
type TimeFormat = "12h" | "24h";

type AvailabilityResponse = {
  days: AvailabilityDay[];
  error?: string;
};

type BookingReceipt = {
  meetingTitle: string;
  durationMinutes: number;
  start: string;
  end: string;
  timeZone: string;
  calendarHtmlLink?: string;
  meetLink?: string;
  attendeeStatus?: string;
};

type BookingResponse = {
  ok?: boolean;
  receipt?: BookingReceipt;
  error?: string;
  code?: string;
};

type TimeZoneOption = {
  timeZone: string;
  label: string;
  search: string;
};

const initialDetails: BookingDetails = {
  name: "",
  email: "",
  company: "",
  linkedin: "",
  message: "",
};

const stepLabels = [
  "Select Date",
  "Select Time",
  "Your Details",
  "Confirm Booking",
];
const fallbackTimeZones = [
  "Asia/Tbilisi",
  "Europe/Berlin",
  "Europe/London",
  "Europe/Amsterdam",
  "Europe/Paris",
  "Europe/Warsaw",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Yerevan",
  "Asia/Baku",
  "Asia/Istanbul",
  "Asia/Tokyo",
  "Australia/Sydney",
];

function supportedTimeZones() {
  if (typeof Intl.supportedValuesOf === "function") {
    return Intl.supportedValuesOf("timeZone");
  }

  return fallbackTimeZones;
}

function cityName(timeZone: string) {
  return timeZone.split("/").pop()?.replaceAll("_", " ") ?? timeZone;
}

function offsetMinutes(date: Date, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  const zonedAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return Math.round((zonedAsUtc - date.getTime()) / 60_000);
}

function gmtOffset(date: Date, timeZone: string) {
  const minutes = offsetMinutes(date, timeZone);
  const sign = minutes >= 0 ? "+" : "-";
  const absolute = Math.abs(minutes);
  const hours = Math.floor(absolute / 60);
  const remainingMinutes = absolute % 60;

  return `GMT${sign}${hours}:${String(remainingMinutes).padStart(2, "0")}`;
}

function optionDefinition(timeZone: string) {
  return timeZoneOptionDefinitions.find(
    (option) => option.timeZone === timeZone,
  );
}

function timeZoneDisplayName(timeZone: string) {
  const option = optionDefinition(timeZone);

  if (option) {
    return `${option.city}, ${option.country}${option.name ? ` - ${option.name}` : ""}`;
  }

  return cityName(timeZone);
}

const countrySearchCodes: Record<string, string[]> = {
  "American Samoa": ["AS"],
  Argentina: ["AR"],
  Armenia: ["AM"],
  Australia: ["AU"],
  Azerbaijan: ["AZ"],
  Bangladesh: ["BD"],
  Belarus: ["BY", "RB"],
  Brazil: ["BR"],
  Canada: ["CA"],
  Chile: ["CL"],
  China: ["CN"],
  Colombia: ["CO"],
  "Costa Rica": ["CR"],
  Fiji: ["FJ"],
  Finland: ["FI"],
  Georgia: ["GE"],
  Germany: ["DE", "EU"],
  Greece: ["GR", "EU"],
  Guatemala: ["GT"],
  Iceland: ["IS"],
  India: ["IN"],
  Iran: ["IR"],
  Israel: ["IL"],
  Japan: ["JP"],
  Mexico: ["MX"],
  Nepal: ["NP"],
  "New Zealand": ["NZ"],
  Panama: ["PA"],
  Pakistan: ["PK"],
  Peru: ["PE"],
  Portugal: ["PT", "EU"],
  Romania: ["RO", "EU"],
  Russia: ["RU"],
  "Saudi Arabia": ["SA"],
  Singapore: ["SG"],
  "South Korea": ["KR"],
  Taiwan: ["TW"],
  Thailand: ["TH"],
  Turkey: ["TR"],
  Ukraine: ["UA"],
  "United Arab Emirates": ["AE", "UAE"],
  "United Kingdom": ["GB", "UK"],
  "United States": ["US", "USA"],
  Uruguay: ["UY"],
  Venezuela: ["VE"],
};

function timeZoneLabel(timeZone: string) {
  return `(${gmtOffset(new Date(), timeZone)}) ${timeZoneDisplayName(timeZone)}`;
}

function timeZoneOptions(): TimeZoneOption[] {
  const now = new Date();

  return timeZoneOptionDefinitions
    .map((option) => {
      const label = `(${gmtOffset(new Date(), option.timeZone)}) ${option.city}, ${option.country}${
        option.name ? ` - ${option.name}` : ""
      }`;

      return {
        timeZone: option.timeZone,
        label,
        search: `${label} ${option.timeZone} ${option.region ?? ""} ${option.countryCode ?? ""} ${(
          countrySearchCodes[option.country] ?? []
        ).join(" ")} ${(option.keywords ?? []).join(" ")}`,
      };
    })
    .sort((first, second) => {
      const offsetDifference =
        offsetMinutes(now, first.timeZone) -
        offsetMinutes(now, second.timeZone);

      if (offsetDifference !== 0) {
        return offsetDifference;
      }

      return first.label.localeCompare(second.label);
    });
}

function formatTime(iso: string, timeZone: string, timeFormat: TimeFormat) {
  return new Intl.DateTimeFormat("en", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: timeFormat === "12h",
  }).format(new Date(iso));
}

function formatDate(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

function clientTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function fieldError(
  errors: Record<string, string[] | undefined>,
  key: keyof BookingDetails,
) {
  return errors[key]?.[0];
}

export function BookingWizard({ meeting }: { meeting: MeetingDefinition }) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<Step>(0);
  const [timeZone, setTimeZone] = useState(clientTimeZone);
  const [timeZoneConfirmed, setTimeZoneConfirmed] = useState(false);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("12h");
  const [days, setDays] = useState<AvailabilityDay[]>([]);
  const [availabilityError, setAvailabilityError] = useState("");
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [details, setDetails] = useState<BookingDetails>(initialDetails);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[] | undefined>
  >({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadAvailability() {
      setIsLoadingAvailability(true);
      setAvailabilityError("");

      try {
        const params = new URLSearchParams({ type: meeting.type, timeZone });
        const response = await fetch(`/api/availability?${params.toString()}`, {
          headers: { Accept: "application/json" },
        });
        const data = (await response.json()) as AvailabilityResponse;

        if (!response.ok) {
          throw new Error(data.error || "Availability could not be loaded.");
        }

        if (isActive) {
          setDays(data.days);
        }
      } catch (error) {
        if (isActive) {
          setAvailabilityError(
            error instanceof Error
              ? error.message
              : "Availability could not be loaded.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingAvailability(false);
        }
      }
    }

    void loadAvailability();

    return () => {
      isActive = false;
    };
  }, [meeting.type, timeZone]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const selectedDay = useMemo(
    () => days.find((day) => day.date === selectedDate),
    [days, selectedDate],
  );

  const selectedSlotData = useMemo(() => {
    return selectedDay?.slots.find((slot) => slot.start === selectedSlot);
  }, [selectedDay, selectedSlot]);

  const progressWidth = `${((step + 1) / stepLabels.length) * 100}%`;
  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: "easeOut" };

  function goBack() {
    setSubmitError("");
    setStep((current) => Math.max(0, current - 1) as Step);
  }

  function continueFromDetails() {
    const parsed = bookingDetailsSchema.safeParse(details);

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setFieldErrors({});
    setDetails(parsed.data);
    setStep(3);
  }

  async function bookMeeting() {
    if (!selectedSlotData) {
      setSubmitError("Select an available time before booking.");
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          type: meeting.type,
          slot: selectedSlotData.start,
          timeZone,
          details,
        }),
      });
      const data = (await response.json()) as BookingResponse;

      if (!response.ok) {
        if (data.code === "SLOT_UNAVAILABLE") {
          setSelectedSlot("");
          setStep(1);
        }

        throw new Error(data.error || "The meeting could not be booked.");
      }

      if (data.receipt) {
        sessionStorage.setItem("booking_receipt", JSON.stringify(data.receipt));
      }

      router.push("/book/success");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "The meeting could not be booked.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-[min(100%-28px,960px)] py-7 sm:w-[min(100%-64px,960px)] sm:py-[34px]">
      <header className="mb-6">
        <a
          href="/"
          className="inline-flex text-sm font-bold text-slate-300 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-primaryHover"
        >
          ← Back
        </a>
        <div className="mt-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase text-primaryHover">
              Book a call
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              {meeting.title}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
              {meeting.description} {meeting.durationMinutes} minutes.
            </p>
          </div>
          <p className="text-sm font-semibold text-slate-400">{timeZone}</p>
        </div>
      </header>

      <section className="rounded-lg border border-border bg-surface shadow-premium">
        <div className="h-px bg-border">
          <motion.div
            className="h-px bg-primaryHover"
            initial={false}
            animate={{ width: progressWidth }}
            transition={transition}
          />
        </div>

        <div className="p-5 sm:p-6">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-2xl font-extrabold text-white outline-none"
          >
            {stepLabels[step]}
          </h2>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={transition}
              className="mt-5"
            >
              {step === 0 ? (
                <DateStep
                  days={days}
                  isLoading={isLoadingAvailability}
                  error={availabilityError}
                  selectedDate={selectedDate}
                  timeZone={timeZone}
                  timeZoneConfirmed={timeZoneConfirmed}
                  onConfirmTimeZone={() => setTimeZoneConfirmed(true)}
                  onTimeZoneChange={(nextTimeZone) => {
                    setTimeZone(nextTimeZone);
                    setTimeZoneConfirmed(true);
                    setSelectedDate("");
                    setSelectedSlot("");
                  }}
                  onSelect={(date) => {
                    if (!timeZoneConfirmed) {
                      return;
                    }

                    setSelectedDate(date);
                    setSelectedSlot("");
                    setStep(1);
                  }}
                />
              ) : null}

              {step === 1 ? (
                <TimeStep
                  day={selectedDay}
                  selectedSlot={selectedSlot}
                  timeZone={timeZone}
                  timeFormat={timeFormat}
                  onTimeFormatChange={setTimeFormat}
                  onSelect={(slot) => {
                    setSelectedSlot(slot);
                    setStep(2);
                  }}
                />
              ) : null}

              {step === 2 ? (
                <DetailsStep
                  details={details}
                  errors={fieldErrors}
                  onChange={(key, value) =>
                    setDetails((current) => ({ ...current, [key]: value }))
                  }
                />
              ) : null}

              {step === 3 ? (
                <ConfirmStep
                  meeting={meeting}
                  details={details}
                  slot={selectedSlotData}
                  timeZone={timeZone}
                  timeFormat={timeFormat}
                />
              ) : null}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={isSubmitting}
                    className="rounded-lg border border-border px-4 py-3 font-bold text-slate-300 outline-none transition hover:border-primaryHover hover:text-white focus-visible:ring-2 focus-visible:ring-primaryHover disabled:pointer-events-none disabled:opacity-40"
                  >
                    Back
                  </button>
                ) : null}

                {step < 2 ? null : step === 2 ? (
                  <button
                    type="button"
                    onClick={continueFromDetails}
                    disabled={isSubmitting}
                    className="rounded-lg bg-primary px-5 py-3 font-extrabold text-white outline-none transition hover:bg-primaryHover focus-visible:ring-2 focus-visible:ring-primaryHover disabled:pointer-events-none disabled:opacity-45"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void bookMeeting()}
                    disabled={isSubmitting}
                    className="rounded-lg bg-primary px-5 py-3 font-extrabold text-white outline-none transition hover:bg-primaryHover focus-visible:ring-2 focus-visible:ring-primaryHover disabled:pointer-events-none disabled:opacity-50"
                  >
                    {isSubmitting ? "Booking..." : "Book Meeting"}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {submitError ? (
            <p className="mt-5 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
              {submitError}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function DateStep({
  days,
  isLoading,
  error,
  selectedDate,
  timeZone,
  timeZoneConfirmed,
  onConfirmTimeZone,
  onTimeZoneChange,
  onSelect,
}: {
  days: AvailabilityDay[];
  isLoading: boolean;
  error: string;
  selectedDate: string;
  timeZone: string;
  timeZoneConfirmed: boolean;
  onConfirmTimeZone: () => void;
  onTimeZoneChange: (timeZone: string) => void;
  onSelect: (date: string) => void;
}) {
  return (
    <div>
      <TimeZonePicker
        value={timeZone}
        confirmed={timeZoneConfirmed}
        onConfirm={onConfirmTimeZone}
        onChange={onTimeZoneChange}
      />
      <p className="mb-4 text-sm font-semibold text-muted">
        {timeZoneConfirmed
          ? `Times are shown in ${timeZoneLabel(timeZone)}.`
          : "Confirm this is your time zone or choose another one."}
      </p>
      {isLoading ? (
        <p className="text-muted">Loading available days...</p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
          {error}
        </p>
      ) : null}
      {!isLoading && !error ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {days.map((day) => (
            <button
              key={day.date}
              type="button"
              disabled={day.disabled || !timeZoneConfirmed}
              onClick={() => onSelect(day.date)}
              aria-pressed={selectedDate === day.date}
              className="rounded-lg border border-border bg-background/35 px-4 py-4 text-left outline-none transition hover:border-primaryHover focus-visible:ring-2 focus-visible:ring-primaryHover disabled:pointer-events-none disabled:opacity-35 data-[selected=true]:border-primaryHover data-[selected=true]:bg-primary/15"
              data-selected={selectedDate === day.date}
            >
              <span className="block font-bold text-white">{day.label}</span>
              <span className="mt-1 block text-sm text-muted">
                {day.disabled ? "Unavailable" : `${day.slots.length} slots`}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TimeZonePicker({
  value,
  confirmed,
  onConfirm,
  onChange,
}: {
  value: string;
  confirmed: boolean;
  onConfirm: () => void;
  onChange: (timeZone: string) => void;
}) {
  const [query, setQuery] = useState(timeZoneLabel(value));
  const [open, setOpen] = useState(false);
  const options = useMemo(() => timeZoneOptions(), []);
  const matches = useMemo(() => {
    const normalized = query.toLowerCase().replace(/[()]/g, "");

    return options.filter((option) =>
      option.search.toLowerCase().replace(/[()]/g, "").includes(normalized),
    );
  }, [query, options]);

  useEffect(() => {
    setQuery(timeZoneLabel(value));
  }, [value]);

  return (
    <div className="mb-4 grid gap-2">
      <label className="text-sm font-bold text-slate-300" htmlFor="time-zone">
        Time zone
      </label>
      <div className="relative">
        <input
          id="time-zone"
          value={query}
          placeholder="Start typing..."
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          className="w-full rounded-lg border border-border bg-background/50 px-4 py-3 pr-11 font-semibold text-white outline-none transition placeholder:text-muted focus:border-primaryHover focus:ring-2 focus:ring-primaryHover/40"
        />
        <button
          type="button"
          aria-label="Show time zones"
          onClick={() => setOpen((current) => !current)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-slate-300 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-primaryHover"
        >
          ▾
        </button>
        {open ? (
          <div className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-lg border border-border bg-[#0f172a] p-1 shadow-premium">
            {matches.length > 0 ? (
              matches.map((option) => (
                <button
                  key={`${option.label}-${option.timeZone}`}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(option.timeZone);
                    setOpen(false);
                  }}
                  className="block w-full rounded-md px-3 py-2 text-left font-semibold text-slate-200 outline-none transition hover:bg-primary hover:text-white focus-visible:bg-primary focus-visible:text-white"
                >
                  {option.label}
                </button>
              ))
            ) : (
              <p className="px-3 py-3 text-sm font-semibold text-muted">
                No time zone found. Try a nearby major city, country, or
                abbreviation.
              </p>
            )}
          </div>
        ) : null}
      </div>
      {!confirmed ? (
        <button
          type="button"
          onClick={onConfirm}
          className="justify-self-start rounded-lg bg-primary px-4 py-2 text-sm font-extrabold text-white outline-none transition hover:bg-primaryHover focus-visible:ring-2 focus-visible:ring-primaryHover"
        >
          Confirm time zone
        </button>
      ) : null}
    </div>
  );
}

function TimeStep({
  day,
  selectedSlot,
  timeZone,
  timeFormat,
  onTimeFormatChange,
  onSelect,
}: {
  day: AvailabilityDay | undefined;
  selectedSlot: string;
  timeZone: string;
  timeFormat: TimeFormat;
  onTimeFormatChange: (format: TimeFormat) => void;
  onSelect: (slot: string) => void;
}) {
  if (!day) {
    return <p className="text-muted">Select a date first.</p>;
  }

  if (day.slots.length === 0) {
    return <p className="text-muted">No available times for this date.</p>;
  }

  return (
    <div>
      <TimeFormatToggle value={timeFormat} onChange={onTimeFormatChange} />
      <p className="mb-4 text-sm font-semibold text-muted">{day.label}</p>
      <p className="mb-4 text-sm font-semibold text-muted">
        Available times in {timeZoneLabel(timeZone)}.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {day.slots.map((slot) => (
          <button
            key={slot.start}
            type="button"
            onClick={() => onSelect(slot.start)}
            aria-pressed={selectedSlot === slot.start}
            className="rounded-lg border border-border bg-background/35 px-4 py-3 text-left font-bold text-white outline-none transition hover:border-primaryHover focus-visible:ring-2 focus-visible:ring-primaryHover data-[selected=true]:border-primaryHover data-[selected=true]:bg-primary/15"
            data-selected={selectedSlot === slot.start}
          >
            {formatTime(slot.start, timeZone, timeFormat)}
          </button>
        ))}
      </div>
    </div>
  );
}

function TimeFormatToggle({
  value,
  onChange,
}: {
  value: TimeFormat;
  onChange: (format: TimeFormat) => void;
}) {
  return (
    <fieldset className="mb-5">
      <legend className="mb-2 text-sm font-bold text-slate-300">
        Time format
      </legend>
      <div className="inline-flex border rounded-lg border-border bg-background/60 p-1 shadow-[0_1px_0_rgba(255,255,255,.04)_inset]">
        {(["12h", "24h"] as const).map((format) => (
          <button
            key={format}
            type="button"
            onClick={() => onChange(format)}
            aria-pressed={value === format}
            className="rounded-lg px-5 py-2 text-sm font-extrabold uppercase text-slate-400 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-primaryHover data-[selected=true]:bg-white data-[selected=true]:text-slate-950 data-[selected=true]:shadow"
            data-selected={value === format}
          >
            {format}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function DetailsStep({
  details,
  errors,
  onChange,
}: {
  details: BookingDetails;
  errors: Record<string, string[] | undefined>;
  onChange: (key: keyof BookingDetails, value: string) => void;
}) {
  return (
    <div className="grid gap-4">
      <Field
        label="Name"
        value={details.name || ""}
        error={fieldError(errors, "name")}
        required
        onChange={(value) => onChange("name", value)}
      />
      <Field
        label="Email"
        type="email"
        value={details.email || ""}
        error={fieldError(errors, "email")}
        required
        onChange={(value) => onChange("email", value)}
      />
      <Field
        label="Company"
        value={details.company || ""}
        error={fieldError(errors, "company")}
        onChange={(value) => onChange("company", value)}
      />
      <Field
        label="LinkedIn"
        type="url"
        value={details.linkedin || ""}
        error={fieldError(errors, "linkedin")}
        onChange={(value) => onChange("linkedin", value)}
      />
      <label className="grid gap-2">
        <span className="text-sm font-bold text-slate-300">Message</span>
        <textarea
          value={details.message || ""}
          onChange={(event) => onChange("message", event.target.value)}
          rows={4}
          className="resize-y rounded-lg border border-border bg-background/50 px-4 py-3 text-white outline-none transition placeholder:text-muted focus:border-primaryHover focus:ring-2 focus:ring-primaryHover/40"
        />
        {fieldError(errors, "message") ? (
          <span className="text-sm font-semibold text-red-200">
            {fieldError(errors, "message")}
          </span>
        ) : null}
      </label>
    </div>
  );
}

function Field({
  label,
  value,
  type = "text",
  required = false,
  error,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  required?: boolean;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-slate-300">
        {label}
        {required ? <span className="text-primaryHover"> *</span> : null}
      </span>
      <input
        value={value}
        type={type}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-border bg-background/50 px-4 py-3 text-white outline-none transition placeholder:text-muted focus:border-primaryHover focus:ring-2 focus:ring-primaryHover/40"
      />
      {error ? (
        <span className="text-sm font-semibold text-red-200">{error}</span>
      ) : null}
    </label>
  );
}

function ConfirmStep({
  meeting,
  details,
  slot,
  timeZone,
  timeFormat,
}: {
  meeting: MeetingDefinition;
  details: BookingDetails;
  slot: AvailabilitySlot | undefined;
  timeZone: string;
  timeFormat: TimeFormat;
}) {
  const rows = [
    ["Meeting Type", meeting.title],
    ["Duration", `${meeting.durationMinutes} min`],
    ["Date", slot ? formatDate(slot.start, timeZone) : "Not selected"],
    [
      "Time",
      slot ? formatTime(slot.start, timeZone, timeFormat) : "Not selected",
    ],
    ["Time zone", timeZoneLabel(timeZone)],
    ["Name", details.name],
    ["Email", details.email],
    ["Company", details.company || "—"],
    ["LinkedIn", details.linkedin || "—"],
    ["Message", details.message || "—"],
  ];

  return (
    <dl className="grid gap-3">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid gap-1 rounded-lg border border-border bg-background/35 px-4 py-3 sm:grid-cols-[160px_1fr] sm:gap-4"
        >
          <dt className="text-sm font-bold text-slate-400">{label}</dt>
          <dd className="break-words text-sm font-semibold text-white">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
