"use client";

import DynamicForm from "../DynamicForm";
import { FormConfig } from "@/types/form";

interface CustomerLoginFormProps {
  onSuccess?: (data: string) => void;
  onError?: (error: string) => void;
}

const CustomerLoginForm: React.FC<CustomerLoginFormProps> = ({
  onSuccess,
  onError,
}) => {
  const handleLoginSuccess = (response: {
    success: boolean;
    message: string;
    data: {
      customer: {
        _id: string;
        name: string;
        email: string;
        phoneNumber: string;
      };
      token: string;
    };
  }) => {
    console.log("Full API response:", response); // Debug log

    // The API returns: { success: true, message: "Login successful", data: { customer: {...}, token: "..." } }
    // So we need to access response.data.token and response.data.customer
    if (response.data && response.data.token) {
      localStorage.setItem("customerToken", response.data.token);
    } else {
      console.error("Token not found in response:", response);
    }

    // Call the parent success handler if provided
    if (onSuccess) {
      onSuccess(response.message);
    } else {
      // Default success behavior - redirect to dashboard or home
      window.location.href = "/customers/admin";
    }
  };

  const handleLoginError = (error: string) => {
    console.error("Login error:", error); // Debug log

    // Call the parent error handler if provided
    if (onError) {
      onError(error);
    } else {
      // Default error behavior
      console.error("Login failed:", error);
    }
  };

  const customerLoginFormConfig: FormConfig = {
    title: "ورود به حساب کاربری",
    description:
      "برای ورود به حساب کاربری خود، شماره تلفن و رمز عبور را وارد کنید",
    endpoint: "/api/customers/login",
    method: "POST",
    submitButtonText: "ورود",
    onSuccess: handleLoginSuccess,
    onError: handleLoginError,
    className: "max-w-md", // Make it narrower for login form
    fields: [
      {
        name: "phoneNumber",
        label: "شماره تلفن",
        type: "tel",
        placeholder: "شماره تلفن خود را وارد کنید",
        required: true,
        validation: {
          pattern: "^[+]?[0-9]{10,15}$",
          minLength: 10,
          maxLength: 15,
        },
        description: "شماره تلفن همراه با کد کشور (مثال: +989123456789)",
      },
      {
        name: "password",
        label: "رمز عبور",
        type: "password",
        placeholder: "رمز عبور خود را وارد کنید",
        required: true,
        validation: {
          minLength: 8,
        },
        description: "رمز عبور باید حداقل 8 کاراکتر باشد",
      },
    ],
  };

  return <DynamicForm config={customerLoginFormConfig} />;
};

export default CustomerLoginForm;
