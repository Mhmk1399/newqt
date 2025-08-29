"use client";
import { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import Image from "next/image";
import { IoArrowForward, IoArrowBack } from "react-icons/io5";
import { FiPlus } from "react-icons/fi";
import { projects } from "../../data/projectSlider";
import Link from "next/link";

const ProjectSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [expandedView, setExpandedView] = useState(false);
  const [selectedDetailImage, setSelectedDetailImage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  console.log(selectedDetailImage);

  // Mouse position for parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smoothed mouse values for more natural movement
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Progress animation
  const [progress, setProgress] = useState(0);

  // Current project
  const currentProject = projects[currentIndex];

  // Handle auto-play
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAutoPlaying && !expandedView) {
      interval = setInterval(() => {
        goToNext();
      }, 6000);

      // Update progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0;
          return prev + (100 / 6000) * 10; // Update every 10ms
        });
      }, 10);

      return () => {
        clearInterval(interval);
        clearInterval(progressInterval);
      };
    }

    return () => {};
  }, [isAutoPlaying, currentIndex, expandedView]);

  // Reset progress when slide changes
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (expandedView) {
        if (e.key === "Escape") {
          setExpandedView(false);
        } else if (e.key === "ArrowRight") {
          setSelectedDetailImage((prev) =>
            prev === 0 ? currentProject.detailImages.length - 1 : prev - 1
          );
        } else if (e.key === "ArrowLeft") {
          setSelectedDetailImage(
            (prev) => (prev + 1) % currentProject.detailImages.length
          );
        }
      } else {
        if (e.key === "ArrowRight") {
          goToPrevious();
        } else if (e.key === "ArrowLeft") {
          goToNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expandedView, currentIndex, currentProject]);

  // Handle mouse movement for parallax effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      // Normalize mouse position to be between -0.5 and 0.5
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      mouseX.set(x);
      mouseY.set(y);
    }
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    // Reset mouse position when leaving
    mouseX.set(0);
    mouseY.set(0);
  };

  // Navigation functions
  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Handle touch events for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;

    // Prevent scrolling while swiping
    if (Math.abs(diff) > 5) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentX = e.changedTouches[0].clientX;
    const diff = startX - currentX;

    if (diff > 50) {
      // Swiped left, go to next
      goToNext();
    } else if (diff < -50) {
      // Swiped right, go to previous
      goToPrevious();
    }

    setIsDragging(false);
  };

  // Toggle expanded view

  // Toggle autoplay
  const toggleAutoplay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0 as const,
      scale: 0.85 as const,
      filter: "blur(8px)" as const,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)" as const,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 } as const,
        opacity: { duration: 0.5 } as const,
        scale: { duration: 0.5 },
        filter: { duration: 0.5 },
      } as const,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.85,
      filter: "blur(8px)",
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 } as const,
        opacity: { duration: 0.5 },
        scale: { duration: 0.5 },
        filter: { duration: 0.5 },
      },
    }),
  };

  const contentVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (custom: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.2 + custom * 0.1,
        duration: 0.5,
        ease: [0.19, 1.0, 0.22, 1.0] as const,
      },
    }),
    exit: { y: -20, opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-[#030014] py-16 px-4 md:px-8"
      dir="rtl"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050118] to-[#030014] opacity-80"></div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-pink-500/10 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-40 left-20 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Content container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.19, 1.0, 0.22, 1.0] }}
          >
            پروژه‌ها
          </motion.h2>

          <motion.div
            className="h-1 w-20 mx-auto rounded-full mb-6"
            style={{
              background: "linear-gradient(90deg, #8B5CF6, #EC4899)",
            }}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "120px", opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />

          <motion.p
            className="text-gray-300 max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            نگاهی به برخی از پروژه‌های اخیر ما که با افتخار برای مشتریان خود
            انجام داده‌ایم
          </motion.p>
        </div>

        {/* Main slider */}
        <div
          ref={sliderRef}
          className="relative h-[650px] md:h-[700px] rounded-3xl overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Glass border effect */}
          <div className="absolute inset-0 rounded-3xl z-20 pointer-events-none">
            <div className="absolute inset-0 rounded-3xl border border-white/10"></div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-50"></div>
          </div>

          {/* Slides */}
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
            >
              {/* Background image with parallax effect */}
              <motion.div
                className="absolute inset-0"
                style={{
                  x: useTransform(smoothMouseX, [-0.5, 0.5], [20, -20]),
                  y: useTransform(smoothMouseY, [-0.5, 0.5], [20, -20]),
                }}
              >
                <Image
                  src={currentProject.image}
                  alt={currentProject.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-[#030014]/70 to-transparent"></div>
              </motion.div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                <div className="max-w-3xl">
                  <motion.span
                    className="inline-block px-4 py-1 rounded-full text-sm font-medium mb-4"
                    style={{
                      backgroundColor: `${currentProject.color}33`,
                      color: currentProject.color,
                    }}
                    custom={0}
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {currentProject.category}
                  </motion.span>

                  <motion.h3
                    className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
                    custom={1}
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {currentProject.title}
                  </motion.h3>

                  <motion.p
                    className="text-gray-300 text-lg mb-6"
                    custom={2}
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {currentProject.description}
                  </motion.p>

                  <motion.div
                    className="flex flex-wrap gap-3 mb-8"
                    custom={3}
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {currentProject.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-sm bg-white/10 text-white/80"
                      >
                        {tech}
                      </span>
                    ))}
                  </motion.div>

                  <motion.div
                    className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                    custom={4}
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-400 text-sm">مشتری:</span>
                      <span className="text-white font-medium">
                        {currentProject.client}
                      </span>
                    </div>

                    <div className="w-px h-10 bg-white/20 hidden sm:block"></div>

                    <div className="flex flex-col gap-1">
                      <span className="text-gray-400 text-sm">تاریخ:</span>
                      <span className="text-white font-medium">
                        {currentProject.date}
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation controls */}
          <div className="absolute bottom-0 left-8 right-8 flex justify-between items-center z-30">
            <div className="flex gap-2">
              <motion.button
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20"
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                }}
                whileTap={{ scale: 0.9 }}
                onClick={goToPrevious}
              >
                <IoArrowForward className="text-xl" />
              </motion.button>

              <motion.button
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20"
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                }}
                whileTap={{ scale: 0.9 }}
                onClick={goToNext}
              >
                <IoArrowBack className="text-xl" />
              </motion.button>
            </div>

            {/* Slide indicators */}
            <div className="hidden md:flex items-center gap-3">
              {projects.map((_, index) => (
                <motion.button
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? "w-10 bg-white" : "w-2 bg-white/40"
                  }`}
                  onClick={() => goToSlide(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>

            {/* Progress bar (mobile) */}
            <div className="md:hidden w-full max-w-[150px] h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Autoplay toggle */}
            <motion.button
              className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center text-white border border-white/20 ${
                isAutoPlaying ? "bg-white/20" : "bg-white/10"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleAutoplay}
            >
              {isAutoPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </motion.button>
          </div>

          {/* Slide counter */}
          <div className="absolute top-8 right-8 text-white/70 font-mono text-sm z-20">
            <motion.span
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {(currentIndex + 1).toString().padStart(2, "0")}
            </motion.span>
            <span className="mx-1">/</span>
            <span>{projects.length.toString().padStart(2, "0")}</span>
          </div>
        </div>

        {/* Project grid preview */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-white mb-8">سایر پروژه‌ها</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                className={`group relative rounded-xl overflow-hidden aspect-[4/3] ${
                  index === currentIndex
                    ? "ring-2 ring-offset-4 ring-offset-[#030014] ring-white"
                    : ""
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
                onClick={() => goToSlide(index)}
              >
                <div className="absolute inset-0">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 w-fit"
                    style={{
                      backgroundColor: `${project.color}33`,
                      color: project.color,
                    }}
                  >
                    {project.category}
                  </span>
                  <h4 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {project.title}
                  </h4>
                  <p className="text-gray-300 text-sm line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {project.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">
                      {project.date}
                    </span>
                    <motion.div
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      whileHover={{
                        scale: 1.1,
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiPlus className="text-white" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
            آماده همکاری با ما هستید؟
          </h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            با کارخانه محتوا تماس بگیرید و اولین قدم را برای ارتقای استراتژی
            محتوای خود بردارید.
          </p>
          <motion.button
            className="px-8 py-3 rounded-full text-white font-medium"
            style={{
              background: "linear-gradient(90deg, #8B5CF6, #EC4899)",
              boxShadow: "0 8px 20px -5px rgba(139, 92, 246, 0.5)",
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 12px 25px -5px rgba(139, 92, 246, 0.6)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/contact">تماس با ما</Link>{" "}
          </motion.button>
        </motion.div>

        {/* Floating elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Animated particles */}
          {[...Array(15)].map((_, i) => {
            const size = Math.random() * 4 + 2;
            const duration = Math.random() * 20 + 10;
            const initialX = Math.random() * 100;
            const initialY = Math.random() * 100;
            const delay = Math.random() * 5;
            const colors = ["#8B5CF6", "#EC4899", "#3B82F6"];
            const color = colors[Math.floor(Math.random() * colors.length)];

            return (
              <motion.div
                key={`particle-${i}`}
                className="absolute rounded-full"
                style={{
                  width: size,
                  height: size,
                  x: `${initialX}%`,
                  y: `${initialY}%`,
                  backgroundColor: color,
                  opacity: 0.4,
                }}
                animate={{
                  y: [`${initialY}%`, `${initialY - 30}%`],
                  opacity: [0, 0.7, 0],
                  scale: [1, 1.5, 0.8],
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  delay,
                  ease: "linear",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectSlider;
