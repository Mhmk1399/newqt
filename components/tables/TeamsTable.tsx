"use client";

import React, { useState } from "react";
import DynamicTablefrom from "./DynamicTable";
import DynamicModal, { ModalConfig } from "../DynamicModal";
import toast from "react-hot-toast";
import { TableConfig } from "@/types/tables";

const TeamsTable: React.FC = () => {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [refreshTable, setRefreshTable] = useState(0);

  const handleView = (team: {
    _id: string | undefined;
    id: string;
    name: string;
    description: string;
    leaderId: string;
    members: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) => {
    const config: ModalConfig = {
      title: "مشاهده جزئیات تیم",
      type: "view",
      size: "xl",
      endpoint: `/api/teams/detailes`,
      fields: [
        { key: "name", label: "نام تیم", type: "text" },
        { key: "description", label: "توضیحات", type: "textarea" },
        { key: "leaderId", label: "شناسه رهبر تیم", type: "text" },
        { 
          key: "members", 
          label: "اعضای تیم", 
          type: "textarea",
          render: (value) => {
          // Check if customerId is populated with customer object
          if (value && typeof value === "object" && "name" in value) {
            return (value as { name: string }).name;
          }
          // If it's still just an ID string
          if (typeof value === "string") {
            return `مشتری: ${value.substring(0, 8)}...`;
          }
          return "-";
        },
        },
        { 
          key: "isActive", 
          label: "وضعیت فعالیت", 
          type: "select",
          options: [
            { value: true, label: "فعال" },
            { value: false, label: "غیرفعال" }
          ]
        },
        { key: "createdAt", label: "تاریخ ایجاد", type: "date" },
        { key: "updatedAt", label: "آخرین به‌روزرسانی", type: "date" },
      ],
      onClose: () => setShowModal(false),
    };

    setModalConfig(config);
    setSelectedTeamId(team._id || team.id);
    setShowModal(true);
  };

  const handleEdit = (team: {
    _id: string | undefined;
    id: string;
  }) => {
    const config: ModalConfig = {
      title: "ویرایش تیم",
      type: "edit",
      size: "xl",
      endpoint: `/api/teams/detailes`,
      method: "PATCH",
      fields: [
        { key: "name", label: "نام تیم", type: "text", required: true },
        { key: "description", label: "توضیحات", type: "textarea", required: true },
        { key: "leaderId", label: "شناسه رهبر تیم", type: "text" },
        { 
          key: "isActive", 
          label: "وضعیت فعالیت", 
          type: "select",
          required: true,
          options: [
            { value: true, label: "فعال" },
            { value: false, label: "غیرفعال" }
          ]
        },
      ],
      onSuccess: (data) => {
        console.log("Team updated successfully:", data);
        toast.success("تیم با موفقیت به‌روزرسانی شد.");
        setRefreshTable(prev => prev + 1);
      },
      onError: (error) => {
        console.error("Update error:", error);
        toast.error("خطا در به‌روزرسانی تیم.");
      },
      onClose: () => setShowModal(false),
      confirmText: "ذخیره تغییرات",
    };

    setModalConfig(config);
    setSelectedTeamId(team._id || team.id);
    setShowModal(true);
  };

  const handleDelete = (team: {name:string, _id: string | undefined; id: string }) => {
    const config: ModalConfig = {
      title: "حذف تیم",
      type: "delete",
      size: "md",
      endpoint: `/api/teams/detailes`,
      method: "DELETE",
      customContent: (
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            تأیید حذف تیم
          </h4>
          <p className="text-gray-600 mb-4">
            آیا از حذف تیم  اطمینان دارید؟
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">
              ⚠️ توجه: حذف تیم باعث حذف تخصیص اعضا از این تیم خواهد شد.
              این عمل قابل بازگشت نیست.
            </p>
          </div>
        </div>
      ),
      onSuccess: (data) => {
        console.log("Team deleted successfully:", data);
        setRefreshTable(prev => prev + 1);
        toast.success("تیم با موفقیت حذف شد");
      },
      onError: (error) => {
        console.error("Delete error:", error);
        toast.error("خطا در حذف تیم: ");
      },
      onClose: () => setShowModal(false),
      confirmText: "حذف تیم",
      cancelText: "لغو",
    };

    setModalConfig(config);
    setSelectedTeamId(team._id || team.id);
    setShowModal(true);
  };

  const teamsTableConfig: TableConfig = {
    title: "لیست تیم‌ها",
    description: "مدیریت و مشاهده اطلاعات تیم‌های سازمان",
    endpoint: "/api/teams",
    deleteEndpoint: "/api/teams/detailes",
    columns: [
      {
        key: "name",
        label: "نام تیم",
        type: "text",
        sortable: true,
        width: "200px",
      },
      {
        key: "description",
        label: "توضیحات",
        type: "text",
        sortable: true,
        width: "250px",
        render: (value) => {
          return value && value.length > 50 
            ? `${value.substring(0, 50)}...` 
            : value || "-";
        },
      },
      {
        key: "leaderId",
        label: "رهبر تیم",
        type: "text",
        sortable: true,
        width: "150px",
        render: (value) => {
          return value ? `رهبر: ${value.substring(0, 8)}...` : "بدون رهبر";
        },
      },
      {
        key: "members",
        label: "تعداد اعضا",
        type: "number",
        sortable: true,
        width: "120px",
        render: (value) => {
          if (Array.isArray(value)) {
            return `${value.length} عضو`;
          }
          return "0 عضو";
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
            <span className={`px-2 py-1 rounded-full text-xs ${
              value 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {value ? "فعال" : "غیرفعال"}
            </span>
          );
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
      <DynamicTablefrom 
        config={teamsTableConfig} 
        key={refreshTable}
      />
      
      {/* Dynamic Modal */}
      {showModal && modalConfig && (
        <DynamicModal
          isOpen={showModal}
          config={modalConfig}
          itemId={selectedTeamId}
        />
      )}
    </div>
  );
};

export default TeamsTable;
