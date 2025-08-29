"use client";

import React, { useState } from "react";
import DynamicTable from "@/components/tables/DynamicTable";
import DynamicModal, { ModalConfig } from "@/components/DynamicModal";
import { TableConfig } from "@/types/tables";

const UserTasksPage = () => {
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);


  const getCustomerIdFromToken = (): string | null => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        console.error("توکن کاربر در localStorage یافت نشد");
        return null;
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      console.log("توکن رمزگشایی شده:", decodedToken);

      if (decodedToken.userId) {
        return decodedToken.userId;
      } else {
        console.error("userId در محتوای توکن یافت نشد");
        return null;
      }
    } catch (error) {
      console.error("خطا در رمزگشایی توکن:", error);
      return null;
    }
  };

  // Helper function to translate status to Persian
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "todo":
        return "انجام نشده";
      case "in-progress":
        return "در حال انجام";
      case "completed":
        return "تکمیل شده";
      case "pending":
        return "در انتظار";
      case "cancelled":
        return "لغو شده";
      default:
        return status;
    }
  };

  // Helper function to translate priority to Persian
  const getPriorityLabel = (priority: string): string => {
    switch (priority) {
      case "low":
        return "کم";
      case "medium":
        return "متوسط";
      case "high":
        return "بالا";
      case "urgent":
        return "فوری";
      case "critical":
        return "بحرانی";
      default:
        return priority;
    }
  };

  // Helper function to get status color classes
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Helper function to get priority color classes
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "critical":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Custom render functions for status and priority
  const renderStatus = (status: string) => {
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
          status
        )}`}
      >
        {getStatusLabel(status)}
      </span>
    );
  };

  const renderPriority = (priority: string) => {
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
          priority
        )}`}
      >
        {getPriorityLabel(priority)}
      </span>
    );
  };

  // Format date to Persian
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };



  // Handle upload file button click - FIXED

  // Handle view task
  const handleViewTask = (row: {
    _id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }) => {
    const viewConfig: ModalConfig = {
      title: `جزئیات وظیفه: ${row.title}`,
      type: "view",
      size: "lg",
      endpoint: "/api/tasks/detailes",
      method: "GET",
      onClose: () => setIsModalOpen(false),
      fields: [
        {
          key: "title",
          label: "عنوان وظیفه",
          type: "text",
        },
        {
          key: "description",
          label: "توضیحات",
          type: "textarea",
        },
        {
          key: "status",
          label: "وضعیت",
          type: "text",
          render: (value: unknown) => getStatusLabel(value as string),
        },
        {
          key: "priority",
          label: "اولویت",
          type: "text",
          render: (value: unknown) => getPriorityLabel(value as string),
        },
        {
          key: "startDate",
          label: "تاریخ شروع",
          type: "date",
        },
        {
          key: "dueDate",
          label: "مهلت انجام",
          type: "date",
        },
        {
          key: "notes",
          label: "یادداشت‌ها",
          type: "textarea",
        },
        {
          key: "deliverables",
          label: "تحویلی‌ها",
          type: "textarea",
        },
      ],
    };

    setModalConfig(viewConfig);
    setSelectedTaskId(row._id);
    setIsModalOpen(true);
  };

  // Handle edit task
  const handleEditTask = (row: {
    _id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    startDate: string;
    dueDate: string;
    notes: string;
    deliverables: string;
  }) => {
    const editConfig: ModalConfig = {
      title: `ویرایش وظیفه: ${row.title}`,
      type: "edit",
      size: "md",
      endpoint: "/api/tasks/detailes",
      method: "PATCH",
      onSuccess: (data) => {
        console.log("Task updated successfully:", data);
        setIsModalOpen(false);
      },
      onError: (error) => {
        console.error("Error updating task:", error);
        alert("خطا در به‌روزرسانی وظیفه: " + error);
      },
      onClose: () => setIsModalOpen(false),
      confirmText: "ذخیره تغییرات",
      cancelText: "انصراف",
      fields: [
        {
          key: "status",
          label: "وضعیت",
          type: "select",
          required: true,
          options: [
            { value: "todo", label: "انجام نشده" },
            { value: "in-progress", label: "در حال انجام" },
            { value: "completed", label: "تکمیل شده" },
            { value: "cancelled", label: "لغو شده" },
          ],
        },
        {
          key: "notes",
          label: "یادداشت‌ها",
          type: "textarea",
          required: false,
          placeholder: "یادداشت‌های خود را اینجا بنویسید...",
        },
        {
          key: "deliverables",
          label: "تحویلی‌ها",
          type: "textarea",
          required: false,
          placeholder: "تحویلی‌ها خود را اینجا بنویسید...",
        },
      ],
    };

    setModalConfig(editConfig);
    setSelectedTaskId(row._id);
    setIsModalOpen(true);
  };

  const id = getCustomerIdFromToken();

  const tableConfig: TableConfig = {
    title: `وظایف من`,
    description: "لیست وظایف اختصاص داده شده به شما.",
    endpoint: `/api/tasks/byUsers`,
    headers: id ? { id } : {},
    columns: [
      { key: "title", label: "عنوان", sortable: true },
      { key: "description", label: "توضیحات" },
      {
        key: "status",
        label: "وضعیت",
        type: "status",
        render: (value: string) => renderStatus(value),
      },
      {
        key: "priority",
        label: "اولویت",
        type: "status",
        render: (value: string) => renderPriority(value),
      },
      {
        key: "startDate",
        label: "تاریخ شروع",
        type: "date",
        render: (value: string) => formatDate(value),
      },
      {
        key: "dueDate",
        label: "مهلت انجام",
        type: "date",
        render: (value: string) => formatDate(value),
      },
      { key: "notes", label: "یادداشت‌ها" },
      { key: "deliverables", label: "تحویلی‌ها" },
      
      
    ],
    actions: {
      view: true,
      edit: true,
      delete: false,
    },
    onView: handleViewTask,
    onEdit: handleEditTask,
    onDelete: (row) => {
      console.log("حذف وظیفه:", row);
    },
  };

  // نمایش حالت بارگذاری یا خطا در صورت عدم وجود شناسه کاربر
  if (!id) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">
            امکان بارگذاری اطلاعات کاربر وجود ندارد. لطفاً دوباره وارد شوید.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <DynamicTable config={tableConfig} />

      {isModalOpen && modalConfig && (
        <DynamicModal
          isOpen={isModalOpen}
          config={modalConfig}
          itemId={selectedTaskId}
        />
      )}


    </div>
  );
};

export default UserTasksPage;
