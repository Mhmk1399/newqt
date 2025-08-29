"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { BsCameraFill } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import { BiTimeFive } from "react-icons/bi";
import { HiArrowLeft } from "react-icons/hi";

const AboutSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-4 py-12"
      dir="rtl"
    >
      <div className="flex flex-col md:flex-row gap-8">
        {/* Stats Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-[#60a5fa] to-[#2563eb] text-white p-8 rounded-3xl md:w-1/3 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <BsCameraFill className="w-6 h-6" />
            <h3 className="text-lg font-bold">آمار کارخانه محتوا</h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <FaUsers className="w-8 h-8 opacity-80" />
              <div>
                <p className="text-5xl font-bold mb-1">۲۰۰+</p>
                <p className="text-sm opacity-90">پروژه تصویربرداری</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <BiTimeFive className="w-8 h-8 opacity-80" />
              <div>
                <p className="text-4xl font-bold mb-1">۱۰+</p>
                <p className="text-sm opacity-90">سال تجربه عکاسی حرفه‌ای</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          className="bg-white rounded-3xl md:w-2/3 overflow-hidden shadow-xl flex flex-col md:flex-row"
          whileHover={{ boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
        >
          <div className="md:w-1/2 p-8 flex flex-col justify-center">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold flex items-center gap-2 mb-6"
            >
              کارخانه <span className="text-[#2563eb]">محتوا</span>
              <HiArrowLeft className="text-[#2563eb]" />
            </motion.h2>

            <div className="space-y-4 text-gray-600">
              <p>
                در کارخانه محتوا، ما با بهره‌گیری از تجهیزات حرفه‌ای و تیم
                متخصص، خدمات تصویربرداری و تولید محتوای باکیفیت ارائه می‌دهیم.
              </p>
              <p>
                تخصص ما در عکاسی صنعتی، تبلیغاتی و تولید محتوای دیجیتال است. با
                استفاده از جدیدترین تجهیزات و تکنیک‌های روز دنیا، محتوایی
                حرفه‌ای برای کسب و کار شما تولید می‌کنیم.
              </p>
            </div>
          </div>

          <motion.div className="md:w-1/2 relative h-[400px] md:h-auto">
            <Image
              src="/assets/images/cam1.jpg"
              alt="استودیو عکاسی حرفه‌ای"
              fill
              className="object-cover border-r-[15px] border-[#60a5fa]/40 rounded-r-full"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent mix-blend-overlay" />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default AboutSection;
