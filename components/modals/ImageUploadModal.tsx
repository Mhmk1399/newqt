"use client";

import React, { useState, useCallback } from "react";
import { HiX, HiUpload, HiTrash } from "react-icons/hi";
import toast from "react-hot-toast";
import Image from "next/image";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImagesSelected: (mainImage: string, thumbnails: string[]) => void;
  initialMainImage?: string;
  initialThumbnails?: string[];
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onImagesSelected,
  initialMainImage = "",
  initialThumbnails = [],
}) => {
  const [mainImage, setMainImage] = useState(initialMainImage);
  const [thumbnails, setThumbnails] = useState<string[]>(initialThumbnails);
  const [uploading, setUploading] = useState(false);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer dummy-token`,
      },
      body: formData,
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Upload failed");
    }

    return result.url;
  }, []);

  const handleMainImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadImage(file);
      setMainImage(url);
      toast.success("تصویر اصلی آپلود شد");
    } catch (error) {
      console.log(error);
      toast.error("خطا در آپلود تصویر اصلی");
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const uploadPromises = files.map(uploadImage);
      const urls = await Promise.all(uploadPromises);
      setThumbnails((prev) => [...prev, ...urls]);
      toast.success(`${files.length} تصویر کوچک آپلود شد`);
    } catch (error) {
      console.log(error);
      toast.error("خطا در آپلود تصاویر کوچک");
    } finally {
      setUploading(false);
    }
  };

  const removeThumbnail = (index: number) => {
    setThumbnails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!mainImage) {
      toast.error("تصویر اصلی الزامی است");
      return;
    }
    onImagesSelected(mainImage, thumbnails);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">آپلود تصاویر</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {/* Main Image */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4">تصویر اصلی *</h4>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {mainImage ? (
                <div className="relative">
                  <Image
                    src={mainImage}
                    alt="Main"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setMainImage("")}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block text-center">
                  <HiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    کلیک کنید تا تصویر اصلی را انتخاب کنید
                  </p>
                  <p className="text-sm text-gray-500">JPG, PNG, GIF تا 10MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          <div>
            <h4 className="text-lg font-semibold mb-4">تصاویر کوچک</h4>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
              <label className="cursor-pointer block text-center">
                <HiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">
                  انتخاب تصاویر کوچک (چندتایی)
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG, GIF تا 10MB هر کدام
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleThumbnailUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Thumbnail Grid */}
            {thumbnails.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {thumbnails.map((thumb, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={thumb}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeThumbnail(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <HiTrash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={uploading}
          >
            لغو
          </button>
          <button
            onClick={handleSave}
            disabled={uploading || !mainImage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "در حال آپلود..." : "ذخیره"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
