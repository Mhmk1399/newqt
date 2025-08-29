"use client";
import Image from "next/image";
import { motion } from "framer-motion";

const AboutWelcome = () => {
  return (
    <section className="relative flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto p-6">
      <div className="relative w-full md:w-1/2 h-[500px]">
        <Image
          src="/assets/images/cam3.jpg"
          alt="کارخانه محتوا"
          layout="fill"
          objectFit="cover"
          className="rounded-lg shadow-lg"
        />
        <div className="absolute bottom-6 left-6 bg-white p-3 gap-3 flex items-center shadow-lg rounded-lg">
          <button className="bg-black text-white w-10 h-10 flex items-center justify-center rounded-full">
            ▶
          </button>
          <span className="mr-3 text-sm font-medium">تماشا</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white p-8 rounded-lg z-50 shadow-lg md:w-1/2 md:-mr-20"
        dir="rtl"
      >
        <p className="text-sm text-gray-500 font-semibold">
          به کارخانه محتوا خوش آمدید
        </p>
        <h2 className="text-3xl font-bold mt-2">
          ایده‌های خلاقانه <br /> طراحی‌های حرفه‌ای
        </h2>
        <p className="text-gray-500 mt-4">
          کارخانه محتوا با بیش از یک دهه تجربه در تولید محتوای دیجیتال، آماده
          ارائه خدمات حرفه‌ای در زمینه تولید محتوای متنی، تصویری و ویدیویی است.
          تیم متخصص ما با استفاده از جدیدترین تکنولوژی‌های روز دنیا، محتوای
          منحصر به فرد شما را خلق می‌کند.
        </p>
        <button className="mt-6 border-2 border-[#2563eb] hover:bg-[#2563eb] hover:text-white transition-colors duration-300 text-[#2563eb] px-6 py-2 rounded-md">
          شروع کنید
        </button>
      </motion.div>

      <div className="mt-10 flex gap-10">
        <div className="text-center">
          <p className="text-3xl font-bold">۱۰ +</p>
          <p className="text-gray-500">سال تجربه</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold">۱۲۵۰ +</p>
          <p className="text-gray-500">پروژه موفق</p>
        </div>
      </div>
    </section>
  );
};

export default AboutWelcome;
