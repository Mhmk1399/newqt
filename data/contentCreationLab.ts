import {
  HiOutlineLightBulb,
  HiOutlineChartSquareBar,
  HiOutlineSparkles,
  HiOutlineGlobe,
  HiOutlinePhotograph,
  HiOutlineDocumentText,
  HiOutlineChip,
  HiOutlinePuzzle,
  HiOutlineChatAlt2,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineEye,
} from "react-icons/hi";
import { FiZap, FiTarget, FiAward } from "react-icons/fi";
import { IconType } from "react-icons";

// Define types for our content elements
interface ContentElement {
  id: string;
  name: string;
  description: string;
  icon: IconType;
  color: string;
}

// Define types for content formulas
interface ContentFormula {
  id: string;
  title: string;
  description: string;
  elements: string[];
  result: string;
  video: string;
  color: string;
}

// Define types for content experiments
interface ContentExperiment {
  id: string;
  title: string;
  description: string;
  before: string;
  after: string;
  stats: { label: string; value: string; icon: IconType }[];
  color: string;
}

// Define types for content tools
interface ContentTool {
  id: string;
  title: string;
  description: string;
  icon: IconType;
  color: string;
}

// Content elements (like periodic table elements)
export const contentElements: ContentElement[] = [
  {
    id: "Cr",
    name: "خلاقیت",
    description: "ایده‌های نوآورانه و منحصر به فرد که توجه مخاطب را جلب می‌کند",
    icon: HiOutlineLightBulb,
    color: "#8B5CF6", // Violet
  },
  {
    id: "St",
    name: "استراتژی",
    description: "برنامه‌ریزی هدفمند برای دستیابی به اهداف کسب و کار",
    icon: HiOutlineChartSquareBar,
    color: "#EC4899", // Pink
  },
  {
    id: "Vi",
    name: "بصری",
    description: "عناصر تصویری جذاب که پیام را به شکلی قدرتمند منتقل می‌کنند",
    icon: HiOutlinePhotograph,
    color: "#3B82F6", // Blue
  },
  {
    id: "En",
    name: "تعامل",
    description: "ایجاد ارتباط دوطرفه با مخاطب و تشویق به مشارکت",
    icon: HiOutlineChatAlt2,
    color: "#10B981", // Emerald
  },
  {
    id: "Da",
    name: "داده",
    description: "استفاده از تحلیل داده‌ها برای بهینه‌سازی محتوا",
    icon: HiOutlineChip,
    color: "#F59E0B", // Amber
  },
  {
    id: "Em",
    name: "احساسات",
    description: "برانگیختن احساسات مخاطب برای ایجاد ارتباط عمیق‌تر",
    icon: HiOutlineSparkles,
    color: "#EF4444", // Red
  },
  {
    id: "Au",
    name: "اصالت",
    description: "محتوای اصیل و معتبر که اعتماد مخاطب را جلب می‌کند",
    icon: FiAward,
    color: "#6366F1", // Indigo
  },
  {
    id: "Op",
    name: "بهینه‌سازی",
    description: "بهبود مستمر محتوا برای دستیابی به نتایج بهتر",
    icon: FiTarget,
    color: "#14B8A6", // Teal
  },
];

// Content formulas
export const contentFormulas: ContentFormula[] = [
  {
    id: "formula1",
    title: "فرمول جذب مشتری",
    description: "ترکیبی قدرتمند برای جذب مشتریان جدید و افزایش آگاهی از برند",
    elements: ["Vi", "Em", "En"],
    result: "افزایش ۱۵۰٪ در نرخ تعامل",
    video: "https://arziplus.storage.c2.liara.space/qt/vafadari.mov",
    color: "#00000",
  },
  {
    id: "formula4",
    title: "فرمول وفاداری مشتری",
    description: "ترکیبی عاطفی برای ایجاد ارتباط عمیق و وفاداری بلندمدت",
    elements: ["Em", "En", "Au"],
    result: "افزایش ۹۰٪ در نرخ بازگشت مشتری",
    video: "https://arziplus.storage.c2.liara.space/qt/vafadari.mov",
    color: "#00000",
  },
];

// Content experiments
export const contentExperiments: ContentExperiment[] = [
  {
    id: "experiment1",
    title: "آزمایش محتوای ویدیویی",
    description: "تبدیل محتوای متنی به ویدیوهای کوتاه و جذاب برای افزایش تعامل",
    before: "/assets/images/cam1.jpg",
    after: "/assets/images/cam2.jpg",
    stats: [
      { label: "افزایش تعامل", value: "۳۰۰٪", icon: HiOutlineSparkles },
      { label: "افزایش اشتراک‌گذاری", value: "۲۵۰٪", icon: HiOutlineGlobe },
      { label: "افزایش زمان مشاهده", value: "۴۰۰٪", icon: HiOutlineEye },
    ],
    color: "#00000",
  },
  {
    id: "experiment2",
    title: "آزمایش محتوای تعاملی",
    description:
      "افزودن عناصر تعاملی به محتوای استاتیک برای افزایش مشارکت کاربران",
    before: "/assets/images/cam2.jpg",
    after: "/assets/images/cam3.jpg",
    stats: [
      { label: "افزایش نرخ تبدیل", value: "۱۵۰٪", icon: FiTarget },
      { label: "کاهش نرخ خروج", value: "۶۰٪", icon: HiOutlineX },
      { label: "افزایش زمان حضور", value: "۲۰۰٪", icon: HiOutlineCheck },
    ],
    color: "#00000",
  },
];

// Content tools
export const contentTools: ContentTool[] = [
  {
    id: "tool1",
    title: "آنالیز محتوا",
    description: "تحلیل عمیق محتوای موجود و شناسایی فرصت‌های بهبود",
    icon: HiOutlineChartSquareBar,
    color: "#8B5CF6", // Violet
  },
  {
    id: "tool2",
    title: "تولید ایده",
    description: "خلق ایده‌های نوآورانه و مرتبط با کسب و کار شما",
    icon: HiOutlineLightBulb,
    color: "#EC4899", // Pink
  },
  {
    id: "tool3",
    title: "تولید محتوا",
    description: "ساخت محتوای با کیفیت و جذاب در انواع فرمت‌ها",
    icon: HiOutlineDocumentText,
    color: "#3B82F6", // Blue
  },
  {
    id: "tool4",
    title: "بهینه‌سازی",
    description: "بهبود محتوا برای موتورهای جستجو و تجربه کاربری",
    icon: FiZap,
    color: "#10B981", // Emerald
  },
  {
    id: "tool5",
    title: "توزیع محتوا",
    description: "انتشار هوشمند محتوا در کانال‌های مناسب",
    icon: HiOutlineGlobe,
    color: "#F59E0B", // Amber
  },
  {
    id: "tool6",
    title: "تحلیل نتایج",
    description: "سنجش عملکرد محتوا و ارائه گزارش‌های تحلیلی",
    icon: HiOutlinePuzzle,
    color: "#EF4444", // Red
  },
];
