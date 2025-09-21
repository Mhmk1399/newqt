"use client";

import React, { useState, useEffect } from "react";
import DynamicTable from "@/components/global/newdynamics/dynamicTable";
import { TableColumn, TableData, FormField, FilterField } from "@/types/dynamicTypes/types";
import toast from "react-hot-toast";

const CoWorkersManagement: React.FC = () => {
  const [coworkers, setCoworkers] = useState<TableData[]>([]);
  const [users, setUsers] = useState<{_id: string, name: string, email: string}[]>([]);
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
      header: "نام همکار",
      sortable: true,
    },
    {
      key: "email",
      header: "ایمیل",
      sortable: true,
    },
    {
      key: "phoneNumber",
      header: "شماره تلفن",
      sortable: true,
    },
    {
      key: "experties",
      header: "تخصص",
      sortable: true,
      render: (value) => {
        const expertiesMap: { [key: string]: string } = {
          model: "مدل",
          makeUpArtist: "آرایشگر",
          stylist: "استایلیست",
          location: "مکان",
          photoGrapher: "عکاس"
        };
        return expertiesMap[value as string] || value || "-";
      },
    },
    {
      key: "description",
      header: "توضیحات",
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
      key: "isApprove",
      header: "تایید شده",
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
        }`}>
          {value ? "تایید شده" : "در انتظار تایید"}
        </span>
      ),
    },
    {
      key: "aprovedBy",
      header: "تایید کننده",
      sortable: false,
      render: (value) => {
        if (typeof value === 'object' && value && 'name' in value) {
          return (value as Record<string, unknown>).name as string;
        }
        return value || "-";
      },
    },
    {
      key: "isActive",
      header: "وضعیت",
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {value ? "فعال" : "غیرفعال"}
        </span>
      ),
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
      label: "نام همکار",
      type: "text",
      placeholder: "نام همکار را وارد کنید",
      validation: [{ type: "required", message: "نام همکار الزامی است" }],
    },
    {
      name: "email",
      label: "ایمیل",
      type: "email",
      placeholder: "ایمیل را وارد کنید",
    },
    {
      name: "phoneNumber",
      label: "شماره تلفن",
      type: "text",
      placeholder: "شماره تلفن را وارد کنید",
      validation: [{ type: "required", message: "شماره تلفن الزامی است" }],
    },
    {
      name: "password",
      label: "رمز عبور",
      type: "password",
      placeholder: "رمز عبور را وارد کنید",
      validation: [{ type: "required", message: "رمز عبور الزامی است" }],
    },
    {
      name: "experties",
      label: "تخصص",
      type: "select",
      options: [
        { label: "مدل", value: "model" },
        { label: "آرایشگر", value: "makeUpArtist" },
        { label: "استایلیست", value: "stylist" },
        { label: "مکان", value: "location" },
        { label: "عکاس", value: "photoGrapher" },
      ],
    },
    {
      name: "description",
      label: "توضیحات",
      type: "textarea",
      placeholder: "توضیحات همکار را وارد کنید",
    },
    {
      name: "resomeLink",
      label: "لینک رزومه",
      type: "url",
      placeholder: "لینک رزومه را وارد کنید",
    },
    {
      name: "socialLinks.instagram",
      label: "اینستاگرام",
      type: "text",
      placeholder: "آدرس اینستاگرام را وارد کنید",
    },
    {
      name: "socialLinks.telegram",
      label: "تلگرام",
      type: "text",
      placeholder: "آدرس تلگرام را وارد کنید",
    },
    {
      name: "socialLinks.whatsapp",
      label: "واتساپ",
      type: "text",
      placeholder: "شماره واتساپ را وارد کنید",
    },
    {
      name: "aprovedBy",
      label: "تایید کننده",
      type: "select",
      placeholder: "کاربر تایید کننده را انتخاب کنید",
      options: users.map(user => ({ label: user.name, value: user._id })),
    },
    {
      name: "isApprove",
      label: "وضعیت تایید",
      type: "select",
      options: [
        { label: "تایید شده", value: "true" },
        { label: "در انتظار تایید", value: "false" },
      ],
      defaultValue: "false",
    },
    {
      name: "isActive",
      label: "وضعیت فعالیت",
      type: "select",
      options: [
        { label: "فعال", value: "true" },
        { label: "غیرفعال", value: "false" },
      ],
      defaultValue: "true",
    },
  ];

  const filterFields: FilterField[] = [
    {
      key: "search",
      label: "جستجو",
      type: "text",
      placeholder: "نام، ایمیل، شماره تلفن یا توضیحات را جستجو کنید...",
    },
    {
      key: "experties",
      label: "تخصص",
      type: "select",
      options: [
        { label: "مدل", value: "model" },
        { label: "آرایشگر", value: "makeUpArtist" },
        { label: "استایلیست", value: "stylist" },
        { label: "مکان", value: "location" },
        { label: "عکاس", value: "photoGrapher" },
      ],
    },
    {
      key: "isApprove",
      label: "وضعیت تایید",
      type: "select",
      options: [
        { label: "تایید شده", value: "true" },
        { label: "در انتظار تایید", value: "false" },
      ],
    },
    {
      key: "isActive",
      label: "وضعیت فعالیت",
      type: "select",
      options: [
        { label: "فعال", value: "true" },
        { label: "غیرفعال", value: "false" },
      ],
    },
  ];

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users?dropdown=true');
      const result = await response.json();
      if (result.success) {
        setUsers(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCoworkers = async (page = 1, filters: Record<string, string> = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: (pagination?.itemsPerPage || 10).toString(),
        ...filters,
      });

      const response = await fetch(`/api/coworkers?${params}`);
      const result = await response.json();

      if (result.success) {
        setCoworkers(result.data || []);
        setPagination(result.pagination || pagination);
      }
    } catch (error) {
      console.error('Error fetching coworkers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/coworkers?id=${id}`, {
        method: "DELETE",
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success("همکار با موفقیت حذف شد");
        fetchCoworkers();
      } else {
        toast.error(result.message || "خطا در حذف همکار");
      }
    } catch (error) {
      console.error("Error deleting coworker:", error);
      toast.error("خطا در حذف همکار");
    }
  };

  const handleToggleActivation = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const response = await fetch("/api/coworkers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: newStatus }),
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success(`وضعیت همکار به ${newStatus ? 'فعال' : 'غیرفعال'} تغییر یافت`);
        fetchCoworkers();
      } else {
        toast.error(result.message || "خطا در تغییر وضعیت همکار");
      }
    } catch (error) {
      console.error("Error toggling coworker status:", error);
      toast.error("خطا در تغییر وضعیت همکار");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCoworkers();
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
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-3">مدیریت همکاران</h1>
          <p className="text-white/70 text-lg">مدیریت کامل همکاران با امکان جستجو، فیلتر، ویرایش و تایید</p>
        </div>
      
        <DynamicTable
          columns={columns}
          data={coworkers}
          loading={loading}
          formFields={formFields}
          endpoint="/api/coworkers"
          formTitle="ویرایش همکار"
          formSubtitle="اطلاعات همکار را ویرایش کنید"
          onRefresh={() => fetchCoworkers()}
          onDelete={handleDelete}
          onToggleApproval={handleToggleActivation}
          pagination={pagination}
          onPageChange={(page) => fetchCoworkers(page)}
          filterFields={filterFields}
          onFilterChange={(filters) => {
            const stringFilters: Record<string, string> = {};
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                stringFilters[key] = String(value);
              }
            });
            fetchCoworkers(1, stringFilters);
          }}
        />
      </div>
    </div>
  );
};

export default CoWorkersManagement;