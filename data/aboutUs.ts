import {
  IoCheckmarkCircle,
  IoRocketSharp,
  IoTimeOutline,
  IoTrophyOutline,
} from "react-icons/io5";
import { FiUsers, FiTarget, FiTrendingUp, FiAward } from "react-icons/fi";
import { IconType } from "react-icons";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  socialLinks: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
}

// Timeline event interface
interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  icon: IconType;
  color: string;
}

// Value interface
interface CompanyValue {
  id: string;
  title: string;
  description: string;
  icon: IconType;
  color: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "علی محمدی",
    role: "مدیر عامل و بنیانگذار",
    bio: "علی بیش از ۱۰ سال تجربه در زمینه تولید محتوا و بازاریابی دیجیتال دارد. او با چشم‌انداز ایجاد یک آژانس محتوای خلاق، کارخانه محتوا را در سال ۱۳۹۷ تأسیس کرد.",
    image: "/assets/images/cam1.jpg",
    socialLinks: {
      instagram: "https://instagram.com",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
    },
  },
  {
    id: "2",
    name: "سارا رضایی",
    role: "مدیر خلاقیت",
    bio: "سارا با بیش از ۸ سال تجربه در طراحی و تولید محتوای بصری، مسئول هدایت تیم خلاق کارخانه محتوا است. تخصص او در ایجاد استراتژی‌های محتوایی منحصر به فرد است.",
    image: "/assets/images/cam2.jpg",
    socialLinks: {
      instagram: "https://instagram.com",
      linkedin: "https://linkedin.com",
    },
  },
  {
    id: "3",
    name: "محمد حسینی",
    role: "مدیر فنی",
    bio: "محمد با تخصص در توسعه وب و بهینه‌سازی موتورهای جستجو، مسئول تمام جنبه‌های فنی پروژه‌های کارخانه محتوا است. او بیش از ۷ سال تجربه در این زمینه دارد.",
    image: "/assets/images/cam3.jpg",
    socialLinks: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
    },
  },
  {
    id: "4",
    name: "نیلوفر کریمی",
    role: "مدیر روابط مشتریان",
    bio: "نیلوفر با تجربه گسترده در مدیریت پروژه و ارتباط با مشتری، مسئول اطمینان از رضایت مشتریان و تحویل به موقع پروژه‌های کارخانه محتوا است.",
    image: "/assets/images/cam1.jpg",
    socialLinks: {
      instagram: "https://instagram.com",
      linkedin: "https://linkedin.com",
    },
  },
];

// Timeline events
export const timelineEvents: TimelineEvent[] = [
  {
    year: "۱۳۹۷",
    title: "تأسیس کارخانه محتوا",
    description:
      "شروع فعالیت با یک تیم کوچک ۳ نفره و تمرکز بر تولید محتوای متنی",
    icon: IoRocketSharp,
    color: "#8B5CF6", // Violet
  },
  {
    year: "۱۳۹۸",
    title: "گسترش خدمات",
    description: "اضافه کردن خدمات تولید ویدیو و عکاسی به مجموعه خدمات شرکت",
    icon: FiTrendingUp,
    color: "#EC4899", // Pink
  },
  {
    year: "۱۳۹۹",
    title: "همکاری با برندهای بزرگ",
    description: "آغاز همکاری با چندین برند معتبر ملی و بین‌المللی",
    icon: FiUsers,
    color: "#3B82F6", // Blue
  },
  {
    year: "۱۴۰۰",
    title: "توسعه تیم",
    description: "گسترش تیم به بیش از ۱۵ متخصص در حوزه‌های مختلف تولید محتوا",
    icon: FiTarget,
    color: "#10B981", // Emerald
  },
  {
    year: "۱۴۰۱",
    title: "راه‌اندازی آکادمی آموزشی",
    description:
      "تأسیس آکادمی آموزشی برای انتقال دانش و تجربیات به علاقه‌مندان",
    icon: IoTimeOutline,
    color: "#F59E0B", // Amber
  },
  {
    year: "۱۴۰۲",
    title: "کسب جوایز متعدد",
    description:
      "دریافت چندین جایزه ملی در زمینه خلاقیت و نوآوری در تولید محتوا",
    icon: IoTrophyOutline,
    color: "#EF4444", // Red
  },
];

export const companyValues: CompanyValue[] = [
  {
    id: "creativity",
    title: "خلاقیت",
    description:
      "ما به ارائه راه‌حل‌های خلاقانه و منحصر به فرد برای هر مشتری متعهد هستیم.",
    icon: FiAward,
    color: "#8B5CF6", // Violet
  },
  {
    id: "quality",
    title: "کیفیت",
    description:
      "کیفیت برتر در تمام خدمات ما تضمین شده است. ما به کمتر از بهترین راضی نمی‌شویم.",
    icon: IoCheckmarkCircle,
    color: "#EC4899", // Pink
  },
  {
    id: "innovation",
    title: "نوآوری",
    description:
      "همواره به دنبال روش‌های نوین و فناوری‌های پیشرفته برای بهبود خدمات خود هستیم.",
    icon: IoRocketSharp,
    color: "#3B82F6", // Blue
  },
  {
    id: "customer",
    title: "مشتری‌مداری",
    description:
      "رضایت مشتری اولویت اصلی ماست. ما برای ایجاد تجربه‌ای عالی برای مشتریان تلاش می‌کنیم.",
    icon: FiUsers,
    color: "#10B981", // Emerald
  },
];
