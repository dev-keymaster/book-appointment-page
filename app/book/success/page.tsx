import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BookingSuccessDetails } from "@/components/booking-success-details";

export default async function BookingSuccessPage() {
  const cookieStore = await cookies();

  if (cookieStore.get("booking_success")?.value !== "1") {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-screen w-[min(100%-28px,760px)] items-center py-10 sm:w-[min(100%-64px,760px)]">
      <section className="w-full rounded-lg border border-border bg-surface p-6 shadow-premium sm:p-8">
        <p className="text-xs font-bold uppercase text-primaryHover">Booking confirmed</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
          Meeting scheduled successfully.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          A Google Calendar event was created.
        </p>
        <BookingSuccessDetails />
      </section>
    </main>
  );
}
