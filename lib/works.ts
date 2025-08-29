export type WorkExample = {
  id: number;
  title: string;
  description: string;
  category: WorkCategory;
  imageUrl: string;
  videoUrl: string;
  client: string;
  duration: string;
  team: string;
  stats?: {
    views?: number;
    engagement?: string;
    reach?: string;
  };
};

export type WorkCategory =
  | "Content Strategy"
  | "Social Media"
  | "Video Production"
  | "Copywriting"
  | "Graphic Design";

export const workExamples: WorkExample[] = [
  {
    id: 1,
    title: "کمپین داستان برند",
    description: "طراحی مجدد روایت برند با داستان‌سرایی استراتژیک",
    category: "Content Strategy",
    imageUrl: "/assets/images/works/cont1.jpg",
    videoUrl: "assets/videos/video.mp4",
    client: "برند لوازم خانگی ایکس",
    duration: "3 ماه",
    team: "4 نفر",
    stats: {
      views: 150000,
      engagement: "23%",
      reach: "500K+",
    },
  },
  {
    id: 2,
    title: "تولید محتوای شبکه‌های اجتماعی",
    description: "مدیریت کامل صفحات اینستاگرام و لینکدین برند لوازم خانگی",
    category: "Social Media",
    imageUrl: "/assets/images/works/cont2.png",
    videoUrl: "assets/videos/video.mp4",
    client: "برند لوازم خانگی ایکس",
    duration: "3 ماه",
    team: "4 نفر",
    stats: {
      views: 280000,
      engagement: "18%",
      reach: "750K+",
    },
  },
  {
    id: 3,
    title: "ویدیو تبلیغاتی محصول",
    description: "ساخت تیزر تبلیغاتی برای محصول جدید با تکنیک موشن گرافیک",
    category: "Video Production",
    imageUrl: "/assets/images/works/cont3.png",
    videoUrl: "assets/videos/video.mp4",
    client: "برند لوازم خانگی ایکس",
    duration: "3 ماه",
    team: "4 نفر",
    stats: {
      views: 420000,
      engagement: "31%",
      reach: "1M+",
    },
  },
  {
    id: 4,
    title: "متن‌نویسی وبسایت",
    description: "نگارش محتوای سئو محور برای صفحات اصلی وبسایت فروشگاهی",
    category: "Copywriting",
    imageUrl: "/assets/images/works/cop1.jpg",
    videoUrl: "assets/videos/video.mp4",
    client: "برند لوازم خانگی ایکس",
    duration: "3 ماه",
    team: "4 نفر",
    stats: {
      views: 95000,
      engagement: "15%",
      reach: "300K+",
    },
  },
  {
    id: 5,
    title: "طراحی هویت بصری",
    description: "طراحی لوگو و ست اداری کامل برای برند استارتاپی",
    category: "Graphic Design",
    imageUrl: "/assets/images/works/grap1.jpeg",
    videoUrl: "assets/videos/video.mp4",
    client: "برند لوازم خانگی ایکس",
    duration: "3 ماه",
    team: "4 نفر",
    stats: {
      views: 180000,
      engagement: "25%",
      reach: "450K+",
    },
  },
  {
    id: 6,
    title: "استراتژی محتوای سالانه",
    description: "تدوین تقویم محتوایی یکساله برای برند لوازم آرایشی",
    category: "Content Strategy",
    imageUrl: "/assets/images/works/cont1.jpg",
    videoUrl: "assets/videos/video.mp4",
    client: "برند لوازم خانگی ایکس",
    duration: "3 ماه",
    team: "4 نفر",
    stats: {
      views: 320000,
      engagement: "28%",
      reach: "800K+",
    },
  },
  {
    id: 7,
    title: "کمپین تیک‌تاک",
    description: "اجرای کمپین ویدیویی برای جذب مخاطب نسل جدید",
    category: "Social Media",
    imageUrl: "/assets/images/works/soc1.jpeg",
    videoUrl: "assets/videos/video.mp4",
    client: "برند لوازم خانگی ایکس",
    duration: "3 ماه",
    team: "4 نفر",
    stats: {
      views: 890000,
      engagement: "35%",
      reach: "2M+",
    },
  },
  {
    id: 8,
    title: "مستند برند",
    description: "ساخت مستند کوتاه از پشت صحنه تولید محصولات",
    category: "Video Production",
    imageUrl: "/assets/images/works/vid1.jpg",
    videoUrl: "assets/videos/video.mp4",
    client: "برند لوازم خانگی ایکس",
    duration: "3 ماه",
    team: "4 نفر",
    stats: {
      views: 250000,
      engagement: "27%",
      reach: "600K+",
    },
  },
  {
    id: 9,
    title: "محتوای وبلاگ",
    description: "تولید محتوای تخصصی برای وبلاگ صنعت ساختمان",
    category: "Copywriting",
    imageUrl: "/assets/images/works/cop2.jpg",
    videoUrl: "assets/videos/video.mp4",
    client: "برند لوازم خانگی ایکس",
    duration: "3 ماه",
    team: "4 نفر",
    stats: {
      views: 135000,
      engagement: "19%",
      reach: "400K+",
    },
  },
  {
    id: 10,
    title: "طراحی کاتالوگ محصولات",
    description: "طراحی کاتالوگ دیجیتال برای محصولات صنعتی",
    category: "Graphic Design",
    imageUrl: "/assets/images/works/grap1.jpeg",
    videoUrl: "assets/videos/video.mp4",
    client: "برند لوازم خانگی ایکس",
    duration: "3 ماه",
    team: "4 نفر",
    stats: {
      views: 210000,
      engagement: "22%",
      reach: "550K+",
    },
  },
  {
    id: 11,
    title: "کمپین ایمیل مارکتینگ",
    description: "طراحی و اجرای کمپین ایمیلی برای مشتریان وفادار",
    category: "Content Strategy",
    imageUrl: "/assets/images/works/cont3.png",
    videoUrl: "assets/videos/video.mp4",
    client: "برند لوازم خانگی ایکس",
    duration: "3 ماه",
    team: "4 نفر",
    stats: {
      views: 175000,
      engagement: "24%",
      reach: "420K+",
    },
  },
  {
    id: 12,
    title: "مدیریت پیج اینفلوئنسر",
    description: "تولید محتوا و مدیریت صفحه شخصی اینفلوئنسر لایف‌استایل",
    category: "Social Media",
    imageUrl: "/assets/images/works/soc2.png",
    videoUrl: "assets/videos/video.mp4",
    client: "برند لوازم خانگی ایکس",
    duration: "3 ماه",
    team: "4 نفر",
    stats: {
      views: 520000,
      engagement: "29%",
      reach: "1.2M+",
    },
  },
  {
    id: 13,
    title: "ویدیو آموزشی محصول",
    description: "تولید ویدیوهای آموزشی برای اپلیکیشن موبایل",
    category: "Video Production",
    imageUrl: "/assets/images/works/vid2.jpg",
    videoUrl: "assets/videos/video.mp4",
    client: "برند لوازم خانگی ایکس",
    duration: "3 ماه",
    team: "4 نفر",
    stats: {
      views: 310000,
      engagement: "26%",
      reach: "850K+",
    },
  },
  {
    id: 14,
    title: "متن تبلیغاتی گوگل",
    description: "نگارش متن‌های تبلیغاتی برای کمپین گوگل ادز",
    category: "Copywriting",
    imageUrl: "/assets/images/works/cop3.webp",
    videoUrl: "assets/videos/video.mp4",
    client: "برند لوازم خانگی ایکس",
    duration: "3 ماه",
    team: "4 نفر",
    stats: {
      views: 145000,
      engagement: "17%",
      reach: "380K+",
    },
  },
  {
    id: 15,
    title: "طراحی پست اینستاگرام",
    description: "طراحی قالب پست‌های اینستاگرام برای برند غذایی",
    category: "Graphic Design",
    imageUrl: "/assets/images/works/grap3.webp",
    videoUrl: "assets/videos/video.mp4",
    client: "برند لوازم خانگی ایکس",
    duration: "3 ماه",
    team: "4 نفر",
    stats: {
      views: 230000,
      engagement: "21%",
      reach: "620K+",
    },
  },
];
