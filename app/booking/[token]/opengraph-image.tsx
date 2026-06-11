import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getBookingByToken } from "@/lib/bookings";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

type OpenGraphImageProps = {
  params: Promise<{
    token: string;
  }>;
};

function formatDateTime(start: string, end: string, timeZone: string) {
  const date = new Intl.DateTimeFormat("en", {
    timeZone,
    weekday: "short",
    month: "short",
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

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { token } = await params;
  const booking = await getBookingByToken(token);

  if (!booking) {
    notFound();
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0F172A",
          color: "#FFFFFF",
          padding: 64,
          fontFamily: "Inter, Arial, sans-serif"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 85% 15%, rgba(37,99,235,0.36), transparent 34%), linear-gradient(135deg, rgba(59,130,246,0.12), transparent 42%)"
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
            backgroundSize: "44px 44px"
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "#60A5FA",
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: 0
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#3B82F6",
                boxShadow: "0 0 34px rgba(59,130,246,0.9)"
              }}
            />
            Booking confirmed
          </div>

          <div
            style={{
              marginTop: 34,
              maxWidth: 930,
              fontSize: 74,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: 0
            }}
          >
            {booking.meetingTitle} with Igor Kliuchnik
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            gap: 32,
            alignItems: "flex-end"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ color: "#94A3B8", fontSize: 28, fontWeight: 700 }}>Time</div>
            <div style={{ color: "#FFFFFF", fontSize: 40, fontWeight: 850 }}>
              {formatDateTime(booking.startAt, booking.endAt, booking.timeZone)}
            </div>
            <div style={{ color: "#C7D2FE", fontSize: 28, fontWeight: 700 }}>{booking.timeZone}</div>
          </div>

          <div
            style={{
              display: "flex",
              border: "1px solid #1E293B",
              background: "rgba(17,24,39,0.86)",
              borderRadius: 14,
              padding: "20px 24px",
              color: "#DDE7FF",
              fontSize: 28,
              fontWeight: 800
            }}
          >
            Open details
          </div>
        </div>
      </div>
    ),
    size
  );
}
