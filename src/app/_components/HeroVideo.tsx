"use client";

import { useEffect, useRef } from "react";

// Replaces the animated flying.webp hero background. `muted` is set both as
// a JSX attribute (so it's present in the server-rendered HTML the browser
// parses first, which is what autoplay's mute check actually relies on) and
// imperatively on mount (belt-and-suspenders against browsers/hydration
// paths that don't otherwise honor it) — both are needed for autoplay to be
// reliably permitted. `poster` is a single extracted frame (flying-poster.jpg,
// ~65KB), not the old animated flying.webp (~10MB) — it needs to be small
// enough to paint before the video itself has buffered.
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {
      // Autoplay can still be blocked by the browser (e.g. a restrictive
      // power-saving mode) — fail silently rather than surface an error
      // for a purely decorative background.
    });
  }, []);

  return (
    <video
      ref={videoRef}
      aria-hidden="true"
      autoPlay
      loop
      muted
      playsInline
      disablePictureInPicture
      disableRemotePlayback
      preload="auto"
      poster="/images/flying-poster.jpg"
      className="absolute inset-0 h-full w-full object-cover"
    >
      <source src="/images/flying.mp4" type="video/mp4" />
    </video>
  );
}
