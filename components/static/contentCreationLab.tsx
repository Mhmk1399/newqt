"use client";
import { useState, useEffect, useCallback, memo } from "react";
import { HiOutlineBeaker, HiOutlineSparkles } from "react-icons/hi";
import { FiZap, FiChevronDown, FiChevronUp } from "react-icons/fi";
import {
  contentElements,
  contentFormulas,
} from "../../data/contentCreationLab";
import { useNavigation } from "@/utilities/navigationUtils";
import VideoPlayer from "../video";

// Memoized componentsF
interface ContentElementType {
  id: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  color: string;
  name: string;
}

interface FormulaType {
  id: string;
  video: string;
  title: string;
  description: string;
  elements: string[];
  result: string;
}

interface FormulaCardProps {
  formula: FormulaType;
  isActive: boolean;
  isHovered: boolean;
  onClick: (id: string) => void;
  onHover: (id: string | null) => void;
}

interface ContentElementProps {
  element: ContentElementType;
  onClick: (id: string) => void;
}

const ContentElement = memo(({ element, onClick }: ContentElementProps) => (
  <div
    className="relative p-4 rounded-xl cursor-pointer transition-all duration-300 w-full  hover:scale-95 will-change-transform group"
    style={{
      background:
        "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.2)",
      boxShadow:
        "0 10px 25px -5px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
    }}
    onClick={() => onClick(element.id)}
  >
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20">
        <element.icon
          className="text-white text-xl"
          style={{ color: element.color }}
        />
      </div>
      <div className="text-white text-sm font-medium group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
        {element.name}
      </div>
    </div>
  </div>
));

const FormulaCard = memo(
  ({ formula, isActive, isHovered, onClick, onHover }: FormulaCardProps) => (
    <div
      className={`relative cursor-pointer rounded-xl overflow-hidden group transition-all duration-500 hover:scale-[1.02] ${
        isActive ? "scale-105 shadow-2xl" : ""
      }`}
      style={{
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow: isActive
          ? "0 25px 50px -12px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
          : "0 10px 25px -5px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
      }}
      onClick={() => onClick(formula.id)}
      onMouseEnter={() => onHover(formula.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="relative h-100 overflow-hidden">
        <VideoPlayer
          src={formula.video}
          autoPlay={isHovered}
          className="transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-4 right-4">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all duration-300 hover:bg-white/20">
            {isActive ? <FiChevronUp /> : <FiChevronDown />}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 p-3 md:p-6 flex flex-col justify-end">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20 transition-all duration-500">
          <h4 className="text-white text-lg md:text-2xl font-bold mb-2 md:mb-3 leading-tight">
            {formula.title}
          </h4>
          <p className="text-white/90 text-xs md:text-sm mb-3 md:mb-4 leading-relaxed">
            {formula.description}
          </p>

          <div
            className={`transition-all duration-500 overflow-hidden ${
              isActive ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="pt-3 md:pt-4 border-t border-white/20">
              <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4">
                {formula.elements.map((elementId: string) => {
                  const element = contentElements.find(
                    (e: ContentElementType) => e.id === elementId
                  );
                  return (
                    <div
                      key={elementId}
                      className="px-2 md:px-3 py-1 md:py-2 rounded-full text-xs md:text-sm flex items-center gap-1 md:gap-2 bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105 hover:bg-white/20"
                      style={{ color: element?.color ?? "#fff" }}
                    >
                      <span className="text-sm md:text-base">
                        {element?.icon && <element.icon />}
                      </span>
                      <span className="font-medium text-white">
                        {element?.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-xl p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-emerald-400/30 rounded-full flex items-center justify-center">
                    <FiZap className="text-emerald-400 text-sm md:text-base" />
                  </div>
                  <div>
                    <div className="text-emerald-400 text-xs font-medium mb-1">
                      نتیجه مورد انتظار
                    </div>
                    <div className="text-white font-bold text-xs md:text-sm">
                      {formula.result}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
);

ContentElement.displayName = "ContentElement";
FormulaCard.displayName = "FormulaCard";

const ContentCreationLab = () => {
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [activeFormula, setActiveFormula] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { navigateTo } = useNavigation();

  // Simplified animations with CSS classes instead of GSAP
  useEffect(() => {
    // Add intersection observer for fade-in animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeInUp");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleFormulaClick = useCallback((formulaId: string) => {
    setActiveFormula((prev) => (prev === formulaId ? null : formulaId));
  }, []);

  const handleCardHover = useCallback((formulaId: string | null) => {
    setHoveredCard(formulaId);
  }, []);

  const handleElementClick = useCallback((elementId: string) => {
    setActiveElement(elementId);
  }, []);

  const closeModal = useCallback(() => {
    setActiveElement(null);
  }, []);

  // Removed heavy GSAP animations for better performance

  return (
    <div
      className="relative w-full overflow-hidden bg-[#030014] py-20 px-4 md:px-8"
      dir="rtl"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050118] to-[#030014] opacity-80"></div>

      {/* Animated background image with parallax */}
      <div className="parallax-bg absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent"></div>
      </div>

      {/* Content container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            آزمایشگاه تولید محتوا
          </h2>

          <div className="divider-line h-1 w-20 mx-auto rounded-full mb-6 bg-gradient-to-r from-purple-500 to-pink-500" />

          <p className="section-description text-gray-300 max-w-2xl mx-auto text-md">
            در استدیو کیوتی، ما با یک فرآیند منظم و خلاقانه، محتوای با کیفیت و
            تأثیرگذار برای کسب و کار شما تولید می‌کنیم
          </p>
        </div>

        {/* Content Elements Lab */}
        <div className="mb-32">
          <h3 className="lab-title text-2xl md:text-3xl font-bold text-white mb-12 text-center">
            عناصر محتوایی
          </h3>

          <div className="flex flex-row overflow-auto gap-5 mb-16">
            {contentElements.map((element) => (
              <ContentElement
                key={element.id}
                element={element}
                onClick={handleElementClick}
              />
            ))}
          </div>
        </div>

        {/* Content Formulas Section */}
        <div className="mb-32">
          <h3 className="formulas-title text-2xl md:text-3xl font-bold text-white mb-12 text-center">
            فرمول‌های محتوایی
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {contentFormulas.map((formula) => (
              <FormulaCard
                key={formula.id}
                formula={formula}
                isActive={activeFormula === formula.id}
                isHovered={hoveredCard === formula.id}
                onClick={handleFormulaClick}
                onHover={handleCardHover}
              />
            ))}
          </div>
        </div>

        {/* Enhanced Interactive Cards Section with Glassmorphism */}
        <div className="mb-32">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-12 text-center">
            چرا آزمایشگاه محتوای ما را انتخاب کنید؟
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Scientific Approach Card */}
            <div
              className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer transition-all duration-700 hover:scale-[1.02]"
              style={{
                background:
                  "linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.05))",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow:
                  "0 25px 50px -12px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              {/* Floating elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse" />
                <div className="absolute bottom-20 right-10 w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 animate-pulse delay-500" />
              </div>

              {/* Glassmorphism content container */}
              <div className="relative z-10 h-full p-8 flex flex-col justify-center items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:bg-white/20">
                  <HiOutlineBeaker className="text-white text-4xl" />
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transition-all duration-500 group-hover:bg-white/15">
                  <h4 className="text-white text-2xl font-bold mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                    رویکرد علمی به محتوا
                  </h4>

                  <p className="text-white/90 mb-6 leading-relaxed text-sm">
                    ما با ترکیب علم و هنر، محتوایی تولید می‌کنیم که نه تنها زیبا
                    و جذاب است، بلکه نتایج قابل اندازه‌گیری برای کسب و کار شما
                    به ارمغان می‌آورد.
                  </p>
                </div>
              </div>
            </div>

            {/* Results-Driven Card */}
            <div
              className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer transition-all duration-700 hover:scale-[1.02]"
              style={{
                background:
                  "linear-gradient(145deg, rgba(16, 185, 129, 0.1), rgba(239, 68, 68, 0.05))",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow:
                  "0 25px 50px -12px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              {/* Floating elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-16 right-8 w-18 h-18 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 animate-bounce" />
                <div className="absolute bottom-16 left-8 w-14 h-14 rounded-full bg-gradient-to-r from-red-400 to-pink-400 animate-bounce delay-700" />
                <div className="absolute top-1/3 right-1/3 w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 animate-bounce delay-300" />
              </div>

              {/* Glassmorphism content container */}
              <div className="relative z-10 h-full p-8 flex flex-col justify-center items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-white/20">
                  <HiOutlineSparkles className="text-white text-4xl" />
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transition-all duration-500 group-hover:bg-white/15">
                  <h4 className="text-white text-2xl font-bold mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-blue-400 transition-all duration-300">
                    نتایج قابل اندازه‌گیری
                  </h4>

                  <p className="text-white/90 mb-6 leading-relaxed text-sm">
                    ما به نتایج واقعی باور داریم. هر محتوایی که تولید می‌کنیم با
                    دقت تحلیل می‌شود تا مطمئن شویم به اهداف کسب و کار شما کمک
                    می‌کند.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats section with Glassmorphism */}
        <div className="mt-24">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-12 text-center">
            آمار عملکرد آزمایشگاه
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                value: "+۱۰۰",
                label: "فرمول محتوایی",
                color: "#8B5CF6",
                icon: HiOutlineBeaker,
              },
              {
                value: "+۵۰۰",
                label: "پروژه موفق",
                color: "#3B82F6",
                icon: HiOutlineSparkles,
              },
              {
                value: "+۹۵٪",
                label: "رضایت مشتری",
                color: "#F59E0B",
                icon: FiZap,
              },
              {
                value: "+۲۰۰٪",
                label: "میانگین رشد",
                color: "#6366F1",
                icon: contentElements[6].icon,
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="group relative text-center p-6 rounded-2xl transition-all duration-500 hover:scale-105 cursor-pointer"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  boxShadow:
                    "0 10px 25px -5px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                {/* Icon with glassmorphism */}
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20">
                  <stat.icon className="text-white text-xl" />
                </div>

                {/* Value */}
                <h3
                  className="text-3xl md:text-4xl font-bold mb-2 transition-all duration-300 group-hover:scale-110"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </h3>

                {/* Label */}
                <p className="text-white/80 text-sm font-medium">
                  {stat.label}
                </p>

                {/* Glassmorphism hover effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-white/5 backdrop-blur-sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action with Glassmorphism */}
        <div className="mt-32 text-center">
          <div
            className="max-w-4xl mx-auto p-8 rounded-3xl transition-all duration-500 hover:scale-[1.02]"
            style={{
              background:
                "linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(245, 158, 11, 0.05))",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow:
                "0 25px 50px -12px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              آماده شروع هستید؟
            </h3>
            <p className="text-white/90 text-lg mb-8 leading-relaxed">
              بیایید با هم محتوایی بسازیم که نه تنها دیده شود، بلکه تأثیر بگذارد
            </p>
            <button
              className="px-12 py-4 rounded-full cursor-pointer bg-gradient-to-r from-purple-500 to-amber-500 text-white font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl backdrop-blur-sm"
              onClick={() => navigateTo("/contact")}
            >
              شروع همکاری
            </button>
          </div>
        </div>
      </div>

      {/* Element Modal with Enhanced Glassmorphism */}
      {activeElement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          {/* Enhanced Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

          {/* Modal Content with Glassmorphism */}
          <div
            className="element-modal relative max-w-md w-full transition-all duration-300"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
              backdropFilter: "blur(25px)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "24px",
              boxShadow:
                "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const element = contentElements.find(
                (e) => e.id === activeElement
              );
              return element ? (
                <div className="p-8">
                  {/* Close Button */}
                  <button
                    className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
                    onClick={closeModal}
                  >
                    ×
                  </button>

                  {/* Element Info */}
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                      <element.icon className="text-white text-3xl" />
                    </div>
                    <div
                      className="text-xl font-bold mb-2"
                      style={{ color: element.color }}
                    >
                      {element.name}
                    </div>
                  </div>

                  {/* Description with glassmorphism container */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-white/90 text-center leading-relaxed">
                      {element.description}
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCreationLab;
