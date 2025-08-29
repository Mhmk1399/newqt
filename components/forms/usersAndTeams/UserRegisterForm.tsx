"use client";

import DynamicForm from "../DynamicForm";
import { FormConfig } from "@/types/form";

interface UserRegisterFormProps {
  onSuccess?: (data: string) => void;
  onError?: (error: string) => void;
}

const UserRegisterForm: React.FC<UserRegisterFormProps> = ({
  onSuccess,
  onError,
}) => {
  const handleRegisterSuccess = (data: string) => {
    console.log("User registration successful:", data);
    if (onSuccess) {
      onSuccess(data);
    }
  };

  const handleRegisterError = (error: string) => {
    console.error("User registration failed:", error);
    if (onError) {
      onError(error);
    }
  };
  const userRegisterFormConfig: FormConfig = {
    title: "ساخت حساب کاربری",
    description: "فرم زیر را برای ساخت حساب کاربری تکمیل کنید",
    endpoint: "/api/users",
    method: "POST",
    submitButtonText: "ثبت نام",
    onSuccess: handleRegisterSuccess,
    onError: handleRegisterError,
    errorMessage: "خطا در ساخت حساب کاربری",
    successMessage: "حساب کاربری با موفقیت ایجاد شد",
    validationErrorMessage: "لطفاً اطلاعات فرم را به درستی تکمیل کنید.",
    fields: [
      {
        name: "name",
        label: "نام و نام خانوادگی",
        type: "text",
        placeholder: "نام و نام خانوادگی",
        required: true,
        validation: {
          minLength: 2,
          maxLength: 100,
        },
      },
      {
        name: "email",
        label: "آدرس ایمیل",
        type: "email",
        placeholder: "آدرس ایمیل",
        required: true,
        validation: {
          pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        },
      },
      {
        name: "phoneNumber",
        label: "شماره تلفن",
        type: "tel",
        placeholder: "شماره تلفن",
        required: true,
      },
      {
        name: "password",
        label: "رمز عبور",
        type: "password",
        placeholder: "رمز عبور",
        required: true,
        validation: {
          minLength: 8,
        },
        description: "رمز عبور باید حداقل 8 کاراکتر باشد.",
      },
      {
        name: "role",
        label: "نقش",
        type: "select",
        required: true,
        options: [
          { value: "admin", label: " ادمین" },
          { value: "manager", label: "مدیر" },
          { value: "editor", label: "ادیتور" },
          { value: "designer", label: "طراح" },
          { value: "shooter", label: "فیلمبردار" },
        ],
      },
      {
        name: "permissions",
        label: "دسترسی‌ها",
        type: "select",
        required: true,
        defaultValue: "read",
        options: [
          { value: "read", label: "خواندن" },
          { value: "write", label: "نوشتن" },
          { value: "admin", label: "مدیریت" },
          { value: "manager", label: "مدیریت پروژه‌ها" },
        ],
        description: "دسترسی‌های کاربر",
      },
    ],
  };

  return <DynamicForm config={userRegisterFormConfig} />;
};

export default UserRegisterForm;
