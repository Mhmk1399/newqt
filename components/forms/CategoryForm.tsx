"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { FiTag, FiFileText, FiImage, FiPlus } from "react-icons/fi";

const CategoryForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("کتگوری با موفقیت ساخته شد");

        setFormData({ name: "", description: "", icon: "" });
      } else {
        toast.error("کتگوری با موفقیت ساخته نشد");

        setError(result.error || "خطا در ایجاد دسته‌بندی");
      }
    } catch (err) {
      toast.error("کتگوری با موفقیت ساخته نشد" + err);

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
          <FiTag className="text-2xl text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">افزودن دسته‌بندی جدید</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white font-medium mb-2">
            نام دسته‌بندی
          </label>
          <div className="relative">
            <FiTag className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full pr-12 pl-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              placeholder="مثال: طراحی گرافیک"
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
              placeholder="توضیح کوتاهی از این دسته‌بندی..."
              rows={3}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            آیکون (نام آیکون)
          </label>
          <div className="relative">
            <FiImage className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              className="w-full pr-12 pl-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              placeholder="مثال: FiCamera, FiVideo, FiEdit"
              required
            />
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
              <FiPlus className="text-xl" />
              ایجاد دسته‌بندی
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CategoryForm;
