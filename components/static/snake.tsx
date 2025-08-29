"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

const SnakeLine = () => {
  // All hooks must be called unconditionally at the top level
  const { scrollYProgress } = useScroll();
  const pathRef = useRef<SVGPathElement>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [headPosition, setHeadPosition] = useState({ x: 0, y: 0 });
  const [snakePath, setSnakePath] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
      console.log(windowSize);


  // Create smooth scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 90,
    mass: 0.4,
  });

  // Create transforms for path length
  const pathLength = useTransform(smoothProgress, [0, 1], [0.02, 0.98]);

  // Create transforms for progress indicator
  const progressOpacity = useTransform(
    smoothProgress,
    [0, 0.02, 0.98, 1],
    [0, 1, 1, 0]
  );

  const progressY = useTransform(
    smoothProgress,
    [0, 0.1, 0.9, 1],
    [20, 0, 0, 20]
  );

  // Create transforms for scroll hint
  const hintOpacity = useTransform(smoothProgress, [0, 0.1], [1, 0]);

  const hintY = useTransform(smoothProgress, [0, 0.1], [0, 20]);

  // Update window dimensions and initialize path
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setWindowSize({ width, height });

      // Generate path when dimensions are available
      if (width > 0 && height > 0) {
        const path = generateSinusoidalPath(width, height);
        setSnakePath(path);
        setIsInitialized(true);
      }
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update head position on scroll
  useEffect(() => {
    if (!pathRef.current || !isInitialized) return;

    const updateHeadPosition = () => {
      if (!pathRef.current) return;

      const progress = smoothProgress.get();
      const pathLength = pathRef.current.getTotalLength();
      const point = pathRef.current.getPointAtLength(pathLength * progress);

      setHeadPosition({ x: point.x, y: point.y });
    };

    // Initial update
    updateHeadPosition();

    // Subscribe to changes
    const unsubscribe = smoothProgress.onChange(updateHeadPosition);
    return unsubscribe;
  }, [smoothProgress, isInitialized]);

  // Generate a sinusoidal path that flows across the page
  const generateSinusoidalPath = (width: number, height: number) => {
    // Number of waves/oscillations
    const numWaves = 5;
    // Amplitude of the waves (how tall they are)
    const amplitude = width * 0.15;
    // Number of points to generate along the path
    const numPoints = 100;

    let path = "";

    // Generate points along the sinusoidal path
    for (let i = 0; i < numPoints; i++) {
      const progress = i / (numPoints - 1);
      const y = height * progress;

      // Calculate x position using sine function for oscillation
      // Center the wave around the middle of the screen
      const centerX = width * 0.5;
      const sineWave = Math.sin(progress * Math.PI * 2 * numWaves);
      const x = centerX + sineWave * amplitude;

      // Start the path or add a line to the next point
      if (i === 0) {
        path = `M ${x},${y}`;
      } else {
        path += ` L ${x},${y}`;
      }
    }

    // Smooth the path with bezier curves
    return smoothPath(path);
  };

  // Convert a path with many points to a smoother path with bezier curves
  const smoothPath = (path: string) => {
    // Parse the path to extract points
    const pointsRegex = /([ML]) ([\d.]+),([\d.]+)/g;
    const points = [];
    let match;

    while ((match = pointsRegex.exec(path)) !== null) {
      points.push({
        x: parseFloat(match[2]),
        y: parseFloat(match[3]),
      });
    }

    // Create a new smooth path with bezier curves
    let smoothPath = `M ${points[0].x},${points[0].y}`;

    // Use every few points as control points for smoother curves
    const step = 4; // Use every 4th point

    for (let i = 0; i < points.length - 1; i += step) {
      const startPoint = points[i];
      const endPoint = points[Math.min(i + step, points.length - 1)];

      // If we're at the end, just draw a line to the last point
      if (i + step >= points.length - 1) {
        smoothPath += ` L ${endPoint.x},${endPoint.y}`;
        break;
      }

      // Calculate control points for a smooth curve
      const cp1 = {
        x: startPoint.x + (endPoint.x - startPoint.x) / 3,
        y: startPoint.y + (endPoint.y - startPoint.y) / 3,
      };

      const cp2 = {
        x: startPoint.x + (2 * (endPoint.x - startPoint.x)) / 3,
        y: startPoint.y + (2 * (endPoint.y - startPoint.y)) / 3,
      };

      // Add a cubic bezier curve
      smoothPath += ` C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${endPoint.x},${endPoint.y}`;
    }

    return smoothPath;
  };

  // Don't render until initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* SVG container for the snake path */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient for the snake */}
          <linearGradient
            id="snakeGradient"
            gradientUnits="userSpaceOnUse"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="25%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="75%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          {/* Filter for glow effect */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Shadow path for glow effect */}
        <motion.path
          d={snakePath}
          fill="none"
          stroke="rgba(139, 92, 246, 0.15)"
          strokeWidth="12"
          strokeLinecap="round"
          style={{
            filter: "blur(12px)",
            pathLength,
            pathOffset: 0,
          }}
        />

        {/* Main snake path */}
        <motion.path
          ref={pathRef}
          d={snakePath}
          fill="none"
          stroke="url(#snakeGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          style={{
            pathLength,
            pathOffset: 0,
            filter: "url(#glow)",
          }}
          animate={{
            filter: [
              "drop-shadow(0 0 2px rgba(139, 92, 246, 0.5))",
              "drop-shadow(0 0 8px rgba(139, 92, 246, 0.8))",
              "drop-shadow(0 0 2px rgba(139, 92, 246, 0.5))",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>

      {/* Snake head */}
      <motion.div
        className="absolute w-10 h-10 -ml-5 -mt-5 flex items-center justify-center"
        style={{
          x: headPosition.x,
          y: headPosition.y,
        }}
      >
        {/* Inner glow */}
        <motion.div
          className="absolute w-6 h-6 rounded-full bg-white/30 blur-md"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Main orb */}
        <motion.div
          className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 via-blue-500 to-emerald-400"
          animate={{
            boxShadow: [
              "0 0 10px 2px rgba(139, 92, 246, 0.5)",
              "0 0 25px 5px rgba(139, 92, 246, 0.7)",
              "0 0 10px 2px rgba(139, 92, 246, 0.5)",
            ],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Core highlight */}
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-white/80 blur-[1px]"
          style={{
            top: "25%",
            left: "25%",
          }}
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Scroll progress indicator */}
      <motion.div
        className="fixed bottom-8 right-8 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-sm font-mono text-white/90 border border-white/10 flex items-center gap-2"
        style={{
          opacity: progressOpacity,
          y: progressY,
        }}
      >
        <motion.div
          className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.span>{Math.round(smoothProgress.get() * 100)}%</motion.span>
      </motion.div>

      {/* Scroll hint at the beginning */}
      <motion.div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{
          opacity: hintOpacity,
          y: hintY,
        }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-1"
          initial={{ y: 0 }}
          animate={{ y: [0, 5, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.div
            className="w-1 h-2 bg-white/70 rounded-full"
            animate={{
              height: [2, 4, 2],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
        <span className="text-white/70 text-sm font-light">
          Scroll to explore
        </span>
      </motion.div>
    </div>
  );
};

export default SnakeLine;
