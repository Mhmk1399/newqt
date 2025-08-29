"use client";

import React, { useState } from "react";
import DynamicTable from "./DynamicTable";
import DynamicModal, { ModalConfig } from "../DynamicModal";
import toast from "react-hot-toast";
import { TableConfig } from "@/types/tables";

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee' | 'client' | 'viewer';
  teamId?: string;
  permissions?: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface Team {
  _id: string;
  name: string;
}

const UsersTable: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [refreshTable, setRefreshTable] = useState(0);
  const [teams, setTeams] = useState<{[key: string]: string}>({});

  React.useEffect(() => {
    fetch('/api/teams')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const teamMap = data.data.reduce((acc: Record<string, string>, team: Team) => {
            acc[team._id] = team.name;
            return acc;
          }, {});
          setTeams(teamMap);
        }
      })
      .catch(console.error);
  }, []);

  const handleView = (user: User) => {
    const config: ModalConfig = {
      title: "مشاهده جزئیات کاربر",
      type: "view",
      size: "xl",
      endpoint: "/api/users/detailes",
      fields: [
        { key: "name", label: "نام کاربر", type: "text" },
        { key: "email", label: "ایمیل", type: "email" },
        {
          key: "role",
          label: "نقش کاربر",
          type: "select",
          options: [
            { value: "admin", label: "مدیر سیستم" },
            { value: "manager", label: "مدیر" },
            { value: "employee", label: "کارمند" },
            { value: "client", label: "مشتری" },
            { value: "viewer", label: "بازدیدکننده" },
          ],
        },
        { 
          key: "teamId", 
          label: "تیم", 
          type: "select",
          optionsEndpoint: "/api/teams",
          optionLabelKey: "name"
        },
        {
          key: "permissions",
          label: "مجوزها",
          type: "textarea",
          render: (value: unknown) => {
            if (Array.isArray(value)) {
              return value.join(', ');
            }
            return (value as string) || '-';
          },
        },
        {
          key: "isActive",
          label: "وضعیت فعالیت",
          type: "select",
          options: [
            { value: true, label: "فعال" },
            { value: false, label: "غیرفعال" },
          ],
        },
        { key: "lastLogin", label: "آخرین ورود", type: "date" },
        { key: "createdAt", label: "تاریخ ایجاد", type: "date" },
        { key: "updatedAt", label: "آخرین به‌روزرسانی", type: "date" },
      ],
      onClose: () => setShowModal(false),
    };

    setModalConfig(config);
    setSelectedUserId(user._id || user.id);
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    const config: ModalConfig = {
      title: "ویرایش کاربر",
      type: "edit",
      size: "xl",
      endpoint: "/api/users/detailes",
      method: "PATCH",
      fields: [
        { key: "name", label: "نام کاربر", type: "text", required: true },
        { key: "email", label: "ایمیل", type: "email", required: true },
        {
          key: "role",
          label: "نقش کاربر",
          type: "select",
          required: true,
          options: [
            { value: "admin", label: "مدیر سیستم" },
            { value: "manager", label: "مدیر" },
            { value: "employee", label: "کارمند" },
            { value: "client", label: "مشتری" },
            { value: "viewer", label: "بازدیدکننده" },
          ],
        },
 { 
          key: "teamId", 
          label: "تیم", 
          type: "select",
          optionsEndpoint: "/api/teams",
          optionLabelKey: "name"
        },        {
          key: "permissions",
          label: "مجوزها",
          type: "textarea",
          description: "مجوزها را با کاما از هم جدا کنید",
        },
        {
          key: "isActive",
          label: "وضعیت فعالیت",
          type: "select",
          required: true,
          options: [
            { value: true, label: "فعال" },
            { value: false, label: "غیرفعال" },
          ],
        },
        {
          key: "password",
          label: "رمز عبور جدید",
          type: "password",
          description:
            "در صورت عدم تمایل به تغییر رمز عبور، این فیلد را خالی بگذارید",
        },
      ],
      onSuccess: (data) => {
        console.log("User updated successfully:", data);
        toast.success("کاربر با موفقیت به‌روزرسانی شد.");
        setRefreshTable((prev) => prev + 1);
      },
      onError: (error) => {
        console.error("Update error:", error);
        toast.error("خطا در به‌روزرسانی کاربر.");
      },
      onClose: () => setShowModal(false),
      confirmText: "ذخیره تغییرات",
    };

    setModalConfig(config);
    setSelectedUserId(user._id || user.id);
    setShowModal(true);
  };



 

  const handleDelete = (user: User) => {
    const config: ModalConfig = {
      title: "حذف کاربر",
      type: "delete",
      size: "md",
      endpoint: "/api/users/detailes",
      method: "DELETE",
      customContent: (
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            تأیید حذف کاربر
          </h4>
          <p className="text-gray-600 mb-4">
            آیا از حذف کاربر  اطمینان دارید؟
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">
              ⚠️ توجه: حذف کاربر باعث حذف تمام اطلاعات مرتبط با وی خواهد شد. این
              عمل قابل بازگشت نیست.
            </p>
          </div>
        </div>
      ),
      onSuccess: (data) => {
        console.log("User deleted successfully:", data);
        toast.success("کاربر با موفقیت حذف شد");
        setRefreshTable((prev) => prev + 1);
      },
      onError: (error) => {
        console.error("Delete error:", error);
        toast.error("خطا در حذف کاربر ");
      },
      onClose: () => setShowModal(false),
      confirmText: "حذف کاربر",
      cancelText: "لغو",
    };

    setModalConfig(config);
    setSelectedUserId(user._id || user.id);
    setShowModal(true);
  };

  const usersTableConfig: TableConfig = {
    title: "لیست کاربران",
    description: "مدیریت و مشاهده اطلاعات کاربران سیستم",
    endpoint: "/api/users",
    deleteEndpoint: "/api/users/detailes",
    columns: [
      {
        key: "name",
        label: "نام کاربر",
        type: "text",
        sortable: true,
        width: "180px",
      },
      {
        key: "email",
        label: "ایمیل",
        type: "email",
        sortable: true,
        width: "200px",
      },
      {
        key: "role",
        label: "نقش",
        type: "status",
        sortable: true,
        width: "120px",
        render: (value) => {
          const roleConfig: {
            [key: string]: { label: string; className: string };
          } = {
            admin: {
              label: "مدیر سیستم",
              className: "bg-red-100 text-red-800",
            },
            manager: { label: "مدیر", className: "bg-blue-100 text-blue-800" },
            employee: {
              label: "کارمند",
              className: "bg-green-100 text-green-800",
            },
            client: {
              label: "مشتری",
              className: "bg-purple-100 text-purple-800",
            },
            viewer: {
              label: "بازدیدکننده",
              className: "bg-gray-100 text-gray-800",
            },
          };
          const config = roleConfig[value] || {
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
        key: "teamId",
        label: "تیم",
        type: "text",
        sortable: true,
        width: "120px",
        render: (value) => {
          return value ? teams[value] || `تیم: ${value.substring(0, 8)}...` : "-";
        },
      },
      {
        key: "isActive",
        label: "وضعیت",
        type: "status",
        sortable: true,
        width: "100px",
        render: (value) => {
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                value
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {value ? "فعال" : "غیرفعال"}
            </span>
          );
        },
      },
      {
        key: "permissions",
        label: "مجوزها",
        type: "text",
        sortable: false,
        width: "150px",
        render: (value) => {
          if (Array.isArray(value)) {
            return value.length > 0 ? `${value.length} مجوز` : "بدون مجوز";
          }
          return value ? "دارد" : "ندارد";
        },
      },
      {
        key: "lastLogin",
        label: "آخرین ورود",
        type: "date",
        sortable: true,
        width: "130px",
        render: (value) => {
          if (!value) return "هرگز";
          return new Date(value).toLocaleDateString("fa-IR");
        },
      },
      {
        key: "createdAt",
        label: "تاریخ ایجاد",
        type: "date",
        sortable: true,
        width: "130px",
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
      <DynamicTable config={usersTableConfig} key={refreshTable} />

      {/* Dynamic Modal */}
      {showModal && modalConfig && (
        <DynamicModal
          isOpen={showModal}
          config={modalConfig}
          itemId={selectedUserId}
        />
      )}
    </div>
  );
};

export default UsersTable;
