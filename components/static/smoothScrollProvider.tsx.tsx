"use client";
import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrollProvider() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2, // زمان نرم بودن اسکرول
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // انیمیشن نرم
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true, // اسکرول چرخ ماوس نرم
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  return null;
}
