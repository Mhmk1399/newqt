"use client";

import React, { useState, useEffect } from "react";
import DynamicTable from "@/components/global/newdynamics/dynamicTable";
import { TableColumn, TableData, FormField, FilterField } from "@/types/dynamicTypes/types";
import toast from "react-hot-toast";

const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<TableData[]>([]);
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
      header: "نام دسته‌بندی",
      sortable: true,
    },
    {
      key: "description",
      header: "توضیحات",
      sortable: true,
      render: (value) => value || "-",
    },
    {
      key: "icon",
      header: "آیکون",
      sortable: false,
      render: (value) => value || "-",
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
      label: "نام دسته‌بندی",
      type: "text",
      placeholder: "نام دسته‌بندی را وارد کنید",
      validation: [{ type: "required", message: "نام دسته‌بندی الزامی است" }],
    },
    {
      name: "description",
      label: "توضیحات",
      type: "textarea",
      placeholder: "توضیحات دسته‌بندی را وارد کنید",
    },
    {
      name: "icon",
      label: "آیکون",
      type: "text",
      placeholder: "نام آیکون را وارد کنید",
    },
    {
      name: "isActive",
      label: "وضعیت",
      type: "select",
      options: [
        { label: "فعال", value: "true" },
        { label: "غیرفعال", value: "false" },
      ],
      defaultValue: true,
    },
  ];

  const filterFields: FilterField[] = [
    {
      key: "name",
      label: "جستجو در نام",
      type: "text",
      placeholder: "نام دسته‌بندی را جستجو کنید...",
    },
    {
      key: "description",
      label: "جستجو در توضیحات",
      type: "text",
      placeholder: "توضیحات را جستجو کنید...",
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

  const fetchCategories = async (filters: any = {}, page = 1) => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        page: page.toString(),
        limit: (pagination?.itemsPerPage || 10).toString(),
      };
      
      // Handle search filters
      if (filters.name || filters.description) {
        const searchTerms: string[] = [];
        if (filters.name) searchTerms.push(String(filters.name));
        if (filters.description) searchTerms.push(String(filters.description));
        params.search = searchTerms.join(' ');
      }
      
      // Handle other filters
      if (filters.isActive !== null && filters.isActive !== undefined && filters.isActive !== '') {
        params.isActive = String(filters.isActive);
      }
      
      const searchParams = new URLSearchParams(params);
      
      const response = await fetch(`/api/categories?${searchParams}`);
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data || []);
        if (result.pagination) {
          setPagination({
            currentPage: result.pagination.page,
            totalPages: result.pagination.pages,
            totalItems: result.pagination.total,
            itemsPerPage: result.pagination.limit,
            hasNextPage: result.pagination.page < result.pagination.pages,
            hasPrevPage: result.pagination.page > 1,
          });
        }
      } else {
        toast.error(result.message || "خطا در بارگذاری دسته‌بندی‌ها");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("خطا در بارگذاری دسته‌بندی‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success("دسته‌بندی با موفقیت حذف شد");
        fetchCategories();
      } else {
        toast.error(result.message || "خطا در حذف دسته‌بندی");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("خطا در حذف دسته‌بندی");
    }
  };

  const handleToggleActivation = async (id: string, currentStatus: string) => {
    try {
      const category = categories.find(c => c._id === id);
      if (!category) return;
      
      const newStatus = !category.isActive;
      const response = await fetch("/api/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        toast.success(`وضعیت دسته‌بندی به ${newStatus ? 'فعال' : 'غیرفعال'} تغییر یافت`);
        fetchCategories();
      } else {
        toast.error(result.message || "خطا در تغییر وضعیت دسته‌بندی");
      }
    } catch (error) {
      console.error("Error toggling category status:", error);
      toast.error("خطا در تغییر وضعیت دسته‌بندی");
    }
  };

  useEffect(() => {
    fetchCategories();
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
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-3">مدیریت دسته‌بندی‌ها</h1>
          <p className="text-white/70 text-lg">مدیریت کامل دسته‌بندی‌ها با امکان جستجو، فیلتر، ویرایش و حذف</p>
        </div>
      
        <DynamicTable
          columns={columns}
          data={categories}
          loading={loading}
          formFields={formFields}
          endpoint="/api/categories"
          formTitle="ویرایش دسته‌بندی"
          formSubtitle="اطلاعات دسته‌بندی را ویرایش کنید"
          onRefresh={() => fetchCategories()}
          onDelete={handleDelete}
          onToggleApproval={handleToggleActivation}
          pagination={pagination}
          onPageChange={(page) => fetchCategories({}, page)}
          filterFields={filterFields}
          onFilterChange={(filters) => fetchCategories(filters, 1)}
        />
      </div>
    </div>
  );
};

export default CategoriesManagement;