"use client";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaTwitter,
  FaCopyright,
  FaChevronUp,
  FaHeart,
} from "react-icons/fa";
const footerItems = [
  {
    icon: FaGithub,
    title: "Github",
    link: "https://github.com",
    color: "#333",
  },
  {
    icon: FaLinkedin,
    title: "LinkedIn",
    link: "https://linkedin.com",
    color: "#0077b5",
  },
  {
    icon: FaInstagram,
    title: "Instagram",
    link: "https://instagram.com",
    color: "#e4405f",
  },
  {
    icon: FaTwitter,
    title: "Twitter",
    link: "https://twitter.com",
    color: "#1da1f2",
  },
];
const Footer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const controls = useAnimation();

  const pulseAnimation = {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };


  useEffect(() => {
    const sequence = async () => {
      await controls.start({ scale: 1.1 });
      await controls.start({ scale: 1 });
    };

    if (isExpanded) {
      sequence();
    }
  }, [isExpanded, controls]);
  useEffect(() => {
    if (!isExpanded) {
      const timer = setTimeout(() => {
        controls.start("initial");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, controls]);
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Calculate distance from bottom (100px threshold)
      const distanceFromBottom = documentHeight - scrollPosition;

      if (distanceFromBottom < 100) {
        setIsExpanded(true);
      } else {
        // Only auto-close on mobile
        if (window.innerWidth < 1024) {
          setIsExpanded(false);
        }
      }
    };

    // Throttle the scroll event for better performance
    let timeout: NodeJS.Timeout;
    const throttledScroll = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(handleScroll, 100);
    };

    window.addEventListener("scroll", throttledScroll);

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", throttledScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, []);
  return (
    <motion.footer
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:p-0"
    >
      <motion.button
        aria-label="Toggle Footer"
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute z-50 -top-8 left-1/2 -translate-x-1/2 
                   bg-gradient-to-r from-blue-500/30 to-purple-500/30 
                   backdrop-blur-md p-3 rounded-full
                   border border-white/20 text-white
                   hover:shadow-lg hover:shadow-blue-500/20
                   transition-all duration-300
                   lg:hidden"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <FaChevronUp size={20} />
        </motion.div>
      </motion.button>

      <motion.div
        initial={{ height: "4rem" }}
        animate={{
          height: isExpanded ? "24rem" : "2rem",
          opacity: 1,
        }}
        onHoverStart={() => window.innerWidth >= 1024 && setIsExpanded(true)}
        onHoverEnd={() => window.innerWidth >= 1024 && setIsExpanded(false)}
        className="mx-auto max-w-screen-xl 
                   bg-gradient-to-r from-gray-900/50 to-gray-800/60
                   backdrop-blur-xl border border-white/30 
                   rounded-t-3xl shadow-2xl shadow-black/20
                   flex flex-col items-center
                   overflow-hidden transition-all duration-500
                   lg:justify-center"
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-8 p-6 w-full
                     lg:flex lg:justify-center lg:items-center lg:gap-12"
        >
          {footerItems.map((item, index) => (
            <motion.a
              key={index}
              variants={{
                hidden: { y: 20, opacity: 0 },
                show: { 
                  y: 0, 
                  opacity: 1, 
                  transition: { 
                    type: "spring", 
                    bounce: 0.4 
                  } 
                }
              }}
              href={item.link}
              target="_blank"
              aria-label={`Visit our ${item.title} profile`}
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 group"
              whileHover={{ scale: 1.1 }}
            >
              <motion.div
                animate={controls}
                custom={index}
                variants={{
                  hover: (i: number) => ({
                    scale: 1.1,
                    transition: { delay: i * 0.1 },
                    backgroundColor: footerItems[i].color,
                    color: "#ffffff",
                  }),
                  initial: {
                    scale: 1,
                    backgroundColor: "rgba(55, 65, 81, 0.5)",
                    color: "#d1d5db",
                  },
                }}
                className="p-4 rounded-xl bg-gray-700/50 text-gray-300
            transition-all duration-300
            shadow-lg shadow-black/20"
                onHoverStart={() => controls.start("hover")}
                onHoverEnd={() => controls.start("initial")}
              >
                <item.icon size={24} />
              </motion.div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-white font-medium tracking-wide"
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.a>
          ))}
        </motion.div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="flex flex-col items-center gap-4 text-gray-400 text-sm pb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <motion.div
                className="flex items-center gap-2"
                animate={pulseAnimation}
              >
                <span>Made with</span>
                <FaHeart className="text-red-500" />
                <span>by Content Factory</span>
              </motion.div>
              <div className="flex items-center gap-2">
                <FaCopyright size={14} />
                <span>2025 Content Factory. All rights reserved.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;
