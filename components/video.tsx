"use client";
import { useRef, useEffect, useState } from "react";

interface VideoPlayerProps {
  src: string;
  isModal?: boolean;
  autoPlay?: boolean;
  className?: string;
  poster?: string;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: () => void;
}

export default function VideoPlayer({
  src,
  isModal = false,
  autoPlay = false,
  className = "",
  poster,
  onLoadStart,
  onLoadEnd,
  onError,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      onLoadStart?.();
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      onLoadEnd?.();
    };

    const handleError = () => {
      setIsLoading(false);
      onError?.();
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    if (isModal) {
      video.style.opacity = "0";
      video.style.transition = "opacity 0.5s ease";
      setTimeout(() => {
        video.style.opacity = "1";
      }, 10);

      if (autoPlay) {
        video.play().catch(() => {});
      }
      return;
    }

    video.style.transform = "scale(0.95)";
    video.style.opacity = "0.7";
    video.style.transition = "transform 0.4s ease, opacity 0.4s ease";

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          video.style.transform = "scale(1)";
          video.style.opacity = "1";
          video.play().catch(() => {});
        } else {
          video.style.transform = "scale(0.95)";
          video.style.opacity = "0.7";
          video.pause();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [isModal, autoPlay, onLoadStart, onLoadEnd, onError]);

  return (
    <div
      className={`relative w-full ${
        isModal ? "h-full" : "aspect-video"
      } ${className}`}
    >
      <video
        ref={videoRef}
        className={`w-full h-full  object-cover transition-all duration-300 ${
          isModal ? "border border-white/40" : "rounded-xl shadow-2xl"
        }`}
        muted={!isModal}
        loop={!isModal}
        playsInline
        controls={isModal}
        preload="auto"
        poster={poster}
      >
        <source src={src} type="video/mp4" />
        <p className="text-gray-400">
          مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
        </p>
      </video>

      {!isModal && !isLoading && (
        <div className="absolute bottom-4 right-4">
          <div
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              isPlaying ? "bg-green-500" : "bg-gray-500"
            }`}
          ></div>
        </div>
      )}
    </div>
  );
}
