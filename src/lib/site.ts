export const siteConfig = {
  name: "Hustla",
  title: "Hustla | Find Skilled Workers Near You",
  description:
    "Connect skilled workers with customers who need them. Location-based marketplace coming soon to Africa.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    "https://hustla.live",
  ogImage: "/title-logo.png",
} as const;
