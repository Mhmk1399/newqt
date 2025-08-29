"use client";

import React, { useState, useEffect } from "react";
import { FormConfig } from "@/types/form";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import toast from "react-hot-toast";

const TransactionForm: React.FC = () => {
  const [users, setUsers] = useState<Array<{ value: string; label: string }>>(
    []
  );
  const [customers, setCustomers] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [transactionDate, setTransactionDate] = useState<DateObject | null>(
    new DateObject()
  );
  const [formData, setFormData] = useState<{
    debtor: string;
    subject: string;
    fastener: string;
    amount: string;
    description: string;
    [key: string]: string;
  }>({
    debtor: "",
    subject: "",
    fastener: "",
    amount: "",
    description: "",
  });

  useEffect(() => {
    // Fetch users
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(
            data.data.map((user: { _id: string; name: string }) => ({
              value: user._id,
              label: user.name,
            }))
          );
        }
      });

    // Fetch customers
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCustomers(
            data.data.map((customer: { _id: string; name: string }) => ({
              value: customer._id,
              label: customer.name,
            }))
          );
        }
      });
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    if (!transactionDate) {
      toast.error("لطفاً تاریخ تراکنش را انتخاب کنید");
      return;
    }

    // Validate required fields
    if (!formData.subject || !formData.debtor || !formData.fastener) {
      toast.error("لطفاً تمام فیلدهای اجباری را تکمیل کنید");
      return;
    }

    // Convert Persian date to Gregorian for API
    const gregorianDate = transactionDate.toDate();
    
    const submissionData = {
      ...formData,
      date: gregorianDate,
    };

    console.log("Submitting data:", submissionData);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success("تراکنش با موفقیت ثبت شد");
        // Reset form on success
        setTransactionDate(new DateObject());
        setFormData({
           debtor: "",
    subject: "",
    fastener: "",
    amount: "",
    description: "",
        });
        // You might want to trigger a form reset here
      } else {
        toast.error(result.message || "خطا در ثبت تراکنش");
      }
    } catch (error) {
      console.error("Error submitting transaction:", error);
      toast.error("خطا در ارتباط با سرور");
    }
  };

  // Handle form data changes
  // const handleFormDataChange = (data: any) => {
  //   setFormData(data);
  // };

  const formConfig: FormConfig = {
    title: "ثبت تراکنش",
    description: "فرم ثبت تراکنش مالی جدید",
    endpoint: "/api/transactions", // This won't be used since we're handling submission manually
    method: "POST",
    submitButtonText: "ثبت تراکنش",
    successMessage: "تراکنش با موفقیت ثبت شد",
    errorMessage: "خطا در ثبت تراکنش",
    validationErrorMessage: "لطفاً اطلاعات فرم را به درستی تکمیل کنید.",
    fields: [
      {
        name: "subject",
        label: "موضوع تراکنش",
        type: "text",
        required: true,
        placeholder: "موضوع تراکنش را وارد کنید",
        validation: {
          minLength: 2,
          maxLength: 200,
        },
      },
      {
        name: "debtor",
        label: "مبلغ بدهکار",
        type: "number",
        placeholder: "مبلغ بدهکار را وارد کنید",
        required: true,
        validation: {
          min: 0,
        },
        description: "مبلغ به تومان",
      },
      {
        name: "fastener",
        label: "مبلغ بستانکار",
        type: "number",
        placeholder: "مبلغ بستانکار را وارد کنید",
        required: true,
        validation: {
          min: 0,
        },
        description: "مبلغ به تومان",
      },
      {
        name: "users",
        label: "کاربر",
        type: "select",
        required: false,
        options: [{ value: "", label: "کاربر را انتخاب کنید" }, ...users],
      },
      {
        name: "customer",
        label: "مشتری",
        type: "select",
        required: false,
        options: [{ value: "", label: "مشتری را انتخاب کنید" }, ...customers],
      },
    ],
  };

  return (
    <div className="w-full max-w-3xl mx-auto" dir="rtl">
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 border-b pb-3 text-center text-gray-800">
          {formConfig.title}
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          {formConfig.description}
        </p>
        
        {/* Custom Persian Date Picker */}
        <div className="mb-4 w-full">
          <label className="text-sm mb-2 block font-medium text-gray-700">
            تاریخ تراکنش <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <FaRegCalendarAlt className="text-gray-400" />
            <DatePicker
              value={transactionDate}
              onChange={setTransactionDate}
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              inputClass="w-full bg-transparent p-2 text-black focus:outline-none"
              calendarPosition="bottom-right"
              placeholder="تاریخ تراکنش را انتخاب کنید"
            />
          </div>
        </div>
        
        {/* Form Fields */}
        <div className="space-y-4">
          {formConfig.fields.map((field) => (
            <div key={field.name} className="mb-4">
              <label className="text-sm mb-2 block font-medium text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === "select" ? (
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                  min={field.validation?.min}
                  minLength={field.validation?.minLength}
                  maxLength={field.validation?.maxLength}
                />
              )}
              {field.description && (
                <p className="text-sm text-gray-500 mt-1">{field.description}</p>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 px-12 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-bold mt-6"
        >
          {formConfig.submitButtonText}
        </button>
      </div>
    </div>
  );
};

export default TransactionForm;
