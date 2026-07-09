import type { NextConfig } from "next";

// `next build` always runs with NODE_ENV=production. Without this variable,
// RequestTrainingForm silently shows every visitor a generic error instead
// of ever attempting to submit — catch the misconfiguration here, loudly,
// at build/deploy time, rather than discovering it via a broken form later.
if (
  process.env.NODE_ENV === "production" &&
  !process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT
) {
  throw new Error(
    "NEXT_PUBLIC_FORMSPREE_ENDPOINT is not set. Set it before building for production.",
  );
}

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
