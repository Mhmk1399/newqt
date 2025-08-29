"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function HeroImage({ src, alt }: { src: string; alt: string }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        if (overlayRef.current) {
          overlayRef.current.style.setProperty("--x", `${e.clientX}px`);
          overlayRef.current.style.setProperty("--y", `${e.clientY}px`);
        }
      });
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="absolute inset-0">
      {/* grayscale base */}
      <Image src={src} alt={alt} fill className="object-cover grayscale" />

      {/* colored overlay with spotlight mask */}
      <div
        ref={overlayRef}
        className="absolute inset-0"
        style={{
          WebkitMaskImage: `radial-gradient(circle 180px at var(--x, -200px) var(--y, -200px), rgba(0,0,0,0.9) 70%, rgba(0,0,0,0) 100%)`,
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskComposite: "destination-in",
          maskImage: `radial-gradient(circle 180px at var(--x, -200px) var(--y, -200px), rgba(0,0,0,0.9) 70%, rgba(0,0,0,0) 100%)`,
          maskRepeat: "no-repeat",
        }}
      >
        <Image src={src} alt={alt} fill className="object-cover" />
      </div>
    </div>
  );
}
