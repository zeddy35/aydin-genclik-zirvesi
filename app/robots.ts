import type { MetadataRoute } from "next";

const BASE_URL = "https://aydin-genclik-zirvesi.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/lore", "/auth/login", "/auth/register"],
        disallow: ["/admin/", "/panel/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
