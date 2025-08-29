"use client";

import React, { useState, useEffect } from "react";
import DynamicForm from "./DynamicForm";
import { FormConfig } from "@/types/form";

interface ServiceFormProps {
  onSuccess?: (data: string) => void;
  onError?: (error: string) => void;
}

interface Team {
  _id: string;
  name: string;
  specialization: string;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ onSuccess, onError }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch available teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("/api/teams");
        const result = await response.json();

        if (result.success) {
          setTeams(result.data);
        } else {
          console.error("Failed to fetch teams:", result.error);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);
  const serviceFormConfig: FormConfig = {
    title: "ساخت سرویس جدید",
    description: "برای ایجاد یک سرویس جدید، فرم زیر را پر کنید",
    endpoint: "/api/services",
    method: "POST",
    submitButtonText: "ثبت سرویس",
    onSuccess,
    onError,
    successMessage: "سرویس با موفقیت ایجاد شد.",
    errorMessage: "خطا در ایجاد سرویس.",
    validationErrorMessage: "لطفا فیلدهای مورد نظر را به درستی وارد کنید.",
    fields: [
      {
        name: "name",
        label: "نام سرویس",
        type: "text",
        placeholder: "نام سرویس را وارد کنید",
        required: true,
        validation: {
          minLength: 2,
          maxLength: 100,
        },
        description: "نام واضح و توصیفی برای سرویس",
      },
      {
        name: "description",
        label: "توضیحات سرویس",
        type: "textarea",
        placeholder: "توضیحات سرویس را وارد کنید",
        required: false,
        validation: {
          maxLength: 1000,
        },
        description: "توضیحات مفصل و کامل سرویس",
      },

      {
        name: "basePrice",
        label: "قیمت پایه",
        type: "number",
        placeholder: "قیمت پایه را وارد کنید",
        required: true,
        validation: {
          min: 0,
          max: 1000000,
        },
        description: "قیمت اصلی سرویس",
      },

      {
        name: "teamId",
        label: "تیم انجام دهنده سرویس",
        type: "select",
        required: true,
        options: [
          { value: "", label: "انتخاب کنید" }, // Add this as the first option
          ...teams.map((team) => ({
            value: team._id,
            label: `${team.name} (${team.specialization})`,
          })),
        ],
        description: "تیمی را که مسئول ارائه این سرویس است انتخاب کنید",
      },
      {
        name: "isVip",
        label: "سرویس VIP",
        type: "checkbox",
        required: false,
        description: "آیا این سرویس یک سرویس VIP است؟",
      },
    ],
  };

  // Show loading while fetching teams
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">در حال بارگیری تیم ها...</p>
        </div>
      </div>
    );
  }

  // Show error if no teams available
  if (teams.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <p className="text-red-600">
            تیمی موجود نیست. لطفاً ابتدا تیم‌ها را ایجاد کنید.
          </p>
        </div>
      </div>
    );
  }

  return <DynamicForm config={serviceFormConfig} />;
};

export default ServiceForm;
