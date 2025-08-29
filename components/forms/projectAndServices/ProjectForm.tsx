"use client";

import React, { useState, useEffect, useRef } from "react";
import { FormConfig } from "@/types/form";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import toast from "react-hot-toast";

interface ProjectFormProps {
  onSuccess?: (data: string) => void;
  onError?: (error: string) => void;
}

interface Customer {
  _id: string;
  name: string;
  businessName: string;
}

interface Contract {
  customerId: string;
}

interface Manager {
  _id: string;
  name?: string;
  username?: string;
  email?: string;
}

interface Service {
  _id: string;
  name: string;
  teamId?: { name: string };
  basePrice?: number;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSuccess, onError }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allContracts, setAllContracts] = useState<Contract[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);

  // Persian date states - exactly like attendanceForm
  const [startDate, setStartDate] = useState<DateObject | null>(null);
  const [expectedEndDate, setExpectedEndDate] = useState<DateObject | null>(null);
  const [actualEndDate, setActualEndDate] = useState<DateObject | null>(null);
  
  const [formData, setFormData] = useState<{
    title?: string;
    name?: string;
    description?: string;
    customerId?: string;
    projectManagerId?: string;
    totalPrice?: number;
    finalPrice?: number;
    services?: string[];
    status?: string;
    paymentStatus?: string;
    discount?: number;
    paidAmount?: number;
    notes?: string;
    internalNotes?: string;
    [key: string]: string | number | string[] | undefined;
  }>({
    status: "planning",
    paymentStatus: "pending",
    discount: 0,
    paidAmount: 0,
  });

  // Fetch initial data
  useEffect(() => {
    if (hasInitialized.current) return;
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Fetch customers
        const customersResponse = await fetch("/api/customers");
        const customersData = await customersResponse.json();

        // Fetch all contracts
        const contractsResponse = await fetch("/api/contracts");
        const contractsData = await contractsResponse.json();

        // Fetch users/managers
        const usersResponse = await fetch("/api/users");
        const usersData = await usersResponse.json();

        // Fetch services
        const servicesResponse = await fetch("/api/services");
        const servicesData = await servicesResponse.json();

        if (customersData.success) {
          setCustomers(customersData.data || []);
        }

        if (contractsData.success) {
          setAllContracts(contractsData.data || []);
        }

        if (usersData.success) {
          setManagers(usersData.data || []);
        }

        if (servicesData.success) {
          setServices(servicesData.data || []);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
        hasInitialized.current = true;
      }
    };

    fetchInitialData();
  }, []);

  // Filter contracts when customer changes
  useEffect(() => {
    if (selectedCustomerId) {
      // Filter contracts for the selected customer
      allContracts.filter(
        (contract) => contract.customerId === selectedCustomerId
      );
    } 
  }, [selectedCustomerId, allContracts]);

  const handleCustomerChange = (fieldName: string, value: string | string[]) => {
    setSelectedCustomerId(value as string);
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  // Handle form submission with Persian dates - exactly like attendanceForm
  const handleProjectSubmit = async () => {
    // Validate required fields
    if (!formData.title || !formData.description || !formData.customerId || !formData.projectManagerId || !formData.totalPrice || !formData.finalPrice) {
      toast.error("لطفاً تمام فیلدهای اجباری را تکمیل کنید");
      return;
    }

    // Convert dates exactly like in attendanceForm
    const formattedStartDate = startDate ? startDate.toDate() : null; // Converts to JS Date (Gregorian)
    const formattedExpectedEndDate = expectedEndDate ? expectedEndDate.toDate() : null;
    const formattedActualEndDate = actualEndDate ? actualEndDate.toDate() : null;

    // Prepare submission data
    const submissionData = {
      ...formData,
      startDate: formattedStartDate,
      expectedEndDate: formattedExpectedEndDate,
      actualEndDate: formattedActualEndDate,
    };

    console.log("Submitting project data:", submissionData);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success("پروژه با موفقیت ایجاد شد");
        // Reset form on success - exactly like attendanceForm
        setStartDate(null);
        setExpectedEndDate(null);
        setActualEndDate(null);
        setFormData({
          status: "planning",
          paymentStatus: "pending",
          discount: 0,
          paidAmount: 0,
        });
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        toast.error(result.message || "خطا در ساخت پروژه");
        if (onError) {
          onError(result.message || "خطا در ساخت پروژه");
        }
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      toast.error("خطا در ارتباط با سرور");
      if (onError) {
        onError("خطا در ارتباط با سرور");
      }
    }
  };

  // Fixed: Create static form config to prevent infinite loops
  const getFormConfig = (): FormConfig => {
    return {
      title: "ایجاد پروژه جدید",
      description: "فرم زیر را برای ایجاد پروژه جدید تکمیل کنید",
      endpoint: "/api/projects",
      method: "POST",
      submitButtonText: "ایجاد پروژه",
      onSuccess,
      onError,
      successMessage: "پروژه با موفقیت ایجاد شد",
      errorMessage: "خطا در ساخت پروژه",
      validationErrorMessage: "لطفا تمامی فیلدهای الزامی را پر کنید",
      fields: [
        {
          name: "title",
          label: "عنوان پروژه",
          type: "text",
          placeholder: "عنوان پروژه را وارد کنید",
          required: true,
          validation: {
            minLength: 2,
            maxLength: 200,
          },
        },
        {
          name: "description",
          label: "توضیحات پروژه",
          type: "textarea",
          placeholder: "توضیحات کامل پروژه را وارد کنید",
          required: true,
          validation: {
            minLength: 10,
            maxLength: 1000,
          },
        },
        {
          name: "customerId",
          label: "مشتری",
          type: "select",
          required: true,
          options: [
            { value: "", label: "مشتری را انتخاب کنید" },
            ...customers.map((customer) => ({
              value: customer._id,
              label: `${customer.name} - ${customer.businessName}`,
            })),
          ],
          onChange: handleCustomerChange,
        },
        {
          name: "projectManagerId",
          label: "مدیر پروژه",
          type: "select",
          required: true,
          options: [
            { value: "", label: "مدیر پروژه را انتخاب کنید" },
            ...managers.map((manager) => ({
              value: manager._id,
              label: manager.name || manager.username || manager.email || "نامشخص",
            })),
          ],
        },
        {
          name: "services",
          label: "خدمات پروژه",
          type: "checkbox-group",
          required: false,
          options: services.map((service) => ({
            value: service._id,
            label: `${service.name}`,
            description: service.teamId
              ? `تیم: ${service.teamId.name || "نامشخص"} - ${
                  service.basePrice?.toLocaleString() || 0
                } تومان`
              : `بدون تیم - ${service.basePrice?.toLocaleString() || 0} تومان`,
          })),
          description:
            "خدماتی که در این پروژه ارائه خواهد شد را انتخاب کنید (می‌توانید چندین خدمت انتخاب کنید)",
          placeholder: "خدمات مورد نظر را انتخاب کنید",
        },
        {
          name: "status",
          label: "وضعیت پروژه",
          type: "select",
          required: true,
          defaultValue: "planning",
          options: [
            { value: "planning", label: "در حال برنامه‌ریزی" },
            { value: "active", label: "فعال" },
            { value: "paused", label: "متوقف شده" },
            { value: "completed", label: "تکمیل شده" },
            { value: "cancelled", label: "لغو شده" },
          ],
        },
        {
          name: "paymentStatus",
          label: "وضعیت پرداخت",
          type: "select",
          required: true,
          defaultValue: "pending",
          options: [
            { value: "pending", label: "در انتظار پرداخت" },
            { value: "partial", label: "پرداخت جزئی" },
            { value: "paid", label: "پرداخت شده" },
            { value: "overdue", label: "معوقه" },
          ],
        },
        {
          name: "totalPrice",
          label: "قیمت کل (تومان)",
          type: "number",
          placeholder: "قیمت کل پروژه را وارد کنید",
          required: true,
          validation: {
            min: 0,
          },
        },
        {
          name: "finalPrice",
          label: "قیمت نهایی (تومان)",
          type: "number",
          placeholder: "قیمت نهایی پروژه را وارد کنید",
          required: true,
          validation: {
            min: 0,
          },
          description: "قیمت نهایی پس از اعمال تخفیف",
        },
        {
          name: "discount",
          label: "تخفیف (تومان)",
          type: "number",
          placeholder: "مقدار تخفیف را وارد کنید",
          required: false,
          defaultValue: 0,
          validation: {
            min: 0,
          },
        },
        {
          name: "paidAmount",
          label: "مبلغ پرداخت شده (تومان)",
          type: "number",
          placeholder: "مبلغ پرداخت شده را وارد کنید",
          required: false,
          defaultValue: 0,
          validation: {
            min: 0,
          },
        },
        {
          name: "notes",
          label: "یادداشت‌های عمومی",
          type: "textarea",
          placeholder: "یادداشت‌های مربوط به پروژه (قابل مشاهده برای مشتری)",
          required: false,
          validation: {
            maxLength: 1000,
          },
        },
        {
          name: "internalNotes",
          label: "یادداشت‌های داخلی",
          type: "textarea",
          placeholder: "یادداشت‌های داخلی (فقط برای تیم)",
          required: false,
          validation: {
            maxLength: 1000,
          },
          description: "این یادداشت‌ها فقط برای تیم داخلی قابل مشاهده است",
        },
      ],
    };
  };

  // Show loading state
  if (loading) {
    return (
      <div
        className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md"
        dir="rtl"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری اطلاعات...</p>
        </div>
      </div>
    );
  }

  // Get form config when needed
  const formConfig = getFormConfig();

  return (
    <div className="w-full max-w-4xl mx-auto" dir="rtl">
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 border-b pb-3 text-center text-gray-800">
          {formConfig.title}
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          {formConfig.description}
        </p>
        
        {/* Form Fields - Fixed: Added id and name attributes */}
        <div className="space-y-4">
          {formConfig.fields.map((field: import("../../../types/form").FormField) => (
            <div key={field.name} className="mb-4">
              <label 
                htmlFor={field.name}
                className="text-sm mb-2 block font-medium text-gray-700"
              >
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={String(formData[field?.name] || field.defaultValue || "")}
                  onChange={(e) => {
                    const newFormData = {...formData, [field.name]: e.target.value};
                    setFormData(newFormData);
                    if (field.onChange) {
                      field.onChange(field.name, e.target.value);
                    }
                  }}
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px]"
                  value={String(formData[field.name] || "")}
                  onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                  minLength={field.validation?.minLength}
                  maxLength={field.validation?.maxLength}
                />
              ) : field.type === "checkbox-group" ? (
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {field.options?.map((option) => (
                    <label key={option.value} className="flex items-start space-x-2 space-x-reverse">
                      <input
                        id={`${field.name}-${option.value}`}
                        name={`${field.name}[]`}
                        type="checkbox"
                        value={option.value}
                        checked={(formData[field.name] as string[] || []).includes(option.value)}
                        onChange={(e) => {
                          const currentValues = formData[field.name] as string[] || [];
                          const newValues = e.target.checked
                            ? [...currentValues, option.value]
                            : currentValues.filter((v: string) => v !== option.value);
                          setFormData({...formData, [field.name]: newValues});
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="text-xs text-gray-500">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              ) : field.type === "number" ? (
                <input
                  id={field.name}
                  name={field.name}
                  type="number"
                  placeholder={field.placeholder}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={String(formData[field.name] || field.defaultValue || "")}
                  onChange={(e) => setFormData({...formData, [field.name]: parseFloat(e.target.value) || 0})}
                  min={field.validation?.min}
                />
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={String(formData[field.name] || field.defaultValue || "")}
                  onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
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

        {/* Persian Date Pickers - Exactly like attendanceForm */}
      {/* Persian Date Pickers */}
<div className="mt-6 space-y-4">
  {/* تاریخ شروع */}
  <div className="mb-4 w-full">
    <label className="text-sm mb-2 block">تاریخ شروع</label>
    <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg">
      <FaRegCalendarAlt className="text-gray-400" />
      <DatePicker
        value={startDate}
        onChange={setStartDate}
        calendar={persian}
        locale={persian_fa}
        format="YYYY/MM/DD"
        containerClassName="w-full"
        inputClass="w-full bg-transparent p-2 text-black focus:outline-none border rounded-lg"
        calendarPosition="bottom-right"
        zIndex={1000} // Ensure calendar appears above other elements
        placeholder="تاریخ شروع پروژه را انتخاب کنید"
        onOpen={() => console.log("Start DatePicker opened")}
        onClose={() => console.log("Start DatePicker closed")}
      />
    </div>
    <p className="text-sm text-gray-500 mt-1">تاریخ شروع پروژه (اختیاری)</p>
  </div>

  {/* تاریخ پایان مورد انتظار */}
  <div className="mb-4 w-full">
    <label className="text-sm mb-2 block">تاریخ پایان مورد انتظار</label>
    <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg">
      <FaRegCalendarAlt className="text-gray-400" />
      <DatePicker
        value={expectedEndDate}
        onChange={setExpectedEndDate}
        calendar={persian}
        locale={persian_fa}
        format="YYYY/MM/DD"
        containerClassName="w-full"
        inputClass="w-full bg-transparent p-2 text-black focus:outline-none border rounded-lg"
        calendarPosition="bottom-right"
        zIndex={1000}
        placeholder="تاریخ پایان مورد انتظار را انتخاب کنید"
        onOpen={() => console.log("Expected End DatePicker opened")}
        onClose={() => console.log("Expected End DatePicker closed")}
      />
    </div>
    <p className="text-sm text-gray-500 mt-1">تاریخ مورد انتظار برای پایان پروژه</p>
  </div>

  {/* تاریخ پایان واقعی */}
  <div className="mb-4 w-full">
    <label className="text-sm mb-2 block">تاریخ پایان واقعی</label>
    <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg">
      <FaRegCalendarAlt className="text-gray-400" />
      <DatePicker
        value={actualEndDate}
        onChange={setActualEndDate}
        calendar={persian}
        locale={persian_fa}
        format="YYYY/MM/DD"
        containerClassName="w-full"
        inputClass="w-full bg-transparent p-2 text-black focus:outline-none border rounded-lg"
        calendarPosition="bottom-right"
        zIndex={1000}
        placeholder="تاریخ پایان واقعی را انتخاب کنید"
        onOpen={() => console.log("Actual End DatePicker opened")}
        onClose={() => console.log("Actual End DatePicker closed")}
      />
    </div>
    <p className="text-sm text-gray-500 mt-1">تاریخ واقعی پایان پروژه</p>
  </div>
</div>

        {/* Submit Button */}
        <button
          onClick={handleProjectSubmit}
          className="w-full py-3 px-12 bg-blue-500 text-white rounded-xl hover:opacity-90 transition font-bold mt-6"
        >
          {formConfig.submitButtonText}
        </button>
      </div>
    </div>
  );
};

export default ProjectForm;

