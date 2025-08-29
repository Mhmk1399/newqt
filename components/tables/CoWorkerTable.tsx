"use client";

import React, { useState } from "react";
import DynamicTable from "./DynamicTable";
import DynamicModal, { ModalConfig } from "../DynamicModal";
import toast from "react-hot-toast";
import { TableConfig } from "@/types/tables";

interface CoWorker {
  _id: string;
  id: string;
  name: string;
  phoneNumber: number;
  experties: "model" | "makeUpArtist" | "stylist" | "location" | "photoGrapher";
  email: string;
  isActive: boolean;
  description: string;
  images: {
    main: string;
    thumbnails: string[];
  };
  resomeLink: string;
  socialLinks: object;
  aprovedBy: string;
  isApprove: boolean;
  projects?: string[];
  createdAt: string;
  updatedAt: string;
}

const CoWorkerTable: React.FC = () => {
  const [selectedCoWorkerId, setSelectedCoWorkerId] = useState<string | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [refreshTable, setRefreshTable] = useState(0);

  const handleView = (coworker: CoWorker) => {
    const config: ModalConfig = {
      title: "مشاهده جزئیات همکار",
      type: "view",
      size: "xl",
      endpoint: "/api/coworkers/detailes",
      fields: [
        { key: "name", label: "نام", type: "text" },
        { key: "email", label: "ایمیل", type: "email" },
        { key: "phoneNumber", label: "شماره تلفن", type: "text" },
        {
          key: "experties",
          label: "تخصص",
          type: "select",
          options: [
            { value: "model", label: "مدل" },
            { value: "makeUpArtist", label: "آرایشگر" },
            { value: "stylist", label: "استایلیست" },
            { value: "location", label: "لوکیشن" },
            { value: "photoGrapher", label: "عکاس" },
          ],
        },
        { key: "description", label: "توضیحات", type: "textarea" },
        { key: "resomeLink", label: "لینک رزومه", type: "text" },
        {
          key: "aprovedBy",
          label: "تایید شده توسط",
          type: "select",
          optionsEndpoint: "/api/users/admins",
          optionLabelKey: "name",
        },
      ],
      onClose: () => setShowModal(false),
    };

    setModalConfig(config);
    setSelectedCoWorkerId(coworker._id || coworker.id);
    setShowModal(true);
  };

  const handleEdit = (coworker: CoWorker) => {
    const config: ModalConfig = {
      title: "ویرایش همکار",
      type: "edit",
      size: "xl",
      endpoint: "/api/coworkers/detailes",
      method: "PATCH",
      fields: [
        { key: "name", label: "نام", type: "text", required: true },
        { key: "email", label: "ایمیل", type: "email", required: true },
        {
          key: "phoneNumber",
          label: "شماره تلفن",
          type: "number",
          required: true,
        },
        {
          key: "experties",
          label: "تخصص",
          type: "select",
          required: true,
          options: [
            { value: "model", label: "مدل" },
            { value: "makeUpArtist", label: "آرایشگر" },
            { value: "stylist", label: "استایلیست" },
            { value: "location", label: "لوکیشن" },
            { value: "photoGrapher", label: "عکاس" },
          ],
        },
        {
          key: "description",
          label: "توضیحات",
          type: "textarea",
          required: true,
        },
        {
          key: "resomeLink",
          label: "لینک رزومه",
          type: "text",
          required: true,
        },
        {
          key: "aprovedBy",
          label: "تایید شده توسط",
          type: "select",
          required: true,
          optionsEndpoint: "/api/users/admins",
          optionLabelKey: "name",
        },
      ],
      onSuccess: () => {
        toast.success("همکار با موفقیت بهروزرسانی شد.");
        setRefreshTable((prev) => prev + 1);
      },
      onError: () => {
        toast.error("خطا در بهروزرسانی همکار.");
      },
      onClose: () => setShowModal(false),
      confirmText: "ذخیره تغییرات",
    };

    setModalConfig(config);
    setSelectedCoWorkerId(coworker._id || coworker.id);
    setShowModal(true);
  };

  const handleApprove = async (
    coworkerId: string,
    action: "approve" | "decline"
  ) => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch("/api/coworkers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ coworkerId, action }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("وضعیت تایید با موفقیت تغییر کرد");
        setRefreshTable((prev) => prev + 1);
      } else {
        toast.error("خطا در تغییر وضعیت تایید");
      }
    } catch (error: unknown) {
      console.log(error);
      toast.error("خطا در تغییر وضعیت تایید");
    }
  };

  const handleDelete = (coworker: CoWorker) => {
    const config: ModalConfig = {
      title: "حذف همکار",
      type: "delete",
      size: "md",
      endpoint: "/api/coworkers",
      method: "DELETE",
      customContent: (
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            تأیید حذف همکار
          </h4>
          <p className="text-gray-600 mb-4">
            آیا از حذف همکار {coworker.name} اطمینان دارید؟
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">
              ⚠️ توجه: حذف همکار باعث حذف تمام اطلاعات مرتبط با وی خواهد شد. این
              عمل قابل بازگشت نیست.
            </p>
          </div>
        </div>
      ),
      onSuccess: () => {
        toast.success("همکار با موفقیت حذف شد");
        setRefreshTable((prev) => prev + 1);
      },
      onError: () => {
        toast.error("خطا در حذف همکار");
      },
      onClose: () => setShowModal(false),
      confirmText: "حذف همکار",
      cancelText: "لغو",
    };

    setModalConfig(config);
    setSelectedCoWorkerId(coworker._id || coworker.id);
    setShowModal(true);
  };

  const coWorkersTableConfig: TableConfig = {
    title: "لیست همکاران",
    description: "مدیریت و مشاهده اطلاعات همکاران",
    endpoint: "/api/coworkers?showAll=true",
    deleteEndpoint: "/api/coworkers/detailes",
    columns: [
      {
        key: "name",
        label: "نام",
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
        key: "phoneNumber",
        label: "شماره تلفن",
        type: "text",
        sortable: true,
        width: "150px",
      },
      {
        key: "experties",
        label: "تخصص",
        type: "status",
        sortable: true,
        width: "120px",
        render: (value) => {
          const expertiesConfig: {
            [key: string]: { label: string; className: string };
          } = {
            model: {
              label: "مدل",
              className: "bg-purple-100 text-purple-800",
            },
            makeUpArtist: {
              label: "آرایشگر",
              className: "bg-pink-100 text-pink-800",
            },
            stylist: {
              label: "استایلیست",
              className: "bg-blue-100 text-blue-800",
            },
            location: {
              label: "لوکیشن",
              className: "bg-green-100 text-green-800",
            },
            photoGrapher: {
              label: "عکاس",
              className: "bg-orange-100 text-orange-800",
            },
          };
          const config = expertiesConfig[value] || {
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
        key: "description",
        label: "توضیحات",
        type: "text",
        sortable: false,
        width: "200px",
        render: (value) => {
          const desc = value as string;
          return desc
            ? desc.length > 50
              ? `${desc.substring(0, 50)}...`
              : desc
            : "-";
        },
      },
      {
        key: "resomeLink",
        label: "رزومه",
        type: "text",
        sortable: false,
        width: "100px",
        render: (value, row) => {
          if (!value) return "-";

          const coworkerId = row._id || row.id;
          const href = `/models/${coworkerId}`;

          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              مشاهده
            </a>
          );
        },
      },
    ],
    actions: {
      view: true,
      edit: true,
      delete: true,
      custom: [
        {
          label: "تایید",
          icon: "✓",
          className:
            "text-green-600 hover:text-green-800 border border-green-200 hover:bg-green-50",
          condition: (row) => !row.isApprove,
          onClick: (row) => handleApprove(row._id || row.id, "approve"),
        },
        {
          label: "رد",
          icon: "✗",
          className:
            "text-red-600 hover:text-red-800 border border-red-200 hover:bg-red-50",
          condition: (row) => row.isApprove,
          onClick: (row) => handleApprove(row._id || row.id, "decline"),
        },
      ],
    },
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  };

  return (
    <div>
      <DynamicTable config={coWorkersTableConfig} key={refreshTable} />

      {showModal && modalConfig && (
        <DynamicModal
          isOpen={showModal}
          config={modalConfig}
          itemId={selectedCoWorkerId}
        />
      )}
    </div>
  );
};

export default CoWorkerTable;
