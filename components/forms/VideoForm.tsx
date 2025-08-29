"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiVideo, FiFileText, FiLink, FiTag, FiUpload } from "react-icons/fi";

interface Category {
  _id: string;
  name: string;
  icon: string;
}

interface VideoFormProps {
  onSuccess?: () => void;
}

const VideoForm: React.FC<VideoFormProps> = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    link: "",
    categoryId: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const result = await response.json();
        if (result.success) {
          setCategories(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("ویدیو با موفقیت آپلود شد");
        setFormData({ name: "", description: "", link: "", categoryId: "" });
      } else {
        toast.error("ویدیو با موفقیت آپلود نشد");

        setError(result.error || "خطا در آپلود ویدیو");
      }
    } catch (err) {
      toast.error("ویدیو با موفقیت آپلود نشد" + err);

      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="max-w-md mx-auto bg-gradient-to-br from-[#0A0A2E]/95 to-[#1A1A4A]/95 backdrop-blur-2xl rounded-3xl p-8 border border-white/20"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center">
          <FiVideo className="text-2xl text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">آپلود ویدیو جدید</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white font-medium mb-2">نام ویدیو</label>
          <div className="relative">
            <FiVideo className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full pr-12 pl-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              placeholder="مثال: ویدیو معرفی محصول"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">توضیحات</label>
          <div className="relative">
            <FiFileText className="absolute right-4 top-4 text-gray-400" />
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full pr-12 pl-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 resize-none"
              placeholder="توضیح کوتاهی از ویدیو..."
              rows={3}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            لینک ویدیو
          </label>
          <div className="relative">
            <FiLink className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="url"
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
              className="w-full pr-12 pl-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              placeholder="https://example.com/video.mp4"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">دسته‌بندی</label>
          <div className="relative">
            <FiTag className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className="w-full pr-12 pl-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:border-purple-500/50"
              required
            >
              <option value="">انتخاب دسته‌بندی</option>
              {categories.map((category) => (
                <option
                  key={category._id}
                  value={category._id}
                  className="bg-gray-800"
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-2xl flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <FiUpload className="text-xl" />
              آپلود ویدیو
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default VideoForm;
