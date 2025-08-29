"use client";

import React, { useState } from "react";
import DynamicTable from "./DynamicTable";
import DynamicModal, { ModalConfig } from "../DynamicModal";
import toast from "react-hot-toast";
import { TableConfig } from "@/types/tables";

const ServiceRequestsTable: React.FC = () => {
  const [selectedServiceRequestId, setSelectedServiceRequestId] = useState<
    string | null
  >(null);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [refreshTable, setRefreshTable] = useState(0);

  // Function to fetch projects for dropdown
  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const result = await response.json();

      if (result.success) {
        return [
          ...result.data.map((project: { _id: string; title: string }) => ({
            value: project._id,
            label: project.title,
          })),
        ];
      }
      return [{ value: "", label: "انتخاب کنید" }];
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [{ value: "", label: "انتخاب کنید" }];
    }
  };

  // Function to fetch services for dropdown
  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      const result = await response.json();

      if (result.success) {
        return [
          ...result.data.map((service: { _id: string; name: string , basePrice: number }) => ({
            value: service._id,
            label: `${service.name} (${service.basePrice})`,
          })),
        ];
      }
      return [{ value: "", label: "انتخاب کنید" }];
    } catch (error) {
      console.error("Error fetching services:", error);
      return [{ value: "", label: "انتخاب کنید" }];
    }
  };

  const handleView = (serviceRequest: { _id: string ;id:string, projectId: string, serviceId: string, title: string, description: string, status: string, price: number, createdAt: string, updatedAt: string }) => {
    const config: ModalConfig = {
      title: "مشاهده جزئیات درخواست سرویس",
      type: "view",
      size: "xl",
      endpoint: `/api/service-requests/detailes`,
      fields: [
        { key: "title", label: "عنوان", type: "text" },
        {
          key: "projectId",
          label: "پروژه",
          type: "text",
          render: (value: unknown) => {
            if (value && typeof value === "object") {
              const v = value as { title?: string; name?: string };
              return v.title || v.name || "-";
            }
            return (value as string) || "-";
          },
        },
        {
          key: "serviceId",
          label: "سرویس",
          type: "text",
          render: (value: unknown) => {
            if (value && typeof value === "object") {
              const v = value as { name?: string; basePrice?: number };
              return `${v.name ?? "-"} (${v.basePrice ?? "-"} تومان)`;
            }
            return (value as string) || "-";
          },
        },
        { key: "quantity", label: "تعداد", type: "number" },
        {
          key: "priority",
          label: "اولویت",
          type: "select",
          options: [
            { value: "low", label: "کم اولویت" },
            { value: "medium", label: "متوسط اولویت" },
            { value: "high", label: "بالا اولویت" },
            { value: "urgent", label: "فوری" },
          ],
        },
        { key: "requestedDate", label: "تاریخ درخواست", type: "date" },
        { key: "scheduledDate", label: "تاریخ پیشنهادی", type: "date" },
        {
          key: "requirements",
          label: "توضیحات و نیازهای خاص",
          type: "textarea",
        },
        { key: "notes", label: "توضیحات و نکات اضافی", type: "textarea" },
        {
          key: "status",
          label: "وضعیت",
          type: "select",
          options: [
            { value: "pending", label: "در انتظار" },
            { value: "approved", label: "تایید شده" },
            { value: "in_progress", label: "در حال انجام" },
            { value: "completed", label: "تکمیل شده" },
            { value: "cancelled", label: "لغو شده" },
          ],
        },
        { key: "createdAt", label: "تاریخ ایجاد", type: "date" },
        { key: "updatedAt", label: "آخرین به‌روزرسانی", type: "date" },
      ],
      onClose: () => setShowModal(false),
    };

    setModalConfig(config);
    setSelectedServiceRequestId(serviceRequest._id || serviceRequest.id);
    setShowModal(true);
  };

  const handleEdit = async (serviceRequest: { _id: string; id: string }) => {
    // Show loading state
    toast.loading("در حال بارگیری اطلاعات...", { id: "loading-data" });

    try {
      // Fetch projects and services for dropdowns
      const [projects, services] = await Promise.all([
        fetchProjects(),
        fetchServices(),
      ]);

      // Dismiss loading toast
      toast.dismiss("loading-data");

      const config: ModalConfig = {
        title: "ویرایش درخواست سرویس",
        type: "edit",
        size: "xl",
        endpoint: `/api/service-requests/detailes`,
        method: "PATCH",
        fields: [
          {
            key: "title",
            label: "عنوان",
            type: "text",
            required: true,
          },
          {
            key: "projectId",
            label: "پروژه",
            type: "select",
            required: true,
            options: projects,
          },
          {
            key: "serviceId",
            label: "سرویس",
            type: "select",
            required: true,
            options: services,
          },
          {
            key: "quantity",
            label: "تعداد",
            type: "number",
            required: true,
          },
          {
            key: "priority",
            label: "اولویت",
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
            key: "requestedDate",
            label: "تاریخ درخواست",
            type: "date",
            required: true,
          },
          {
            key: "scheduledDate",
            label: "تاریخ پیشنهادی",
            type: "date",
            required: false,
          },
          {
            key: "requirements",
            label: "توضیحات و نیازهای خاص",
            type: "textarea",
            required: true,
          },
          {
            key: "notes",
            label: "توضیحات و نکات اضافی",
            type: "textarea",
            required: false,
          },
          {
            key: "status",
            label: "وضعیت",
            type: "select",
            options: [
              { value: "", label: "انتخاب کنید" },
              { value: "pending", label: "در انتظار" },
              { value: "approved", label: "تایید شده" },
              { value: "in_progress", label: "در حال انجام" },
              { value: "completed", label: "تکمیل شده" },
              { value: "cancelled", label: "لغو شده" },
            ],
          },
        ],
        onSuccess: (data) => {
          console.log("Service request updated successfully:", data);
          toast.success("درخواست سرویس با موفقیت ویرایش شد");
          setRefreshTable((prev) => prev + 1);
        },
        onError: (error) => {
          toast.error("خطا در ویرایش درخواست سرویس");
          console.error("Update error:", error);
        },
        onClose: () => setShowModal(false),
        confirmText: "ذخیره تغییرات",
      };

      setModalConfig(config);
      setSelectedServiceRequestId(serviceRequest._id || serviceRequest.id);
      setShowModal(true);
    } catch (error) {
      toast.dismiss("loading-data");
      toast.error("خطا در بارگیری اطلاعات");
      console.error("Error loading data:", error);
    }
  };

  const handleDelete = (serviceRequest: {
    _id: string;
    id: string;
    title: string;
 }) => {
    const config: ModalConfig = {
      title: "حذف درخواست سرویس",
      type: "delete",
      size: "md",
      endpoint: `/api/service-requests/detailes`,
      method: "DELETE",
      customContent: (
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            تأیید حذف درخواست سرویس
          </h4>
          <p className="text-gray-600 mb-4">
            آیا از حذف درخواست سرویس  اطمینان دارید؟
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">
              ⚠️ توجه: حذف درخواست سرویس ممکن است بر تسک‌ها و گزارش‌های مرتبط
              تأثیر بگذارد. این عمل قابل بازگشت نیست.
            </p>
          </div>
        </div>
      ),
      onSuccess: (data) => {
        console.log("Service request deleted successfully:", data);
        toast.success("درخواست سرویس با موفقیت حذف شد");
        setRefreshTable((prev) => prev + 1);
      },
      onError: (error) => {
        toast.error("خطا در حذف درخواست سرویس: " + error);
        console.error("Delete error:", error);
      },
      onClose: () => setShowModal(false),
      confirmText: "حذف درخواست سرویس",
      cancelText: "لغو",
    };

    setModalConfig(config);
    setSelectedServiceRequestId(serviceRequest._id || serviceRequest.id);
    setShowModal(true);
  };

  const serviceRequestsTableConfig: TableConfig = {
    title: "لیست درخواست‌های سرویس",
    description: "مدیریت و مشاهده درخواست‌های سرویس ثبت شده",
    endpoint: "/api/service-requests",
    columns: [
      {
        key: "title",
        label: "عنوان",
        type: "text",
        sortable: true,
        width: "200px",
      },
      {
        key: "projectId",
        label: "پروژه",
        type: "text",
        sortable: true,
        width: "150px",
        render: (value) => {
          if (value && typeof value === "object") {
            return value.title || value.name || "-";
          }
          return value || "-";
        },
      },
      {
        key: "serviceId",
        label: "سرویس",
        type: "text",
        sortable: true,
        width: "180px",
        render: (value) => {
          if (value && typeof value === "object") {
            return (
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{value.name}</span>
                <span className="text-xs text-gray-500">
                  {value.basePrice} تومان
                </span>
              </div>
            );
          }
          return value || "-";
        },
      },
      {
        key: "quantity",
        label: "تعداد",
        type: "number",
        sortable: true,
        width: "80px",
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
            pending: {
              label: "در انتظار",
              className: "bg-yellow-100 text-yellow-800",
            },
            approved: {
              label: "تایید شده",
              className: "bg-green-100 text-green-800",
            },
            in_progress: {
              label: "در حال انجام",
              className: "bg-blue-100 text-blue-800",
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
        key: "requestedDate",
        label: "تاریخ درخواست",
        type: "date",
        sortable: true,
        width: "130px",
      },
      {
        key: "requirements",
        label: "نیازمندی‌ها",
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
      <DynamicTable config={serviceRequestsTableConfig} key={refreshTable} />

      {/* Dynamic Modal */}
      {showModal && modalConfig && (
        <DynamicModal
          isOpen={showModal}
          config={modalConfig}
          itemId={selectedServiceRequestId}
        />
      )}
    </div>
  );
};

export default ServiceRequestsTable;
