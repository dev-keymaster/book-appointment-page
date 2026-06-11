import Link from "next/link";
import type { MeetingDefinition } from "@/lib/meetings";

export function BookingCard({
  meeting,
  recommended = false
}: {
  meeting: MeetingDefinition;
  recommended?: boolean;
}) {
  return (
    <Link
      href={`/book?type=${meeting.type}`}
      aria-label={`Schedule ${meeting.title}, ${meeting.durationMinutes} minutes`}
      className="group relative flex min-h-[206px] cursor-pointer flex-col overflow-hidden rounded-lg border border-border bg-surface p-5 outline-none transition duration-200 [background-image:linear-gradient(180deg,rgba(255,255,255,.045),transparent_34%)] hover:-translate-y-1 hover:border-primaryHover/70 hover:bg-[#151f32] hover:shadow-premium focus-visible:-translate-y-1 focus-visible:border-primaryHover/70 focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,.34),0_24px_70px_rgba(2,6,23,.36)]"
    >
      <span className="pointer-events-none absolute inset-x-5 -bottom-16 h-28 rounded-full bg-primary/20 opacity-0 blur-[46px] transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" />
      <span className="flex min-h-8 items-start justify-between gap-3">
        <span className="font-display text-[1.18rem] font-extrabold leading-tight text-white">
          {meeting.title}
        </span>
        {recommended ? (
          <span className="shrink-0 rounded-full border border-primaryHover/40 bg-primary/15 px-2.5 py-1 text-xs font-bold text-blue-200">
            Recommended
          </span>
        ) : null}
      </span>
      <span className="mt-[18px] block text-sm font-bold text-slate-300">
        {meeting.durationMinutes} min
      </span>
      <span className="mt-3 block max-w-md text-[0.98rem] leading-relaxed text-muted">
        {meeting.description}
      </span>
      <span className="relative z-10 mt-auto block pt-5 font-extrabold text-blue-200">
        Schedule Call →
      </span>
    </Link>
  );
}
