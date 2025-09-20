"use client";

import React, { useState, useEffect } from "react";
import DynamicTable from "@/components/global/newdynamics/dynamicTable";
import { TableColumn, TableData, FormField, FilterField } from "@/types/dynamicTypes/types";
import toast from "react-hot-toast";

const CustomersManagement: React.FC = () => {
  const [customers, setCustomers] = useState<TableData[]>([]);
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
      key: "businessName",
      header: "نام کسبوکار",
      sortable: true,
    },
    {
      key: "businessScale",
      header: "مقیاس کسبوکار",
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
      header: "وضعیت فعالیت",
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
      key: "isVip",
      header: "VIP",
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
        }`}>
          {value ? "VIP" : "عادی"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "تاریخ ثبتنام",
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString("fa-IR"),
    },
  ];

  const formFields: FormField[] = [
    {
      name: "name",
      label: "نام و نام خانوادگی",
      type: "text",
      placeholder: "نام و نام خانوادگی را وارد کنید",
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
      name: "businessName",
      label: "نام کسبوکار",
      type: "text",
      placeholder: "نام کسبوکار را وارد کنید",
    },
    {
      name: "businessScale",
      label: "مقیاس کسبوکار",
      type: "select",
      options: [
        { label: "استارتاپ", value: "startup" },
        { label: "کوچک", value: "small" },
        { label: "متوسط", value: "medium" },
        { label: "بزرگ", value: "large" },
        { label: "سازمانی", value: "enterprise" },
      ],
    },
    {
      name: "address",
      label: "آدرس",
      type: "textarea",
      placeholder: "آدرس را وارد کنید",
    },
    {
      name: "website",
      label: "وبسایت",
      type: "text",
      placeholder: "آدرس وبسایت را وارد کنید",
    },
    {
      name: "isActive",
      label: "وضعیت فعالیت",
      type: "select",
      options: [
        { label: "فعال", value: "true" },
        { label: "غیرفعال", value: "false" },
      ],
      defaultValue: true,
    },
    {
      name: "isVip",
      label: "VIP",
      type: "select",
      options: [
        { label: "VIP", value: "true" },
        { label: "عادی", value: "false" },
      ],
      defaultValue: false,
    },
  ];

  const filterFields: FilterField[] = [
    {
      key: "name",
      label: "جستجو در نام",
      type: "text",
      placeholder: "نام مشتری را جستجو کنید...",
    },
    {
      key: "phoneNumber",
      label: "جستجو در شماره تلفن",
      type: "text",
      placeholder: "شماره تلفن را جستجو کنید...",
    },
    {
      key: "businessName",
      label: "جستجو در نام کسبوکار",
      type: "text",
      placeholder: "نام کسبوکار را جستجو کنید...",
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
    {
      key: "businessScale",
      label: "مقیاس کسبوکار",
      type: "select",
      options: [
        { label: "استارتاپ", value: "startup" },
        { label: "کوچک", value: "small" },
        { label: "متوسط", value: "medium" },
        { label: "بزرگ", value: "large" },
        { label: "سازمانی", value: "enterprise" },
      ],
    },
    {
      key: "isVip",
      label: "وضعیت VIP",
      type: "select",
      options: [
        { label: "VIP", value: "true" },
        { label: "عادی", value: "false" },
      ],
    },
  ];

  const fetchCustomers = async (filters: any = {}, page = 1) => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        page: page.toString(),
        limit: (pagination?.itemsPerPage || 10).toString(),
      };
      
      // Handle search filters
      if (filters.name || filters.phoneNumber || filters.businessName) {
        const searchTerms: string[] = [];
        if (filters.name) searchTerms.push(String(filters.name));
        if (filters.phoneNumber) searchTerms.push(String(filters.phoneNumber));
        if (filters.businessName) searchTerms.push(String(filters.businessName));
        params.search = searchTerms.join(' ');
      }
      
      // Handle other filters
      if (filters.isActive !== null && filters.isActive !== undefined && filters.isActive !== '') {
        params.isActive = String(filters.isActive);
      }
      if (filters.businessScale) {
        params.businessScale = String(filters.businessScale);
      }
      if (filters.isVip !== null && filters.isVip !== undefined && filters.isVip !== '') {
        params.isVip = String(filters.isVip);
      }
      
      const searchParams = new URLSearchParams(params);
      
      const response = await fetch(`/api/customers?${searchParams}`);
      const result = await response.json();
      
      if (result.success) {
        setCustomers(result.data || []);
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
        toast.error(result.message || "خطا در بارگذاری مشتریان");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("خطا در بارگذاری مشتریان");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/customers?id=${id}`, {
        method: "DELETE",
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success("مشتری با موفقیت حذف شد");
        fetchCustomers();
      } else {
        toast.error(result.message || "خطا در حذف مشتری");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("خطا در حذف مشتری");
    }
  };

  const handleToggleActivation = async (id: string, currentStatus: string) => {
    try {
      const customer = customers.find(c => c._id === id);
      if (!customer) return;
      
      const newStatus = !customer.isActive;
      const response = await fetch("/api/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        toast.success(`وضعیت مشتری به ${newStatus ? 'فعال' : 'غیرفعال'} تغییر یافت`);
        fetchCustomers();
      } else {
        toast.error(result.message || "خطا در تغییر وضعیت مشتری");
      }
    } catch (error) {
      console.error("Error toggling customer status:", error);
      toast.error("خطا در تغییر وضعیت مشتری");
    }
  };

  useEffect(() => {
    fetchCustomers();
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
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-3">مدیریت مشتریان</h1>
          <p className="text-white/70 text-lg">مدیریت کامل مشتریان با امکان جستجو، فیلتر، ویرایش و حذف</p>
        </div>
      
      <DynamicTable
        columns={columns}
        data={customers}
        loading={loading}
        formFields={formFields}
        endpoint="/api/customers"
        formTitle="ویرایش مشتری"
        formSubtitle="اطلاعات مشتری را ویرایش کنید"
        onRefresh={() => fetchCustomers()}
        onDelete={handleDelete}
        onToggleApproval={handleToggleActivation}
        pagination={pagination}
        onPageChange={(page) => fetchCustomers({}, page)}
        filterFields={filterFields}
        onFilterChange={(filters) => fetchCustomers(filters, 1)}
      />
      </div>
    </div>
  );
};

export default CustomersManagement;