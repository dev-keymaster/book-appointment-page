function LinkedInIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-current opacity-80"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" />
      <path d="M2 9h4v12H2z" />
      <path d="M4 6.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-current opacity-80"
    >
      <path d="m21.9 4.6-3.2 15.1c-.2 1-.8 1.2-1.6.8l-4.8-3.6-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.7 13.4 2 11.9c-1-.3-1-1 .2-1.5L20.5 3.3c.9-.3 1.7.2 1.4 1.3Z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-current opacity-80"
    >
      <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 3.4V17h16V8.4l-7.4 5.1a1 1 0 0 1-1.2 0L4 8.4Zm1.8-1.4 6.2 4.3L18.2 7H5.8Z" />
    </svg>
  );
}

const links = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/iharkliuchnik/",
    icon: <LinkedInIcon />,
  },
  {
    label: "Telegram",
    href: "https://t.me/Igor_Kliuchnik",
    icon: <TelegramIcon />,
  },
  {
    label: "Email",
    href: "mailto:igor.kliuchnik.job@gmail.com",
    icon: <EmailIcon />,
  },
];

export function ContactLinks() {
  return (
    <nav className="flex flex-wrap gap-5" aria-label="Contact links">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target={link.href.startsWith("mailto:") ? undefined : "_blank"}
          rel={
            link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"
          }
          className="inline-flex items-center gap-2 border-b border-slate-400/30 py-2 font-bold text-slate-300 outline-none transition hover:border-primaryHover hover:text-white focus-visible:border-primaryHover focus-visible:text-white"
        >
          {link.icon}
          <span>{link.label}</span>
        </a>
      ))}
    </nav>
  );
}
