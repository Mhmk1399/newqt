"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

// Video data
const videos = [
  {
    id: 1,
    title: "Mountain Adventure",
    duration: "2:45",
    url: "/assets/video/video1.mp4",
  },
  {
    id: 2,
    title: "Ocean Depths",
    duration: "4:20",
    url: "/assets/video/video1.mp4",
  },
  {
    id: 3,
    title: "Desert Mirage",
    duration: "3:15",
    url: "/assets/video/video1.mp4",
  },
  {
    id: 4,
    title: "Forest Exploration",
    duration: "5:10",
    url: "/assets/video/video1.mp4",
  },
  {
    id: 5,
    title: "City Lights",
    duration: "3:45",
    url: "/assets/video/video1.mp4",
  },
];

const CinematicProjection = () => {
  // States
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [flicker, setFlicker] = useState(1);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Refs
  const playBoxRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get current video
  const currentVideo = videos[activeVideoIndex];

  // Flicker effect for lights
  useEffect(() => {
    const flickerInterval = setInterval(() => {
      setFlicker(0.8 + Math.random() * 0.4);
    }, 300 + Math.random() * 400);

    return () => clearInterval(flickerInterval);
  }, []);

  // Handle video loading
  const handleVideoLoad = useCallback(() => {
    setIsVideoLoaded(true);
  }, []);

  // Handle video play/pause
  const handleVideoPlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handleVideoPause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Change video function
  const changeVideo = useCallback(
    (newIndex: number) => {
      if (
        newIndex >= 0 &&
        newIndex < videos.length &&
        newIndex !== activeVideoIndex
      ) {
        setIsVideoLoaded(false);
        setActiveVideoIndex(newIndex);
      }
    },
    [activeVideoIndex]
  );

  // Handle scroll-based video switching
  useEffect(() => {
    const handleScroll = () => {
      if (!sceneRef.current) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const scrollProgress = scrollY / (windowHeight * 0.3);

      const newVideoIndex = Math.min(
        Math.max(0, Math.floor(scrollProgress)),
        videos.length - 1
      );

      changeVideo(newVideoIndex);
    };

    const throttledScroll = throttle(handleScroll, 100);
    window.addEventListener("scroll", throttledScroll, { passive: true });

    return () => window.removeEventListener("scroll", throttledScroll);
  }, [changeVideo]);

  // Auto-play video when activeVideo changes
  useEffect(() => {
    if (videoRef.current && isVideoLoaded) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);
    }
  }, [activeVideoIndex, isVideoLoaded]);

  // Handle dot click
  const handleDotClick = useCallback(
    (index: number) => {
      changeVideo(index);
    },
    [changeVideo]
  );

  return (
    <div className="relative   " ref={sceneRef}>
      <div className="absolute top-0 left-0 z-[-1] w-full h-screen  ">
        <video
          ref={videoRef}
          src="/assets/video/video4.mp4"
          onLoadedData={handleVideoLoad}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          className="w-full h-full object-cover "
          autoPlay
          loop
          muted
        />
      </div>
      <div className="absolute top-0 bg-black left-0 z-[-1] w-full h-screen  opacity-80 "></div>
      {/* Fresnel Light 1 */}
      <FresnelLight
        position="top-150 left-1/8"
        rotation={100}
        flicker={flicker}
        className="sm:block hidden"
      />

      {/* Fresnel Light 2 */}
      <FresnelLight
        position="top-150 right-1/8"
        rotation={-100}
        flicker={flicker}
        className="transform scale-x-[-1]"
      />

      {/* Enhanced Play Box with Glass Effect */}
      <motion.div
        ref={playBoxRef}
        className="absolute  left-1/2 transform -translate-x-1/2 w-[400px] 
            
             
              
             rotate-x-[15deg] rotate-y-[-5deg] perspective-1000"
        style={{
          transformStyle: "preserve-3d",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Content Container */}
        <div className="relative h-screen p-6 flex flex-col min-h-0">
          {/* Header */}
          <motion.div
            className="mb-4 flex-shrink-0"
            key={`header-${activeVideoIndex}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2
              className="text-2xl font-bold text-black mb-2 text-center"
              dir="rtl"
            >
              نمونه هایی از هنر ما
            </h2>
            <div className="flex items-center  justify-center gap-2 text-blue-200">
              <span className="text-sm font-medium  text-black">
                {currentVideo.title}
              </span>
              <span className="text-xs opacity-70  text-black">•</span>
              <span className="text-xs opacity-70  text-black">
                {currentVideo.duration}
              </span>
            </div>
          </motion.div>

          {/* Video Container - Takes all available space */}
          <motion.div
            className="flex-1 relative rounded-xl overflow-hidden  border border-blue-300/30 min-h-0"
            key={`video-${activeVideoIndex}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Loading indicator */}
            {!isVideoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Video Element */}
            <video
              ref={videoRef}
              src={currentVideo.url}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                width: "100%",
                height: "100%",
                minHeight: "100%",
                maxHeight: "100%",
                objectFit: "cover",
              }}
              muted
              loop
              playsInline
              onLoadedData={handleVideoLoad}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onError={() => setIsVideoLoaded(false)}
            />

            {/* Video overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

            {/* Play indicator */}
            {isPlaying && (
              <motion.div
                className="absolute top-4 left-4 flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white text-xs">LIVE</span>
              </motion.div>
            )}
          </motion.div>

          {/* Video Navigation Dots */}
          <div className="flex justify-center items-center mt-4 gap-2 flex-shrink-0">
            {videos.map((_, index) => (
              <motion.button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 focus:outline-none ${
                  index === activeVideoIndex
                    ? "bg-blue-400 w-6"
                    : "bg-white/40 hover:bg-white/60"
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDotClick(index)}
                aria-label={`Play video ${index + 1}`}
              />
            ))}
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-4 right-4 text-white/60 text-xs flex items-center gap-1 pointer-events-none"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span>Scroll to explore</span>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const FresnelLight = ({
  position,
  rotation,
  flicker,
  className,
}: {
  position: string;
  rotation: number;
  flicker: number;
  className: string;
}) => {
  return (
    <motion.div
      className={`absolute ${position} flex flex-col items-center z-0`}
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "bottom center",
      }}
      animate={{
        y: [0, -3, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
      }}
    >
      {/* Light body */}
      <Image
        src={"/assets/images/projecteur.svg"}
        alt="light"
        width={300}
        height={300}
        className={`${className}`}
      />

      {/* Light beam */}
      <motion.div
        className="absolute bottom-full mt-10 w-[80vw] h-[60vh] 
                   pointer-events-none origin-top"
        style={{
          transform: `rotate(${-rotation}deg)`,
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        }}
        animate={{
          opacity: [0.2 * flicker, 0.4 * flicker, 0.2 * flicker],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(253, 173, 25, 0.2),transparent_70%)]" />
      </motion.div>
    </motion.div>
  );
};

// Utility function for throttling scroll events with proper TypeScript types
function throttle<T extends unknown[]>(
  func: (...args: T) => void,
  delay: number
): (...args: T) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return (...args: T): void => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

export default CinematicProjection;
