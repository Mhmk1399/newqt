import { IconType } from "react-icons";
import {
  HiOutlineCode,
  HiOutlineDesktopComputer,
  HiOutlineLightBulb,
  HiOutlinePencilAlt,
  HiOutlineCog,
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiOutlineDocumentReport,
  HiOutlineClock,
  HiOutlineThumbUp,
  HiOutlineCamera,
  HiOutlineFilm,
  HiOutlineColorSwatch,
  HiOutlineTemplate,
} from "react-icons/hi";

export interface WorkProject {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  link?: string;
  date: string;
}

interface WorkCategory {
  id: string;
  title: string;
  description: string;
  icon: IconType;
  color: string;
  projects: WorkProject[];
}

// Updated work categories with content for photography and content factory
export const workCategories: WorkCategory[] = [
  {
    id: "web-development",
    title: "توسعه وب",
    description: "وب‌سایت‌های مدرن و واکنش‌گرا با تجربه کاربری عالی",
    icon: HiOutlineCode,
    color: "#8B5CF6", // Violet
    projects: [
      {
        id: "web-1",
        title: "فروشگاه آنلاین مدرن",
        description:
          "طراحی و توسعه یک فروشگاه آنلاین با رابط کاربری مدرن و امکانات پیشرفته پرداخت و مدیریت سبد خرید.",
        image: "/assets/images/cam1.jpg",
        tags: ["React", "Next.js", "Tailwind CSS"],
        link: "https://example.com",
        date: "1402/03/15",
      },
      {
        id: "web-2",
        title: "داشبورد مدیریت محتوا",
        description:
          "سیستم مدیریت محتوای سفارشی با امکان آنالیز داده‌ها و گزارش‌گیری پیشرفته.",
        image: "/assets/images/cam2.jpg",
        tags: ["TypeScript", "React", "Chart.js"],
        link: "https://example.com",
        date: "1402/05/20",
      },
      {
        id: "web-3",
        title: "پلتفرم آموزش آنلاین",
        description:
          "سیستم جامع آموزش آنلاین با قابلیت پخش ویدیو، کوئیز و صدور گواهینامه.",
        image: "/assets/images/cam3.jpg",
        tags: ["Next.js", "MongoDB", "Framer Motion"],
        link: "https://example.com",
        date: "1402/07/10",
      },
    ],
  },
  {
    id: "ui-design",
    title: "طراحی رابط کاربری",
    description: "رابط‌های کاربری زیبا و کاربردی با تمرکز بر تجربه کاربر",
    icon: HiOutlineDesktopComputer,
    color: "#EC4899", // Pink
    projects: [
      {
        id: "ui-1",
        title: "اپلیکیشن موبایل بانکداری",
        description:
          "طراحی رابط کاربری اپلیکیشن موبایل بانکداری با تمرکز بر امنیت و سهولت استفاده.",
        image: "/assets/images/cam2.jpg",
        tags: ["Figma", "UI/UX", "Mobile Design"],
        link: "https://example.com",
        date: "1402/02/05",
      },
      {
        id: "ui-2",
        title: "سیستم رزرو آنلاین",
        description:
          "طراحی رابط کاربری سیستم رزرو آنلاین با قابلیت شخصی‌سازی و تقویم پیشرفته.",
        image: "/assets/images/cam1.jpg",
        tags: ["Adobe XD", "Prototyping", "UI Design"],
        link: "https://example.com",
        date: "1402/04/18",
      },
    ],
  },
  {
    id: "photography",
    title: "عکاسی محتوا",
    description: "عکاسی حرفه‌ای برای تولید محتوای جذاب و تاثیرگذار",
    icon: HiOutlineCamera,
    color: "#3B82F6", // Blue
    projects: [
      {
        id: "photo-1",
        title: "عکاسی محصولات",
        description:
          "عکاسی حرفه‌ای از محصولات برای فروشگاه‌های آنلاین و کاتالوگ‌های تبلیغاتی با تمرکز بر جزئیات و زیبایی‌شناسی.",
        image: "/assets/images/cam3.jpg",
        tags: ["عکاسی محصول", "نورپردازی استودیویی", "پس‌زمینه حرفه‌ای"],
        link: "https://example.com",
        date: "1402/01/25",
      },
      {
        id: "photo-2",
        title: "عکاسی غذا",
        description:
          "عکاسی تخصصی از انواع غذاها برای رستوران‌ها و کافه‌ها با استفاده از تکنیک‌های نورپردازی خاص و چیدمان حرفه‌ای.",
        image: "/assets/images/cam2.jpg",
        tags: ["عکاسی غذا", "استایلینگ", "نورپردازی طبیعی"],
        link: "https://example.com",
        date: "1402/06/12",
      },
      {
        id: "photo-3",
        title: "عکاسی مد و پوشاک",
        description:
          "عکاسی حرفه‌ای از لباس و پوشاک برای برندهای مد و فروشگاه‌های آنلاین با استفاده از مدل‌های حرفه‌ای.",
        image: "/assets/images/cam1.jpg",
        tags: ["عکاسی مد", "مدلینگ", "پس‌تولید حرفه‌ای"],
        link: "https://example.com",
        date: "1402/08/05",
      },
    ],
  },
  {
    id: "content-factory",
    title: "تولید محتوا",
    description: "تولید محتوای خلاقانه و جذاب برای پلتفرم‌های مختلف",
    icon: HiOutlineColorSwatch,
    color: "#10B981", // Emerald
    projects: [
      {
        id: "content-1",
        title: "محتوای شبکه‌های اجتماعی",
        description:
          "تولید محتوای جذاب و تعاملی برای پلتفرم‌های اینستاگرام، لینکدین و تلگرام با هدف افزایش تعامل و فالوور.",
        image: "/assets/images/cam1.jpg",
        tags: ["استراتژی محتوا", "طراحی گرافیک", "کپی‌رایتینگ"],
        link: "https://example.com",
        date: "1402/03/08",
      },
      {
        id: "content-2",
        title: "محتوای وبلاگ",
        description:
          "نگارش مقالات تخصصی و محتوای وبلاگی با رویکرد سئو برای افزایش رتبه سایت در موتورهای جستجو.",
        image: "/assets/images/cam3.jpg",
        tags: ["تولید محتوای سئو", "مقاله‌نویسی", "تحقیق و پژوهش"],
        link: "https://example.com",
        date: "1402/08/20",
      },
      {
        id: "content-3",
        title: "تولید پادکست",
        description:
          "تولید پادکست‌های آموزشی و تخصصی با کیفیت صدای حرفه‌ای و محتوای ارزشمند برای مخاطبان هدف.",
        image: "/assets/images/cam2.jpg",
        tags: ["ضبط صدا", "تدوین صوتی", "تولید محتوای صوتی"],
        link: "https://example.com",
        date: "1402/05/15",
      },
    ],
  },
  {
    id: "instagram-reels",
    title: "ریلز اینستاگرام",
    description: "تولید ویدیوهای کوتاه و جذاب برای افزایش تعامل در اینستاگرام",
    icon: HiOutlineFilm,
    color: "#F59E0B", // Amber
    projects: [
      {
        id: "reels-1",
        title: "ریلز تبلیغاتی محصول",
        description:
          "ساخت ویدیوهای کوتاه و جذاب برای معرفی محصولات با تکنیک‌های روایتگری بصری و موسیقی مناسب.",
        image: "/assets/images/cam2.jpg",
        tags: ["تدوین ویدیو", "موشن گرافیک", "استوری‌تلینگ"],
        link: "https://example.com",
        date: "1402/04/05",
      },
      {
        id: "reels-2",
        title: "ریلز آموزشی",
        description:
          "تولید ویدیوهای آموزشی کوتاه و کاربردی برای ارائه نکات و ترفندهای مفید به مخاطبان.",
        image: "/assets/images/cam1.jpg",
        tags: ["آموزش کوتاه", "ویدیوی توضیحی", "گرافیک متحرک"],
        link: "https://example.com",
        date: "1402/07/15",
      },
      {
        id: "reels-3",
        title: "ریلز سرگرمی",
        description:
          "تولید محتوای سرگرم‌کننده و خلاقانه برای افزایش تعامل و جذب مخاطب جدید در اینستاگرام.",
        image: "/assets/images/cam3.jpg",
        tags: ["محتوای سرگرمی", "ترند اینستاگرام", "افکت‌های ویژه"],
        link: "https://example.com",
        date: "1402/09/10",
      },
    ],
  },
  {
    id: "branding",
    title: "برندینگ",
    description: "ساخت و توسعه هویت بصری منحصر به فرد برای کسب و کارها",
    icon: HiOutlineTemplate,
    color: "#6366F1", // Indigo
    projects: [
      {
        id: "brand-1",
        title: "طراحی هویت بصری",
        description:
          "طراحی لوگو، پالت رنگی، تایپوگرافی و سایر عناصر بصری برای ایجاد هویت منسجم و متمایز برند.",
        image: "/assets/images/cam3.jpg",
        tags: ["طراحی لوگو", "هویت بصری", "برندبوک"],
        link: "https://example.com",
        date: "1402/02/18",
      },
      {
        id: "brand-2",
        title: "بازطراحی برند",
        description:
          "بازطراحی و بروزرسانی هویت بصری برندهای موجود برای ایجاد تصویری مدرن‌تر و متناسب با نیازهای امروز.",
        image: "/assets/images/cam1.jpg",
        tags: ["ریبرندینگ", "طراحی مجدد", "استراتژی برند"],
        link: "https://example.com",
        date: "1402/06/25",
      },
    ],
  },
];

// Define process steps with React icons
 export const processSteps = [
  {
    title: "ایده‌پردازی",
    icon: HiOutlineLightBulb,
    color: workCategories[0].color,
  },
  {
    title: "طراحی",
    icon: HiOutlinePencilAlt,
    color: workCategories[1].color,
  },
  {
    title: "توسعه",
    icon: HiOutlineCog,
    color: workCategories[2].color,
  },
  {
    title: "تحویل",
    icon: HiOutlineSparkles,
    color: workCategories[3].color,
  },
];

// Define stats with React icons
 export const statsData = [
  {
    value: 100,
    label: "مشتری راضی",
    icon: HiOutlineUserGroup,
    color: workCategories[0].color,
  },
  {
    value: 500,
    label: "پروژه موفق",
    icon: HiOutlineDocumentReport,
    color: workCategories[1].color,
  },
  {
    value: 5,
    label: "سال تجربه",
    icon: HiOutlineClock,
    color: workCategories[2].color,
  },
  {
    value: 98,
    label: "رضایت مشتری",
    suffix: "%",
    icon: HiOutlineThumbUp,
    color: workCategories[3].color,
  },
];
