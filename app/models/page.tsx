"use client";

import { useState, useRef, useEffect } from "react";
import { FiUser, FiCamera, FiMapPin, FiScissors, FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import CoworkerShowcaseCard from "../../components/static/coworkerShowcaseCard";

interface CoWorker {
  _id: string;
  name: string;
  email?: string;
  phoneNumber: string;
  experties: "model" | "makeUpArtist" | "stylist" | "location" | "photoGrapher";
  description?: string;
  images: {
    main?: string;
    thumbnails?: string[];
  };
  resomeLink?: string;
  socialLinks?: object;
  isActive: boolean;
}

interface ExpertiseOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ExpertiseDropdownProps {
  options: ExpertiseOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

const ExpertiseDropdown: React.FC<ExpertiseDropdownProps> = ({
  options,
  selectedValue,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === selectedValue);

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex items-center justify-between text-white hover:bg-white/15 transition-all duration-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3">
          {selectedOption && (
            <>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                <selectedOption.icon className="text-lg text-purple-300" />
              </div>
              <span className="font-medium text-lg">{selectedOption.label}</span>
            </>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-white/60"
        >
          <FiChevronDown className="text-xl" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-2 shadow-2xl z-50"
          >
            {options.map((option, index) => {
              const IconComponent = option.icon;
              const isSelected = option.value === selectedValue;
              
              return (
                <motion.button
                  key={option.value}
                  onClick={() => {
                    onSelect(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-600/50 to-blue-600/50 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected 
                      ? "bg-white/20" 
                      : "bg-gradient-to-r from-purple-500/20 to-blue-500/20"
                  }`}>
                    <IconComponent className="text-lg" />
                  </div>
                  <span className="font-medium">{option.label}</span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mr-auto w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

const ModelsPage = () => {
  const [selectedExpertise, setSelectedExpertise] = useState<string>("model");
  const [coworkers, setCoworkers] = useState<CoWorker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const expertiseOptions = [
    { value: "model", label: "مدلها", icon: FiUser },
    { value: "photoGrapher", label: "عکاسها", icon: FiCamera },
    { value: "makeUpArtist", label: "میکاپ ارتیست", icon: FiCamera },
    { value: "stylist", label: "استایلیست", icon: FiScissors },
    { value: "location", label: "لوکیشن", icon: FiMapPin },
  ];

  // Fetch coworkers data
  useEffect(() => {
    const fetchCoworkers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/coworkers");
        const result = await response.json();
        if (result.success) {
          // Only show active and approved coworkers
          setCoworkers(
            result.data.filter((worker: CoWorker) => worker.isActive)
          );
        }
      } catch (error) {
        console.error("Error fetching coworkers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoworkers();
  }, []);

  // Filter coworkers by expertise
  const filteredCoworkers = coworkers.filter(
    (worker) => worker.experties === selectedExpertise
  );

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".showcase-card", {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, gridRef);

    return () => ctx.revert();
  }, [filteredCoworkers]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-[#0A0A1A] to-[#05051F] pt-20 pb-16 px-4"
      dir="rtl"
    >
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full filter blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            همکاران ما
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm">
            توی این قسمت میتونید با دیگر همکار های ما اشنا بشید و برای پروژه
            هاتون باهاشون همکاری داشته باشید
          </p>
        </div>

        {/* Expertise Switch */}
        <div className="flex justify-center mb-12">
          {/* Desktop Version - Horizontal Tabs */}
          <div className="hidden sm:flex bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2 gap-2">
            {expertiseOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedExpertise(option.value)}
                  className={`flex items-center gap-2 cursor-pointer px-6 py-3 rounded-xl transition-all ${
                    selectedExpertise === option.value
                      ? "bg-gradient-to-t from-purple-700 to-blue-500 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <IconComponent className="text-lg" />
                  <span className="font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Version - Luxury Dropdown */}
          <div className="sm:hidden w-full max-w-sm">
            <ExpertiseDropdown
              options={expertiseOptions}
              selectedValue={selectedExpertise}
              onSelect={setSelectedExpertise}
            />
          </div>
        </div>

        {/* Coworkers Grid */}
        <div ref={gridRef} className="relative">
          {isLoading ? (
            <div className="grid place-items-center min-h-[400px]">
              <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredCoworkers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCoworkers.map((coworker) => (
                <CoworkerShowcaseCard
                  key={coworker._id}
                  coworker={coworker}
                  className="showcase-card"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                <FiUser className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-2xl font-medium text-white mb-2">
                عضوی یافت نشد
              </h3>
              <p className="text-gray-400">در این بخش فعلاً عضوی وجود ندارد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelsPage;
