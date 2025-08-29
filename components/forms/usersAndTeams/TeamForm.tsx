"use client";

import DynamicForm from "../DynamicForm";
import { FormConfig } from "@/types/form";

interface TeamFormProps {
  onSuccess?: (data: string) => void;
  onError?: (error: string) => void;
}

const TeamForm: React.FC<TeamFormProps> = ({ onSuccess, onError }) => {
  const teamFormConfig: FormConfig = {
    title: "ساخت تیم",
    description: "ساخت یک تیم جدید",
    endpoint: "/api/teams",
    method: "POST",
    submitButtonText: "ساخت تیم",
    onSuccess,
    onError,
    successMessage: "ساخت تیم با موفقیت انجام شد",
    errorMessage: "خطا در ساخت تیم",
    validationErrorMessage: "لطفا فرم را درست پر کنید",
    fields: [
      {
        name: "name",
        label: "نام تیم",
        type: "text",
        placeholder: "نام تیم را وارد کنید",
        required: true,
        validation: {
          minLength: 2,
          maxLength: 100,
        },
        description: "یک نام درست انتخاب کنید",
      },
      {
        name: "specialization",
        label: "تخصص",
        type: "select",
        required: true,
        options: [
          { value: "shooting", label: "فیلم برداری" },
          { value: "edit", label: "تدوین" },
          { value: "photographi", label: "عکاسی" },
          { value: "marketing", label: "تبلیغات" },
        ],
        description: "تخصص تیم را انتخاب کنید",
      },
      {
        name: "description",
        label: "توضیحات",
        type: "textarea",
        placeholder: "توضیحات تیم را وارد کنید",
        required: true,
        validation: {
          minLength: 10,
          maxLength: 500,
        },
        description: "نقش، مسئولیت‌ها و اهداف تیم را شرح دهید",
      },
    ],
  };

  return <DynamicForm config={teamFormConfig} />;
};

export default TeamForm;
