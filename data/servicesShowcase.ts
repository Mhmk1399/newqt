import { IconType } from "react-icons";
import { FaPen, FaShareAlt, FaVideo } from "react-icons/fa";

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: IconType;
  image: string;
  color: string;
  features: {
    title: string;
    description: string;
  }[];
}

export const services: ServiceItem[] = [
  {
    id: "video-art",
    title: "ویدیوهای هنری برای برند شما",
    description:
      "ما ویدیوهایی می‌سازیم که فقط تبلیغ نیستن، بلکه یه اثر هنری‌ان! محتوایی لوکس، خاص و تاثیرگذار برای برندهایی که می‌خوان متفاوت دیده بشن.",
    icon: FaVideo,
    image: "/assets/images/art.webp",
    color: "#967a8e", // Violet
    features: [
      {
        title: "کیفیت سینمایی",
        description: "تصاویر با کیفیت بالا، نورپردازی حرفه‌ای و حس هنری واقعی.",
      },
      {
        title: "روایت برند",
        description: "داستان برندتون رو طوری روایت می‌کنیم که همه بخوان بدونن پشتش کیه.",
      },
      {
        title: "جذاب برای شبکه‌های اجتماعی",
        description: "طراحی شده برای وایرال شدن؛ مناسب برای اینستاگرام، ریلز، و یوتیوب.",
      },
    ],
  },
  {
    id: "social-identity",
    title: "هویت بصری در شبکه‌های اجتماعی",
    description:
      "برندت رو تو شبکه‌های اجتماعی به یه شخصیت واقعی تبدیل کن! از طراحی محتوا تا پست‌گذاری، ما هویت دیجیتال تو رو می‌سازیم.",
    icon: FaShareAlt,
    image: "/assets/images/social.jpg",
    color: "#8673bb", // Pink
    features: [
      {
        title: "استایل برند شخصی",
        description: "طراحی بصری یکتا که با مخاطبات حرف می‌زنه.",
      },
      {
        title: "تقویم محتوایی هوشمند",
        description: "پست‌ها و داستان‌ها دقیقاً وقتی که باید، منتشر می‌شن.",
      },
      {
        title: "محتوای خاص و متفاوت",
        description: "فرمت‌هایی که مخاطب رو غافلگیر می‌کنن و درگیر نگه می‌دارن.",
      },
    ],
  },
  {
    id: "creative-scripts",
    title: "ایده‌پردازی و نگارش خلاق",
    description:
      "قبل از هر ضبط، یه ایده‌ی ناب لازمه! ما با تیم نویسنده و کارگردان‌هامون داستان‌هایی می‌سازیم که دیده می‌شن و تو ذهن می‌مونن.",
    icon: FaPen,
    image: "/assets/images/senario.jpg",
    color: "#88be97", // Emerald
    features: [
      {
        title: "سناریوهای خاص برای برندت",
        description: "دیگه خبری از متن‌های تکراری نیست، هر سناریو خاص خودتونه.",
      },
      {
        title: "نویسندگی تصویری",
        description: "هر کلمه به تصویر تبدیل می‌شه؛ با حس، با سبک، با عمق.",
      },
      {
        title: "الهام از برند و مخاطب",
        description: "ما از دل برند و مخاطبات الهام می‌گیریم، نه از قالب‌های آماده.",
      },
    ],
  },
];
