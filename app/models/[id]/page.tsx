"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiPhone, FiMail, FiExternalLink, FiArrowLeft } from "react-icons/fi";
import { FaInstagram, FaTelegramPlane, FaWhatsapp, FaUser, FaUserTie, FaImages } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoSparkles, IoPersonCircle } from "react-icons/io5";
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
        const response = await fetch(`/api/coworkers?id=${params.id}`, {
          method: "GET",
        });
        const result = await response.json();
        
        if (result.success) {
          setCoworker(result.data);
        } else {
          console.error("API Error:", result.message);
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
      <div className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full"
          />
          در حال بارگذاری...
        </div>
      </div>
    );
  }

  if (!coworker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] flex items-center justify-center">
        <div className="text-white text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
          >
            <IoPersonCircle className="text-6xl text-white/60 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">همکار یافت نشد</h1>
            <p className="text-white/70 mb-6">اطلاعات این همکار در دسترس نیست</p>
            <Link
              href="/models"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-xl hover:bg-purple-500/30 transition-all"
            >
              <FiArrowLeft />
              بازگشت به لیست همکاران
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Get expertise display info
  const getExpertiseInfo = (expertise: string) => {
    const expertiseMap: { [key: string]: { label: string; icon: string; desc: string } } = {
      model: { label: "مدل", icon: "👤", desc: "مدل عکاسی و تصویربرداری" },
      makeUpArtist: { label: "آرایشگر", icon: "💄", desc: "متخصص آرایش و زیبایی" },
      stylist: { label: "استایلیست", icon: "👗", desc: "متخصص طراحی لباس و استایل" },
      location: { label: "لوکیشن", icon: "📍", desc: "تأمین کننده مکان عکاسی" },
      photoGrapher: { label: "عکاس", icon: "📷", desc: "عکاس حرفه‌ای و تصویربردار" }
    };
    return expertiseMap[expertise] || { label: expertise, icon: "🎯", desc: "متخصص حرفه‌ای" };
  };

  const expertiseInfo = getExpertiseInfo(coworker.experties);

  return (
    <div 
      className="min-h-screen pt-4 bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] relative overflow-hidden"
      dir="rtl"
    >
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            href="/models"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
          >
            <FiArrowLeft className="text-sm" />
            بازگشت به لیست همکاران
          </Link>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-tr-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/20 to-transparent rounded-bl-3xl"></div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Profile Image */}
              <div className="lg:col-span-1">
                <div className="relative w-64 h-64 mx-auto lg:mx-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
                  <div className="relative w-full h-full bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                    {(() => {
                      if (coworker.images?.main) {
                        return (
                          <Image
                            src={coworker.images.main}
                            alt={coworker.name}
                            fill
                            className="object-cover"
                            onError={(e) => console.error("Main image load error:", e)}
                          />
                        );
                      } else {
                        return (
                          <div className="w-full h-full flex items-center justify-center">
                            <IoPersonCircle className="text-6xl text-white/60" />
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="lg:col-span-2 text-center lg:text-right">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
               
                  <div>
                    <h3 className="text-purple-400 text-lg font-semibold">{expertiseInfo.label}</h3>
                    <p className="text-white/70 text-sm">{expertiseInfo.desc}</p>
                  </div>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-4">
                  {coworker.name}
                </h1>

                {coworker.description && (
                  <p className="text-white/80 text-lg leading-relaxed mb-6 max-w-2xl mx-auto lg:mx-0">
                    {coworker.description}
                  </p>
                )}

                {/* Contact Info */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
                    <FiPhone className="text-green-400" />
                    <span className="text-white text-sm">{coworker.phoneNumber}</span>
                  </div>
                  {coworker.email && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
                      <FiMail className="text-blue-400" />
                      <span className="text-white text-sm">{coworker.email}</span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {(coworker.socialLinks?.instagram || coworker.socialLinks?.x || coworker.socialLinks?.telegram || coworker.socialLinks?.whatsapp) && (
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    {coworker.socialLinks?.instagram && (
                      <motion.a
                        href={coworker.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-3 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-xl border border-pink-400/30 text-pink-400 hover:from-pink-500/30 hover:to-rose-500/30 transition-all"
                      >
                        <FaInstagram size={20} />
                      </motion.a>
                    )}
                    {coworker.socialLinks?.x && (
                      <motion.a
                        href={coworker.socialLinks.x}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-3 bg-white/10 rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all"
                      >
                        <FaXTwitter size={20} />
                      </motion.a>
                    )}
                    {coworker.socialLinks?.telegram && (
                      <motion.a
                        href={coworker.socialLinks.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-400/30 text-blue-400 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all"
                      >
                        <FaTelegramPlane size={20} />
                      </motion.a>
                    )}
                    {coworker.socialLinks?.whatsapp && (
                      <motion.a
                        href={coworker.socialLinks.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30 text-green-400 hover:from-green-500/30 hover:to-emerald-500/30 transition-all"
                      >
                        <FaWhatsapp size={20} />
                      </motion.a>
                    )}
                  </div>
                )}

                {/* Resume Link */}
                {coworker.resomeLink && (
                  <div className="mt-6">
                    <motion.a
                      href={coworker.resomeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                    >
                      <FiExternalLink />
                      مشاهده رزومه
                    </motion.a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Portfolio Gallery */}
        {(() => {
          return (coworker.images?.thumbnails && coworker.images.thumbnails.length > 0);
        })() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FaImages className="text-purple-400" />
                گالری تصاویر
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
                {coworker.images?.thumbnails?.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.05 }}
                    className="relative aspect-square overflow-hidden rounded-xl bg-white/5 border border-white/10"
                  >
                    <Image
                      src={image}
                      alt={`${coworker.name} - تصویر ${index + 1}`}
                      fill
                      className="object-cover transition-all duration-300 hover:brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Professional Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* About Section */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaUser className="text-blue-400" />
              درباره من
            </h3>
            <p className="text-white/80 leading-relaxed mb-4">
              {coworker.description || 
                `سلام! من ${coworker.name} هستم. ${expertiseInfo.label} با سالها تجربه در این زمینه. آماده همکاری در پروژه‌های جدید و خلاقانه هستم.`}
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                  <FiPhone className="text-green-400 text-sm" />
                </div>
                <span className="text-white">{coworker.phoneNumber}</span>
              </div>
              
              {coworker.email && (
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                    <FiMail className="text-blue-400 text-sm" />
                  </div>
                  <span className="text-white">{coworker.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills & Expertise */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaUserTie className="text-purple-400" />
              تخصص و مهارت‌ها
            </h3>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-white font-semibold">{expertiseInfo.label}</h4>
                </div>
                <p className="text-white/70 text-sm">{expertiseInfo.desc}</p>
              </div>
              
              {coworker.projects && coworker.projects.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">پروژه‌های انجام شده</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{coworker.projects.length}</span>
                    </div>
                    <span className="text-white/70 text-sm">پروژه تکمیل شده</span>
                  </div>
                </div>
              )}
              
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">وضعیت همکاری</h4>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm">آماده پذیرش پروژه جدید</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Card */}
        {(coworker.socialLinks?.instagram || coworker.socialLinks?.x || coworker.socialLinks?.telegram || coworker.socialLinks?.whatsapp || coworker.resomeLink) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <div className="bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 text-center">
              <h3 className="text-xl font-bold text-white mb-6">ارتباط با {coworker.name}</h3>
              
              <div className="flex flex-wrap items-center justify-center gap-4">
                {coworker.socialLinks?.instagram && (
                  <motion.a
                    href={coworker.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-xl border border-pink-400/30 text-pink-400 hover:from-pink-500/30 hover:to-rose-500/30 transition-all"
                  >
                    <FaInstagram />
                    <span className="text-sm">اینستاگرام</span>
                  </motion.a>
                )}
                
                {coworker.socialLinks?.telegram && (
                  <motion.a
                    href={coworker.socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-400/30 text-blue-400 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all"
                  >
                    <FaTelegramPlane />
                    <span className="text-sm">تلگرام</span>
                  </motion.a>
                )}
                
                {coworker.socialLinks?.whatsapp && (
                  <motion.a
                    href={coworker.socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30 text-green-400 hover:from-green-500/30 hover:to-emerald-500/30 transition-all"
                  >
                    <FaWhatsapp />
                    <span className="text-sm">واتساپ</span>
                  </motion.a>
                )}
                
                {coworker.resomeLink && (
                  <motion.a
                    href={coworker.resomeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                  >
                    <FiExternalLink />
                    <span className="text-sm">مشاهده رزومه</span>
                  </motion.a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
