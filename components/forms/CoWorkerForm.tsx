"use client";

import React, { useState } from "react";
import DynamicForm from "./DynamicForm";
import { FormConfig } from "@/types/form";
import toast from "react-hot-toast";
import ImageUploadModal from "../modals/ImageUploadModal";

interface CoWorkerFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CoWorkerForm: React.FC<CoWorkerFormProps> = ({ onSuccess, onCancel }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [formData, setFormData] = useState<{
    images?: { main: string; thumbnails: string[] };
  }>({});
  const [adminOptions, setAdminOptions] = useState<
    { value: string; label: string }[]
  >([{ value: "", label: "انتخاب کنید..." }]);
  const formConfig: FormConfig = {
    title: "افزودن همکار جدید",
    description: "اطلاعات همکار جدید را وارد کنید",
    endpoint: "/api/coworkers",
    method: "POST",
    submitButtonText: "افزودن همکار",
    successMessage: "همکار با موفقیت اضافه شد!",
    errorMessage: "خطا در افزودن همکار",
    validationErrorMessage: "لطفاً تمام فیلدهای الزامی را پر کنید",
    fields: [
      {
        name: "name",
        label: "نام",
        type: "text",
        required: true,
        placeholder: "نام همکار را وارد کنید",
        validation: {
          minLength: 2,
          maxLength: 50,
        },
      },
      {
        name: "phoneNumber",
        label: "شماره تلفن",
        type: "number",
        required: true,
        placeholder: "شماره تلفن را وارد کنید",
        validation: {
          min: 1000000000,
          max: 99999999999,
        },
      },
      {
        name: "experties",
        label: "تخصص",
        type: "select",
        required: true,
        options: [
          { value: "", label: "انتخاب کنید..." },
          { value: "model", label: "مدل" },
          { value: "makeUpArtist", label: "آرایشگر" },
          { value: "stylist", label: "استایلیست" },
          { value: "location", label: "لوکیشن" },
          { value: "photoGrapher", label: "عکاس" },
        ],
      },
      {
        name: "description",
        label: "توضیحات",
        type: "textarea",
        required: true,
        placeholder: "توضیحات در مورد همکار را وارد کنید",
        validation: {
          minLength: 10,
          maxLength: 500,
        },
      },
      {
        name: "email",
        label: "ایمیل",
        type: "email",
        required: true,
        placeholder: "ایمیل همکار را وارد کنید",
        validation: {
          pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        },
      },
      {
        name: "resomeLink",
        label: "لینک رزومه",
        type: "text",
        required: true,
        placeholder: "لینک رزومه را وارد کنید",
        validation: {
          pattern: "^https?://.*",
        },
      },

      {
        name: "password",
        label: "رمز عبور",
        type: "password",
        required: true,
        placeholder: "رمز عبور را وارد کنید",
        validation: {
          minLength: 8,
          maxLength: 50,
        },
      },
      {
        name: "socialLinks",
        label: "لینک‌های اجتماعی",
        type: "textarea",
        required: true,
        placeholder:
          'به صورت JSON وارد کنید: {"instagram": "link", "telegram": "link"}',
        description: "لینک‌های شبکه‌های اجتماعی را به صورت JSON وارد کنید",
      },
      {
        name: "aprovedBy",
        label: "تایید شده توسط",
        type: "select",
        options: adminOptions,
      },
      {
        name: "isActive",
        label: "وضعیت فعالیت",
        type: "select",
        required: true,
        defaultValue: true,
        options: [
          { value: "true", label: "فعال" },
          { value: "false", label: "غیرفعال" },
        ],
      },
    ],
    onSuccess: (data: unknown) => {
      console.log("CoWorker created successfully:", data);
      toast.success("همکار با موفقیت اضافه شد!");
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: string) => {
      console.error("Create error:", error);
      toast.error(`خطا در افزودن همکار: ${error}`);
    },
  };

  // Fetch admin and manager users for aprovedBy field
  React.useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await fetch("/api/users/admins");
        const data: {
          success: boolean;
          data: { _id: string; name: string; role: string }[];
        } = await res.json();
        if (data.success) {
          const userOptions = [
            { value: "", label: "انتخاب کنید..." },
            ...data.data.map(
              (user: { _id: string; name: string; role: string }) => ({
                value: user._id,
                label: `${user.name} (${user.role})`,
              })
            ),
          ];

          setAdminOptions(userOptions);
        }
      } catch (error) {
        console.error("Failed to fetch admins:", error);
      }
    };

    fetchAdmins();
  }, []);

  const handleImagesSelected = (mainImage: string, thumbnails: string[]) => {
    setFormData((prev) => ({
      ...prev,
      images: {
        main: mainImage,
        thumbnails: thumbnails,
      },
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Custom Images Field */}
      <div className="mb-6 p-4 border rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          تصاویر *
        </label>
        <button
          type="button"
          onClick={() => setShowImageModal(true)}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
        >
          <div className="text-center">
            <div className="text-gray-500 mb-2">📷</div>
            <p className="text-gray-600">
              {formData.images?.main ? "ویرایش تصاویر" : "انتخاب تصاویر"}
            </p>
            {formData.images?.main && (
              <p className="text-sm text-green-600 mt-1">
                تصویر اصلی و {formData.images?.thumbnails?.length || 0} تصویر
                کوچک انتخاب شده
              </p>
            )}
          </div>
        </button>
      </div>

      <DynamicForm config={formConfig} initialData={formData} />

      {onCancel && (
        <div className="mt-4 text-center">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            لغو
          </button>
        </div>
      )}

      <ImageUploadModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onImagesSelected={handleImagesSelected}
        initialMainImage={formData.images?.main}
        initialThumbnails={formData.images?.thumbnails}
      />
    </div>
  );
};

export default CoWorkerForm;
