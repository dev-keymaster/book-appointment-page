import { BookingCard } from "@/components/booking-card";
import { ContactLinks } from "@/components/contact-links";
import { meetings } from "@/lib/meetings";

export default function HomePage() {
  return (
    <>
      <main className="mx-auto w-[min(100%-28px,1120px)] sm:w-[min(100%-64px,1120px)]">
        <section className="grid min-h-0 place-items-start py-7 sm:py-[34px]">
          <div className="max-w-[900px]">
            <h1 className="mb-2.5 font-display text-[clamp(3.05rem,6.8vw,5.35rem)] font-extrabold leading-[0.98] tracking-normal text-white">
              Igor Kliuchnik
            </h1>
            <p className="mb-2.5 text-[clamp(1.2rem,2.7vw,1.85rem)] font-bold text-slate-300">
              Senior Frontend Engineer
            </p>
            <p className="mb-[18px] text-[clamp(.98rem,1.8vw,1.16rem)] font-semibold text-white">
              React • Next.js • Vue • Nuxt • TypeScript
            </p>
            <p className="max-w-[650px] text-[clamp(1rem,1.8vw,1.18rem)] leading-relaxed text-muted">
              6+ years building enterprise platforms, fintech products and modern web applications.
            </p>
          </div>
        </section>

        <section className="py-[22px]" aria-labelledby="booking-title">
          <div className="mb-3.5 max-w-[620px]">
            <p className="text-xs font-bold uppercase tracking-normal text-primaryHover">Book a call</p>
            <h2
              id="booking-title"
              className="mt-2 font-display text-[clamp(1.65rem,3.5vw,2.28rem)] font-extrabold leading-tight text-white"
            >
              Choose the right conversation.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <BookingCard meeting={meetings.intro} />
            <BookingCard meeting={meetings.recruiter} recommended />
            <BookingCard meeting={meetings.technical} />
          </div>
        </section>

        <section className="py-[22px]" aria-labelledby="contact-title">
          <div className="mb-3.5 max-w-[620px]">
            <p className="text-xs font-bold uppercase tracking-normal text-primaryHover">Contacts</p>
            <h2
              id="contact-title"
              className="mt-2 font-display text-[clamp(1.45rem,3vw,2rem)] font-extrabold leading-tight text-white"
            >
              Direct channels.
            </h2>
          </div>
          <ContactLinks />
        </section>
      </main>

      <footer className="mx-auto flex w-[min(100%-28px,1120px)] flex-col justify-between gap-4 border-t border-border py-7 text-sm text-muted sm:w-[min(100%-64px,1120px)] md:flex-row">
        <p>© Igor Kliuchnik</p>
        <p>Built for recruiters, engineering managers and hiring teams.</p>
      </footer>
    </>
  );
}
