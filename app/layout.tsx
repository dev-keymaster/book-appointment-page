import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Igor Kliuchnik - Senior Frontend Engineer",
  description:
    "Book a call with Igor Kliuchnik, Senior Frontend Engineer specializing in React, Next.js, Vue, Nuxt, and TypeScript."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
