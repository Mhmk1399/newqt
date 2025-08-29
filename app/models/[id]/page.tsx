"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { FiPhone, FiMail, FiExternalLink } from "react-icons/fi";
import { FaInstagram, FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Link from "next/link";
import HeroImage from "@/components/pages/heromodels";

interface CoWorker {
  _id: string;
  name: string;
  email?: string;
  phoneNumber: string;
  experties: string;
  description?: string;
  images: {
    main?: string;
    thumbnails?: string[];
  };
  resomeLink?: string;
  socialLinks?: {
    instagram?: string;
    x?: string;
    telegram?: string;
    whatsapp?: string;
  };
  projects?: [];
}

export default function CoworkerDetails() {
  const params = useParams();
  const [coworker, setCoworker] = useState<CoWorker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
 
  useEffect(() => {
    const fetchCoworker = async () => {
      try {
        const response = await fetch("/api/coworkers", {
          method: "GET",
          headers: {
            id: params.id as string,
          },
        });
        const result = await response.json();
        if (result.success) {
          setCoworker(result.data);
        }
      } catch (error) {
        console.error("Error fetching coworker:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchCoworker();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!coworker) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-black text-center">
          <h1 className="text-2xl font-bold mb-2">کاربر یافت نشد</h1>
          <p className="text-gray-600">اطلاعات این کاربر در دسترس نیست</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black" dir="rtl">
      {/* Hero Section */}
      <section className="relative w-full h-screen">
        {coworker.images.main ? (
          <HeroImage src={coworker.images.main} alt={coworker.name} />
        ) : (
          <div className="w-full h-full bg-gray-900" />
        )}

        <div className="absolute inset-0 bg-black/40 z-10" />

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
            <div className="max-w-3xl text-white mt-28 md:mt-0">
              <p className="text-sm uppercase tracking-widest  opacity-80">
                {coworker.experties}
              </p>
              <h1 className="text-3xl md:text-7xl font-light leading-tight mb-3 md:mb-6">
                {coworker.name}
              </h1>
              {coworker.description && (
                <p className="md:text-lg text-xs leading-relaxed mb-5 md:mb-8 opacity-90">
                  {coworker.description}
                </p>
              )}
              <button
                onClick={() => {
                  document.getElementById("about")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                className="border border-white cursor-pointer px-8 py-3 text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
              >
                اطلاعات بیشتر
              </button>
            </div>

            {/* Social Links */}
            <div className="hidden md:flex flex-col gap-6 text-white">
              {coworker.socialLinks?.instagram && (
                <Link
                  href={coworker.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-300 transition-colors"
                >
                  <FaInstagram size={20} />
                </Link>
              )}
              {coworker.socialLinks?.x && (
                <Link
                  href={coworker.socialLinks.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-300 transition-colors"
                >
                  <FaXTwitter size={20} />
                </Link>
              )}
              {coworker.socialLinks?.telegram && (
                <Link
                  href={coworker.socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-300 transition-colors"
                >
                  <FaTelegramPlane size={20} />
                </Link>
              )}
              {coworker.socialLinks?.whatsapp && (
                <Link
                  href={coworker.socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-300 transition-colors"
                >
                  <FaWhatsapp size={20} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-32">
        {" "}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2  gap-16 lg:gap-24">
          {/* Left images grid */}
          <div className="grid grid-cols-2 gap-6">
            
            <div className="col-span-2 lg:col-span-1 lg:row-span-2 relative aspect-[3/4] overflow-hidden">
              <Image
                src={coworker.images.main || "/assets/qtlogo.png"}
                alt={coworker.name}
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <div className="hidden lg:block relative aspect-square overflow-hidden">
              <Image
                src={coworker.images.thumbnails?.[0] || "/assets/qtlogo.png"}
                alt={coworker.name}
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <div className="col-span-2 lg:col-span-1 relative aspect-[3/4] overflow-hidden">
              <Image
                src={coworker.images.thumbnails?.[1] || "/assets/qtlogo.png"}
                alt={coworker.name}
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </div>

          {/* Right text */}
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-light mb-8">درباره من</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              {coworker.description ||
                `سلام! من ${coworker.name} هستم. متخصص ${coworker.experties} با سالها تجربه در این زمینه.`}
            </p>
            <div className="space-y-3 pt-6">
              <div className="flex items-center gap-3">
                <FiPhone className="text-gray-400" />
                <span>{coworker.phoneNumber}</span>
              </div>
              {coworker.email && (
                <div className="flex items-center gap-3">
                  <FiMail className="text-gray-400" />
                  <span>{coworker.email}</span>
                </div>
              )}
              {coworker.resomeLink && (
                <a
                  href={coworker.resomeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-black hover:text-gray-600 transition-colors"
                >
                  <FiExternalLink />
                  <span>مشاهده رزومه</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left - Tall portrait */}
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={coworker.images.thumbnails?.[2] || "/assets/qtlogo.png"}
              alt={coworker.name}
              fill
              className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>

          {/* Right - Grid */}
          <div>
            <h3 className="text-4xl md:text-5xl font-light mb-12">پورتفولیو</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 relative aspect-[2/1] overflow-hidden">
                <Image
                  src={coworker.images.thumbnails?.[3] || "/assets/qtlogo.png"}
                  alt={coworker.name}
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={coworker.images.thumbnails?.[4] || "/assets/qtlogo.png"}
                  alt={coworker.name}
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={coworker.images.thumbnails?.[5] || "/assets/qtlogo.png"}
                  alt={coworker.name}
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
