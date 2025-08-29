"use client";

import DynamicForm from "../DynamicForm";
import { FormConfig } from "@/types/form";

interface CustomerFormProps {
  onSuccess?: (data: string) => void;
  onError?: (error: string) => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSuccess, onError }) => {
  const customerFormConfig: FormConfig = {
    title: "فرم ثبت نام",
    description: "لطفا اطلاعات خود را وارد کنید",
    endpoint: "/api/customers",
    method: "POST",
    submitButtonText: "ثبت نام",
    onSuccess,
    onError,
    validationErrorMessage: "لطفاً اطلاعات فرم را به درستی تکمیل کنید.",
    successMessage: "مشتری با موفقیت ثبت شد",
    errorMessage: "خطا در ثبت نام مشتری",
    fields: [
      {
        name: "name",
        label: "نام",
        type: "text",
        placeholder: "لطفا نام خود را وارد کنید",
        required: true,
        validation: {
          minLength: 2,
          maxLength: 100,
        },
      },
      {
        name: "email",
        label: "ایمیل",
        type: "email",
        placeholder: "لطفا ایمیل خود را وارد کنید",
        required: true,
        validation: {
          pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        },
      },
      {
        name: "phoneNumber",
        label: "شماره تماس",
        type: "tel",
        placeholder: "لطفا شماره تماس خود را وارد کنید",
        required: true,
        validation: {
          pattern: "^[+]?[0-9]{10,15}$",
        },
        description: "شماره تماس باید با 09 و حداقل 10 رقم باشد",
      },
      {
        name: "password",
        label: "رمز عبور",
        type: "password",
        placeholder: "لطفا رمز عبور خود را وارد کنید",
        required: false,
        validation: {
          minLength: 8,
        },
        description: "رمز عبور باید حداقل 8 کاراکتر باشد",
      },
      {
        name: "businessName",
        label: "نام سازمان",
        type: "text",
        placeholder: "لطفا نام سازمان خود را وارد کنید",
        required: true,
        validation: {
          minLength: 2,
          maxLength: 200,
        },
      },
      {
        name: "businessScale",
        label: "مقیاس سازمان",
        type: "select",
        required: true,
        options: [
          { value: "startup", label: "استارتاپ" },
          { value: "small", label: "کوچک" },
          { value: "medium", label: "متوسط" },
          { value: "large", label: "بزرگ" },
          { value: "enterprise", label: "شرکت" },
        ],
      },
      {
        name: "address",
        label: "آدرس کامل سازمان",
        type: "textarea",
        placeholder: "لطفا آدرس کامل سازمان خود را وارد کنید",
        required: true,
        validation: {
          minLength: 10,
          maxLength: 500,
        },
      },
      {
        name: "website",
        label: "وبسایت",
        type: "text",
        placeholder: "https://example.com",
        required: false,
        validation: {
          pattern: "^https?://.*",
        },
        description: "لطفا وبسایت خود را به صورت https://example.com وارد کنید",
      },
    ],
  };

  return <DynamicForm config={customerFormConfig} />;
};

export default CustomerForm;
