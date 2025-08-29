import { IconType } from "react-icons";
import {
  FaLightbulb,
  FaUsers,
  FaChartLine,
  FaRocket,
  FaAward,
  FaHeadset,
} from "react-icons/fa";

interface ReasonItem {
  id: string;
  title: string;
  description: string;
  icon: IconType;
  image: string;
  color: string;
}

export const reasons: ReasonItem[] = [
  {
    id: "creativity",
    title: "خلاقیت بی‌نظیر",
    description:
      "تیم خلاق ما با ایده‌های نوآورانه، محتوایی منحصر به فرد برای برند شما خلق می‌کند که در میان رقبا متمایز می‌شود.",
    icon: FaLightbulb,
    image: "/assets/images/cam1.jpg",
    color: "#8B5CF6", // Violet
  },
  {
    id: "expertise",
    title: "تخصص حرفه‌ای",
    description:
      "متخصصان ما با سال‌ها تجربه در صنعت محتوا، دانش عمیقی در استراتژی‌های دیجیتال مدرن دارند.",
    icon: FaUsers,
    image: "/assets/images/cam2.jpg",
    color: "#EC4899", // Pink
  },
  {
    id: "results",
    title: "نتایج قابل اندازه‌گیری",
    description:
      "ما بر اساس داده‌ها تصمیم می‌گیریم و نتایج ملموس و قابل اندازه‌گیری را برای کسب و کار شما ارائه می‌دهیم.",
    icon: FaChartLine,
    image: "/assets/images/cam3.jpg",
    color: "#3B82F6", // Blue
  },
  {
    id: "speed",
    title: "سرعت و کارایی",
    description:
      "فرآیندهای بهینه‌شده ما تضمین می‌کند که پروژه‌های شما به موقع و با کیفیت بالا تحویل داده می‌شوند.",
    icon: FaRocket,
    image: "/assets/images/cam1.jpg",
    color: "#10B981", // Emerald
  },
  {
    id: "quality",
    title: "کیفیت برتر",
    description:
      "ما به استانداردهای بالای کیفیت پایبند هستیم و هر محتوایی که تولید می‌کنیم از فرآیند دقیق کنترل کیفیت عبور می‌کند.",
    icon: FaAward,
    image: "/assets/images/cam2.jpg",
    color: "#F59E0B", // Amber
  },
  {
    id: "support",
    title: "پشتیبانی مداوم",
    description:
      "تیم ما همیشه در دسترس است تا به سؤالات شما پاسخ دهد و در طول همکاری، راهنمایی و پشتیبانی لازم را ارائه دهد.",
    icon: FaHeadset,
    image: "/assets/images/cam3.jpg",
    color: "#EF4444", // Red
  },
];
