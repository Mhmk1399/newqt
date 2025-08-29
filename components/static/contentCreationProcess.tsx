"use client";
import { useState, useEffect, useCallback, memo } from "react";
import VideoPlayer from "../video";
import { contentTypes, processSteps } from "../../data/contentCreationProcess";

// Type definitions
interface ProcessStepProps {
  step: {
    id: string;
    title: string;
    description: string;
    color: string;
    icon: React.ElementType;
  };
  isActive: boolean;
  onClick: (id: string) => void;
}

interface ContentTypeProps {
  type: {
    id: string;
    title: string;
    description: string;
    video: string;
    icon: React.ElementType;
    features: string[];
  };
  onVideoShow: (videoSrc: string) => void;
}

// Memoized components
const ProcessStep = memo<ProcessStepProps>(({ step, isActive, onClick }) => (
  <div
    className="relative text-center cursor-pointer group"
    onClick={() => onClick(step.id)}
  >
    {/* Icon */}
    <div
      className="relative w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 will-change-transform"
      style={{ backgroundColor: step.color }}
    >
      <step.icon className="w-8 h-8 text-white" />

      {/* Floating description box */}
      {isActive && (
        <div
          className="
            absolute -top-10 left-1/2 w-42 -translate-x-1/2 
            md:w-56 p-4 rounded-xl 
            bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg
            text-gray-200 text-sm text-center 
            animate-fadeIn animate-scaleIn
            z-99999
          "
        >
          {step.description}
        </div>
      )}
    </div>

    {/* Title */}
    <h4 className="text-white font-semibold mb-2">{step.title}</h4>
  </div>
));

const ContentTypeCard = memo<ContentTypeProps>(({ type, onVideoShow }) => (
  <div className="bg-gray-900/50 rounded-xl overflow-hidden hover:bg-gray-800/50 transition-colors duration-300">
    <div
      className="relative h-48 bg-gray-800 cursor-pointer group"
      onClick={() => onVideoShow(type.video)}
    >
      <VideoPlayer src={type.video} className="h-full" />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
        </div>
      </div>
    </div>

    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <type.icon className="w-6 h-6 text-white" />
        <h4 className="text-white font-semibold">{type.title}</h4>
      </div>

      <p className="text-gray-300 text-sm mb-4">{type.description}</p>

      <div className="space-y-2">
        {type.features.map((feature: string, idx: number) => (
          <div
            key={idx}
            className="flex items-center gap-2 text-gray-300 text-sm"
          >
            <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
            {feature}
          </div>
        ))}
      </div>
    </div>
  </div>
));

ProcessStep.displayName = "ProcessStep";
ContentTypeCard.displayName = "ContentTypeCard";

const ContentCreationProcess = () => {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showVideo) {
        handleVideoClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [showVideo]);

  const handleStepClick = useCallback((stepId: string) => {
    setActiveStep((prev) => (prev === stepId ? null : stepId));
  }, []);

  const handleVideoShow = useCallback((videoSrc: string) => {
    setShowVideo(videoSrc);
    document.body.style.overflow = "hidden";
  }, []);

  const handleVideoClose = useCallback(() => {
    document.body.style.overflow = "auto";
    setShowVideo(null);
  }, []);

  return (
    <div className="relative w-full bg-[#030014] py-20 px-4 md:px-8" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-b from-[#050118] to-[#030014]"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            فرآیند تولید محتوا
          </h2>
          <div
            className="divider-line h-1 w-20 mx-auto rounded-full mb-6"
            style={{
              background: `linear-gradient(90deg, ${processSteps[0].color}, ${
                processSteps[processSteps.length - 1].color
              })`,
            }}
          />
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            در استدیو کیوتی، ما با یک فرآیند منظم و خلاقانه، محتوای با کیفیت و
            تأثیرگذار برای کسب و کار شما تولید می‌کنیم
          </p>
        </div>

        <div className="mb-20">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-12 text-center">
            مراحل تولید محتوا
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {processSteps.map((step) => (
              <ProcessStep
                key={step.id}
                step={step}
                isActive={activeStep === step.id}
                onClick={handleStepClick}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-12 text-center">
            انواع محتوا
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contentTypes.map((type) => (
              <ContentTypeCard
                key={type.id}
                type={type}
                onVideoShow={handleVideoShow}
              />
            ))}
          </div>
        </div>
      </div>

      {showVideo && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fadeIn">
          <div className="relative w-full max-w-5xl mx-4 h-[80vh] animate-scaleIn">
            <button
              onClick={handleVideoClose}
              className="absolute -top-12 right-0 w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center text-xl transition-colors duration-200 z-20"
            >
              ✕
            </button>
            <div className="w-full h-full rounded-lg overflow-hidden">
              <VideoPlayer
                src={showVideo}
                isModal
                autoPlay
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCreationProcess;
