"use client";
import { useState, useRef, useEffect } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";

import { reasons } from "../../data/whyChooseUs";

const WhyChooseUs = () => {
  const [activeReason, setActiveReason] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(titleRef, { once: false, margin: "-100px 0px" });

  // For parallax scrolling effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacitySection = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0]
  );

  // Handle window resize for responsive adjustments
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  console.log(windowWidth);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get active reason data
  const activeReasonData = reasons.find((reason) => reason.id === activeReason);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#030014] py-20 px-4 md:px-8"
      dir="rtl" // RTL for Persian content
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050118] to-[#030014] opacity-80"></div>

      {/* Animated background image with parallax */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{ y: backgroundY }}
      >
        <Image
          src={activeReasonData?.image || reasons[0].image}
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent"></div>
      </motion.div>

      {/* Content container */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto"
        style={{ opacity: opacitySection }}
      >
        {/* Section header with animated title */}
        <div className="text-center mb-16 md:mb-24">
          <motion.h2
            ref={titleRef}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, ease: [0.19, 1.0, 0.22, 1.0] }}
          >
            چرا کارخانه محتوا را انتخاب کنید؟
          </motion.h2>

          <motion.div
            className="h-1 w-20 mx-auto rounded-full mb-6"
            style={{
              background: `linear-gradient(90deg, ${reasons[0].color}, ${
                reasons[reasons.length - 1].color
              })`,
            }}
            initial={{ width: 0, opacity: 0 }}
            animate={
              isInView
                ? { width: "120px", opacity: 1 }
                : { width: 0, opacity: 0 }
            }
            transition={{ delay: 0.3, duration: 0.8 }}
          />

          <motion.p
            className="text-gray-300 max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            ما با ترکیب خلاقیت، تخصص و تکنولوژی، محتوایی می‌سازیم که نتایج واقعی
            به همراه دارد
          </motion.p>
        </div>

        {/* Enhanced Desktop Grid Layout */}
        {!isMobile && (
          <div className="hidden md:block relative">
            {/* Main grid container */}
            <div className="grid grid-cols-3 gap-8 mb-16">
              {reasons.map((reason, index) => (
                <motion.div
                  key={reason.id}
                  className={`relative cursor-pointer transition-all duration-500 ${
                    activeReason && activeReason !== reason.id
                      ? "opacity-60"
                      : "opacity-100"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() =>
                    setActiveReason(
                      activeReason === reason.id ? null : reason.id
                    )
                  }
                  whileHover={{ scale: 1.03, opacity: 1 }}
                >
                  <motion.div
                    className="relative aspect-square rounded-2xl overflow-hidden backdrop-blur-lg"
                    style={{
                      boxShadow: `0 10px 30px -5px ${reason.color}40`,
                      border: `1px solid ${reason.color}30`,
                    }}
                  >
                    {/* Background image with overlay */}
                    <div className="absolute inset-0 opacity-20">
                      <Image
                        src={reason.image}
                        alt={reason.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Gradient overlay */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${reason.color}40, transparent)`,
                      }}
                    ></div>

                    {/* Content */}
                    <div className="relative h-full flex flex-col items-center justify-center p-6 text-center z-10">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        style={{
                          backgroundColor: `${reason.color}33`,
                          border: `1px solid ${reason.color}66`,
                        }}
                      >
                        <span className="text-white text-2xl">
                          {reason.icon && <reason.icon />}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2">
                        {reason.title}
                      </h3>

                      <AnimatePresence>
                        {activeReason === reason.id && (
                          <motion.p
                            className="text-gray-300 text-sm"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {reason.description}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {activeReason !== reason.id && (
                        <motion.p
                          className="text-gray-400 text-xs mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          برای مشاهده جزئیات کلیک کنید
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Center content - now as a separate section below the grid */}
            <motion.div
              className="relative mx-auto max-w-2xl rounded-2xl p-8 mb-16"
              style={{
                background: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex items-center gap-6">
                <Image
                  src="/assets/images/cam1.jpg" // Replace with your logo
                  alt="Content Factory"
                  width={100}
                  height={100}
                  className="rounded-full border-2 border-white/20"
                />
                <div className="text-right">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    کارخانه محتوا
                  </h3>
                  <p className="text-gray-300">
                    ما به شما کمک می‌کنیم تا با محتوای حرفه‌ای، در دنیای دیجیتال
                    بدرخشید
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Mobile layout - vertical cards */}
        {isMobile && (
          <div className="grid grid-cols-1 gap-6">
            {reasons.map((reason, index) => (
              <motion.div
                key={reason.id}
                className="relative cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() =>
                  setActiveReason(activeReason === reason.id ? null : reason.id)
                }
              >
                <motion.div
                  className="relative rounded-xl overflow-hidden backdrop-blur-lg"
                  style={{
                    boxShadow: `0 10px 30px -5px ${reason.color}40`,
                    border: `1px solid ${reason.color}30`,
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Background with overlay */}
                  <div className="absolute inset-0 opacity-20">
                    <Image
                      src={reason.image}
                      alt={reason.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${reason.color}40, transparent)`,
                    }}
                  ></div>

                  {/* Content */}
                  <div className="relative flex items-center p-4 z-10">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ml-4"
                      style={{
                        backgroundColor: `${reason.color}33`,
                        border: `1px solid ${reason.color}66`,
                      }}
                    >
                      <span className="text-white text-xl">
                        {reason.icon && <reason.icon />}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        {reason.title}
                      </h3>

                      <AnimatePresence>
                        {activeReason === reason.id && (
                          <motion.p
                            className="text-gray-300 text-sm"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {reason.description}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {activeReason !== reason.id && (
                        <motion.p
                          className="text-gray-400 text-xs"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          برای مشاهده جزئیات کلیک کنید
                        </motion.p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Floating elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Animated particles */}
          {[...Array(20)].map((_, i) => {
            const size = Math.random() * 4 + 2;
            const duration = Math.random() * 20 + 10;
            const initialX = Math.random() * 100;
            const initialY = Math.random() * 100;
            const delay = Math.random() * 5;
            const color =
              reasons[Math.floor(Math.random() * reasons.length)].color;

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

          {/* Floating orbs with glass effect */}
          <motion.div
            className="absolute w-40 h-40 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${reasons[0].color}10 0%, ${reasons[0].color}05 50%, transparent 70%)`,
              boxShadow: `inset 0 0 20px ${reasons[0].color}20, 0 0 30px ${reasons[0].color}10`,
              backdropFilter: "blur(5px)",
              border: `1px solid ${reasons[0].color}10`,
              left: "10%",
              top: "20%",
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />

          <motion.div
            className="absolute w-24 h-24 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${reasons[2].color}10 0%, ${reasons[2].color}05 50%, transparent 70%)`,
              boxShadow: `inset 0 0 15px ${reasons[2].color}20, 0 0 20px ${reasons[2].color}10`,
              backdropFilter: "blur(5px)",
              border: `1px solid ${reasons[2].color}10`,
              right: "15%",
              bottom: "25%",
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -15, 0],
              y: [0, 15, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2,
            }}
          />
        </div>

        {/* Animated rings */}
        <div className="absolute left-1/4 top-1/4 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
          <motion.div
            className="w-40 h-40 rounded-full border border-white/10"
            animate={{
              scale: [1, 1.5],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute inset-0 w-40 h-40 rounded-full border border-white/10"
            animate={{
              scale: [1, 1.5],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              delay: 1,
            }}
          />
          <motion.div
            className="absolute inset-0 w-40 h-40 rounded-full border border-white/10"
            animate={{
              scale: [1, 1.5],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              delay: 2,
            }}
          />
        </div>

        {/* Testimonial section */}
        <motion.div
          className="mt-24 relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div
            className="p-8 rounded-2xl backdrop-blur-lg"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-24 h-24 md:w-32 md:h-32 relative rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src="/assets/images/cam2.jpg" // Replace with testimonial image
                  alt="مشتری راضی"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 border-2 border-white/20 rounded-full"></div>
              </div>

              <div className="flex-1">
                <div className="mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400 text-xl ml-1">
                      ★
                    </span>
                  ))}
                </div>

                <p className="text-white/90 text-lg mb-6 leading-relaxed">
                  همکاری با کارخانه محتوا یکی از بهترین تصمیمات کسب و کار ما
                  بود. آنها نه تنها محتوای با کیفیت بالا تولید کردند، بلکه
                  استراتژی دیجیتال ما را کاملاً متحول کردند. نتایج فراتر از
                  انتظارات ما بود.
                </p>

                <div>
                  <h4 className="text-white font-bold text-lg">سارا محمدی</h4>
                  <p className="text-gray-400">
                    مدیر بازاریابی، شرکت نوآوران دیجیتال
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <motion.div
            className="absolute -top-10 -right-10 w-20 h-20 rounded-full"
            style={{
              background: `radial-gradient(circle, ${reasons[4].color}20 0%, transparent 70%)`,
              border: `1px solid ${reasons[4].color}30`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />

          <motion.div
            className="absolute -bottom-5 -left-5 w-10 h-10 rounded-full"
            style={{
              background: `radial-gradient(circle, ${reasons[1].color}20 0%, transparent 70%)`,
              border: `1px solid ${reasons[1].color}30`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1,
            }}
          />
        </motion.div>

        {/* Stats section */}
        <motion.div
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          {[
            { value: "+۱۰۰", label: "مشتری راضی" },
            { value: "+۵۰۰", label: "پروژه موفق" },
            { value: "+۵", label: "سال تجربه" },
            { value: "+۹۸٪", label: "رضایت مشتری" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-6 rounded-xl backdrop-blur-sm"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{
                y: -5,
                boxShadow: `0 10px 30px -5px ${
                  reasons[index % reasons.length].color
                }40`,
              }}
            >
              <motion.h3
                className="text-3xl md:text-4xl font-bold mb-2"
                style={{ color: reasons[index % reasons.length].color }}
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.9, 1, 0.9],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: index * 0.5,
                }}
              >
                {stat.value}
              </motion.h3>
              <p className="text-gray-300">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to action */}
        <motion.div
          className="mt-24 text-center"
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
              background: `linear-gradient(90deg, ${reasons[0].color}, ${reasons[2].color})`,
              boxShadow: `0 8px 20px -5px ${reasons[0].color}80`,
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: `0 12px 25px -5px ${reasons[0].color}80`,
            }}
            whileTap={{ scale: 0.98 }}
          >
            مشاوره رایگان
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WhyChooseUs;
