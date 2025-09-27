import { motion, AnimatePresence } from "framer-motion";
import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaTwitter,
  FaTimes,
  FaWhatsapp,
  FaTelegram,
} from "react-icons/fa";
import { useEffect, useRef } from "react";

interface SocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalPosition: {
    top: number;
    left?: number;
    right?: number;
  };
}

const socialItems = [
  {
    icon: FaInstagram,
    title: "Instagram",
    link: "https://www.instagram.com/the.qt.studio?igsh=MXVlajJuN3A1YjQyMQ==",
    color: "#e4405f",
  },

  {
    icon: FaWhatsapp,
    title: "WhatsApp",
    link: "https://wa.me/+989015528576",
    color: "#25D366",
  },
  {
    icon: FaTelegram,
    title: "Telegram",
    link: "https://t.me/Immhmk",
    color: "#0088cc",
  },
];

const SocialModal = ({ isOpen, onClose, modalPosition }: SocialModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!modalPosition) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20 }}
            dir="rtl"
            style={{
              position: "fixed",
              top: `${modalPosition.top}px`,
              left: modalPosition.left ? `${modalPosition.left}px` : undefined,
              right: modalPosition.right
                ? `${modalPosition.right}px`
                : undefined,
              zIndex: 50,
            }}
            className="bg-gray-900/90 backdrop-blur-lg rounded-xl overflow-hidden border border-gray-700/30 shadow-xl w-[300px]"
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/30">
              <h3 className="text-white text-sm font-medium">
                راه های ارتباطی با ما
              </h3>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-1 rounded-md hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes size={14} />
              </motion.button>
            </div>

            {/* Social icons grid */}
            <div className="grid grid-cols-3 gap-2 p-4">
              {socialItems.map((item, index) => (
                <motion.a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: 0.05 * index },
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full mb-1"
                    style={{
                      backgroundColor: `${item.color}20`,
                      border: `1px solid ${item.color}40`,
                    }}
                  >
                    <item.icon size={18} color={item.color} />
                  </div>
                  <span className="text-gray-300 text-xs">{item.title}</span>
                </motion.a>
              ))}
            </div>

            {/* Decorative element */}
            <div
              className="absolute -z-10 top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-20"
              style={{
                background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
              }}
            ></div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SocialModal;
