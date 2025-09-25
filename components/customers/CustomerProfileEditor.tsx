"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaPhone,
  FaBuilding,
  FaIndustry,
  FaMapMarkerAlt,
  FaGlobe,
  FaStar,
  FaEdit,
  FaSave,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaShieldAlt,
} from "react-icons/fa";
import { IoSparkles, IoClose } from "react-icons/io5";
import { BiBuilding, BiMap } from "react-icons/bi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface DecodedToken {
  userId: string;
  phoneNumber: string;
  name: string;
  userType: "user" | "customer" | "coworker" | "admin";
  exp: number;
}

interface CustomerProfile {
  _id?: string;
  name: string;
  phoneNumber: string;
  businessName: string;
  businessScale: "startup" | "small" | "medium" | "large" | "enterprise" | "";
  address: string;
  website: string;
  isActive: boolean;
  isVip: boolean;
  verifiedAt?: Date;
  createdAt?: string;
  updatedAt?: string;
}

const CustomerProfileEditor: React.FC = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);
  const [profile, setProfile] = useState<CustomerProfile>({
    name: "",
    phoneNumber: "",
    businessName: "",
    businessScale: "",
    address: "",
    website: "",
    isActive: true,
    isVip: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  const businessScaleOptions = [
    { value: "startup", label: "استارت‌آپ", icon: "🚀", desc: "شرکت نوپا با ایده‌های خلاقانه" },
    { value: "small", label: "کوچک", icon: "🏪", desc: "کسب‌وکار محلی با تیم کوچک" },
    { value: "medium", label: "متوسط", icon: "🏢", desc: "شرکت در حال رشد با حضور منطقه‌ای" },
    { value: "large", label: "بزرگ", icon: "🏬", desc: "سازمان بزرگ با حضور ملی" },
    { value: "enterprise", label: "سازمانی", icon: "🏭", desc: "شرکت بین‌المللی با حضور جهانی" }
  ];

  // Extract user info from token
  useEffect(() => {
    const extractUserFromToken = () => {
      try {
        const token =
          localStorage.getItem("userToken") || localStorage.getItem("token");

        if (!token) {
          toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
          router.push("/auth");
          return;
        }

        const decoded = JSON.parse(atob(token.split(".")[1])) as DecodedToken;

        if (decoded.exp && decoded.exp < Date.now() / 1000) {
          toast.error("جلسه شما منقضی شده است. لطفا مجدداً وارد شوید");
          localStorage.removeItem("userToken");
          localStorage.removeItem("token");
          router.push("/auth");
          return;
        }

        if (decoded.userType !== "customer") {
          toast.error("دسترسی محدود به مشتریان");
          router.push("/");
          return;
        }

        setUserInfo(decoded);
      } catch (error) {
        console.error("Error decoding token:", error);
        toast.error("خطا در تشخیص هویت. لطفا مجدداً وارد شوید");
        router.push("/auth");
      }
    };

    extractUserFromToken();
  }, [router]);

  // Fetch customer profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userInfo?.userId) return;

      setLoading(true);
      try {
        const token =
          localStorage.getItem("userToken") || localStorage.getItem("token");
        const response = await fetch(`/api/customers?id=${userInfo.userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (result.success && result.data) {
          setProfile(result.data);
          setProfileExists(true);
        } else {
          // Profile doesn't exist, initialize with token data
          setProfile(prev => ({
            ...prev,
            name: userInfo.name || "",
            phoneNumber: userInfo.phoneNumber || "",
          }));
          setIsEditing(true); // Auto-enable editing for new profiles
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("خطا در دریافت اطلاعات");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userInfo]);

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!profile.name.trim()) {
      newErrors.name = "نام الزامی است";
    }

    if (!profile.businessName.trim()) {
      newErrors.businessName = "نام کسب‌وکار الزامی است";
    }

    if (profile.website && !/^https?:\/\/.+/.test(profile.website)) {
      newErrors.website = "آدرس وب‌سایت باید با http:// یا https:// شروع شود";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const token =
        localStorage.getItem("userToken") || localStorage.getItem("token");

      const method = profileExists ? "PUT" : "POST";
      const url = profileExists ? `/api/customers?id=${profile._id}` : "/api/customers";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to save profile");
      }

      if (!profileExists) {
        setProfile(result.data);
        setProfileExists(true);
      }

      setIsEditing(false);
      setShowSuccessModal(true);
      toast.success("اطلاعات با موفقیت ذخیره شد! 🎉");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("خطا در ذخیره اطلاعات");
    } finally {
      setSaving(false);
    }
  };

  // Handle input change
  const handleInputChange = (field: keyof CustomerProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full"
          />
          در حال بارگذاری...
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] flex items-center justify-center">
        <div className="text-white text-xl">خطا در تشخیص هویت</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] relative overflow-hidden"
      dir="rtl"
    >
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-3">
            پروفایل کسب‌وکار
          </h1>
          <p className="text-white/70 text-lg">
            خوش آمدید {userInfo.name} - مدیریت اطلاعات کسب‌وکار شما
          </p>
        </motion.div>

        {/* Profile Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${profile.isVip ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}>
                  {profile.isVip ? <FaStar className="text-white text-lg" /> : <FaUser className="text-white text-lg" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{profile.name || "نام کاربری"}</h2>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${profile.isVip ? 'bg-yellow-400/20 text-yellow-300' : 'bg-blue-400/20 text-blue-300'}`}>
                      {profile.isVip ? "VIP مشتری" : "مشتری عادی"}
                    </span>
                    {profile.verifiedAt && (
                      <span className="px-3 py-1 rounded-full text-sm bg-green-400/20 text-green-300 flex items-center gap-1">
                        <FaShieldAlt />
                        تایید شده
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(!isEditing)}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  isEditing
                    ? "bg-red-500/20 text-red-300 border border-red-400/30"
                    : "bg-purple-500/20 text-purple-300 border border-purple-400/30 hover:bg-purple-500/30"
                }`}
              >
                {isEditing ? (
                  <>
                    <FaTimes />
                    لغو ویرایش
                  </>
                ) : (
                  <>
                    <FaEdit />
                    ویرایش اطلاعات
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Basic Information */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FaUser className="text-purple-400" />
                اطلاعات شخصی
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    نام کامل *
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={!isEditing}
                    className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all ${
                      !isEditing ? "opacity-60 cursor-not-allowed" : ""
                    } ${errors.name ? "border-red-400/50" : ""}`}
                    placeholder="نام کامل خود را وارد کنید"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    شماره تلفن
                  </label>
                  <input
                    type="text"
                    value={profile.phoneNumber}
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/60 cursor-not-allowed"
                    placeholder="شماره تلفن"
                  />
                  <p className="text-white/40 text-xs mt-1">
                    شماره تلفن قابل تغییر نیست
                  </p>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FaBuilding className="text-blue-400" />
                اطلاعات کسب‌وکار
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    نام کسب‌وکار *
                  </label>
                  <input
                    type="text"
                    value={profile.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    disabled={!isEditing}
                    className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all ${
                      !isEditing ? "opacity-60 cursor-not-allowed" : ""
                    } ${errors.businessName ? "border-red-400/50" : ""}`}
                    placeholder="نام شرکت یا کسب‌وکار خود را وارد کنید"
                  />
                  {errors.businessName && (
                    <p className="text-red-400 text-xs mt-1">{errors.businessName}</p>
                  )}
                </div>

                {/* Business Scale */}
                <div>
                  <label className="block text-white/70 text-sm mb-3">
                    مقیاس کسب‌وکار
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {businessScaleOptions.map((option) => (
                      <motion.div
                        key={option.value}
                        whileHover={isEditing ? { scale: 1.02 } : {}}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          profile.businessScale === option.value
                            ? "bg-purple-500/20 border-purple-400/50 text-white"
                            : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
                        } ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                        onClick={() => isEditing && handleInputChange("businessScale", option.value)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{option.icon}</span>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs opacity-70">{option.desc}</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    آدرس
                  </label>
                  <textarea
                    value={profile.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all resize-none ${
                      !isEditing ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    placeholder="آدرس کامل کسب‌وکار خود را وارد کنید"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    وب‌سایت
                  </label>
                  <input
                    type="url"
                    value={profile.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    disabled={!isEditing}
                    className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all ${
                      !isEditing ? "opacity-60 cursor-not-allowed" : ""
                    } ${errors.website ? "border-red-400/50" : ""}`}
                    placeholder="https://example.com"
                  />
                  {errors.website && (
                    <p className="text-red-400 text-xs mt-1">{errors.website}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Account Status */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">وضعیت حساب</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">نوع حساب:</span>
                  <span className={profile.isVip ? "text-yellow-400" : "text-blue-400"}>
                    {profile.isVip ? "VIP" : "عادی"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">وضعیت:</span>
                  <span className={profile.isActive ? "text-green-400" : "text-red-400"}>
                    {profile.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </div>
                {profile.verifiedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">تایید شده:</span>
                    <span className="text-green-400 flex items-center gap-1">
                      <FaCheck className="text-sm" />
                      بله
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">آمار سریع</h3>
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-purple-400 text-sm">کامل بودن پروفایل</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.round(
                            ((profile.name ? 1 : 0) +
                            (profile.businessName ? 1 : 0) +
                            (profile.businessScale ? 1 : 0) +
                            (profile.address ? 1 : 0) +
                            (profile.website ? 1 : 0)) / 5 * 100
                          )}%`
                        }}
                      />
                    </div>
                    <span className="text-white text-sm">
                      {Math.round(
                        ((profile.name ? 1 : 0) +
                        (profile.businessName ? 1 : 0) +
                        (profile.businessScale ? 1 : 0) +
                        (profile.address ? 1 : 0) +
                        (profile.website ? 1 : 0)) / 5 * 100
                      )}%
                    </span>
                  </div>
                </div>
                {profile.createdAt && (
                  <div className="text-center text-white/60 text-sm">
                    عضو از {new Date(profile.createdAt).toLocaleDateString("fa-IR")}
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                {saving ? (
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                    />
                    در حال ذخیره...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <FaSave />
                    ذخیره اطلاعات
                  </div>
                )}
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <FaCheck className="text-white text-2xl" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">موفقیت آمیز!</h3>
                <p className="text-white/70 mb-6">اطلاعات شما با موفقیت ذخیره شد</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSuccessModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium"
                >
                  عالی!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerProfileEditor;