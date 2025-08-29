"use client";
import { motion } from "framer-motion";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

const contactItems = [
  {
    icon: <FaPhone className="text-[#2563eb]" size={28} />,
    title: "تماس مستقیم",
    info: "۰۲۱-۱۲۳۴۵۶۷۸",
    subInfo: "شنبه تا پنجشنبه - ۹ صبح تا ۶ عصر",
    action: "tel:+982112345678",
  },
  {
    icon: <FaEnvelope className="text-[#2563eb]" size={28} />,
    title: "ایمیل",
    info: "info@contentfactory.ir",
    subInfo: "پاسخگویی در کمتر از ۲۴ ساعت",
    action: "mailto:info@contentfactory.ir",
  },
  {
    icon: <FaMapMarkerAlt className="text-[#2563eb]" size={28} />,
    title: "آدرس دفتر مرکزی",
    info: "تهران، خیابان ولیعصر، برج محتوا",
    subInfo: "کد پستی: ۱۲۳۴۵۶۷۸۹۰",
    action: "https://maps.google.com",
  },
];

const socialLinks = [
  { icon: <FaWhatsapp size={24} />, url: "https://wa.me/+989123456789" },
  {
    icon: <FaInstagram size={24} />,
    url: "https://instagram.com/contentfactory",
  },
  {
    icon: <FaLinkedin size={24} />,
    url: "https://linkedin.com/company/contentfactory",
  },
];

export default function ContactInfo() {
  return (
    <div className="py-20" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto px-6"
      >
        <div className="relative flex flex-col items-center gap-4 mb-16">
          <div className="absolute -top-6  w-32 h-32 bg-[#2563eb]/20 rounded-full blur-xl" />

          <div className="flex items-center gap-4 w-full max-w-2xl">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[#2563eb]/80 to-transparent" />
            <h2 className="text-3xl font-bold text-center relative z-10 text-[#2563eb]">
              راه‌های ارتباطی با ما
            </h2>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-[#2563eb]/80 to-transparent" />
          </div>

          <span className="text-gray-600 text-lg font-medium mt-2 max-w-2xl mx-auto text-center">
            تیم ما آماده پاسخگویی به تمامی سوالات شما در مورد خدمات تولید محتوا
            است
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {contactItems.map((item, index) => (
            <motion.a
              key={index}
              href={item.action}
              initial={{ y: 20, opacity: 1 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="bg-[#60a5fa]/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {item.title}
              </h3>
              <p className="text-[#2563eb] font-semibold mb-2">{item.info}</p>
              <p className="text-gray-500 text-sm">{item.subInfo}</p>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            ما را در شبکه‌های اجتماعی دنبال کنید
          </h3>
          <div className="flex justify-center gap-6">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                className="text-[#2563eb] hover:text-[#60a5fa] transition-colors duration-300"
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16 p-6 bg-gradient-to-r from-[#2563eb]/5 to-[#60a5fa]/5 rounded-2xl text-center"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            نیاز به مشاوره دارید؟
          </h3>
          <p className="text-gray-600 mb-4">
            کارشناسان ما آماده پاسخگویی به سوالات شما هستند
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#2563eb] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#60a5fa] transition-colors duration-300"
          >
            درخواست مشاوره رایگان
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
