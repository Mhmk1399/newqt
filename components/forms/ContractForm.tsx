"use client";

import React, { useState, useEffect } from "react";
import DynamicForm from "./DynamicForm";
import { FormConfig } from "@/types/form";

interface ContractFormHiddenProps {
  onSuccess?: (data: string) => void;
  onError?: (error: string) => void;
  customerId?: string; // Optional prop to pass customer ID
}

const ContractFormHidden: React.FC<ContractFormHiddenProps> = ({
  onSuccess,
  onError,
  customerId,
}) => {
  const [currentCustomerId, setCurrentCustomerId] = useState<string>("");

  const handleFormSuccess = (data: string) => {
    console.log('Form submitted successfully:', data);
    if (onSuccess) {
      onSuccess(data);
    }
  };

  const handleFormError = (error: string) => {
    console.error('Form submission error:', error);
    if (onError) {
      onError(error);
    }
  };

  // Get customer ID from token or props
  useEffect(() => {
    const getCustomerIdFromToken = () => {
      try {
        // Check if customer ID is passed as prop
        if (customerId) {
          setCurrentCustomerId(customerId);
          return;
        }

        // Try to get from localStorage token
        const token = localStorage.getItem("customerToken");
        console.log(token);
        if (token) {
          const decodedToken = JSON.parse(atob(token.split(".")[1]));
          console.log(decodedToken);
          if (decodedToken.customerId) {
            setCurrentCustomerId(decodedToken.customerId);
            return;
          }
        }
      } catch (error) {
        console.log(error)
      }
    };

    getCustomerIdFromToken();
  }, [customerId]);

  // Debug: Log the customer ID
  console.log('Current customer ID:', currentCustomerId);

  const contractFormConfig: FormConfig = {
    title: "ساخت قرارداد",
    description: "ساخت قرارداد جدید",
    endpoint: "/api/contracts",
    method: "POST",
    submitButtonText: "ثبت قرارداد",
    onSuccess: handleFormSuccess,
    onError: handleFormError,
    fields: [
      {
        name: "customerId",
        label: "شناسسه مشتری",
        type: "hidden", // This field will be hidden from the user
        defaultValue: currentCustomerId,
        required: true,
      },
      {
        name: "contractNumber",
        label: "شماره قرارداد",
        type: "text",
        placeholder: "Enter unique contract number",
        required: true,
        validation: {
          minLength: 3,
          maxLength: 50,
        },
      },
      {
        name: "contractType",
        label: "نوع قرارداد",
        type: "select",
        required: true,
        defaultValue: "standard",
        options: [
          { value: "standard", label: "Standard" },
          { value: "premium", label: "Premium" },
          { value: "enterprise", label: "Enterprise" },
          { value: "custom", label: "Custom" },
        ],
      },
      {
        name: "status",
        label: "Contract Status",
        type: "select",
        required: true,
        defaultValue: "draft",
        options: [
          { value: "draft", label: "Draft" },
          { value: "active", label: "Active" },
          { value: "completed", label: "Completed" },
          { value: "terminated", label: "Terminated" },
          { value: "expired", label: "Expired" },
        ],
      },
      {
        name: "signedDate",
        label: "Signed Date",
        type: "date",
        required: false,
        description: "Date when the contract was signed",
      },
      {
        name: "expiryDate",
        label: "Expiry Date",
        type: "date",
        required: false,
        description: "Date when the contract expires",
      },
      {
        name: "terms",
        label: "Contract Terms",
        type: "textarea",
        placeholder: "Enter contract terms and conditions",
        required: false,
        validation: {
          maxLength: 5000,
        },
        description: "Detailed terms and conditions of the contract",
      },
    ],
  };

  // Don't render the form until we have the customer ID
  if (!currentCustomerId) {
    return <div className="text-center p-4">Loading customer information...</div>;
  }

  return (
    <DynamicForm
      config={contractFormConfig}
      initialData={{ customerId: currentCustomerId }}
    />
  );
};

export default ContractFormHidden;
