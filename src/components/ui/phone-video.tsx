"use client";

import { useEffect, useRef } from "react";
import { Phone } from "./phone";
import { cn } from "@/lib/utils/cn";

/**
 * Un téléphone qui joue une capture de l’invitation, en boucle et
 * sans son. La lecture ne démarre qu’une fois le cadre visible :
 * inutile de décoder une vidéo qu’on ne regarde pas.
 */
export function PhoneVideo({
  src,
  poster,
  className,
  tone = "ink",
}: {
  src: string;
  poster?: string;
  className?: string;
  tone?: "ivory" | "ink";
}) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;
    if (!element) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) element.play().catch(() => {});
        else element.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Phone className={cn(className)} tone={tone}>
      <video
        ref={video}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="Aperçu animé d’une invitation Zevent"
        className="size-full object-cover"
      />
    </Phone>
  );
}
