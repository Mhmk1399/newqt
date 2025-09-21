"use client";

import React, { useState, useEffect } from "react";
import DynamicTable from "@/components/global/newdynamics/dynamicTable";
import { TableColumn, TableData, FormField, FilterField } from "@/types/dynamicTypes/types";
import toast from "react-hot-toast";

const TeamsManagement: React.FC = () => {
  const [teams, setTeams] = useState<TableData[]>([]);
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
      header: "نام تیم",
      sortable: true,
    },
    {
      key: "specialization",
      header: "تخصص",
      sortable: true,
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
      label: "نام تیم",
      type: "text",
      placeholder: "نام تیم را وارد کنید",
      validation: [{ type: "required", message: "نام تیم الزامی است" }],
    },
    {
      name: "specialization",
      label: "تخصص",
      type: "text",
      placeholder: "تخصص تیم را وارد کنید",
      validation: [{ type: "required", message: "تخصص الزامی است" }],
    },
    {
      name: "description",
      label: "توضیحات",
      type: "textarea",
      placeholder: "توضیحات تیم را وارد کنید",
      validation: [{ type: "required", message: "توضیحات الزامی است" }],
    },
    {
      name: "isActive",
      label: "وضعیت",
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
      placeholder: "نام، تخصص یا توضیحات تیم را جستجو کنید...",
    },
    {
      key: "isActive",
      label: "وضعیت",
      type: "select",
      options: [
        { label: "فعال", value: "true" },
        { label: "غیرفعال", value: "false" },
      ],
    },
  ];

  const fetchTeams = async (page = 1, filters: Record<string, string> = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: (pagination?.itemsPerPage || 10).toString(),
        ...filters,
      });

      const response = await fetch(`/api/teams?${params}`);
      const result = await response.json();

      if (result.success) {
        setTeams(result.data || []);
        setPagination(result.pagination || pagination);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/teams?id=${id}`, {
        method: "DELETE",
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success("تیم با موفقیت حذف شد");
        fetchTeams();
      } else {
        toast.error(result.message || "خطا در حذف تیم");
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("خطا در حذف تیم");
    }
  };

  useEffect(() => {
    fetchTeams();
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
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-3">مدیریت تیمها</h1>
          <p className="text-white/70 text-lg">مدیریت کامل تیمها با امکان جستجو، فیلتر، ویرایش و حذف</p>
        </div>
      
        <DynamicTable
          columns={columns}
          data={teams}
          loading={loading}
          formFields={formFields}
          endpoint="/api/teams"
          formTitle="ویرایش تیم"
          formSubtitle="اطلاعات تیم را ویرایش کنید"
          onRefresh={() => fetchTeams()}
          onDelete={handleDelete}
          pagination={pagination}
          onPageChange={(page) => fetchTeams(page)}
          filterFields={filterFields}
          onFilterChange={(filters) => {
            const stringFilters: Record<string, string> = {};
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                stringFilters[key] = String(value);
              }
            });
            fetchTeams(1, stringFilters);
          }}
        />
      </div>
    </div>
  );
};

export default TeamsManagement;