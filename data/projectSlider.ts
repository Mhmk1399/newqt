interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  client: string;
  date: string;
  image: string;
  detailImages: string[];
  technologies: string[];
  link?: string;
  color: string;
}

// Sample projects data with Persian content
export const projects: Project[] = [
  {
    id: "1",
    title: "کمپین دیجیتال مارکتینگ برند لوازم آرایشی",
    description:
      "طراحی و اجرای کمپین جامع دیجیتال مارکتینگ برای برند لوازم آرایشی با هدف افزایش آگاهی از برند و افزایش فروش آنلاین",
    category: "دیجیتال مارکتینگ",
    client: "گلدن بیوتی",
    date: "تیر ۱۴۰۲",
    image: "/assets/images/cam1.jpg",
    detailImages: [
      "/assets/images/cam1.jpg",
      "/assets/images/cam2.jpg",
      "/assets/images/cam3.jpg",
    ],
    technologies: [
      "تولید محتوا",
      "شبکه‌های اجتماعی",
      "تبلیغات کلیکی",
      "ایمیل مارکتینگ",
    ],
    link: "https://example.com/project1",
    color: "#8B5CF6", // Violet
  },
  {
    id: "2",
    title: "بازطراحی وب‌سایت فروشگاه آنلاین",
    description:
      "بازطراحی کامل وب‌سایت فروشگاهی با تمرکز بر تجربه کاربری، سرعت بارگذاری و بهینه‌سازی نرخ تبدیل",
    category: "طراحی وب",
    client: "دیجی‌استور",
    date: "مرداد ۱۴۰۲",
    image: "/assets/images/cam2.jpg",
    detailImages: [
      "/assets/images/cam2.jpg",
      "/assets/images/cam3.jpg",
      "/assets/images/cam1.jpg",
    ],
    technologies: [
      "طراحی UI/UX",
      "توسعه فرانت‌اند",
      "بهینه‌سازی SEO",
      "تست A/B",
    ],
    link: "https://example.com/project2",
    color: "#EC4899", // Pink
  },
  {
    id: "3",
    title: "تولید محتوای ویدیویی برای شبکه‌های اجتماعی",
    description:
      "تولید سری ویدیوهای آموزشی و تبلیغاتی برای استفاده در پلتفرم‌های اینستاگرام، یوتیوب و آپارات",
    category: "تولید ویدیو",
    client: "آکادمی زبان پارسیان",
    date: "شهریور ۱۴۰۲",
    image: "/assets/images/cam3.jpg",
    detailImages: [
      "/assets/images/cam3.jpg",
      "/assets/images/cam1.jpg",
      "/assets/images/cam2.jpg",
    ],
    technologies: ["فیلمبرداری", "تدوین ویدیو", "موشن گرافیک", "صداگذاری"],
    color: "#3B82F6", // Blue
  },
  {
    id: "4",
    title: "استراتژی محتوای بلاگ شرکتی",
    description:
      "طراحی و اجرای استراتژی محتوا برای وبلاگ شرکتی با هدف افزایش ترافیک ارگانیک و تبدیل بازدیدکنندگان به مشتری",
    category: "تولید محتوا",
    client: "تک‌نوین",
    date: "مهر ۱۴۰۲",
    image: "/assets/images/cam1.jpg",
    detailImages: [
      "/assets/images/cam1.jpg",
      "/assets/images/cam2.jpg",
      "/assets/images/cam3.jpg",
    ],
    technologies: [
      "تحقیق کلمات کلیدی",
      "تولید محتوای بلاگ",
      "بهینه‌سازی SEO",
      "بازاریابی محتوا",
    ],
    link: "https://example.com/project4",
    color: "#10B981", // Emerald
  },
  {
    id: "5",
    title: "کمپین تبلیغاتی محصول جدید",
    description:
      "طراحی و اجرای کمپین تبلیغاتی چندکاناله برای معرفی محصول جدید به بازار با استفاده از رسانه‌های دیجیتال و سنتی",
    category: "تبلیغات",
    client: "صنایع غذایی بهار",
    date: "آبان ۱۴۰۲",
    image: "/assets/images/cam2.jpg",
    detailImages: [
      "/assets/images/cam2.jpg",
      "/assets/images/cam3.jpg",
      "/assets/images/cam1.jpg",
    ],
    technologies: [
      "طراحی کمپین",
      "تبلیغات دیجیتال",
      "بیلبورد",
      "تیزر تلویزیونی",
    ],
    color: "#F59E0B", // Amber
  },
];
