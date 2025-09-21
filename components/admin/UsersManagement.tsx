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

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<TableData[]>([]);
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
      header: "نام کاربر",
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
      key: "role",
      header: "نقش",
      sortable: true,
      render: (value) => {
        const roleMap: { [key: string]: string } = {
          admin: "مدیر",
          manager: "مدیر پروژه",
          editor: "ویرایشگر",
          designer: "طراح",
          "video-shooter": "فیلمبردار",
        };
        return roleMap[value as string] || value;
      },
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
      header: "وضعیت",
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
      key: "permissions",
      header: "مجوزها",
      sortable: false,
      render: (value) => {
        const permissions = Array.isArray(value) ? value : [];
        const permissionLabels = permissions.map(p => {
          const permissionMap: { [key: string]: string } = {
            'read': 'خواندن',
            'write': 'نوشتن',
            'delete': 'حذف',
            'admin': 'مدیریت',
            'manage_users': 'مدیریت کاربران',
            'manage_tasks': 'مدیریت تسکها',
            'manage_services': 'مدیریت سرویسها',
            'manage_customers': 'مدیریت مشتریان'
          };
          return permissionMap[p] || p;
        }).join(', ');
        return (
          <div className="max-w-xs truncate" title={permissionLabels}>
            {permissionLabels.length > 30 ? `${permissionLabels.substring(0, 30)}...` : permissionLabels || "-"}
          </div>
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
      label: "نام کاربر",
      type: "text",
      placeholder: "نام کاربر را وارد کنید",
      validation: [{ type: "required", message: "نام کاربر الزامی است" }],
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
      name: "role",
      label: "نقش",
      type: "select",
      options: [
        { label: "مدیر", value: "admin" },
        { label: "مدیر پروژه", value: "manager" },
        { label: "ویرایشگر", value: "editor" },
        { label: "طراح", value: "designer" },
        { label: "فیلمبردار", value: "video-shooter" },
      ],
      defaultValue: "designer",
    },
    {
      name: "teamId",
      label: "تیم",
      type: "select",
      placeholder: "تیم را انتخاب کنید",
      options: teams.map((team) => ({ label: team.name, value: team._id })),
    },
    {
      name: "permissions",
      label: "مجوزها",
      type: "multiselect",
      placeholder: "مجوزها را انتخاب کنید",
      options: [
        { label: "خواندن", value: "read" },
        { label: "نوشتن", value: "write" },
        { label: "حذف", value: "delete" },
        { label: "مدیریت", value: "admin" },
        { label: "مدیریت کاربران", value: "manage_users" },
        { label: "مدیریت تسکها", value: "manage_tasks" },
        { label: "مدیریت سرویسها", value: "manage_services" },
        { label: "مدیریت مشتریان", value: "manage_customers" },
      ],
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
      placeholder: "نام، ایمیل یا شماره تلفن را جستجو کنید...",
    },
    {
      key: "role",
      label: "نقش",
      type: "select",
      options: [
        { label: "مدیر", value: "admin" },
        { label: "مدیر پروژه", value: "manager" },
        { label: "ویرایشگر", value: "editor" },
        { label: "طراح", value: "designer" },
        { label: "فیلمبردار", value: "video-shooter" },
      ],
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

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams?dropdown=true");
      const result = await response.json();
      if (result.success) {
        setTeams(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const fetchUsers = async (page = 1, filters: Record<string, string> = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: (pagination?.itemsPerPage || 10).toString(),
        ...filters,
      });

      const response = await fetch(`/api/users?${params}`);
      const result = await response.json();

      if (result.success) {
        setUsers(result.data || []);
        setPagination(result.pagination || pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/users?id=${id}`, {
        method: "DELETE",
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success("کاربر با موفقیت حذف شد");
        fetchUsers();
      } else {
        toast.error(result.message || "خطا در حذف کاربر");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("خطا در حذف کاربر");
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchUsers();
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
            مدیریت کاربران
          </h1>
          <p className="text-white/70 text-lg">
            مدیریت کامل کاربران با امکان جستجو، فیلتر، ویرایش و تخصیص
          </p>
        </div>

        <DynamicTable
          columns={columns}
          data={users}
          loading={loading}
          formFields={formFields}
          endpoint="/api/users"
          formTitle="ویرایش کاربر"
          formSubtitle="اطلاعات کاربر را ویرایش کنید"
          onRefresh={() => fetchUsers()}
          onDelete={handleDelete}
          pagination={pagination}
          onPageChange={(page) => fetchUsers(page)}
          filterFields={filterFields}
          onFilterChange={(filters) => {
            const stringFilters: Record<string, string> = {};
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                stringFilters[key] = String(value);
              }
            });
            fetchUsers(1, stringFilters);
          }}
        />
      </div>
    </div>
  );
};

export default UsersManagement;
