"use client";

import React, { useState, useEffect } from "react";
import DynamicForm from "./DynamicForm";
import { FormConfig } from "@/types/form";

interface ServiceRequestFormProps {
  onSuccess?: (data: string) => void;
  onError?: (error: string) => void;
}

interface Project {
  _id: string;
  title: string;
}

interface Service {
  _id: string;
  name: string;
  basePrice: number;
}

const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({
  onSuccess,
  onError,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch available projects and services
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsResponse, servicesResponse] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/services"),
        ]);

        const projectsResult = await projectsResponse.json();
        const servicesResult = await servicesResponse.json();

        if (projectsResult.success) {
          setProjects(projectsResult.data);
        }

        if (servicesResult.success) {
          setServices(servicesResult.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const serviceRequestFormConfig: FormConfig = {
    title: "ساخت درخواست سرویس",
    description: "ایجاد یک درخواست سرویس جدید",
    endpoint: "/api/service-requests",
    method: "POST",
    submitButtonText: "ثبت درخواست سرویس",
    onSuccess,
    onError,
    successMessage: "درخواست سرویس با موفقیت ایجاد شد",
    errorMessage: "خطا در ایجاد درخواست سرویس.",
    validationErrorMessage: "لطفا فیلدها را به درستی پر کنید",
    fields: [
      {
        name: "projectId",
        label: "پروژه",
        type: "select",
        required: true,
        options: [
          { value: "", label: "انتخاب کنید" }, // Add this as the first option
          ...projects.map((project) => ({
            value: project._id,
            label: project.title,
          })),
        ],

        description:
          "پروژه‌ای را که این درخواست سرویس به آن تعلق دارد انتخاب کنید",
      },
      {
        name: "serviceId",
        label: "سرویس",
        type: "select",
        required: true,
        options: [
          { value: "", label: "انتخاب کنید" },
          ...services.map((service) => ({
            value: service._id,
            label: `${service.name} (${service.basePrice})`,
          })),
        ],

        description: "سرویس مورد نظر خود را برای درخواست انتخاب کنید",
      },
      {
        name: "quantity",
        label: "تعداد ",
        type: "number",
        placeholder: "تعداد سرویس مورد نظر را وارد کنید",
        required: true,
        defaultValue: 1,
        validation: {
          min: 1,
          max: 100,
        },
        description: "تعداد واحدهای خدماتی درخواستی",
      },
      {
        name: "priority",
        label: "اولویت",
        type: "select",
        required: true,
        defaultValue: "medium",
        options: [
          { value: "", label: "انتخاب کنید" },
          { value: "low", label: "کم اولویت" },
          { value: "medium", label: "متوسط اولویت" },
          { value: "high", label: "بالا اولویت" },
          { value: "urgent", label: "فوری" },
        ],
        description: "سطح اولویت برای این درخواست سرویس",
      },
      {
        name: "requestedDate",
        label: "تاریخ درخواست",
        type: "date",
        required: true,
        description: "چه زمانی به شروع این سرویس نیاز دارید؟",
      },
      {
        name: "scheduledDate",
        label: "تاریخ پیشنهادی",
        type: "date",
        required: false,
        description: "اختیاری: تاریخ ترجیحی برای ارائه خدمات",
      },
      {
        name: "requirements",
        label: "توضیحات و نیازهای خاص",
        type: "textarea",
        placeholder: "الزامات دقیق برای این سرویس را وارد کنید",
        required: true,
        validation: {
          minLength: 10,
          maxLength: 1000,
        },
        description: "الزامات و مشخصات دقیق",
      },
      {
        name: "notes",
        label: "توضیحات و نکات اضافی",
        type: "textarea",
        placeholder: "هرگونه یادداشت یا نظر اضافی",
        required: false,
        validation: {
          maxLength: 500,
        },
        description: "یادداشت‌های اضافی اختیاری یا دستورالعمل‌های ویژه",
      },
      {
        name: "title",
        label: "عنوان",
        type: "text",
        placeholder: "توضیحات و نکات اضافی",
        required: true,
        validation: {
          maxLength: 500,
        },
        description: "یادداشت‌های اضافی اختیاری یا دستورالعمل‌های ویژه",
      },
    ],
  };

  // Show loading while fetching data
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">
            در حال بارگذاری پروژه‌ها و خدمات...
          </p>
        </div>
      </div>
    );
  }

  // Show error if no data available
  if (projects.length === 0 || services.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <p className="text-red-600">
            {projects.length === 0 && "پروژه‌ ای وجود ندارد. "}
            {services.length === 0 && "سرویسی وجود ندارد. "}
            لطفا ابتدا پروژه‌ها و سرویس‌ها را ایجاد کنید.
          </p>
        </div>
      </div>
    );
  }

  return <DynamicForm config={serviceRequestFormConfig} />;
};

export default ServiceRequestForm;
