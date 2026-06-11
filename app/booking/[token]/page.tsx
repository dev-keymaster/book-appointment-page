import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingShareActions } from "@/components/booking-share-actions";
import { CopyMeetLinkButton } from "@/components/copy-meet-link-button";
import { getBookingByToken } from "@/lib/bookings";

type BookingPageProps = {
  params: Promise<{
    token: string;
  }>;
};

function formatDateTime(start: string, end: string, timeZone: string) {
  const date = new Intl.DateTimeFormat("en", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(new Date(start));
  const startTime = new Intl.DateTimeFormat("en", {
    timeZone,
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(start));
  const endTime = new Intl.DateTimeFormat("en", {
    timeZone,
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(end));

  return `${date}, ${startTime}-${endTime}`;
}

export async function generateMetadata({ params }: BookingPageProps): Promise<Metadata> {
  const { token } = await params;
  const booking = await getBookingByToken(token);

  if (!booking) {
    return {
      title: "Booking details"
    };
  }

  const title = `${booking.meetingTitle} with Igor Kliuchnik`;
  const description = `${formatDateTime(booking.startAt, booking.endAt, booking.timeZone)} • ${booking.timeZone}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: `/booking/${booking.token}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/booking/${booking.token}/opengraph-image`]
    }
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { token } = await params;
  const booking = await getBookingByToken(token);

  if (!booking) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-[min(100%-28px,860px)] items-center py-10 sm:w-[min(100%-64px,860px)]">
      <section className="w-full rounded-lg border border-border bg-surface p-6 shadow-premium sm:p-8">
        <p className="text-xs font-bold uppercase text-primaryHover">Booking details</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
          {booking.meetingTitle} with Igor Kliuchnik
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Shared meeting details for the scheduled call.
        </p>

        <dl className="mt-8 grid gap-3">
          <div className="rounded-lg border border-border bg-background/35 px-4 py-3">
            <dt className="text-sm font-bold text-slate-400">Time</dt>
            <dd className="mt-1 font-semibold text-white">
              {formatDateTime(booking.startAt, booking.endAt, booking.timeZone)}
            </dd>
          </div>
          <div className="rounded-lg border border-border bg-background/35 px-4 py-3">
            <dt className="text-sm font-bold text-slate-400">Time zone</dt>
            <dd className="mt-1 font-semibold text-white">{booking.timeZone}</dd>
          </div>
          {booking.meetLink ? (
            <div className="rounded-lg border border-border bg-background/35 px-4 py-3">
              <dt className="text-sm font-bold text-slate-400">Google Meet</dt>
              <dd className="mt-2 flex items-center gap-3">
                <span className="min-w-0 flex-1 break-words font-semibold text-blue-200">{booking.meetLink}</span>
                <CopyMeetLinkButton value={booking.meetLink} />
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-8">
          <BookingShareActions booking={booking} />
        </div>

        <div className="mt-8 border-t border-border pt-5">
          <Link
            href="/"
            className="text-sm font-bold text-slate-400 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-primaryHover"
          >
            Book another call
          </Link>
        </div>
      </section>
    </main>
  );
}
