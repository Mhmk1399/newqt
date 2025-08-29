"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";

interface CardProps {
  frontCard?: boolean;
  drag?: "x" | false;
  index?: number;
  setIndex?: (index: number) => void;
  imageUrl: string;
  text: string;
  title: string;
}

function Card(props: CardProps) {
  const [dominantColor, setDominantColor] = useState<string>(
    "rgba(37, 99, 235, 0.15)"
  );

  const [exitX, setExitX] = useState<number>(0);
  const x = useMotionValue(0);

  const scale = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  const rotate = useTransform(x, [-150, 0, 150], [-45, 0, 45], {
    clamp: false,
  });
  console.log(exitX);

  useEffect(() => {
    const getImageColor = () => {
      const img = new window.Image();
      img.crossOrigin = "Anonymous";
      img.src = props.imageUrl;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;

        ctx?.drawImage(img, 0, 0);

        const imageData = ctx?.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        ).data;
        if (!imageData) return;

        let r = 0,
          g = 0,
          b = 0;
        const pixelInterval = 5;
        const count = Math.floor(imageData.length / 4 / pixelInterval);

        for (let i = 0; i < imageData.length; i += 4 * pixelInterval) {
          r += imageData[i];
          g += imageData[i + 1];
          b += imageData[i + 2];
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        setDominantColor(`rgba(${r}, ${g}, ${b}, 0.15)`);
      };
    };

    getImageColor();
  }, [props.imageUrl]);

  function handleDragEnd(
    _: MouseEvent | TouchEvent,
    info: { offset: { x: number } }
  ) {
    if (info.offset.x < -100) {
      setExitX(-250);
      props.setIndex?.((props.index ?? 0) + 1);
    }
    if (info.offset.x > 100) {
      setExitX(250);
      props.setIndex?.((props.index ?? 0) + 1);
    }
  }

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto overflow-hidden px-4"
      dir="rtl"
    >
      <motion.div
        className="w-full aspect-[4/3] relative cursor-grab"
        style={{
          x,
          rotate,
        }}
        whileTap={{ cursor: "grabbing" }}
        drag="x"
        dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
        onDragEnd={handleDragEnd}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        // exit={{ scale: 0.5, opacity: 0, x: exitX }}
        // transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 right-2 z-10 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: [0, -10, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        >
          <span className="text-sm text-[#fff] bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            بکشید
          </span>
          <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="text-[#2563eb] rotate-180 fill-current"
          >
            <path d="M20 12L14 18V13H4V11H14V6L20 12Z" />
          </motion.svg>
        </motion.div>
        <motion.div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 30,
            overflow: "hidden",
            scale,
          }}
        >
          <Image
            src={props.imageUrl}
            alt="Card image"
            fill
            className="object-cover rounded-2xl pointer-events-none"
            priority
          />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: dominantColor,
          backdropFilter: "blur(8px)",
          boxShadow: `0 8px 32px ${dominantColor.replace("0.15", "0.2")}`,
        }}
        className="p-8 rounded-2xl border-2"
      >
        <h2
          className="text-3xl font-bold mb-6"
          style={{ color: dominantColor.replace("0.15", "1") }}
        >
          {props.title}
        </h2>
        <p className="text-gray-400 text-lg leading-relaxed">{props.text}</p>
      </motion.div>
    </div>
  );
}

const ImagePan = () => {
  const [index, setIndex] = useState(0);
  const slides = [
    {
      image: "/assets/images/cam3.jpg",
      title: "عکاسی حرفه‌ای",
      text: "لحظات ارزشمند زندگی خود را با تجهیزات پیشرفته دوربین و خدمات عکاسی تخصصی ما ثبت کنید.",
    },
    {
      image: "/assets/images/cam2.jpg",
      title: "استودیو برتر",
      text: "استودیوی حرفه‌ای با نورپردازی کامل و فضای مناسب برای ثبت بهترین عکس‌های شما.",
    },
    {
      image: "/assets/images/download.jpeg",
      title: "نگاه خلاقانه",
      text: "ایده‌های خود را با رویکرد خلاقانه ما در عکاسی به داستان‌های بصری خیره‌کننده تبدیل کنید.",
    },
  ];
  return (
    <div className=" flex flex-col max-w-5xl mx-auto items-center justify-center py-8">
      <div className="relative flex flex-col items-center gap-4 mb-12">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-500/20 rounded-full blur-xl" />
        <div className="absolute -top-2 right-12 w-2 h-2 bg-blue-300 rounded-full animate-ping" />

        <div className="flex items-center gap-4 w-full max-w-2xl">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-[#2563eb]/80 to-transparent" />
          <h3 className="text-3xl font-bold text-center relative z-10 text-[#2563eb]">
            با ما همراه باشید
          </h3>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-[#2563eb]/80 to-transparent" />
        </div>

        <span className="text-gray-500 text-lg font-medium mt-2">
          تولید عکس‌های با کیفیت با عکاسی حرفه‌ای
        </span>
      </div>

      <AnimatePresence mode="wait">
        <Card
          key={index}
          index={index}
          setIndex={setIndex}
          imageUrl={slides[index % slides.length].image}
          title={slides[index % slides.length].title}
          text={slides[index % slides.length].text}
        />
      </AnimatePresence>
    </div>
  );
};
export default ImagePan;
