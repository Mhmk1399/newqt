"use client";

import React, { useState, useEffect } from "react";
import DynamicModal, { ModalConfig } from "../DynamicModal";
import toast from "react-hot-toast";
import { TableConfig } from "@/types/tables";
import DynamicTable from "./DynamicTable";

interface Project {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  customerId: string;
  projectManagerId: string;
  status: string;
  totalPrice: number;
  finalPrice: number;
  [key: string]: unknown;
}

const ProjectsTable: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<{
    _id?: string;
    id?: string;
  }|undefined>(
    {
      _id: "",
      id: "",
    }
  );
  type ProjectManager = {
    _id: string;
    name?: string;
    username?: string;
    email?: string;
  };

  const [projectManagers, setProjectManagers] = useState<ProjectManager[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [refreshTable, setRefreshTable] = useState(0);

  useEffect(() => {
    const fetchProjectManagers = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        setProjectManagers(data.data || []);
      } catch (error) {
        console.error("Error fetching project managers:", error);
      }
    };

    fetchProjectManagers();
  }, []);
  console.log(projectManagers)
  const handleView = (project: Project) => {
    const config: ModalConfig = {
      title: "مشاهده جزئیات پروژه",
      type: "view",
      size: "xl",
      endpoint: "/api/projects/detailes",
      fields: [
        { key: "title", label: "عنوان پروژه", type: "text" },
        { key: "description", label: "توضیحات", type: "textarea" },
        {
          key: "customerId",
          label: "مشتری",
          type: "text",
          render: (value: unknown): React.ReactNode => {
            // Check if customerId is populated with customer object
            if (value && typeof value === "object" && "name" in value) {
              return String((value as { name: string }).name);
            }
            // If it's still just an ID string
            if (typeof value === "string") {
              return `مشتری: ${value.substring(0, 8)}...`;
            }
            return "-";
          },
        },
        { key: "contractId", label: "شناسه قرارداد", type: "text" },
        {
          key: "projectManagerId",
          label: "مدیر پروژه",
          type: "text",
          render: (value: unknown) => {
            if (
              value &&
              typeof value === "object" &&
              "name" in value &&
              "email" in value
            ) {
              const v = value as { name: string; email?: string };
              return `${v.name} (${v.email || ""})`;
            }
            if (typeof value === "string") {
              return value;
            }
            return "-";
          },
        },
        {
          key: "status",
          label: "وضعیت پروژه",
          type: "select",
          options: [
            { value: "planning", label: "در حال برنامه‌ریزی" },
            { value: "active", label: "فعال" },
            { value: "paused", label: "متوقف شده" },
            { value: "completed", label: "تکمیل شده" },
            { value: "cancelled", label: "لغو شده" },
          ],
        },
        { key: "startDate", label: "تاریخ شروع", type: "date" },
        {
          key: "expectedEndDate",
          label: "تاریخ پایان پیش‌بینی شده",
          type: "date",
        },
        { key: "actualEndDate", label: "تاریخ پایان واقعی", type: "date" },
        {
          key: "paymentStatus",
          label: "وضعیت پرداخت",
          type: "select",
          options: [
            { value: "pending", label: "در انتظار پرداخت" },
            { value: "partial", label: "پرداخت جزئی" },
            { value: "paid", label: "پرداخت شده" },
            { value: "overdue", label: "معوقه" },
          ],
        },
        { key: "paidAmount", label: "مبلغ پرداخت شده", type: "number" },
        { key: "totalPrice", label: "قیمت کل", type: "number" },
        { key: "finalPrice", label: "قیمت نهایی", type: "number" },
        { key: "discount", label: "تخفیف", type: "number" },
        { key: "notes", label: "یادداشت‌ها", type: "textarea" },
        { key: "internalNotes", label: "یادداشت‌های داخلی", type: "textarea" },
        { key: "createdAt", label: "تاریخ ایجاد", type: "date" },
        { key: "updatedAt", label: "آخرین به‌روزرسانی", type: "date" },
      ],
      onClose: () => setShowModal(false),
    };

    setModalConfig(config);
    setSelectedProjectId({ _id: project?._id, id: project?.id });
    setShowModal(true);
  };

  const handleEdit = (project: Project) => {
    const config: ModalConfig = {
      title: "ویرایش پروژه",
      type: "edit",
      size: "xl",
      endpoint: "/api/projects/detailes",
      method: "PATCH",
      fields: [
        { key: "title", label: "عنوان پروژه", type: "text", required: true },
        {
          key: "description",
          label: "توضیحات",
          type: "textarea",
          required: true,
        },

        {
          key: "projectManagerId",
          label: "مدیر پروژه",
          type: "select",
          required: true,
          options: [
            { value: "", label: "مدیر پروژه را انتخاب کنید" },
            ...projectManagers.map((manager: ProjectManager) => ({
              value: manager._id,
              label: manager.name || '',
            })),
          ],
        },

        {
          key: "status",
          label: "وضعیت پروژه",
          type: "select",
          required: true,
          options: [
            { value: "planning", label: "در حال برنامه‌ریزی" },
            { value: "active", label: "فعال" },
            { value: "paused", label: "متوقف شده" },
            { value: "completed", label: "تکمیل شده" },
            { value: "cancelled", label: "لغو شده" },
          ],
        },
        { key: "startDate", label: "تاریخ شروع", type: "date" },
        {
          key: "expectedEndDate",
          label: "تاریخ پایان پیش‌بینی شده",
          type: "date",
        },
        { key: "actualEndDate", label: "تاریخ پایان واقعی", type: "date" },
        {
          key: "paymentStatus",
          label: "وضعیت پرداخت",
          type: "select",
          required: true,
          options: [
            { value: "pending", label: "در انتظار پرداخت" },
            { value: "partial", label: "پرداخت جزئی" },
            { value: "paid", label: "پرداخت شده" },
            { value: "overdue", label: "معوقه" },
          ],
        },
        { key: "paidAmount", label: "مبلغ پرداخت شده", type: "number" },
        { key: "totalPrice", label: "قیمت کل", type: "number", required: true },
        {
          key: "finalPrice",
          label: "قیمت نهایی",
          type: "number",
          required: true,
        },
        { key: "discount", label: "تخفیف", type: "number" },
        { key: "notes", label: "یادداشت‌ها", type: "textarea" },
        { key: "internalNotes", label: "یادداشت‌های داخلی", type: "textarea" },
      ],
      onSuccess: () => {
        toast.success("پروژه با موفقیت به‌روزرسانی شد.");
        setRefreshTable((prev) => prev + 1);
      },
      onError: () => {
        toast.error("خطا در به‌روزرسانی پروژه: ");
      },
      onClose: () => setShowModal(false),
      confirmText: "ذخیره تغییرات",
    };

    setModalConfig(config);
    setSelectedProjectId({ _id: project._id, id: project.id });
    setShowModal(true);
  };

  const handleDelete = (project: Project) => {
    const config: ModalConfig = {
      title: "حذف پروژه",
      type: "delete",
      size: "md",
      endpoint: "/api/projects/detailes",
      method: "DELETE",
      onSuccess: () => {
        setRefreshTable((prev) => prev + 1);
        toast.success("پروژه با موفقیت حذف شد.");
      },
      onError: (error) => {
        console.error("Delete error:", error);
        toast.error("خطا در حذف پروژه");
      },
      onClose: () => setShowModal(false),
      confirmText: "حذف پروژه",
      cancelText: "لغو",
    };

    setModalConfig(config);
    setSelectedProjectId({ _id: project._id, id: project.id });
    setShowModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fa-IR", {
      style: "currency",
      currency: "IRR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const projectsTableConfig: TableConfig = {
    title: "لیست پروژه‌ها",
    description: "مدیریت و مشاهده اطلاعات پروژه‌ها",
    endpoint: "/api/projects",
    columns: [
      {
        key: "title",
        label: "عنوان پروژه",
        type: "text",
        sortable: true,
        width: "200px",
      },
  
      {
        key: "status",
        label: "وضعیت پروژه",
        type: "status",
        sortable: true,
        width: "130px",
        render: (value) => {
          const statusConfig: {
            [key: string]: { label: string; className: string };
          } = {
            planning: {
              label: "برنامه‌ریزی",
              className: "bg-blue-100 text-blue-800",
            },
            active: { label: "فعال", className: "bg-green-100 text-green-800" },
            paused: {
              label: "متوقف",
              className: "bg-yellow-100 text-yellow-800",
            },
            completed: {
              label: "تکمیل شده",
              className: "bg-purple-100 text-purple-800",
            },
            cancelled: {
              label: "لغو شده",
              className: "bg-red-100 text-red-800",
            },
          };
          const config = statusConfig[value] || {
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
        key: "paymentStatus",
        label: "وضعیت پرداخت",
        type: "status",
        sortable: true,
        width: "120px",
        render: (value) => {
          const statusConfig: {
            [key: string]: { label: string; className: string };
          } = {
            pending: {
              label: "در انتظار",
              className: "bg-yellow-100 text-yellow-800",
            },
            partial: {
              label: "جزئی",
              className: "bg-orange-100 text-orange-800",
            },
            paid: {
              label: "پرداخت شده",
              className: "bg-green-100 text-green-800",
            },
            overdue: { label: "معوقه", className: "bg-red-100 text-red-800" },
          };
          const config = statusConfig[value] || {
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
        key: "totalPrice",
        label: "قیمت کل",
        type: "number",
        sortable: true,
        width: "120px",
        render: (value) => {
          return value ? formatCurrency(value) : "-";
        },
      },
      {
        key: "finalPrice",
        label: "قیمت نهایی",
        type: "number",
        sortable: true,
        width: "120px",
        render: (value) => {
          return value ? formatCurrency(value) : "-";
        },
      },
      {
        key: "paidAmount",
        label: "مبلغ پرداختی",
        type: "number",
        sortable: true,
        width: "120px",
        render: (value) => {
          return value ? formatCurrency(value) : "-";
        },
      },
      {
        key: "startDate",
        label: "تاریخ شروع",
        type: "date",
        sortable: true,
        width: "120px",
      },
      {
        key: "expectedEndDate",
        label: "تاریخ پایان",
        type: "date",
        sortable: true,
        width: "120px",
      },
      {
        key: "createdAt",
        label: "تاریخ ایجاد",
        type: "date",
        sortable: true,
        width: "120px",
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
      <DynamicTable config={projectsTableConfig} key={refreshTable} />

      {/* Dynamic Modal */}
      {showModal && modalConfig && (
        <DynamicModal
          isOpen={showModal}
          config={modalConfig}
          itemId={selectedProjectId?._id}
        />
      )}
    </div>
  );
};

export default ProjectsTable;
