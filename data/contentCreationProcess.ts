import { IconType } from "react-icons";
import {
  HiOutlineLightBulb,
  HiOutlineDocumentText,
  HiOutlinePencilAlt,
  HiOutlineChartBar,
  HiOutlineShare,
  HiOutlineSparkles,
  HiOutlineCamera,
  HiOutlineVideoCamera,
} from "react-icons/hi";

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  icon: IconType;
  color: string;
  image: string;
}

interface ContentType {
  id: string;
  title: string;
  description: string;
  icon: IconType;
  color: string;
  features: string[];
  video: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  type: string;
  image: string;
  color: string;
}

// Content creation process steps
export const processSteps: ProcessStep[] = [
  {
    id: "ideation",
    title: "ایده‌پردازی",
    description:
      "در این مرحله، ایده‌های خلاقانه برای محتوای شما شکل می‌گیرد. با تحلیل بازار هدف و نیازهای مخاطبان، بهترین مفاهیم را برای کسب و کار شما طراحی می‌کنیم.",
    icon: HiOutlineLightBulb,
    color: "#8B5CF6", // Violet
    image: "/assets/images/cam1.jpg",
  },
  {
    id: "strategy",
    title: "استراتژی محتوا",
    description:
      "استراتژی محتوایی منسجم و هدفمند برای دستیابی به اهداف کسب و کار شما تدوین می‌کنیم. این شامل برنامه‌ریزی زمانی، کانال‌های انتشار و شاخص‌های موفقیت است.",
    icon: HiOutlineDocumentText,
    color: "#EC4899", // Pink
    image: "/assets/images/cam2.jpg",
  },
  {
    id: "creation",
    title: "تولید محتوا",
    description:
      "تیم خلاق ما با استفاده از جدیدترین ابزارها و تکنیک‌ها، محتوای با کیفیت بالا تولید می‌کند. از متن گرفته تا عکس، ویدیو و گرافیک، همه چیز با دقت و ظرافت خلق می‌شود.",
    icon: HiOutlinePencilAlt,
    color: "#3B82F6", // Blue
    image: "/assets/images/cam3.jpg",
  },
  {
    id: "optimization",
    title: "بهینه‌سازی",
    description:
      "محتوای تولید شده برای موتورهای جستجو و پلتفرم‌های مختلف بهینه‌سازی می‌شود تا بیشترین بازدهی و دسترسی‌پذیری را داشته باشد.",
    icon: HiOutlineChartBar,
    color: "#10B981", // Emerald
    image: "/assets/images/cam1.jpg",
  },
  {
    id: "distribution",
    title: "انتشار",
    description:
      "محتوای شما در بهترین زمان و مناسب‌ترین کانال‌ها منتشر می‌شود تا به دست مخاطبان هدف برسد و بیشترین تأثیر را داشته باشد.",
    icon: HiOutlineShare,
    color: "#F59E0B", // Amber
    image: "/assets/images/cam2.jpg",
  },
  {
    id: "analysis",
    title: "تحلیل و بهبود",
    description:
      "عملکرد محتوا را به طور مداوم رصد می‌کنیم و با تحلیل داده‌ها، استراتژی‌ها را بهبود می‌دهیم تا نتایج بهتری حاصل شود.",
    icon: HiOutlineSparkles,
    color: "#EF4444", // Red
    image: "/assets/images/cam3.jpg",
  },
];

// Content types we create
export const contentTypes: ContentType[] = [
  {
    id: "makeup-beauty",
    title: "آرایش و زیبایی",
    description:
      "ترکیبی از فیلم، صدا و احساس — ما روایت‌هایی می‌سازیم که برند شما را نه فقط معرفی، بلکه به یادماندنی می‌کنند.",
    icon: HiOutlineVideoCamera,
    color: "#00000", // Unified color
    features: [
      "فیلم‌های برندینگ با نگاه هنری",
      "ویدیوهای تبلیغاتی مینیمال و عمیق",
      "تیزرهای مفهومی برای پلتفرم‌های لوکس",
      "داستان‌سرایی تصویری با زبان خاص برند شما",
    ],
    video: "https://arziplus.storage.c2.liara.space/qt/arayeshi.mp4",
  },
  {
    id: "medical",
    title: "پزشکی",
    description:
      "هر تصویر و ویدیو یک قاب از دنیای شماست. ما محتوایی تولید می‌کنیم که بیشتر از دیده شدن، حس می‌شود.",
    icon: HiOutlineCamera,
    color: "#00000", // Unified color
    features: [
      "عکاسی مفهومی از محصول و فضا",
      "ترکیب نور، رنگ و روایت",
      "استایل‌های تصویری خاص برای برندهای خاص",
      "محتوای اینستاگرام با ساختار هنری و منحصر‌به‌فرد",
    ],
    video: "https://arziplus.storage.c2.liara.space/qt/videos/clinic.mp4",
  },
  {
    id: "fashion",
    title: "فشن",
    description:
      "قبل از اجرا، هنر در ایده متولد می‌شود. ما برای هر پروژه، یک دنیای مفهومی خلق می‌کنیم که با زبان بصری برندتان هم‌صداست.",
    icon: HiOutlineDocumentText,
    color: "#00000", // Unified color
    features: [
      "ایده‌پردازی خلاقانه برای محتوای برند",
      "اسکریپت‌های شاعرانه و تصویری",
      "طراحی ساختار روایت و کمپین",
      "هویت محتوایی خاص برای برندهای هنردوست",
    ],
    video: "https://arziplus.storage.c2.liara.space/qt/videos/fashion.mp4",
  },
  {
    id: "home-appliances",
    title: "لوازم خانگی",
    description:
      "ترکیبی از فیلم، صدا و احساس — ما روایت‌هایی می‌سازیم که برند شما را نه فقط معرفی، بلکه به یادماندنی می‌کنند.",
    icon: HiOutlineVideoCamera,
    color: "#00000", // Unified color
    features: [
      "فیلم‌های برندینگ با نگاه هنری",
      "ویدیوهای تبلیغاتی مینیمال و عمیق",
      "تیزرهای مفهومی برای پلتفرم‌های لوکس",
      "داستان‌سرایی تصویری با زبان خاص برند شما",
    ],
    video: "https://arziplus.storage.c2.liara.space/qt/videos/lavazemkahne.mp4",
  },
  {
    id: "commercial",
    title: "تجاری",
    description:
      "هر تصویر و ویدیو یک قاب از دنیای شماست. ما محتوایی تولید می‌کنیم که بیشتر از دیده شدن، حس می‌شود.",
    icon: HiOutlineCamera,
    color: "#00000", // Unified color
    features: [
      "عکاسی مفهومی از محصول و فضا",
      "ترکیب نور، رنگ و روایت",
      "استایل‌های تصویری خاص برای برندهای خاص",
      "محتوای اینستاگرام با ساختار هنری و منحصر‌به‌فرد",
    ],
    video: "https://arziplus.storage.c2.liara.space/qt/videos/tejari.mp4",
  },
  {
    id: "product",
    title: "محصول",
    description:
      "قبل از اجرا، هنر در ایده متولد می‌شود. ما برای هر پروژه، یک دنیای مفهومی خلق می‌کنیم که با زبان بصری برندتان هم‌صداست.",
    icon: HiOutlineDocumentText,
    color: "#00000", // Unified color
    features: [
      "ایده‌پردازی خلاقانه برای محتوای برند",
      "اسکریپت‌های شاعرانه و تصویری",
      "طراحی ساختار روایت و کمپین",
      "هویت محتوایی خاص برای برندهای هنردوست",
    ],
    video: "https://arziplus.storage.c2.liara.space/qt/vafadari.mov",
  },
];

// Sample portfolio items
export const portfolioItems: PortfolioItem[] = [
  {
    id: "portfolio-1",
    title: "کمپین محتوایی برند لوازم خانگی",
    type: "استراتژی محتوا",
    image: "/assets/images/cam1.jpg",
    color: processSteps[0].color,
  },
  {
    id: "portfolio-2",
    title: "عکاسی محصولات فروشگاه آنلاین",
    type: "عکاسی محصول",
    image: "/assets/images/cam2.jpg",
    color: processSteps[1].color,
  },
  {
    id: "portfolio-3",
    title: "سری ویدیوهای آموزشی اپلیکیشن",
    type: "ویدیو",
    image: "/assets/images/cam3.jpg",
    color: processSteps[2].color,
  },
  {
    id: "portfolio-4",
    title: "محتوای شبکه‌های اجتماعی رستوران",
    type: "شبکه‌های اجتماعی",
    image: "/assets/images/cam1.jpg",
    color: processSteps[3].color,
  },
  {
    id: "portfolio-5",
    title: "طراحی هویت بصری استارتاپ",
    type: "طراحی گرافیک",
    image: "/assets/images/cam2.jpg",
    color: processSteps[4].color,
  },
];
