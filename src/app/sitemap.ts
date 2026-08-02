import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/features",
    "/pricing",
    "/methodology",
    "/responsible-use",
    "/faq",
    "/contact",
    "/affiliate-disclosure",
    "/terms",
    "/privacy",
    "/signup",
    "/login",
  ];

  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/pricing" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/pricing" || path === "/signup" ? 0.9 : 0.6,
  }));
}
