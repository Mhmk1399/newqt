"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaUser,
  FaUserTie,
  FaEdit,
  FaTimes,
  FaSave,
  FaCheckCircle,
  FaTimesCircle,
  FaInstagram,
  FaTelegram,
  FaWhatsapp,
  FaLink,
  FaImage,
  FaUpload,
} from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import { FaXTwitter } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  DecodedToken,
  getUserFromToken,
  getAuthHeader,
} from "@/utilities/jwtUtils";
import ImageUploadModal from "@/components/modals/ImageUploadModal";
import Image from "next/image";

interface CoWorkerProfile {
  _id?: string;
  name: string;
  email: string;
  phoneNumber: string;
  experties:
    | "model"
    | "makeUpArtist"
    | "stylist"
    | "location"
    | "photoGrapher"
    | "";
  description: string;
  images: {
    main: string;
    thumbnails: string[];
  };
  resomeLink: string;
  socialLinks: {
    instagram: string;
    x: string;
    telegram: string;
    whatsapp: string;
  };
  aprovedBy?: {
    name: string;
  };
  isApprove: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const CoWorkerProfileEditor: React.FC = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);
  const [profile, setProfile] = useState<CoWorkerProfile>({
    name: "",
    email: "",
    phoneNumber: "",
    experties: "",
    description: "",
    images: {
      main: "",
      thumbnails: [],
    },
    resomeLink: "",
    socialLinks: {
      instagram: "",
      x: "",
      telegram: "",
      whatsapp: "",
    },
    isApprove: false,
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const expertiesOptions = [
    {
      value: "model",
      label: "مدل",
      icon: "👤",
      desc: "مدل عکاسی و تصویربرداری",
    },
    {
      value: "makeUpArtist",
      label: "آرایشگر",
      icon: "💄",
      desc: "متخصص آرایش و زیبایی",
    },
    {
      value: "stylist",
      label: "استایلیست",
      icon: "👗",
      desc: "متخصص طراحی لباس و استایل",
    },
    {
      value: "location",
      label: "لوکیشن",
      icon: "📍",
      desc: "تأمین کننده مکان عکاسی",
    },
    {
      value: "photoGrapher",
      label: "عکاس",
      icon: "📷",
      desc: "عکاس حرفه‌ای و تصویربردار",
    },
  ];

  // Extract user info from token
  useEffect(() => {
    const extractUserFromToken = () => {
      try {
        const decoded = getUserFromToken();

        if (!decoded) {
          toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
          router.push("/auth");
          return;
        }

        if (decoded.userType !== "coworker" && decoded.userType !== "admin") {
          toast.error("دسترسی محدود به همکاران");
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

  // Fetch coworker profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userInfo?.userId) return;

      setLoading(true);
      try {
        const authHeader = getAuthHeader();
        if (!authHeader) {
          toast.error("خطا در تشخیص هویت");
          router.push("/auth");
          return;
        }

        const response = await fetch(`/api/coworkers?id=${userInfo.userId}`, {
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (result.success && result.data) {
          // Ensure all nested objects are properly initialized
          const profileData = {
            ...result.data,
            socialLinks: {
              instagram: "",
              x: "",
              telegram: "",
              whatsapp: "",
              ...(result.data.socialLinks || {}),
            },
            images: {
              main: "",
              thumbnails: [],
              ...(result.data.images || {}),
            },
          };
          setProfile(profileData);
          setProfileExists(true);
        } else {
          // Profile doesn't exist, initialize with token data
          setProfile((prev) => ({
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

    if (!profile.experties) {
      newErrors.experties = "تخصص الزامی است";
    }

    if (profile.resomeLink && !/^https?:\/\/.+/.test(profile.resomeLink)) {
      newErrors.resomeLink = "لینک رزومه باید با http:// یا https:// شروع شود";
    }

    // Validate social links (null-safe)
    const socialKeys = ["instagram", "x", "telegram", "whatsapp"];
    socialKeys.forEach((key) => {
      const value =
        profile.socialLinks?.[key as keyof typeof profile.socialLinks];
      if (value && !/^https?:\/\/.+/.test(value)) {
        newErrors[`socialLinks.${key}`] =
          "لینک باید با http:// یا https:// شروع شود";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        toast.error("خطا در تشخیص هویت");
        router.push("/auth");
        return;
      }

      const method = profileExists ? "PUT" : "POST";
      const url = "/api/coworkers";

      const requestBody = profileExists
        ? { ...profile, id: profile._id }
        : profile;

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
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
  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("socialLinks.")) {
      const socialKey = field.replace("socialLinks.", "");
      setProfile((prev) => ({
        ...prev,
        socialLinks: {
          ...(prev.socialLinks || {
            instagram: "",
            x: "",
            telegram: "",
            whatsapp: "",
          }),
          [socialKey]: value,
        },
      }));
    } else {
      setProfile((prev) => ({ ...prev, [field]: value }));
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle thumbnail add

  // Handle images selected from upload modal
  const handleImagesSelected = (mainImage: string, thumbnails: string[]) => {
    setProfile((prev) => ({
      ...prev,
      images: {
        main: mainImage,
        thumbnails: thumbnails,
      },
    }));
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
            پروفایل همکار
          </h1>
       
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
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    profile.isApprove
                      ? "bg-gradient-to-r from-green-400 to-emerald-400"
                      : "bg-gradient-to-r from-yellow-400 to-orange-400"
                  }`}
                >
                  {profile.isApprove ? (
                    <FaCheckCircle className="text-white text-lg" />
                  ) : (
                    <IoSparkles className="text-white text-lg" />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {profile.isApprove ? "همکار تایید شده" : "در انتظار تایید"}
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span
                      className={`flex items-center gap-1 ${
                        profile.isActive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {profile.isActive ? (
                        <FaCheckCircle className="text-xs" />
                      ) : (
                        <FaTimesCircle className="text-xs" />
                      )}
                      {profile.isActive ? "فعال" : "غیرفعال"}
                    </span>
                    {profile.experties && (
                      <span className="text-purple-400">
                        {expertiesOptions.find(
                          (opt) => opt.value === profile.experties
                        )?.label || profile.experties}
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
                    <FaTimes className="text-sm" />
                    انصراف
                  </>
                ) : (
                  <>
                    <FaEdit className="text-sm" />
                    ویرایش پروفایل
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
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    نام کامل
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
                  <label className="block text-white/70 text-sm font-medium mb-2">
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
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    ایمیل
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!isEditing}
                    className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all ${
                      !isEditing ? "opacity-60 cursor-not-allowed" : ""
                    } ${errors.email ? "border-red-400/50" : ""}`}
                    placeholder="ایمیل خود را وارد کنید"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    تخصص
                  </label>
                  <select
                    value={profile.experties}
                    onChange={(e) =>
                      handleInputChange("experties", e.target.value)
                    }
                    disabled={!isEditing}
                    className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all ${
                      !isEditing ? "opacity-60 cursor-not-allowed" : ""
                    } ${errors.experties ? "border-red-400/50" : ""}`}
                  >
                    <option value="" className="bg-gray-800">
                      انتخاب تخصص
                    </option>
                    {expertiesOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-gray-800"
                      >
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.experties && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.experties}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FaUserTie className="text-blue-400" />
                اطلاعات حرفه‌ای
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    توضیحات
                  </label>
                  <textarea
                    value={profile.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    disabled={!isEditing}
                    rows={3}
                    className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all resize-none ${
                      !isEditing ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    placeholder="توضیحات کوتاه درباره تخصص و تجربه خود..."
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    لینک رزومه
                  </label>
                  <input
                    type="url"
                    value={profile.resomeLink || ""}
                    onChange={(e) =>
                      handleInputChange("resomeLink", e.target.value)
                    }
                    disabled={!isEditing}
                    className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all ${
                      !isEditing ? "opacity-60 cursor-not-allowed" : ""
                    } ${errors.resomeLink ? "border-red-400/50" : ""}`}
                    placeholder="https://example.com/resume"
                  />
                  {errors.resomeLink && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.resomeLink}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    تصاویر پروفایل
                  </label>
                  <div className="space-y-4">
                    {/* Image Preview */}
                    {(profile.images?.main ||
                      (profile.images?.thumbnails &&
                        profile.images.thumbnails.length > 0)) && (
                      <div className="grid grid-cols-1 gap-4">
                        {profile.images?.main && (
                          <div className="relative">
                            <img
                              src={profile.images.main}
                              alt="تصویر اصلی"
                              width={400}
                              height={128}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <div className="absolute top-2 left-2 bg-purple-500/80 text-white text-xs px-2 py-1 rounded">
                              تصویر اصلی
                            </div>
                          </div>
                        )}
                        {profile.images?.thumbnails &&
                          profile.images.thumbnails.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                              {profile.images.thumbnails.map((thumb, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={thumb}
                                    alt={`تصویر ${index + 1}`}
                                    width={120}
                                    height={80}
                                    className="w-full h-20 object-cover rounded-lg"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    )}

                    {/* Upload Button */}
                    {isEditing && (
                      <motion.button
                        type="button"
                        onClick={() => setShowImageModal(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-lg text-white/70 hover:bg-white/20 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <FaUpload className="text-sm" />
                        {profile.images?.main ||
                        (profile.images?.thumbnails &&
                          profile.images.thumbnails.length > 0)
                          ? "ویرایش تصاویر"
                          : "آپلود تصاویر"}
                      </motion.button>
                    )}

                    {!isEditing &&
                      !profile.images?.main &&
                      (!profile.images?.thumbnails ||
                        profile.images.thumbnails.length === 0) && (
                        <div className="text-center py-8 text-white/50 bg-white/5 rounded-lg border border-white/10">
                          <FaImage className="mx-auto mb-2 text-2xl" />
                          <p>هنوز تصویری آپلود نشده</p>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FaLink className="text-green-400" />
                شبکه‌های اجتماعی
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                    <FaInstagram className="text-pink-400" />
                    اینستاگرام
                  </label>
                  <input
                    type="url"
                    value={profile.socialLinks?.instagram || ""}
                    onChange={(e) =>
                      handleInputChange("socialLinks.instagram", e.target.value)
                    }
                    disabled={!isEditing}
                    className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all ${
                      !isEditing ? "opacity-60 cursor-not-allowed" : ""
                    } ${
                      errors["socialLinks.instagram"] ? "border-red-400/50" : ""
                    }`}
                    placeholder="https://instagram.com/username"
                  />
                  {errors["socialLinks.instagram"] && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors["socialLinks.instagram"]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                    <FaXTwitter className="text-white" />X (Twitter)
                  </label>
                  <input
                    type="url"
                    value={profile.socialLinks?.x || ""}
                    onChange={(e) =>
                      handleInputChange("socialLinks.x", e.target.value)
                    }
                    disabled={!isEditing}
                    className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all ${
                      !isEditing ? "opacity-60 cursor-not-allowed" : ""
                    } ${errors["socialLinks.x"] ? "border-red-400/50" : ""}`}
                    placeholder="https://x.com/username"
                  />
                  {errors["socialLinks.x"] && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors["socialLinks.x"]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                    <FaTelegram className="text-blue-400" />
                    تلگرام
                  </label>
                  <input
                    type="url"
                    value={profile.socialLinks?.telegram || ""}
                    onChange={(e) =>
                      handleInputChange("socialLinks.telegram", e.target.value)
                    }
                    disabled={!isEditing}
                    className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all ${
                      !isEditing ? "opacity-60 cursor-not-allowed" : ""
                    } ${
                      errors["socialLinks.telegram"] ? "border-red-400/50" : ""
                    }`}
                    placeholder="https://t.me/username"
                  />
                  {errors["socialLinks.telegram"] && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors["socialLinks.telegram"]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                    <FaWhatsapp className="text-green-400" />
                    واتساپ
                  </label>
                  <input
                    type="url"
                    value={profile.socialLinks?.whatsapp || ""}
                    onChange={(e) =>
                      handleInputChange("socialLinks.whatsapp", e.target.value)
                    }
                    disabled={!isEditing}
                    className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all ${
                      !isEditing ? "opacity-60 cursor-not-allowed" : ""
                    } ${
                      errors["socialLinks.whatsapp"] ? "border-red-400/50" : ""
                    }`}
                    placeholder="https://wa.me/number"
                  />
                  {errors["socialLinks.whatsapp"] && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors["socialLinks.whatsapp"]}
                    </p>
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
                  <span className="text-white/70">وضعیت:</span>
                  <span
                    className={`flex items-center gap-1 ${
                      profile.isActive ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {profile.isActive ? (
                      <FaCheckCircle className="text-xs" />
                    ) : (
                      <FaTimesCircle className="text-xs" />
                    )}
                    {profile.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">تایید:</span>
                  <span
                    className={`flex items-center gap-1 ${
                      profile.isApprove ? "text-green-400" : "text-yellow-400"
                    }`}
                  >
                    {profile.isApprove ? (
                      <FaCheckCircle className="text-xs" />
                    ) : (
                      <IoSparkles className="text-xs" />
                    )}
                    {profile.isApprove ? "تایید شده" : "در انتظار"}
                  </span>
                </div>
                {profile.aprovedBy && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/70 text-sm mb-1">
                      تایید شده توسط:
                    </p>
                    <p className="text-white text-sm font-medium">
                      {profile.aprovedBy.name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">آمار سریع</h3>
              <div className="space-y-3">
                {profile.experties && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {
                          expertiesOptions.find(
                            (opt) => opt.value === profile.experties
                          )?.icon
                        }
                      </span>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {
                            expertiesOptions.find(
                              (opt) => opt.value === profile.experties
                            )?.label
                          }
                        </p>
                        <p className="text-white/60 text-xs">
                          {
                            expertiesOptions.find(
                              (opt) => opt.value === profile.experties
                            )?.desc
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {profile.createdAt && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/70 text-xs">عضو از:</p>
                    <p className="text-white text-sm">
                      {new Date(profile.createdAt).toLocaleDateString("fa-IR")}
                    </p>
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
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
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
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  موفقیت آمیز!
                </h3>
                <p className="text-white/70 mb-6">
                  اطلاعات پروفایل شما با موفقیت ذخیره شد
                </p>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:shadow-lg transition-all"
                >
                  عالی!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onImagesSelected={handleImagesSelected}
        initialMainImage={profile.images?.main || ""}
        initialThumbnails={profile.images?.thumbnails || []}
      />
    </div>
  );
};

export default CoWorkerProfileEditor;
