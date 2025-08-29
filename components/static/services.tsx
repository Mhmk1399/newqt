"use client";
import { useState, useRef, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import { IoArrowUp } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";
import { services } from "../../data/servicesShowcase";
import { makeCall } from "@/utilities/callUtils";
import { useNavigation } from "@/utilities/navigationUtils";

// Memoized service card component
interface Service {
  id: string;
  image: string;
  title: string;
  color: string;
  icon: React.ComponentType;
}

interface ServiceCardProps {
  service: Service;
  isActive?: boolean | null;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
  isMobile: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = memo(
  ({ service, isActive, onHover, onClick, isMobile }) => (
    <div
      className={`
      relative group cursor-pointer overflow-hidden
      ${isMobile ? "w-full" : "h-[280px]"}
      ${isActive === false ? "opacity-40" : "opacity-100"}
      transition-opacity duration-300 will-change-transform
    `}
      onClick={() => onClick(service.id)}
      onMouseEnter={() => onHover(service.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 rounded-2xl border border-white/10"></div>
      </div>

      <div className="relative h-full flex flex-col justify-end p-6 z-10">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
          style={{
            backgroundColor: service.color,
            border: `1px solid ${service.color}`,
          }}
        >
          <span className="text-white text-xl">
            {service.icon && <service.icon />}
          </span>
        </div>
        <h3 className="text-sm md:text-2xl font-bold text-white">
          {service.title}
        </h3>
        <div className="mt-4 flex items-center text-sm text-white font-medium">
          <span>مشاهده جزئیات</span>
          <IoIosArrowBack className="mr-1 text-sm" />
        </div>
      </div>
    </div>
  )
);

ServiceCard.displayName = "ServiceCard";

const ServicesShowcase = () => {
  const [activeService, setActiveService] = useState<string | null>(null);
  const [hoverService, setHoverService] = useState<string | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { navigateTo } = useNavigation();

  const handleNavigateToWorks = useCallback(() => {
    navigateTo("works");
  }, [navigateTo]);

  const handleCallClick = useCallback(() => {
    makeCall({ phoneNumber: "+98-9015528576" });
  }, []);

  const handleServiceClick = useCallback(
    (id: string) => {
      const newActiveService = activeService === id ? null : id;
      setActiveService(newActiveService);

      if (newActiveService && detailsRef.current) {
        setTimeout(() => {
          detailsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    },
    [activeService]
  );

  const handleServiceHover = useCallback((id: string | null) => {
    setHoverService(id);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();

    const debouncedResize = debounce(checkMobile, 150);
    window.addEventListener("resize", debouncedResize);
    return () => window.removeEventListener("resize", debouncedResize);
  }, []);

  // Debounce utility
  function debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Get active service data
  const activeServiceData = services.find(
    (service) => service.id === activeService
  );
  const hoverServiceData = services.find(
    (service) => service.id === hoverService
  );

  // Display color based on active or hover state
  const displayColor =
    activeServiceData?.color || hoverServiceData?.color || services[0].color;

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-[#030014] py-20 px-4 md:px-8"
      dir="rtl"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050118] to-[#030014] opacity-80"></div>

      {/* Content container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-24">
          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-4"
            style={{
              textShadow: "0 0 8px rgba(255, 255, 255, 0.4)",
            }}
          >
            خدمات ما
          </h2>
          <div
            className="h-1 w-20 mx-auto rounded-full mb-6"
            style={{ backgroundColor: displayColor }}
          />
          <p className="text-gray-300 max-w-2xl mx-auto text-xl">
            نگاهی متفاوت به تولید محتوا
          </p>
        </div>

        <div
          className={`${
            isMobile ? "flex flex-col space-y-6" : "grid grid-cols-3 gap-8"
          }`}
        >
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isActive={
                activeService && activeService !== service.id ? false : null
              }
              onHover={handleServiceHover}
              onClick={handleServiceClick}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* Detailed view for active service */}
        {activeService && (
          <div
            ref={detailsRef}
            className="mt-8 bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
          >
            <div className="flex flex-col md:flex-row gap-8">
              {/* Image */}
              <div className="w-full md:w-1/2 h-[250px] relative rounded-xl overflow-hidden">
                <Image
                  src={activeServiceData?.image || ""}
                  alt={activeServiceData?.title || ""}
                  fill
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"
                  style={{
                    background: `linear-gradient(to top, ${activeServiceData?.color}, transparent)`,
                  }}
                ></div>
              </div>

              {/* Content */}
              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                  style={{
                    backgroundColor: `${activeServiceData?.color}`,
                    border: `1px solid ${activeServiceData?.color}`,
                  }}
                >
                  <span className="text-white text-2xl">
                    {activeServiceData?.icon && <activeServiceData.icon />}
                  </span>
                </div>

                <h3 className="text-3xl font-bold text-white mb-4">
                  {activeServiceData?.title}
                </h3>

                <p className="text-gray-300 mb-6">
                  {activeServiceData?.description}
                </p>

                <div>
                  <button
                    className="px-6 py-3 rounded-full text-white font-medium"
                    style={{
                      color: `linear-gradient(90deg, ${activeServiceData?.color}, ${activeServiceData?.color})`,
                      boxShadow: `0 8px 20px -5px ${activeServiceData?.color}`,
                    }}
                  >
                    شروع کنید
                  </button>
                </div>
              </div>
            </div>

            {/* Features list */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeServiceData?.features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4">
                    <span
                      className="text-xl font-bold"
                      style={{ color: activeServiceData?.color }}
                    >
                      {index + 1}
                    </span>
                  </div>
                  <h4 className="text-white font-medium mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <button
                style={{
                  boxShadow: `1px 4px 10px 2px ${activeServiceData?.color}`,
                  border: `1px solid ${activeServiceData?.color}`,
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-white/80 text-sm backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-200"
                onClick={() => {
                  setActiveService(null);
                  window.scrollTo({
                    top: window.innerWidth > 768 ? 1200 : 2500,
                    behavior: "smooth",
                  });
                }}
              >
                <IoArrowUp className="h-4 w-4" />
                <span>بازگشت به بالا</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Call to action section */}
      <div className="relative z-10 mt-32 max-w-4xl mx-auto text-center">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
          آماده تحول در استراتژی محتوای خود هستید؟
        </h3>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
          به برندهایی بپیوندید که به کارخانه محتوا اعتماد می‌کنند تا حضور
          دیجیتال خود را ارتقا دهند و تعامل معنادار ایجاد کنند.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="px-8 py-3 rounded-full text-white font-medium"
            style={{
              background: `linear-gradient(90deg, ${services[0].color}, ${services[1].color})`,
              boxShadow: `0 8px 20px -5px ${services[0].color}`,
            }}
            onClick={handleCallClick}
          >
            رزرو مشاوره
          </button>
          <button
            className="px-8 py-3 rounded-full text-white font-medium bg-white/10 backdrop-blur-sm border border-white/20"
            onClick={handleNavigateToWorks}
          >
            مشاهده نمونه کارها
          </button>
        </div>
        {/* Brands/clients logos */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-0 brands-animation"></div>
      </div>
    </div>
  );
};

export default ServicesShowcase;
