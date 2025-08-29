"use client";

import React, { useState } from "react";
import DynamicTable from "./DynamicTable";
import DynamicModal, { ModalConfig } from "../DynamicModal";
import toast from "react-hot-toast";
import { TableConfig } from "@/types/tables";

const TasksTable: React.FC = () => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [refreshTable, setRefreshTable] = useState(0);

  // Function to fetch service requests for dropdown
  const fetchServiceRequests = async () => {
    try {
      const response = await fetch("/api/service-requests");
      const result = await response.json();

      if (result.success) {
        return [
          ...result.data.map((request: { _id: string; title: string , requirements: string }) => ({
            value: request._id,
            label: `${request.title} (${request.requirements?.substring(
              0,
              50
            )}...)`,
          })),
        ];
      }
      return [{ value: "", label: "انتخاب کنید" }];
    } catch (error) {
      console.error("Error fetching service requests:", error);
      return [{ value: "", label: "انتخاب کنید" }];
    }
  };

  // Function to fetch teams for dropdown
  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams");
      const result = await response.json();

      if (result.success) {
        return [
          ...result.data.map((team: { _id: string; name: string ,specialization: string }) => ({
            value: team._id,
            label: `${team.name} (${team.specialization})`,
          })),
        ];
      }
      return [{ value: "", label: "انتخاب کنید" }];
    } catch (error) {
      console.error("Error fetching teams:", error);
      return [{ value: "", label: "انتخاب کنید" }];
    }
  };

  // Function to fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const result = await response.json();

      if (result.success) {
        return [
          ...result.data.map((user: { _id: string; name: string ,role: string }) => ({
            value: user._id,
            label: `${user.name} (${user.role})`,
          })),
        ];
      }
      return [{ value: "", label: "انتخاب کنید" }];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [{ value: "", label: "انتخاب کنید" }];
    }
  };

  const handleView = (task: { _id: string ;id:string, title: string, description: string, status: string, serviceRequestId: string, assignedTeamId: string, assignedUserId: string, createdAt: string, updatedAt: string }) => {
    const config: ModalConfig = {
      title: "مشاهده جزئیات وظیفه",
      type: "view",
      size: "xl",
      endpoint: `/api/tasks/detailes`,
      fields: [
        { key: "title", label: "نام وظیفه", type: "text" },
        { key: "description", label: "توضیحات وظیفه", type: "textarea" },
        {
          key: "serviceRequestId",
          label: "درخواست سرویس",
          type: "text",
          render: (value: unknown) => {
            if (value && typeof value === "object" && "title" in value) {
              return `${(value as { title: string }).title} `;
            }
            return value ? String(value) : "-";
          },
        },
        {
          key: "assignedTeamId",
          label: "تیم تعیین‌شده",
          type: "text",
          render: (value: unknown) => {
            if (value && typeof value === "object" && "name" in value) {
              return `${(value as { name: string }).name} )`;
            }
            return value ? String(value) : "تعیین نشده";
          },
        },
        {
          key: "assignedUserId",
          label: "کاربر تعیین‌شده",
          type: "text",
          render: (value: unknown) => {
            if (value && typeof value === "object" && "name" in value) {
              return `${(value as { name: string }).name} `;
            }
            return value ? String(value) : "تعیین نشده";
          },
        },
        {
          key: "priority",
          label: "اولویت وظیفه",
          type: "select",
          options: [
            { value: "low", label: "کم اولویت" },
            { value: "medium", label: "متوسط اولویت" },
            { value: "high", label: "بالا اولویت" },
            { value: "urgent", label: "فوری" },
          ],
        },
        {
          key: "status",
          label: "وضعیت وظیفه",
          type: "select",
          options: [
            { value: "todo", label: "انجام نشده" },
            { value: "in-progress", label: "در حال انجام" },
            { value: "review", label: "در حال بررسی" },
            { value: "completed", label: "انجام شده" },
            { value: "cancelled", label: "لغو شده" },
          ],
        },
        { key: "startDate", label: "تاریخ شروع", type: "date" },
        { key: "dueDate", label: "تاریخ انقضا", type: "date" },
        { key: "completedDate", label: "تاریخ تکمیل", type: "date" },
        { key: "deliverables", label: "تحویلات", type: "textarea" },
        { key: "notes", label: "یادداشت‌ها", type: "textarea" },
        { key: "createdAt", label: "تاریخ ایجاد", type: "date" },
        { key: "updatedAt", label: "آخرین به‌روزرسانی", type: "date" },
      ],
      onClose: () => setShowModal(false),
    };

    setModalConfig(config);
    setSelectedTaskId(task._id || task.id);
    setShowModal(true);
  };

  const handleEdit = async (task: { _id: string ;id:string, title: string, description: string, status: string, serviceRequestId: string, assignedTeamId: string, assignedUserId: string, createdAt: string, updatedAt: string }) => {
    // Show loading state
    toast.loading("در حال بارگیری اطلاعات...", { id: "loading-data" });

    try {
      // Fetch all required data for dropdowns
      const [serviceRequests, teams, users] = await Promise.all([
        fetchServiceRequests(),
        fetchTeams(),
        fetchUsers(),
      ]);

      // Dismiss loading toast
      toast.dismiss("loading-data");

      const config: ModalConfig = {
        title: "ویرایش وظیفه",
        type: "edit",
        size: "xl",
        endpoint: `/api/tasks/detailes`,
        method: "PATCH",
        fields: [
          {
            key: "serviceRequestId",
            label: "درخواست سرویس",
            type: "select",
            required: true,
            options: serviceRequests,
          },
          {
            key: "title",
            label: "نام وظیفه",
            type: "text",
            required: true,
          },
          {
            key: "description",
            label: "توضیحات وظیفه",
            type: "textarea",
            required: true,
          },
          {
            key: "priority",
            label: "اولویت وظیفه",
            type: "select",
            required: true,
            options: [
              { value: "", label: "انتخاب کنید" },
              { value: "low", label: "کم اولویت" },
              { value: "medium", label: "متوسط اولویت" },
              { value: "high", label: "بالا اولویت" },
              { value: "urgent", label: "فوری" },
            ],
          },
          {
            key: "status",
            label: "وضعیت وظیفه",
            type: "select",
            required: true,
            options: [
              { value: "", label: "انتخاب کنید" },
              { value: "todo", label: "انجام نشده" },
              { value: "in-progress", label: "در حال انجام" },
              { value: "review", label: "در حال بررسی" },
              { value: "completed", label: "انجام شده" },
              { value: "cancelled", label: "لغو شده" },
            ],
          },
          {
            key: "assignedTeamId",
            label: "تیم تعیین‌شده (اختیاری)",
            type: "select",
            required: false,
            options: teams,
          },
          {
            key: "assignedUserId",
            label: "کاربر تعیین‌شده (اختیاری)",
            type: "select",
            required: false,
            options: users,
          },
          {
            key: "startDate",
            label: "تاریخ شروع",
            type: "date",
            required: false,
          },
          {
            key: "dueDate",
            label: "تاریخ انقضا",
            type: "date",
            required: false,
          },
          {
            key: "deliverables",
            label: "تحویلات",
            type: "textarea",
            required: false,
          },
          {
            key: "notes",
            label: "یادداشت‌ها",
            type: "textarea",
            required: false,
          },
        ],
        onSuccess: (data) => {
          console.log("Task updated successfully:", data);
          toast.success("وظیفه با موفقیت ویرایش شد");
          setRefreshTable((prev) => prev + 1);
        },
        onError: (error) => {
          toast.error("خطا در ویرایش وظیفه");
          console.error("Update error:", error);
        },
        onClose: () => setShowModal(false),
        confirmText: "ذخیره تغییرات",
      };

      setModalConfig(config);
      setSelectedTaskId(task._id || task.id);
      setShowModal(true);
    } catch (error) {
      toast.dismiss("loading-data");
      toast.error("خطا در بارگیری اطلاعات");
      console.error("Error loading data:", error);
    }
  };

  const handleDelete = (task: { _id: string ;id:string, title: string, description: string, status: string, serviceRequestId: string, assignedTeamId: string, assignedUserId: string, createdAt: string, updatedAt: string }) => {
    const config: ModalConfig = {
      title: "حذف وظیفه",
      type: "delete",
      size: "md",
      endpoint: `/api/tasks/detailes`,
      method: "DELETE",
      customContent: (
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            تأیید حذف وظیفه
          </h4>
          <p className="text-gray-600 mb-4">
            آیا از حذف وظیفه  اطمینان دارید؟
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">
              ⚠️ توجه: حذف وظیفه ممکن است بر گزارش‌ها و فرآیندهای مرتبط تأثیر
              بگذارد. این عمل قابل بازگشت نیست.
            </p>
          </div>
        </div>
      ),
      onSuccess: (data) => {
        console.log("Task deleted successfully:", data);
        toast.success("وظیفه با موفقیت حذف شد");
        setRefreshTable((prev) => prev + 1);
      },
      onError: (error) => {
        toast.error("خطا در حذف وظیفه: " + error);
        console.error("Delete error:", error);
      },
      onClose: () => setShowModal(false),
      confirmText: "حذف وظیفه",
      cancelText: "لغو",
    };

    setModalConfig(config);
    setSelectedTaskId(task._id || task.id);
    setShowModal(true);
  };

  const tasksTableConfig: TableConfig = {
    title: "لیست وظایف",
    description: "مدیریت و مشاهده وظایف ثبت شده",
    endpoint: "/api/tasks",
    columns: [
      {
        key: "title",
        label: "نام وظیفه",
        type: "text",
        sortable: true,
        width: "200px",
      },
      {
        key: "serviceRequestId",
        label: "درخواست سرویس",
        type: "text",
        sortable: true,
        width: "180px",
        render: (value) => {
          if (value && typeof value === "object") {
            return (
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{value.title}</span>
                <span className="text-xs text-gray-500">
                  {value.requirements?.substring(0, 30)}...
                </span>
              </div>
            );
          }
          return value || "-";
        },
      },
      {
        key: "assignedTeamId",
        label: "تیم",
        type: "text",
        sortable: true,
        width: "150px",
        render: (value) => {
          if (value && typeof value === "object") {
            return (
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{value.name}</span>
              </div>
            );
          }
          return value || "تعیین نشده";
        },
      },
      {
        key: "assignedUserId",
        label: "کاربر",
        type: "text",
        sortable: true,
        width: "130px",
        render: (value) => {
          if (value && typeof value === "object") {
            return (
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">{value.name}</span>
              </div>
            );
          }
          return value || "تعیین نشده";
        },
      },
      {
        key: "priority",
        label: "اولویت",
        type: "text",
        sortable: true,
        width: "100px",
        render: (value) => {
          const priorityConfig: {
            [key: string]: { label: string; className: string };
          } = {
            low: { label: "کم", className: "bg-gray-100 text-gray-800" },
            medium: { label: "متوسط", className: "bg-blue-100 text-blue-800" },
            high: { label: "بالا", className: "bg-orange-100 text-orange-800" },
            urgent: { label: "فوری", className: "bg-red-100 text-red-800" },
          };
          const config = priorityConfig[value] || {
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
        key: "status",
        label: "وضعیت",
        type: "status",
        sortable: true,
        width: "120px",
        render: (value) => {
          const statusConfig: {
            [key: string]: { label: string; className: string };
          } = {
            todo: {
              label: "انجام نشده",
              className: "bg-gray-100 text-gray-800",
            },
            "in-progress": {
              label: "در حال انجام",
              className: "bg-blue-100 text-blue-800",
            },
            review: {
              label: "بررسی",
              className: "bg-yellow-100 text-yellow-800",
            },
            completed: {
              label: "تکمیل شده",
              className: "bg-green-100 text-green-800",
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
        key: "startDate",
        label: "تاریخ شروع",
        type: "date",
        sortable: true,
        width: "120px",
      },
      {
        key: "dueDate",
        label: "تاریخ انقضا",
        type: "date",
        sortable: true,
        width: "120px",
      },
      {
        key: "description",
        label: "توضیحات",
        type: "text",
        sortable: false,
        width: "200px",
        render: (value) => {
          if (!value) return "-";
          return value.length > 50 ? `${value.substring(0, 50)}...` : value;
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
      <DynamicTable config={tasksTableConfig} key={refreshTable} />

      {/* Dynamic Modal */}
      {showModal && modalConfig && (
        <DynamicModal
          isOpen={showModal}
          config={modalConfig}
          itemId={selectedTaskId}
        />
      )}
    </div>
  );
};

export default TasksTable;
