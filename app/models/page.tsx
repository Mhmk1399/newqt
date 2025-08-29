"use client";

import { useState, useRef, useEffect } from "react";
import { FiUser, FiCamera, FiMapPin, FiScissors } from "react-icons/fi";
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
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex flex-wrap gap-2">
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
