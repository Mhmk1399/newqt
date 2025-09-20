"use client";

import React, { useState, useEffect } from "react";
import DynamicTable from "@/components/global/newdynamics/dynamicTable";
import {
  TableColumn,
  TableData,
  FormField,
  FilterField,
} from "@/types/dynamicTypes/types";
import toast from "react-hot-toast";

const ServicesManagement: React.FC = () => {
  const [services, setServices] = useState<TableData[]>([]);
  const [teams, setTeams] = useState<{ _id: string; name: string }[]>([]);
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
      header: "نام سرویس",
      sortable: true,
    },
    {
      key: "description",
      header: "توضیحات",
      sortable: true,
      render: (value) => value || "-",
    },
    {
      key: "basePrice",
      header: "قیمت پایه",
      sortable: true,
      render: (value) => `${Number(value).toLocaleString()} ریال`,
    },
    {
      key: "teamId",
      header: "تیم",
      sortable: false,
      render: (value) => {
        if (typeof value === "object" && value && "name" in value) {
          return (value as Record<string, unknown>).name as string;
        }
        return value || "-";
      },
    },
    {
      key: "isActive",
      header: "وضعیت فعالیت",
      sortable: true,
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
      key: "isVip",
      header: "VIP",
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            value
              ? "bg-purple-100 text-purple-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {value ? "VIP" : "عادی"}
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
      label: "نام سرویس",
      type: "text",
      placeholder: "نام سرویس را وارد کنید",
      validation: [{ type: "required", message: "نام سرویس الزامی است" }],
    },
    {
      name: "description",
      label: "توضیحات",
      type: "textarea",
      placeholder: "توضیحات سرویس را وارد کنید",
    },
    {
      name: "basePrice",
      label: "قیمت پایه",
      type: "number",
      placeholder: "قیمت پایه را وارد کنید",
      validation: [{ type: "required", message: "قیمت پایه الزامی است" }],
    },
    {
      name: "teamId",
      label: "تیم",
      type: "select",
      placeholder: "تیم را انتخاب کنید",
      options: teams.map((team) => ({ label: team.name, value: team._id })),
      validation: [{ type: "required", message: "تیم الزامی است" }],
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
      placeholder: "نام سرویس را جستجو کنید...",
    },
    {
      key: "description",
      label: "جستجو در توضیحات",
      type: "text",
      placeholder: "توضیحات را جستجو کنید...",
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
      key: "isVip",
      label: "وضعیت VIP",
      type: "select",
      options: [
        { label: "VIP", value: "true" },
        { label: "عادی", value: "false" },
      ],
    },
  ];

  const fetchServices = async (filters: any = {}, page = 1) => {
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
        params.search = searchTerms.join(" ");
      }

      // Handle other filters
      if (
        filters.isActive !== null &&
        filters.isActive !== undefined &&
        filters.isActive !== ""
      ) {
        params.isActive = String(filters.isActive);
      }
      if (
        filters.isVip !== null &&
        filters.isVip !== undefined &&
        filters.isVip !== ""
      ) {
        params.isVip = String(filters.isVip);
      }

      const searchParams = new URLSearchParams(params);

      const response = await fetch(`/api/services?${searchParams}`);
      const result = await response.json();

      if (result.success) {
        setServices(result.data || []);
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
        toast.error(result.message || "خطا در بارگذاری سرویسها");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("خطا در بارگذاری سرویسها");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/services?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        toast.success("سرویس با موفقیت حذف شد");
        fetchServices();
      } else {
        toast.error(result.message || "خطا در حذف سرویس");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("خطا در حذف سرویس");
    }
  };

  const handleToggleActivation = async (id: string, currentStatus: string) => {
    try {
      const service = services.find((s) => s._id === id);
      if (!service) return;

      const newStatus = !service.isActive;
      const response = await fetch("/api/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        toast.success(
          `وضعیت سرویس به ${newStatus ? "فعال" : "غیرفعال"} تغییر یافت`
        );
        fetchServices();
      } else {
        toast.error(result.message || "خطا در تغییر وضعیت سرویس");
      }
    } catch (error) {
      console.error("Error toggling service status:", error);
      toast.error("خطا در تغییر وضعیت سرویس");
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams");
      const result = await response.json();
      if (result.success) {
        setTeams(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchServices();
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] relative overflow-hidden"
      dir="rtl"
    >
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-3">
            مدیریت سرویسها
          </h1>
          <p className="text-white/70 text-lg">
            مدیریت کامل سرویسها با امکان جستجو، فیلتر، ویرایش و حذف
          </p>
        </div>

        <DynamicTable
          columns={columns}
          data={services}
          loading={loading}
          formFields={formFields}
          endpoint="/api/services"
          formTitle="ویرایش سرویس"
          formSubtitle="اطلاعات سرویس را ویرایش کنید"
          onRefresh={() => fetchServices()}
          onDelete={handleDelete}
          onToggleApproval={handleToggleActivation}
          pagination={pagination}
          onPageChange={(page) => fetchServices({}, page)}
          filterFields={filterFields}
          onFilterChange={(filters) => fetchServices(filters, 1)}
        />
      </div>
    </div>
  );
};

export default ServicesManagement;
