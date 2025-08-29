export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  width: number;
  height: number;
}

// Sample gallery data with Persian content
export const galleryItems: GalleryItem[] = [
  {
    id: "1",
    title: "تولید محتوای ویدیویی",
    description: "ویدیوی تبلیغاتی برای برند لوازم آرایشی با کیفیت ۴K",
    category: "ویدیو",
    image: "/assets/images/cam1.jpg",
    width: 1920,
    height: 1080,
  },
  {
    id: "2",
    title: "عکاسی محصول",
    description: "عکاسی حرفه‌ای از محصولات فروشگاه آنلاین با نورپردازی خاص",
    category: "عکاسی",
    image: "/assets/images/cam2.jpg",
    width: 1200,
    height: 1500,
  },
  {
    id: "3",
    title: "طراحی پوستر",
    description: "طراحی پوستر برای کمپین تبلیغاتی فصل تابستان",
    category: "طراحی",
    image: "/assets/images/cam3.jpg",
    width: 1080,
    height: 1350,
  },
  {
    id: "4",
    title: "محتوای شبکه‌های اجتماعی",
    description: "تولید محتوا برای پلتفرم‌های اینستاگرام و لینکدین",
    category: "شبکه‌های اجتماعی",
    image: "/assets/images/cam1.jpg",
    width: 1080,
    height: 1080,
  },
  {
    id: "5",
    title: "تیزر تبلیغاتی",
    description: "ساخت تیزر ۳۰ ثانیه‌ای برای پخش در رسانه‌های دیجیتال",
    category: "ویدیو",
    image: "/assets/images/cam2.jpg",
    width: 1920,
    height: 1080,
  },
  {
    id: "6",
    title: "عکاسی صنعتی",
    description: "عکاسی از خط تولید کارخانه برای کاتالوگ محصولات",
    category: "عکاسی",
    image: "/assets/images/cam3.jpg",
    width: 2000,
    height: 1333,
  },
  {
    id: "7",
    title: "موشن گرافیک",
    description: "ساخت انیمیشن موشن گرافیک برای معرفی خدمات شرکت",
    category: "انیمیشن",
    image: "/assets/images/cam1.jpg",
    width: 1920,
    height: 1080,
  },
  {
    id: "8",
    title: "طراحی بنر تبلیغاتی",
    description: "طراحی بنر وب برای کمپین تخفیف ویژه",
    category: "طراحی",
    image: "/assets/images/cam2.jpg",
    width: 1600,
    height: 900,
  },
  {
    id: "9",
    title: "عکاسی مدلینگ",
    description: "عکاسی فشن برای کاتالوگ لباس فصل پاییز",
    category: "عکاسی",
    image: "/assets/images/cam3.jpg",
    width: 1200,
    height: 1800,
  },
];

// Categories for filtering
export const categories = [
  { id: "all", name: "همه" },
  { id: "ویدیو", name: "ویدیو" },
  { id: "عکاسی", name: "عکاسی" },
  { id: "طراحی", name: "طراحی" },
  { id: "شبکه‌های اجتماعی", name: "شبکه‌های اجتماعی" },
  { id: "انیمیشن", name: "انیمیشن" },
];
