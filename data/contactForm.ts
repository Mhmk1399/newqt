import { IconType } from "react-icons";
import { IoCall, IoLocation, IoMail } from "react-icons/io5";

interface FormField {
  id: string;
  name: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

// Form data interface
export interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  service: string;
}

// Contact info interface
interface ContactInfo {
  icon: IconType;
  title: string;
  details: string;
  link?: string;
}

// Service option interface
interface ServiceOption {
  id: string;
  name: string;
}

// Form fields configuration
export const formFields: FormField[] = [
  {
    id: "name",
    name: "name",
    label: "نام و نام خانوادگی",
    type: "text",
    placeholder: "نام خود را وارد کنید",
    required: true,
    minLength: 3,
    maxLength: 50,
  },
  {
    id: "email",
    name: "email",
    label: "ایمیل",
    type: "email",
    placeholder: "example@domain.com",
    required: true,
    pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$",
  },
  {
    id: "phone",
    name: "phone",
    label: "شماره تماس",
    type: "tel",
    placeholder: "۰۹۱۲۳۴۵۶۷۸۹",
    required: true,
    pattern: "^(\\+98|0)?9\\d{9}$",
  },
  {
    id: "subject",
    name: "subject",
    label: "موضوع",
    type: "text",
    placeholder: "موضوع پیام خود را وارد کنید",
    required: true,
    minLength: 5,
    maxLength: 100,
  },
];

// Service options
export const serviceOptions: ServiceOption[] = [
  { id: "content-creation", name: "تولید محتوا" },
  { id: "social-media", name: "مدیریت شبکه‌های اجتماعی" },
  { id: "seo", name: "بهینه‌سازی SEO" },
  { id: "video-production", name: "تولید ویدیو" },
  { id: "analytics", name: "تحلیل محتوا" },
  { id: "other", name: "سایر خدمات" },
];

// Contact information
export const contactInfo: ContactInfo[] = [
  {
    icon: IoLocation,
    title: "آدرس",
    details: "تهران، خیابان فلسطین، تقاطع بزرگمهر، پلاک 78",
    link: "https://maps.app.goo.gl/bRB2g1Kx7iMppx8EA",
  },
  {
    icon: IoCall,
    title: "تلفن تماس",
    details: "09015528576",
    link: "tel:02188776655",
  },
  {
    icon: IoMail,
    title: "ایمیل",
    details: "mhmk1399@gmail.com",
    link: "mailto:mhmk1399@gmail.com",
  },
];
