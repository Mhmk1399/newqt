"use client";

import React, { useState } from "react";
import DynamicModal, { ModalConfig } from "../../components/DynamicModal";
import toast from "react-hot-toast";
import { TableConfig } from "@/types/tables";
import DynamicTable from "./DynamicTable";

const CustomersTable: React.FC = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [refreshTable, setRefreshTable] = useState(0);

  const handleView = (customer: {
    _id: string | undefined;
    id: string 
  }) => {
    const config: ModalConfig = {
      title: "مشاهده جزئیات مشتری",
      type: "view",
      size: "lg",
      endpoint: "/api/customers/detailes",
      fields: [
        { key: "name", label: "نام و نام خانوادگی", type: "text" },
        { key: "email", label: "ایمیل", type: "email" },
        { key: "phoneNumber", label: "شماره تلفن", type: "tel" },
        { key: "businessName", label: "نام کسب‌وکار", type: "text" },
        {
          key: "businessScale",
          label: "مقیاس کسب‌وکار",
          type: "select",
          options: [
            { value: "startup", label: "استارتاپ" },
            { value: "small", label: "کوچک" },
            { value: "medium", label: "متوسط" },
            { value: "large", label: "بزرگ" },
            { value: "enterprise", label: "سازمانی" },
          ],
        },
        { key: "address", label: "آدرس", type: "textarea" },
        { key: "website", label: "وب‌سایت", type: "url" },
        {
          key: "isActive",
          label: "وضعیت فعالیت",
          type: "select",
          options: [
            { value: true, label: "فعال" },
            { value: false, label: "غیرفعال" },
          ],
        },
        {
          key: "verificationStatus",
          label: "وضعیت تأیید",
          type: "select",
          options: [
            { value: "pending", label: "در انتظار تأیید" },
            { value: "verified", label: "تأیید شده" },
            { value: "rejected", label: "رد شده" },
          ],
        },
        { key: "createdAt", label: "تاریخ ثبت نام", type: "date" },
        { key: "updatedAt", label: "آخرین به‌روزرسانی", type: "date" },
      ],
      onClose: () => setShowModal(false),
    };

    setModalConfig(config);
    setSelectedCustomerId(customer._id || customer.id);
    setShowModal(true);
  };

  const handleEdit = (customer: {
    _id: string | undefined;
    id: string
  }) => {
    const config: ModalConfig = {
      title: "ویرایش اطلاعات مشتری",
      type: "edit",
      size: "lg",
      endpoint: "/api/customers/detailes",
      method: "PATCH",
      fields: [
        {
          key: "name",
          label: "نام و نام خانوادگی",
          type: "text",
          required: true,
        },
        { key: "email", label: "ایمیل", type: "email", required: true },
        {
          key: "phoneNumber",
          label: "شماره تلفن",
          type: "tel",
          required: true,
        },
        {
          key: "businessName",
          label: "نام کسب‌وکار",
          type: "text",
          required: true,
        },
        {
          key: "businessScale",
          label: "مقیاس کسب‌وکار",
          type: "select",
          required: true,
          options: [
            { value: "startup", label: "استارتاپ" },
            { value: "small", label: "کوچک" },
            { value: "medium", label: "متوسط" },
            { value: "large", label: "بزرگ" },
            { value: "enterprise", label: "سازمانی" },
          ],
        },
        { key: "address", label: "آدرس", type: "textarea" },
        { key: "website", label: "وب‌سایت", type: "url" },
        {
          key: "isActive",
          label: "وضعیت فعالیت",
          type: "select",
          options: [
            { value: true, label: "فعال" },
            { value: false, label: "غیرفعال" },
          ],
        },
        {
          key: "verificationStatus",
          label: "وضعیت تأیید",
          type: "select",
          options: [
            { value: "pending", label: "در انتظار تأیید" },
            { value: "verified", label: "تأیید شده" },
            { value: "rejected", label: "رد شده" },
          ],
        },
      ],
      onSuccess: (data) => {
        console.log("Customer updated successfully:", data);
        toast.success("مشتری با موفقیت ویرایش شد");
        setRefreshTable((prev) => prev + 1); // Trigger table refresh
      },
      onError: (error) => {
        toast.error("خطا در ویرایش مشتری");
        console.error("Update error:", error);
      },
      onClose: () => setShowModal(false),
      confirmText: "ذخیره تغییرات",
    };

    setModalConfig(config);
    setSelectedCustomerId(customer._id || customer.id);
    setShowModal(true);
  };

  const handleDelete = (customer: { _id: string 
    | undefined ;
    id: string 
  }) => {
    const config: ModalConfig = {
      title: "حذف مشتری",
      type: "delete",
      size: "md",
      endpoint: "/api/customers/detailes",
      method: "DELETE",
      onSuccess: (data) => {
        console.log("Customer deleted successfully:", data);
        toast.success("مشتری با موفقیت حذف شد");
        setRefreshTable((prev) => prev + 1); // Trigger table refresh
      },
      onError: (error) => {
        toast.error("خطا در حذف مشتری: " + error);
        console.error("Delete error:", error);
      },
      onClose: () => setShowModal(false),
      confirmText: "حذف مشتری",
      cancelText: "لغو",
    };

    setModalConfig(config);
    setSelectedCustomerId(customer?._id || customer?.id);
    setShowModal(true);
  };

  const customersTableConfig: TableConfig = {
    title: "لیست مشتریان",
    description: "مدیریت و مشاهده اطلاعات مشتریان سیستم",
    endpoint: "/api/customers",
    columns: [
      {
        key: "name",
        label: "نام",
        type: "text",
        sortable: true,
        width: "150px",
      },
      {
        key: "email",
        label: "ایمیل",
        type: "email",
        sortable: true,
        width: "200px",
      },
      {
        key: "phoneNumber",
        label: "شماره تلفن",
        type: "phone",
        sortable: true,
        width: "130px",
      },
      {
        key: "businessName",
        label: "نام کسب‌وکار",
        type: "text",
        sortable: true,
        width: "150px",
      },
      {
        key: "businessScale",
        label: "مقیاس کسب‌وکار",
        type: "text",
        sortable: true,
        width: "120px",
        render: (value) => {
          const scaleLabels: { [key: string]: string } = {
            startup: "استارتاپ",
            small: "کوچک",
            medium: "متوسط",
            large: "بزرگ",
            enterprise: "سازمانی",
          };
          return (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {scaleLabels[value] || value}
            </span>
          );
        },
      },
      {
        key: "website",
        label: "وب‌سایت",
        type: "text",
        sortable: false,
        width: "150px",
        render: (value) => {
          if (!value) return "-";
          return (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              {value.length > 20 ? `${value.substring(0, 20)}...` : value}
            </a>
          );
        },
      },
      {
        key: "isActive",
        label: "وضعیت فعالیت",
        type: "status",
        sortable: true,
        width: "100px",
        render: (value) => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {value ? "فعال" : "غیرفعال"}
          </span>
        ),
      },
      {
        key: "verificationStatus",
        label: "وضعیت تأیید",
        type: "status",
        sortable: true,
        width: "120px",
        render: (value) => {
          const statusConfig: {
            [key: string]: { label: string; className: string };
          } = {
            pending: {
              label: "در انتظار",
              className: "bg-yellow-100 text-yellow-800",
            },
            verified: {
              label: "تأیید شده",
              className: "bg-green-100 text-green-800",
            },
            rejected: { label: "رد شده", className: "bg-red-100 text-red-800" },
          };
          const config = statusConfig[value] || {
            label: value,
            className: "bg-gray-100 text-gray-800",
          };
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs ${config.className}`}
            >
              {config.label}
            </span>
          );
        },
      },
      {
        key: "createdAt",
        label: "تاریخ ثبت نام",
        type: "date",
        sortable: true,
        width: "120px",
      },
    ],
    actions: {
      view: true,
      edit: true,
      delete: true,
    },
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
    
  };

  return (
    <div>
      <DynamicTable
        config={customersTableConfig}
        key={refreshTable} // Force re-render when refreshTable changes
      />

      {/* Dynamic Modal */}
      {showModal && modalConfig && (
        <DynamicModal
          isOpen={showModal}
          config={modalConfig}
          itemId={selectedCustomerId}
        />
      )}
    </div>
  );
};

export default CustomersTable;
