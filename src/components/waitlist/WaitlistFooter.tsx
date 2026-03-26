"use client";

import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
} from "react-icons/fa6";

const socialLinks = [
  {
    href: "https://instagram.com/hustlafrica",
    label: "Instagram",
    icon: FaInstagram,
  },
  {
    href: "https://x.com/hustlafrica",
    label: "X",
    icon: FaXTwitter,
  },
  {
    href: "https://facebook.com/hustlafrica",
    label: "Facebook",
    icon: FaFacebookF,
  },
  {
    href: "mailto:hello@hustla.live",
    label: "Email",
    icon: FaEnvelope,
  },
];

export function WaitlistFooter() {
  return (
    <footer className="w-full">
      <div className="mx-auto flex w-full flex-col gap-4 rounded-[24px] border border-black/8 bg-white/92 px-4 py-4 text-center shadow-[0_16px_40px_rgba(0,0,0,0.08)] backdrop-blur-sm">
        <div className="flex items-center justify-center gap-3">
          {socialLinks.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
              aria-label={label}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-[#111111] transition duration-200 hover:-translate-y-0.5 hover:border-black/20 hover:text-black"
            >
              <Icon className="text-[17px]" />
            </a>
          ))}
        </div>
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#111111] px-4 py-2 text-white shadow-[0_10px_24px_rgba(17,17,17,0.16)]">
            <span className="h-2 w-2 rounded-full bg-white" />
            <span className="[font-family:var(--font-display)] text-sm font-extrabold tracking-[-0.02em]">
              Built by Africans, for Africa.
            </span>
          </div>
        </div>
        <p className="[font-family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6A6A6A]">
          {"\u00A9 2026 hustla"}
        </p>
      </div>
    </footer>
  );
}
