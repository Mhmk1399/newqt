"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiUser, FiEdit3, FiSave, FiCamera } from "react-icons/fi";
import ImageUploadModal from "../../modals/ImageUploadModal";

interface CoWorkerProfile {
  _id?: string;
  name: string;
  email: string;
  phoneNumber: string;
  experties: string;
  description: string;
  resomeLink: string;
  images?: {
    main?: string;
    thumbnails?: string[];
  };
  socialLinks: {
    instagram: string;
    x: string;
    telegram: string;
    whatsapp: string;
  };
}

const ProfileInfo = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [profile, setProfile] = useState<CoWorkerProfile>({
    name: "",
    email: "",
    phoneNumber: "",
    experties: "",
    description: "",
    resomeLink: "",
    images: {
      main: "",
      thumbnails: [],
    },
    socialLinks: {
      instagram: "",
      x: "",
      telegram: "",
      whatsapp: "",
    },
  });

  const expertiseOptions = [
    { value: "model", label: "مدل" },
    { value: "makeUpArtist", label: "آرایشگر" },
    { value: "stylist", label: "استایلیست" },
    { value: "location", label: "لوکیشن" },
    { value: "photoGrapher", label: "عکاس" },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch("/api/coworkers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setProfile({
          ...data.data,
          images: data.data.images || {
            main: "",
            thumbnails: [],
          },
          socialLinks: data.data.socialLinks || {
            instagram: "",
            x: "",
            telegram: "",
            whatsapp: "",
          },
        });
      }
    } catch (error: unknown) {
      console.log(error);
      toast.error("خطا در دریافت اطلاعات پروفایل");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch("/api/coworkers", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: profile._id, ...profile }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("پروفایل با موفقیت بروزرسانی شد");
        setIsEditing(false);
      } else {
        toast.error(data.error || "خطا در بروزرسانی پروفایل");
      }
    } catch (error: unknown) {
      console.log(error);
      toast.error("خطا در بروزرسانی پروفایل");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("socialLinks.")) {
      const socialKey = name.split(".")[1];
      setProfile((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value,
        },
      }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImagesSelected = (mainImage: string, thumbnails: string[]) => {
    setProfile((prev) => ({
      ...prev,
      images: {
        main: mainImage,
        thumbnails: thumbnails,
      },
    }));
  };

  return (
    <div className="max-w-4xl mx-auto" dir="rtl">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center ml-4">
                <FiUser className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="md:text-2xl text-sm text-nowrap font-bold text-white">
                  پروفایل من
                </h1>
                <p className="text-blue-100 hidden md:block">
                  مدیریت اطلاعات شخصی
                </p>
              </div>
            </div>
            <motion.button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/20 hover:bg-white/30 text-white px-1 md:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiEdit3 className="w-4 h-4" />
              {isEditing ? "لغو" : "ویرایش"}
            </motion.button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                اطلاعات پایه
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile.name || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ایمیل
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شماره تلفن
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profile.phoneNumber || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تخصص
                </label>
                <select
                  name="experties"
                  value={profile.experties || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  required
                >
                  <option value="">انتخاب کنید</option>
                  {expertiseOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                اطلاعات تکمیلی
              </h3>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تصاویر
                </label>
                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  disabled={!isEditing}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-center">
                    <FiCamera
                      className="mx-auto text-gray-400 mb-2"
                      size={24}
                    />
                    <p className="text-gray-600">
                      {profile.images?.main ? "ویرایش تصاویر" : "انتخاب تصاویر"}
                    </p>
                    {profile.images?.main && (
                      <p className="text-sm text-green-600 mt-1">
                        تصویر اصلی و {profile.images?.thumbnails?.length || 0}{" "}
                        تصویر کوچک
                      </p>
                    )}
                  </div>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  درباره من
                </label>
                <textarea
                  name="description"
                  value={profile.description || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="توضیح کوتاهی درباره خودتان بنویسید..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  لینک رزومه
                </label>
                <input
                  type="url"
                  name="resomeLink"
                  value={profile.resomeLink || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="https://example.com/resume"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
              شبکه‌های اجتماعی
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اینستاگرام
                </label>
                <input
                  type="url"
                  name="socialLinks.instagram"
                  value={profile.socialLinks?.instagram || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="https://instagram.com/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  X (Twitter)
                </label>
                <input
                  type="url"
                  name="socialLinks.x"
                  value={profile.socialLinks?.x || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="https://x.com/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تلگرام
                </label>
                <input
                  type="url"
                  name="socialLinks.telegram"
                  value={profile.socialLinks?.telegram || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="https://t.me/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  واتساپ
                </label>
                <input
                  type="url"
                  name="socialLinks.whatsapp"
                  value={profile.socialLinks?.whatsapp || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="https://wa.me/1234567890"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {isEditing && (
            <div className="mt-8 flex justify-end">
              <motion.button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiSave className="w-4 h-4" />
                {isLoading ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </motion.button>
            </div>
          )}
        </form>
      </div>

      <ImageUploadModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onImagesSelected={handleImagesSelected}
        initialMainImage={profile.images?.main}
        initialThumbnails={profile.images?.thumbnails}
      />
    </div>
  );
};

export default ProfileInfo;
