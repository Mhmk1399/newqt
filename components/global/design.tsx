"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function InteriorDesign() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };
  return (
    <>
      <section
        className="py-16 px-6 bg-white flex flex-col md:flex-row shadow-xl items-center max-w-5xl mx-auto"
        dir="rtl"
      >
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 text-right"
        >
          <motion.h4
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg font-semibold text-gray-500 uppercase tracking-wide"
          >
            برنده جوایز متعدد
          </motion.h4>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            طراحی محتوای حرفه‌ای
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-gray-600 mb-6"
          >
            تیم حرفه‌ای ما با بیش از یک دهه تجربه در زمینه تولید محتوا، آماده
            ارائه خدمات ویژه به کسب و کارهای مختلف است. ما با استفاده از
            جدیدترین متدهای تولید محتوا و بهره‌گیری از تکنولوژی‌های نوین،
            محتوایی منحصر به فرد برای شما خلق می‌کنیم.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mb-4"
          >
            <p className="text-gray-500">مهدی رحمانی</p>
            <p className="font-semibold text-gray-800">مدیر ارشد خلاقیت</p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#2563eb] text-white px-6 py-2 rounded-md"
            aria-label="مطالعه بیشتر"
            onClick={() => setIsModalOpen(true)}
          >
            مطالعه بیشتر
          </motion.button>
        </motion.div>

        <motion.div
          transition={{ duration: 0.8 }}
          className="md:w-1/2 relative mt-10 md:mt-0"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="/assets/images/cam1.jpg"
              alt="طراحی محتوا"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </motion.div>

          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-0 right-0 bg-white p-4 rounded-lg shadow-md translate-x-10 -translate-y-10"
          >
            <p className="text-gray-600 text-sm">
              "تیم کارخانه محتوا با خلاقیت و تخصص خود، محتوایی فراتر از انتظار
              ما تولید کرد."
            </p>
            <p className="text-gray-800 font-semibold mt-2">
              محمد حسین محمدخانی
            </p>
          </motion.div> */}
        </motion.div>
      </section>
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsModalOpen(false)}
              dir="rtl"
            />

            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg 
                    bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl z-50
                    border border-white/20"
              dir="rtl"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                درباره کارخانه محتوا
              </h3>
              <p className="text-gray-600 leading-relaxed">
                کارخانه محتوا با هدف ارائه خدمات حرفه‌ای در زمینه تولید محتوای
                دیجیتال تاسیس شده است. تیم ما متشکل از متخصصان خلاق و با تجربه
                است که با استفاده از دانش روز و تکنولوژی‌های نوین، محتوای منحصر
                به فرد و تاثیرگذار برای کسب و کارها تولید می‌کنند.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 bg-[#2563eb] text-white px-4 py-2 rounded-md"
                onClick={() => setIsModalOpen(false)}
              >
                بستن
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
