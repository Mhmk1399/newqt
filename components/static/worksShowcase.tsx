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
import { FiArrowLeft, FiExternalLink, FiX } from "react-icons/fi";
import { WorkProject, workCategories } from "../../data/worksShowcase";
import React from "react";

const WorksShowcase = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<WorkProject | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(titleRef, { once: false, margin: "-100px 0px" });

  // Parallax effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacitySection = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeCategoryData = workCategories.find(
    (category) => category.id === activeCategory
  );

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
    setSelectedProject(null);
  };

  const handleProjectClick = (project: WorkProject) => {
    setSelectedProject(project);
  };

  const handleBackClick = () => {
    setSelectedProject(null);
  };

  const handleCloseCategory = () => {
    setActiveCategory(null);
    setSelectedProject(null);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-black py-20 px-4 md:px-8"
      dir="rtl"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black opacity-80"></div>

      {/* Animated background with parallax */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{ y: backgroundY }}
      >
        <Image
          src={
            activeCategoryData?.projects[0]?.image || "/assets/images/cam1.jpg"
          }
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto"
        style={{ opacity: opacitySection }}
      >
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            ref={titleRef}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
          >
            نمونه کارهای ما
          </motion.h2>

          <motion.div
            className="h-1 w-20 bg-cyan-400 mx-auto rounded-full mb-6"
            initial={{ width: 0, opacity: 0 }}
            animate={
              isInView
                ? { width: "80px", opacity: 1 }
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
            نگاهی به پروژه‌های اخیر ما بیندازید و ببینید چگونه به مشتریان خود
            کمک کرده‌ایم
          </motion.p>
        </div>

        {/* Main content */}
        <div className="relative">
          {/* Categories Grid */}
          <AnimatePresence>
            {!activeCategory && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                {workCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    className="relative cursor-pointer group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() => handleCategoryClick(category.id)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="relative h-64 rounded-xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-cyan-400/50 transition-all duration-300">
                      {/* Content */}
                      <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-cyan-400/20 border border-cyan-400/50 flex items-center justify-center mb-4 group-hover:bg-cyan-400/30 transition-colors duration-300">
                          <span className="text-cyan-400 text-2xl">
                            {category.icon &&
                              React.createElement(category.icon)}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300">
                          {category.title}
                        </h3>

                        <p className="text-gray-400 text-sm mb-4">
                          {category.description}
                        </p>

                        <div className="px-4 py-2 bg-cyan-400/20 border border-cyan-400/50 rounded-full text-cyan-400 text-sm group-hover:bg-cyan-400/30 transition-colors duration-300">
                          {category.projects.length} پروژه
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Projects Grid */}
          <AnimatePresence mode="wait">
            {activeCategory && (
              <motion.div
                key={`projects-${activeCategory}`}
                className="w-full"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.6 }}
              >
                {/* Category header */}
                <motion.div
                  className="mb-8 text-center"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-3xl font-bold text-cyan-400 mb-4">
                    {activeCategoryData?.title}
                  </h3>
                  <button
                    onClick={handleCloseCategory}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-400/20 border border-cyan-400/50 rounded-full text-cyan-400 hover:bg-cyan-400/30 transition-colors duration-300"
                  >
                    <FiArrowLeft />
                    <span>بازگشت</span>
                  </button>
                </motion.div>

                {/* Projects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {activeCategoryData?.projects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      className="relative cursor-pointer rounded-xl overflow-hidden group bg-gray-900 border border-gray-800 hover:border-cyan-400/50 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      onClick={() => handleProjectClick(project)}
                      whileHover={{ scale: 1.02 }}
                    >
                      {/* Project image */}
                      <div className="relative aspect-video">
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      </div>

                      {/* Project info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h4 className="text-white text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors duration-300">
                          {project.title}
                        </h4>
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                          {project.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {project.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="text-xs px-3 py-1 rounded-full bg-cyan-400/20 border border-cyan-400/50 text-cyan-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Project Detail Modal */}
          <AnimatePresence>
            {selectedProject && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleBackClick}
              >
                {/* Backdrop */}
                <motion.div
                  className="absolute inset-0 bg-black/80 backdrop-blur-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />

                {/* Modal */}
                <motion.div
                  className="relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh]"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  transition={{ duration: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    className="absolute top-4 left-4 z-50 bg-black/50 text-white p-2 rounded-full backdrop-blur-md hover:bg-cyan-400/20 hover:text-cyan-400 transition-colors duration-300"
                    onClick={handleBackClick}
                  >
                    <FiX size={20} />
                  </button>

                  {/* Project image */}
                  <div className="relative h-64 md:h-80">
                    <Image
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-6 md:p-8 -mt-16 relative overflow-y-auto max-h-[50vh]">
                    <div className="flex flex-wrap items-center justify-between mb-4">
                      <h3 className="text-2xl md:text-3xl font-bold text-white">
                        {selectedProject.title}
                      </h3>
                      <span className="text-sm px-3 py-1 rounded-full bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 mt-2 md:mt-0">
                        {selectedProject.date}
                      </span>
                    </div>

                    <p className="text-gray-300 mb-6 leading-relaxed">
                      {selectedProject.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedProject.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="text-sm px-3 py-1 rounded-full bg-cyan-400/20 border border-cyan-400/50 text-cyan-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Link */}
                    {selectedProject.link && (
                      <motion.a
                        href={selectedProject.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 rounded-full bg-cyan-400 text-black font-medium hover:bg-cyan-300 transition-colors duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="ml-2">مشاهده پروژه</span>
                        <FiExternalLink />
                      </motion.a>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
            با ما تماس بگیرید تا درباره پروژه شما صحبت کنیم و راه‌حل‌های خلاقانه
            ارائه دهیم.
          </p>
          <motion.button
            className="px-8 py-3 rounded-full bg-cyan-400 text-black font-medium hover:bg-cyan-300 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            تماس با ما
          </motion.button>
        </motion.div>

        {/* Process Section */}
        <div className="mt-32 relative">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h3
              className="text-2xl md:text-3xl font-bold text-white mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              فرآیند کار ما
            </motion.h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { title: "مشاوره", step: "01" },
                { title: "طراحی", step: "02" },
                { title: "توسعه", step: "03" },
                { title: "تحویل", step: "04" },
              ].map((process, index) => (
                <motion.div
                  key={index}
                  className="text-center relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-cyan-400/20 border-2 border-cyan-400/50 flex items-center justify-center text-cyan-400 font-bold text-lg mb-4 mx-auto"
                    whileHover={{ scale: 1.1, borderColor: "#06B6D4" }}
                  >
                    {process.step}
                  </motion.div>
                  <h4 className="text-white font-bold text-lg">
                    {process.title}
                  </h4>

                  {/* Connection line */}
                  {index < 3 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-cyan-400/50 to-transparent"></div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { value: "100+", label: "پروژه تکمیل شده" },
              { value: "50+", label: "مشتری راضی" },
              { value: "5+", label: "سال تجربه" },
              { value: "24/7", label: "پشتیبانی" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -5,
                  borderColor: "#06B6D4",
                  backgroundColor: "rgba(6, 182, 212, 0.1)",
                }}
              >
                <motion.div
                  className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                  viewport={{ once: true }}
                >
                  {stat.value}
                </motion.div>
                <p className="text-gray-300 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Floating elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Animated particles */}
          {Array.from({ length: 8 }).map((_, i) => {
            const size = Math.random() * 3 + 2;
            const duration = Math.random() * 15 + 10;
            const initialX = Math.random() * 100;
            const initialY = Math.random() * 100;
            const delay = Math.random() * 5;

            return (
              <motion.div
                key={`particle-${i}`}
                className="absolute rounded-full bg-cyan-400/30"
                style={{
                  width: size,
                  height: size,
                  x: `${initialX}%`,
                  y: `${initialY}%`,
                }}
                animate={{
                  y: [`${initialY}%`, `${initialY - 20}%`],
                  opacity: [0, 0.6, 0],
                  scale: [1, 1.2, 0.8],
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

          {/* Floating orbs */}
          <motion.div
            className="absolute w-32 h-32 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 70%)",
              boxShadow:
                "inset 0 0 20px rgba(6, 182, 212, 0.2), 0 0 30px rgba(6, 182, 212, 0.1)",
              backdropFilter: "blur(5px)",
              border: "1px solid rgba(6, 182, 212, 0.1)",
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
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />

          <motion.div
            className="absolute w-20 h-20 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 70%)",
              boxShadow:
                "inset 0 0 15px rgba(6, 182, 212, 0.2), 0 0 20px rgba(6, 182, 212, 0.1)",
              backdropFilter: "blur(5px)",
              border: "1px solid rgba(6, 182, 212, 0.1)",
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
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2,
            }}
          />
        </div>

        {/* Animated rings */}
        <div className="absolute left-1/4 top-1/4 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="absolute w-32 h-32 rounded-full border border-cyan-400/20"
              animate={{
                scale: [1, 1.5],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                delay: index,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default WorksShowcase;
