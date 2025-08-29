"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FaTools,
  FaLightbulb,
  FaClipboardCheck,
  FaPencilRuler,
} from "react-icons/fa";

const features = [
  {
    icon: <FaTools size={24} />,
    title: "ساخت سریع محتوا",
    text: "با استفاده از جدیدترین ابزارها و تکنولوژی‌های روز، محتوای شما را در کوتاه‌ترین زمان ممکن تولید می‌کنیم.",
  },
  {
    icon: <FaLightbulb size={24} />,
    title: "اجرای هوشمندانه",
    text: "با بهره‌گیری از هوش مصنوعی و تحلیل داده، بهترین استراتژی محتوا را برای کسب و کار شما پیاده‌سازی می‌کنیم.",
  },
  {
    icon: <FaClipboardCheck size={24} />,
    title: "برنامه‌ریزی دقیق",
    text: "تیم متخصص ما با برنامه‌ریزی دقیق و حساب شده، تمام مراحل تولید محتوا را مدیریت می‌کند.",
  },
  {
    icon: <FaPencilRuler size={24} />,
    title: "طراحی بی‌نظیر",
    text: "خلق محتوای جذاب و منحصر به فرد با استانداردهای روز دنیا برای جلب توجه مخاطبان هدف.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function WhyChooseUs() {
  return (
    <section className="py-16 px-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto text-center"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          چرا کارخانه محتوا؟
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          ما با تجربه و تخصص خود، بهترین راهکارهای تولید محتوا را برای رشد کسب و
          کار شما ارائه می‌دهیم.
        </p>
        <motion.button
          className="bg-[#2563eb] text-white px-6 py-2 rounded-md font-bold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="مشاهده همه"
        >
          <Link href="/gallery" className="text-white">
            مشاهده همه
          </Link>
        </motion.button>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 max-w-5xl mx-auto"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="p-6 rounded-xl shadow-sm flex items-start space-x-4 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300"
          >
            <div className="text-[#2563eb]">{feature.icon}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.text}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="flex justify-center items-center space-x-10 mt-12"
      >
        {["دیجیتال مارکتینگ", "تولید محتوا", "برندینگ", "شبکه‌های اجتماعی"].map(
          (text, index) => (
            <motion.span
              key={index}
              className="text-gray-500 font-semibold"
              whileHover={{ scale: 1.1 }}
            >
              {text}
            </motion.span>
          )
        )}
      </motion.div>
    </section>
  );
}
