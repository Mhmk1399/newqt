"use client";

import React from "react";
import DynamicTable from "@/components/tables/DynamicTable";
import { TableConfig } from "@/types/tables";
import toast from "react-hot-toast";

const CustomersTable: React.FC = () => {
  const customerTableConfig: TableConfig = {
    title: "مدیریت مشتریان",
    description: "لیست تمام مشتریان سیستم با امکان جستجو، فیلتر و مدیریت",
    endpoint: "/api/customers",
    columns: [
      {
        key: "name",
        label: "نام",
        type: "text",
        sortable: true,
      },
      {
        key: "phoneNumber",
        label: "شماره تلفن",
        type: "phone",
        sortable: true,
      },
      {
        key: "businessName",
        label: "نام کسبوکار",
        type: "text",
        sortable: true,
      },
      {
        key: "businessScale",
        label: "مقیاس کسبوکار",
        type: "text",
        sortable: true,
        render: (value) => {
          const scaleMap: { [key: string]: string } = {
            startup: "استارتاپ",
            small: "کوچک",
            medium: "متوسط",
            large: "بزرگ",
            enterprise: "سازمانی"
          };
          return scaleMap[value as string] || value || "-";
        }
      },
      {
        key: "isActive",
        label: "وضعیت فعالیت",
        type: "boolean",
        sortable: true,
      },
      {
        key: "isVip",
        label: "VIP",
        type: "boolean",
        sortable: true,
      },
      {
        key: "createdAt",
        label: "تاریخ ثبتنام",
        type: "date",
        sortable: true,
      },
    ],
    filters: [
      {
        key: "isActive",
        label: "وضعیت فعالیت",
        options: [
          { value: "true", label: "فعال" },
          { value: "false", label: "غیرفعال" },
        ],
      },
      {
        key: "businessScale",
        label: "مقیاس کسبوکار",
        options: [
          { value: "startup", label: "استارتاپ" },
          { value: "small", label: "کوچک" },
          { value: "medium", label: "متوسط" },
          { value: "large", label: "بزرگ" },
          { value: "enterprise", label: "سازمانی" },
        ],
      },
      {
        key: "isVip",
        label: "وضعیت VIP",
        options: [
          { value: "true", label: "VIP" },
          { value: "false", label: "عادی" },
        ],
      },
    ],
    actions: {
      view: true,
      edit: true,
      delete: true,
      activate: true,
    },
    onView: (row) => {
      console.log("View customer:", row);
      toast.success(`مشاهده جزئیات ${row.name}`);
    },
    onEdit: (row) => {
      console.log("Edit customer:", row);
      toast.success(`ویرایش ${row.name}`);
    },
    onDelete: (row) => {
      if (confirm(`آیا از حذف ${row.name} اطمینان دارید؟`)) {
        console.log("Delete customer:", row);
        toast.success(`${row.name} حذف شد`);
      }
    },
    onActivate: (row, newStatus) => {
      console.log("Toggle activation:", row, newStatus);
      toast.success(`وضعیت ${row.name} به ${newStatus ? 'فعال' : 'غیرفعال'} تغییر یافت`);
    },
  };

  return (
    <div className="p-6">
      <DynamicTable config={customerTableConfig} />
    </div>
  );
};

export default CustomersTable;