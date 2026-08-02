import type { MetadataRoute } from "next";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: "EdgePilot",
    description: `${APP_TAGLINE}. ${APP_DESCRIPTION}`,
    start_url: "/",
    display: "standalone",
    background_color: "#0b1210",
    theme_color: "#0d7a5f",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
