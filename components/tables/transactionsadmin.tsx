"use client";

import React, { useState } from "react";
import DynamicModal, { ModalConfig } from "../../components/DynamicModal";
import toast from "react-hot-toast";
import { TableConfig } from "@/types/tables";
import DynamicTable from "./DynamicTable";

interface User {
  name: string;
  email?: string;
}

interface Customer {
  name: string;
  businessName?: string;
  email?: string;
}

interface Transaction {
  _id: string;
  id: string;
  subject: string;
  date: string;
  debtor: number;
  fastener: number;
  users: User;
  customer?: Customer;
}

interface ModalSuccessData {
  success?: boolean;
  message?: string;
  data?: unknown;
}

const TransactionsAdmin: React.FC = () => {
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [refreshTable, setRefreshTable] = useState(0);

  const handleView = (transaction: Transaction) => {
    const config: ModalConfig = {
      title: "مشاهده جزئیات تراکنش",
      type: "view",
      size: "lg",
      endpoint: "/api/transactions/details",
      fields: [
        { key: "subject", label: "موضوع", type: "text" },
        { key: "date", label: "تاریخ", type: "date" },
        { key: "debtor", label: "بدهکار", type: "number" },
        { key: "fastener", label: "بستانکار", type: "number" },
        { 
          key: "users", 
          label: "کاربر", 
          type: "text",
          render: (value: unknown) => {
            if (!value) return "-";
            if (typeof value === 'object' && value !== null && 'name' in value) {
              const user = value as User;
              return `${user.name} (${user.email || 'بدون ایمیل'})`;
            }
            return String(value);
          }
        },
        { 
          key: "customer", 
          label: "مشتری", 
          type: "text",
          render: (value: unknown) => {
            if (!value) return "-";
            if (typeof value === 'object' && value !== null && 'name' in value) {
              const customer = value as Customer;
              return `${customer.name} ${customer.businessName ? `- ${customer.businessName}` : ''} (${customer.email || 'بدون ایمیل'})`;
            }
            return String(value);
          }
        },
      ],
      onClose: () => setShowModal(false),
    };

    setModalConfig(config);
    setSelectedTransactionId(transaction._id || transaction.id);
    setShowModal(true);
  };

  const handleEdit = (transaction: Transaction) => {
    const config: ModalConfig = {
      title: "ویرایش تراکنش",
      type: "edit",
      size: "lg",
      endpoint: "/api/transactions/details",
      method: "PATCH",
      fields: [
        {
          key: "subject",
          label: "موضوع",
          type: "text",
          required: true,
        },
        {
          key: "date",
          label: "تاریخ",
          type: "date",
          required: true,
        },
        {
          key: "debtor",
          label: "بدهکار",
          type: "number",
          required: true,
        },
        {
          key: "fastener",
          label: "بستانکار",
          type: "number",
          required: true,
        },
        { 
          key: "users", 
          label: "کاربر", 
          type: "select",
          optionsEndpoint: "/api/users",
          optionLabelKey: "name"
        },
        { 
          key: "customer", 
          label: "مشتری", 
          type: "select",
          optionsEndpoint: "/api/customers",
          optionLabelKey: "name"
        },
      ],
      onSuccess: (data: ModalSuccessData) => {
        console.log("Transaction updated successfully:", data);
        toast.success("تراکنش با موفقیت ویرایش شد");
        setRefreshTable((prev) => prev + 1);
      },
      onError: (error: string | Error) => {
        toast.error("خطا در ویرایش تراکنش");
        console.error("Update error:", error);
      },
      onClose: () => setShowModal(false),
      confirmText: "ذخیره تغییرات",
    };

    setModalConfig(config);
    setSelectedTransactionId(transaction._id || transaction.id);
    setShowModal(true);
  };

  const handleDelete = (transaction: Transaction) => {
    const config: ModalConfig = {
      title: "حذف تراکنش",
      type: "delete",
      size: "md",
      endpoint: "/api/transactions/details",
      method: "DELETE",
      onSuccess: (data: ModalSuccessData) => {
        console.log("Transaction deleted successfully:", data);
        toast.success("تراکنش با موفقیت حذف شد");
        setRefreshTable((prev) => prev + 1);
      },
      onError: (error: string | Error) => {
        toast.error("خطا در حذف تراکنش: " + error);
        console.error("Delete error:", error);
      },
      onClose: () => setShowModal(false),
      confirmText: "حذف تراکنش",
      cancelText: "لغو",
    };

    setModalConfig(config);
    setSelectedTransactionId(transaction._id || transaction.id);
    setShowModal(true);
  };

 const transactionsTableConfig: TableConfig = {
  title: "لیست تراکنش‌ها",
  description: "مدیریت و مشاهده تراکنش‌های سیستم",
  endpoint: "/api/transactions",
  columns: [
    {
      key: "subject",
      label: "موضوع",
      type: "text",
      sortable: true,
      width: "200px",
      render: (value: string) => (
        <span className="text-sm font-medium text-gray-900">
          {value || "-"}
        </span>
      ),
    },
    {
      key: "date",
      label: "تاریخ",
      type: "date",
      sortable: true,
      width: "120px",
      render: (value: string) => {
        if (!value) return <span className="text-sm text-gray-600">-</span>;
        return (
          <span className="text-sm text-gray-600">
            {new Date(value).toLocaleDateString("fa-IR")}
          </span>
        );
      },
    },
    {
      key: "debtor",
      label: "بدهکار",
      type: "number",
      sortable: true,
      width: "120px",
      render: (value: number) => (
        <span className="font-semibold text-red-600">
          {value?.toLocaleString() || 0} ریال
        </span>
      ),
    },
    {
      key: "fastener",
      label: "بستانکار",
      type: "number",
      sortable: true,
      width: "120px",
      render: (value: number) => (
        <span className="font-semibold text-green-600">
          {value?.toLocaleString() || 0} ریال
        </span>
      ),
    },
    {
      key: "users",
      label: "کاربر",
      type: "text",
      sortable: true,
      width: "150px",
      render: (value: User | string | null | undefined) => {
        if (!value) return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">-</span>;
        if (typeof value === "string") {
          return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{value}</span>;
        }
        if (typeof value === "object" && value !== null && "name" in value) {
          const user = value as User;
          return (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {user.name || "نامشخص"}
            </span>
          );
        }
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">نامشخص</span>;
      },
    },
    {
      key: "customer",
      label: "مشتری",
      type: "text",
      sortable: true,
      width: "150px",
      render: (value: Customer | string | null | undefined) => {
        if (!value) return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">-</span>;
        if (typeof value === "string") {
          return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">{value}</span>;
        }
        if (typeof value === "object" && value !== null && "name" in value) {
          const customer = value as Customer;
          return (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
              {customer.name || "نامشخص"} {customer.businessName ? `- ${customer.businessName}` : ""}
            </span>
          );
        }
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">نامشخص</span>;
      },
    },
    {
      key: "_id",
      label: "شناسه",
      type: "text",
      sortable: false,
      width: "100px",
      render: (value: string) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
          {value ? value.substring(0, 8) + "..." : "-"}
        </span>
      ),
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
      <DynamicTable
        config={transactionsTableConfig}
        key={refreshTable}
      />

      {/* Dynamic Modal */}
      {showModal && modalConfig && (
        <DynamicModal
          isOpen={showModal}
          config={modalConfig}
          itemId={selectedTransactionId}
        />
      )}
    </div>
  );
};

export default TransactionsAdmin;
