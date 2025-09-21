"use client";

import React, { useState, useEffect } from "react";
import DynamicTable from "@/components/global/newdynamics/dynamicTable";
import { TableColumn, TableData, FormField, FilterField } from "@/types/dynamicTypes/types";
import toast from "react-hot-toast";

const ContactRequestsManagement: React.FC = () => {
  const [contactRequests, setContactRequests] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const columns: TableColumn[] = [
    {
      key: "name",
      header: "نام",
      sortable: true,
    },
    {
      key: "phoneNumber",
      header: "شماره تلفن",
      sortable: true,
    },
    {
      key: "title",
      header: "عنوان",
      sortable: true,
    },
    {
      key: "message",
      header: "پیام",
      sortable: false,
      render: (value) => {
        const text = value as string || "-";
        return (
          <div className="max-w-xs truncate" title={text}>
            {text.length > 50 ? `${text.substring(0, 50)}...` : text}
          </div>
        );
      },
    },
    {
      key: "type",
      header: "نوع درخواست",
      sortable: true,
      render: (value) => {
        const typeMap: { [key: string]: string } = {
          content: "محتوا",
          photo: "عکاسی",
          video: "ویدیو",
          social: "شبکه اجتماعی"
        };
        return typeMap[value as string] || value;
      },
    },
    {
      key: "status",
      header: "وضعیت",
      sortable: true,
      render: (value) => {
        const statusMap: { [key: string]: { label: string, color: string } } = {
          pending: { label: "در انتظار", color: "bg-yellow-100 text-yellow-800" },
          "in-progress": { label: "در حال انجام", color: "bg-blue-100 text-blue-800" },
          completed: { label: "تکمیل شده", color: "bg-green-100 text-green-800" },
          cancelled: { label: "لغو شده", color: "bg-red-100 text-red-800" }
        };
        const status = statusMap[value as string] || { label: value, color: "bg-gray-100 text-gray-800" };
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
            {status.label}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "تاریخ ایجاد",
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString("fa-IR"),
    },
  ];

  const formFields: FormField[] = [
    {
      name: "name",
      label: "نام",
      type: "text",
      placeholder: "نام را وارد کنید",
      validation: [{ type: "required", message: "نام الزامی است" }],
    },
    {
      name: "phoneNumber",
      label: "شماره تلفن",
      type: "tel",
      placeholder: "شماره تلفن را وارد کنید",
      validation: [{ type: "required", message: "شماره تلفن الزامی است" }],
    },
    {
      name: "title",
      label: "عنوان",
      type: "text",
      placeholder: "عنوان درخواست را وارد کنید",
      validation: [{ type: "required", message: "عنوان الزامی است" }],
    },
    {
      name: "message",
      label: "پیام",
      type: "textarea",
      placeholder: "پیام درخواست را وارد کنید",
      validation: [{ type: "required", message: "پیام الزامی است" }],
    },
    {
      name: "type",
      label: "نوع درخواست",
      type: "select",
      options: [
        { label: "محتوا", value: "content" },
        { label: "عکاسی", value: "photo" },
        { label: "ویدیو", value: "video" },
        { label: "شبکه اجتماعی", value: "social" },
      ],
      defaultValue: "content",
    },
    {
      name: "status",
      label: "وضعیت",
      type: "select",
      options: [
        { label: "در انتظار", value: "pending" },
        { label: "در حال انجام", value: "in-progress" },
        { label: "تکمیل شده", value: "completed" },
        { label: "لغو شده", value: "cancelled" },
      ],
      defaultValue: "pending",
    },
  ];

  const filterFields: FilterField[] = [
    {
      key: "name",
      label: "جستجو در نام",
      type: "text",
      placeholder: "نام را جستجو کنید...",
    },
    {
      key: "title",
      label: "جستجو در عنوان",
      type: "text",
      placeholder: "عنوان را جستجو کنید...",
    },
    {
      key: "type",
      label: "نوع درخواست",
      type: "select",
      options: [
        { label: "محتوا", value: "content" },
        { label: "عکاسی", value: "photo" },
        { label: "ویدیو", value: "video" },
        { label: "شبکه اجتماعی", value: "social" },
      ],
    },
    {
      key: "status",
      label: "وضعیت",
      type: "select",
      options: [
        { label: "در انتظار", value: "pending" },
        { label: "در حال انجام", value: "in-progress" },
        { label: "تکمیل شده", value: "completed" },
        { label: "لغو شده", value: "cancelled" },
      ],
    },
  ];

  const fetchContactRequests = async (page = 1, filters: Record<string, string> = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: (pagination?.itemsPerPage || 10).toString(),
        ...filters,
      });

      const response = await fetch(`/api/contactRequest?${params}`);
      const result = await response.json();

      if (result.success) {
        setContactRequests(result.data || []);
        setPagination(result.pagination || pagination);
      }
    } catch (error) {
      console.error('Error fetching contact requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/contactRequest?id=${id}`, {
        method: "DELETE",
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success("درخواست تماس با موفقیت حذف شد");
        fetchContactRequests();
      } else {
        toast.error(result.message || "خطا در حذف درخواست تماس");
      }
    } catch (error) {
      console.error("Error deleting contact request:", error);
      toast.error("خطا در حذف درخواست تماس");
    }
  };

  useEffect(() => {
    fetchContactRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] relative overflow-hidden" dir="rtl">
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="relative z-10 p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-3">مدیریت درخواستهای تماس</h1>
          <p className="text-white/70 text-lg">مدیریت کامل درخواستهای تماس با امکان جستجو، فیلتر، ویرایش و حذف</p>
        </div>
      
        <DynamicTable
          columns={columns}
          data={contactRequests}
          loading={loading}
          formFields={formFields}
          endpoint="/api/contactRequest"
          formTitle="ویرایش درخواست تماس"
          formSubtitle="اطلاعات درخواست تماس را ویرایش کنید"
          onRefresh={() => fetchContactRequests()}
          onDelete={handleDelete}
          pagination={pagination}
          onPageChange={(page) => fetchContactRequests(page)}
          filterFields={filterFields}
          onFilterChange={(filters) => {
            const stringFilters: Record<string, string> = {};
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                stringFilters[key] = String(value);
              }
            });
            fetchContactRequests(1, stringFilters);
          }}
        />
      </div>
    </div>
  );
};

export default ContactRequestsManagement;