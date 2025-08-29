"use client";

import React, { useState } from "react";
import DynamicTable from "./DynamicTable";
import DynamicModal, { ModalConfig } from "../DynamicModal";
import toast from "react-hot-toast";
import { TableConfig } from "@/types/tables";

const ServicesTable: React.FC = () => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [refreshTable, setRefreshTable] = useState(0);

  // Function to fetch teams for dropdown
  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams");
      const result = await response.json();

      if (result.success) {
        return result.data.map((team: { _id: string; name: string ,specialization: string }) => ({
          value: team._id,
          label: `${team.name} (${team.specialization})`,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching teams:", error);
      return [];
    }
  };

  const handleView = (service: {
    _id: string;
    id: string;
    name: string;
    description: string;
    basePrice: number;
    teamId: {
      name: string;
      specialization: string;
    };
  }) => {
    const config: ModalConfig = {
      title: "مشاهده جزئیات سرویس",
      type: "view",
      size: "lg",
      endpoint: `/api/services/detailes`,
      fields: [
        { key: "name", label: "نام سرویس", type: "text" },
        { key: "description", label: "توضیحات سرویس", type: "textarea" },
        { key: "basePrice", label: "قیمت پایه", type: "number" },
        {
          key: "teamId",
          label: "تیم انجام دهنده",
          type: "text",
          render: (value: unknown) => {
            if (value && typeof value === "object") {
              return `${(value as { name?: string; specialization?: string }).name ?? ""} (${(value as { specialization?: string }).specialization ?? ""})`;
            }
            return value ? String(value) : "-";
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
        { key: "createdAt", label: "تاریخ ایجاد", type: "date" },
        { key: "updatedAt", label: "آخرین به‌روزرسانی", type: "date" },
      ],
      onClose: () => setShowModal(false),
    };

    setModalConfig(config);
    setSelectedServiceId(service._id || service.id);
    setShowModal(true);
  };

  const handleEdit = async (service: {
    _id: string;
    id: string;
    name: string;
    description: string;
    basePrice: number;
    teamId: {
      name: string;
      specialization: string;
    };
  }) => {
    // Show loading state
    toast.loading("در حال بارگیری اطلاعات...", { id: "loading-teams" });

    try {
      // Fetch teams for dropdown
      const teams = await fetchTeams();

      // Dismiss loading toast
      toast.dismiss("loading-teams");

      if (teams.length === 0) {
        toast.error("تیمی برای انتخاب موجود نیست");
        return;
      }

      const config: ModalConfig = {
        title: "ویرایش اطلاعات سرویس",
        type: "edit",
        size: "lg",
        endpoint: `/api/services/detailes`,
        method: "PATCH",
        fields: [
          {
            key: "name",
            label: "نام سرویس",
            type: "text",
            required: true,
          },
          {
            key: "description",
            label: "توضیحات سرویس",
            type: "textarea",
            required: false,
          },
          {
            key: "basePrice",
            label: "قیمت پایه",
            type: "number",
            required: true,
          },
          {
            key: "teamId",
            label: "تیم انجام دهنده سرویس",
            type: "select",
            required: true,
            options: teams, // Now populated with actual teams
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
        ],
        onSuccess: (data) => {
          console.log("Service updated successfully:", data);
          toast.success("سرویس با موفقیت ویرایش شد");
          setRefreshTable((prev) => prev + 1);
        },
        onError: (error) => {
          toast.error("خطا در ویرایش سرویس");
          console.error("Update error:", error);
        },
        onClose: () => setShowModal(false),
        confirmText: "ذخیره تغییرات",
      };

      setModalConfig(config);
      setSelectedServiceId(service._id || service.id);
      setShowModal(true);
    } catch (error) {
      toast.dismiss("loading-teams");
      toast.error("خطا در بارگیری اطلاعات تیم‌ها");
      console.error("Error loading teams:", error);
    }
  };

  const handleDelete = (service: {
    _id: string;
    id: string;
    name: string;
  }) => {
    const config: ModalConfig = {
      title: "حذف سرویس",
      type: "delete",
      size: "md",
      endpoint: `/api/services/detailes`,
      method: "DELETE",
      customContent: (
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            تأیید حذف سرویس
          </h4>
          <p className="text-gray-600 mb-4">
            آیا از حذف سرویس  اطمینان دارید؟
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">
              ⚠️ توجه: حذف سرویس ممکن است بر پروژه‌ها و درخواست‌های مرتبط تأثیر
              بگذارد. این عمل قابل بازگشت نیست.
            </p>
          </div>
        </div>
      ),
      onSuccess: (data) => {
        console.log("Service deleted successfully:", data);
        toast.success("سرویس با موفقیت حذف شد");
        setRefreshTable((prev) => prev + 1);
      },
      onError: (error) => {
        toast.error("خطا در حذف سرویس: " + error);
        console.error("Delete error:", error);
      },
      onClose: () => setShowModal(false),
      confirmText: "حذف سرویس",
      cancelText: "لغو",
    };

    setModalConfig(config);
    setSelectedServiceId(service._id || service.id);
    setShowModal(true);
  };

  const servicesTableConfig: TableConfig = {
    title: "لیست سرویس‌ها",
    description: "مدیریت و مشاهده اطلاعات سرویس‌های ارائه شده",
    endpoint: "/api/services",
    columns: [
      {
        key: "name",
        label: "نام سرویس",
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
          if (!value) return "-";
          return value.length > 50 ? `${value.substring(0, 50)}...` : value;
        },
      },
      {
        key: "basePrice",
        label: "قیمت پایه",
        type: "number",
        sortable: true,
        width: "120px",
        render: (value) => {
          return value ? `${value.toLocaleString("fa-IR")} تومان` : "-";
        },
      },
      {
        key: "teamId",
        label: "تیم انجام دهنده",
        type: "text",
        sortable: true,
        width: "200px",
        render: (value) => {
          if (value && typeof value === "object") {
            return (
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{value.name}</span>
                <span className="text-xs text-gray-500">
                  ({value.specialization})
                </span>
              </div>
            );
          }
          return value || "-";
        },
      },
      {
        key: "isActive",
        label: "وضعیت",
        type: "status",
        sortable: true,
        width: "100px",
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
      <DynamicTable config={servicesTableConfig} key={refreshTable} />

      {/* Dynamic Modal */}
      {showModal && modalConfig && (
        <DynamicModal
          isOpen={showModal}
          config={modalConfig}
          itemId={selectedServiceId}
        />
      )}
    </div>
  );
};

export default ServicesTable;
