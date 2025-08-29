"use client";

import { useState, useEffect, useRef } from "react";
import { RiPlayFill, RiPhoneFill } from "react-icons/ri";
import { slides } from "../../data/heroSection";
 import Image from "next/image";
import gsap from "gsap";
import SmartVideo from "../video";
import Link from "next/link";

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [isHovering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (titleRef.current && isMounted) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: -50, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 2, ease: "elastic.out(1, 0.5)" }
      );

      gsap.to(titleRef.current, {
        duration: 2,
        yoyo: true,
        ease: "power2.inOut",
      });
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const interval = setInterval(() => {
      if (!isHovering) setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isHovering, isMounted]);

  useEffect(() => {
    if (progressRef.current) {
      gsap.fromTo(
        progressRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 6, ease: "linear" }
      );
    }
  }, [current]);

  if (!isMounted) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center py-12 px-4 bg-[#030014]"
        dir="rtl"
      >
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <div
            className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-blue-500 rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          ></div>
        </div>
        <div className="text-center">
          <h3 className="text-white text-xl font-bold mb-2">کیوتی استودیو</h3>
          <p className="text-gray-400 animate-pulse">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center py-4   px-4 relative overflow-hidden bg-[#030014]"
      dir="rtl"
    >
      {/* Qt Logo Overlay */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2  z-20 w-32 h-32 md:w-40 md:h-40  hover:opacity-100 transition-opacity duration-300">
        <Image
          src="/assets/qtlogo.png"
          alt="Qt Studio Logo"
          fill
          className="object-contain drop-shadow-2xl"
          priority
        />
      </div>

      {/* Content */}
      <div className="max-w-7xl w-full relative z-10 mt-15 md:mt-20">
        {/* Premium Desktop Grid */}
        <div className="hidden md:grid grid-cols-3 gap-8 mb-16">
          {slides[current]?.videos?.map((video, index) => (
            <div
              key={index}
              className="relative w-full h-[580px] group cursor-pointer"
            >
              {/* Luxury Frame */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl p-1">
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/50 backdrop-blur-sm">
                  <SmartVideo
                    src={video}
                    poster={"/assets/images/cam3.jpg"}
                    className="w-full h-full object-cover"
                  />

                  {/* Corner Accent */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-purple-400/50 rounded-tl-2xl"></div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-blue-400/50 rounded-br-2xl"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Mobile Videos */}
        <div className="md:hidden mb-16 flex gap-4 overflow-x-auto px-4 pb-4">
          {slides[current]?.videos?.map((video, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 w-[300px] h-[500px] group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl p-1">
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/30 backdrop-blur-sm">
                  <SmartVideo
                    src={video}
                    poster={
                      slides[current]?.posters || "/assets/images/cam3.jpg"
                    }
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500/40 to-blue-500/40 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <RiPlayFill size={18} className="text-white ml-0.5" />
                  </div>

                  <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-purple-400/50 rounded-tl-2xl"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-blue-400/50 rounded-br-2xl"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center px-8">
          {/* Luxury Title Section */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-4 mb-6"></div>

            <h2 className="text-white text-2xl lg:text-4xl font-bold mb-3 tracking-tight leading-tight">
              {slides[current]?.title || "Default Title"}
            </h2>

            <div className="flex justify-center">
              <div className="w-24 h-1 bg-gradient-to-r from-purple-400 via-blue-500 to-purple-400 rounded-full"></div>
            </div>
          </div>

          <p className="text-gray-300 text-lg max-w-4xl mx-auto mb-8 font-light leading-relaxed">
            {slides[current]?.subtitle || "Default subtitle"}
          </p>

          {/* Premium CTA Button */}
          <div className="mb-16">
            <button className="group relative px-12 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-lg rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
              <Link
                href="/contact"
                className="relative flex items-center gap-3"
              >
                <RiPhoneFill className="text-xl" />
                <span>تماس با ما</span>
              </Link>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
