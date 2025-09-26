"use client";

import React, { useState } from "react";
import useSWR from "swr";
import DynamicTable from "@/components/global/newdynamics/dynamicTable";
import DynamicForm from "@/components/global/newdynamics/dynamicForm";
import {
  TableColumn,
  FormField,
  FilterField,
} from "@/types/dynamicTypes/types";
import { motion, AnimatePresence } from "framer-motion";
import { IoAdd, IoClose } from "react-icons/io5";
import toast from "react-hot-toast";

// Type definition for team
type Team = {
  _id: string;
  name: string;
};

const UsersManagement: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetcher function for SWR
  const fetcher = async (url: string): Promise<Team[]> => {
    const response = await fetch(url);
    const result = await response.json();
    if (!result.success) {
      throw new Error("Failed to fetch teams");
    }
    return result.data || [];
  };

  // Use SWR to fetch teams
  const { data: teams = [], error } = useSWR<Team[]>(
    "/api/teams?dropdown=true",
    fetcher
  );

  // Handle SWR error
  if (error) {
    console.error("Error fetching teams:", error);
  }

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
        const permissionLabels = permissions
          .map((p) => {
            const permissionMap: { [key: string]: string } = {
              read: "خواندن",
              write: "نوشتن",
              delete: "حذف",
              admin: "مدیریت",
              manage_users: "مدیریت کاربران",
              manage_tasks: "مدیریت تسکها",
              manage_services: "مدیریت سرویسها",
              manage_customers: "مدیریت مشتریان",
            };
            return permissionMap[p] || p;
          })
          .join(", ");
        return (
          <div className="max-w-xs truncate" title={permissionLabels}>
            {permissionLabels.length > 30
              ? `${permissionLabels.substring(0, 30)}...`
              : permissionLabels || "-"}
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

        <div className="mb-6 flex justify-end">
          <motion.button
            onClick={() => setIsAddModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-purple-500/25"
          >
            <IoAdd className="text-xl" />
            افزودن
          </motion.button>
        </div>

        <DynamicTable
          columns={columns}
          data={[]}
          loading={false}
          formFields={formFields}
          endpoint="/api/users"
          formTitle="ویرایش کاربر"
          formSubtitle="اطلاعات کاربر را ویرایش کنید"
          filterFields={filterFields}
        />

        <AnimatePresence>
          {isAddModalOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
            >
              {/* Luxury Background Elements */}
              <div className="absolute inset-0 z-0">
                <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full filter blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full filter blur-3xl"></div>
              </div>

              <motion.div
                className="relative z-10 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl w-full max-w-4xl shadow-2xl border border-white/20"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  boxShadow:
                    "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                }}
              >
                {/* Decorative corner elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-tr-3xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/20 to-transparent rounded-bl-3xl"></div>

                <div className="p-8 overflow-auto max-h-[90vh] relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text">
                      افزودن کاربر جدید
                    </h3>
                    <button onClick={() => setIsAddModalOpen(false)}>
                      <IoClose
                        size={24}
                        className="text-white/70 hover:text-white transition-colors"
                      />
                    </button>
                  </div>

                  <DynamicForm
                    title=""
                    subtitle=""
                    fields={formFields}
                    endpoint="/api/users"
                    method="POST"
                    submitButtonText="افزودن کاربر"
                    onSuccess={() => {
                      setIsAddModalOpen(false);
                      toast.success("کاربر با موفقیت افزوده شد");
                    }}
                    onError={() => {
                      toast.error("خطا در افزودن کاربر");
                    }}
                    onCancel={() => setIsAddModalOpen(false)}
                    className="bg-transparent border-0 shadow-none p-0"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UsersManagement;
