"use client";

import React, { useState } from "react";
import DynamicTable from "./DynamicTable";
import DynamicModal, { ModalConfig } from "../DynamicModal";
import toast from "react-hot-toast";
import { TableConfig } from "@/types/tables";

interface Contract {
  _id?: string;
  id?: string;
  title: string;
  contractNumber: string;
  customerId: string;
  status: string;
  totalAmount?: number;
  finalAmount?: number;
  paidAmount?: number;
}

const ContractsTable: React.FC = () => {
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [refreshTable, setRefreshTable] = useState(0);

  const handleView = (contract: Contract) => {
    const config: ModalConfig = {
      title: "مشاهده جزئیات قرارداد",
      type: "view",
      size: "xl",
      endpoint: "/api/contracts/detailes",
      fields: [
        { key: "title", label: "عنوان قرارداد", type: "text" },
        { key: "contractNumber", label: "شماره قرارداد", type: "text" },
        { key: "customerId", label: "شناسه مشتری", type: "text" },
        { key: "description", label: "توضیحات", type: "textarea" },
        {
          key: "status",
          label: "وضعیت قرارداد",
          type: "select",
          options: [
            { value: "draft", label: "پیش‌نویس" },
            { value: "pending", label: "در انتظار تأیید" },
            { value: "approved", label: "تأیید شده" },
            { value: "rejected", label: "رد شده" },
            { value: "active", label: "فعال" },
            { value: "completed", label: "تکمیل شده" },
            { value: "cancelled", label: "لغو شده" },
          ],
        },
        { key: "startDate", label: "تاریخ شروع", type: "date" },
        { key: "endDate", label: "تاریخ پایان", type: "date" },
        { key: "totalAmount", label: "مبلغ کل", type: "number" },
        { key: "paidAmount", label: "مبلغ پرداخت شده", type: "number" },
        { key: "discount", label: "تخفیف", type: "number" },
        { key: "finalAmount", label: "مبلغ نهایی", type: "number" },
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
        { key: "terms", label: "شرایط قرارداد", type: "textarea" },
        { key: "notes", label: "یادداشت‌ها", type: "textarea" },
        { key: "approvedBy", label: "تأیید شده توسط", type: "text" },
        { key: "approvedAt", label: "تاریخ تأیید", type: "date" },
        { key: "rejectionReason", label: "دلیل رد", type: "textarea" },
        { key: "createdAt", label: "تاریخ ایجاد", type: "date" },
        { key: "updatedAt", label: "آخرین به‌روزرسانی", type: "date" },
      ],
      onClose: () => setShowModal(false),
    };

    setModalConfig(config);
    setSelectedContractId(contract?._id || contract?.id ||"");
    setShowModal(true);
  };

  const handleEdit = (contract: Contract) => {
    const config: ModalConfig = {
      title: "ویرایش قرارداد",
      type: "edit",
      size: "xl",
      endpoint: "/api/contracts/detailes",
      method: "PATCH",
      fields: [
        { key: "title", label: "عنوان قرارداد", type: "text", required: true },
        {
          key: "contractNumber",
          label: "شماره قرارداد",
          type: "text",
          required: true,
        },
        {
          key: "customerId",
          label: "شناسه مشتری",
          type: "text",
          required: true,
        },
        {
          key: "description",
          label: "توضیحات",
          type: "textarea",
          required: true,
        },
        {
          key: "status",
          label: "وضعیت قرارداد",
          type: "select",
          required: true,
          options: [
            { value: "draft", label: "پیش‌نویس" },
            { value: "pending", label: "در انتظار تأیید" },
            { value: "approved", label: "تأیید شده" },
            { value: "rejected", label: "رد شده" },
            { value: "active", label: "فعال" },
            { value: "completed", label: "تکمیل شده" },
            { value: "cancelled", label: "لغو شده" },
          ],
        },
        { key: "startDate", label: "تاریخ شروع", type: "date" },
        { key: "endDate", label: "تاریخ پایان", type: "date" },
        {
          key: "totalAmount",
          label: "مبلغ کل",
          type: "number",
          required: true,
        },
        { key: "paidAmount", label: "مبلغ پرداخت شده", type: "number" },
        { key: "discount", label: "تخفیف", type: "number" },
        {
          key: "finalAmount",
          label: "مبلغ نهایی",
          type: "number",
          required: true,
        },
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
        { key: "terms", label: "شرایط قرارداد", type: "textarea" },
        { key: "notes", label: "یادداشت‌ها", type: "textarea" },
        { key: "rejectionReason", label: "دلیل رد", type: "textarea" },
      ],
      onSuccess: (data) => {
        console.log("Contract updated successfully:", data);
        setRefreshTable((prev) => prev + 1);
        toast.success("قرارداد با موفقیت به‌روزرسانی شد.");
      },
      onError: (error) => {
        console.error("Update error:", error);
        toast.error("خطا در به‌روزرسانی قرارداد.");
      },
      onClose: () => setShowModal(false),
      confirmText: "ذخیره تغییرات",
    };

    setModalConfig(config);
    setSelectedContractId(contract._id || contract.id||"");
    setShowModal(true);
  };

  const handleApprove = (contract: Contract) => {
    const config: ModalConfig = {
      title: "تأیید قرارداد",
      type: "edit",
      size: "lg",
      endpoint: "/api/contracts/approve",
      method: "PATCH",
      fields: [
        { key: "title", label: "عنوان قرارداد", type: "text" },
        {
          key: "contractNumber",
          label: "شماره قرارداد",
          type: "text",
        },
        {
          key: "totalAmount",
          label: "مبلغ کل",
          type: "number",
        },
        {
          key: "finalAmount",
          label: "مبلغ نهایی",
          type: "number",
        },
        {
          key: "status",
          label: "وضعیت جدید",
          type: "select",
          required: true,
          options: [
            { value: "approved", label: "تأیید قرارداد" },
            { value: "rejected", label: "رد قرارداد" },
          ],
        },
        {
          key: "approvalNotes",
          label: "یادداشت تأیید/رد",
          type: "textarea",
          placeholder: "دلیل تأیید یا رد قرارداد را وارد کنید...",
          description: "این یادداشت برای مشتری قابل مشاهده خواهد بود",
        },
      ],
      customContent: (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">⚠️ توجه مهم</h4>
          <p className="text-blue-800 text-sm">
            با تأیید این قرارداد، وضعیت آن به   تغییر خواهد کرد و
            مشتری از این موضوع مطلع خواهد شد. در صورت رد قرارداد، دلیل رد برای
            مشتری ارسال خواهد شد.
          </p>
        </div>
      ),
      onSuccess: (data: { [key: string]: unknown }) => {
        console.log("Contract approval updated:", data);
        setRefreshTable((prev) => prev + 1);
        const status =
          data?.status === "approved" ? "تأیید" : "رد";
        toast.success(`قرارداد با موفقیت ${status} شد`);
      },
      onError: (error) => {
        console.error("Approval error:", error);
        toast.error("خطا در تأیید/رد قرارداد: ");
      },
      onClose: () => setShowModal(false),
      confirmText: "ثبت تصمیم",
      cancelText: "لغو",
    };

    setModalConfig(config);
    setSelectedContractId(contract._id || contract.id||"");
    setShowModal(true);
  };

  const handleDelete = (contract: Contract) => {
    const config: ModalConfig = {
      title: "حذف قرارداد",
      type: "delete",
      size: "md",
      endpoint: "/api/contracts/detailes",
      method: "DELETE",
      customContent: (
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            تأیید حذف قرارداد
          </h4>
          <p className="text-gray-600 mb-4">
            آیا از حذف قرارداد اطمینان دارید؟
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">
              ⚠️ توجه: حذف قرارداد باعث حذف تمام پروژه‌های مرتبط با آن خواهد شد.
              این عمل قابل بازگشت نیست.
            </p>
          </div>
        </div>
      ),
      onSuccess: (data) => {
        console.log("Contract deleted successfully:", data);
        setRefreshTable((prev) => prev + 1);
        toast.success("قرارداد با موفقیت حذف شد");
      },
      onError: (error) => {
        console.error("Delete error:", error);
        toast.error("خطا در حذف قرارداد: ");
      },
      onClose: () => setShowModal(false),
      confirmText: "حذف قرارداد",
      cancelText: "لغو",
    };

    setModalConfig(config);
    setSelectedContractId(contract._id || contract.id||"");
    setShowModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fa-IR", {
      style: "currency",
      currency: "IRR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const contractsTableConfig: TableConfig = {
    title: "لیست قراردادها",
    description: "مدیریت و مشاهده اطلاعات قراردادها",
    endpoint: "/api/contracts",
    deleteEndpoint: "/api/contracts/detailes",
    columns: [
      {
        key: "contractNumber",
        label: "شماره قرارداد",
        type: "text",
        sortable: true,
        width: "130px",
      },
      {
        key: "title",
        label: "عنوان قرارداد",
        type: "text",
        sortable: true,
        width: "200px",
      },
      {
        key: "customerId",
        label: "مشتری",
        type: "text",
        sortable: true,
        width: "150px",
        render: (value) => {
          // You might want to populate this with actual customer name
          return value ? `مشتری: ${value.substring(0, 8)}...` : "-";
        },
      },
      {
        key: "status",
        label: "وضعیت قرارداد",
        type: "status",
        sortable: true,
        width: "130px",
        render: (value) => {
          const statusConfig: {
            [key: string]: { label: string; className: string };
          } = {
            draft: {
              label: "پیش‌نویس",
              className: "bg-gray-100 text-gray-800",
            },
            pending: {
              label: "در انتظار",
              className: "bg-yellow-100 text-yellow-800",
            },
            approved: {
              label: "تأیید شده",
              className: "bg-green-100 text-green-800",
            },
            rejected: { label: "رد شده", className: "bg-red-100 text-red-800" },
            active: { label: "فعال", className: "bg-blue-100 text-blue-800" },
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
        key: "totalAmount",
        label: "مبلغ کل",
        type: "number",
        sortable: true,
        width: "120px",
        render: (value) => {
          return value ? formatCurrency(value) : "-";
        },
      },
      {
        key: "finalAmount",
        label: "مبلغ نهایی",
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
        key: "endDate",
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
      custom: [
        {
          label: "تأیید/رد",
          icon: "✅",
          className: "bg-green-500 hover:bg-green-600 text-white",
          onClick: handleApprove,
          condition: (row: Contract) =>
            row.status === "pending" || row.status === "draft",
        },
      ],
    },
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  };

  return (
    <div>
      <DynamicTable config={contractsTableConfig} key={refreshTable} />

      {/* Dynamic Modal */}
      {showModal && modalConfig && (
        <DynamicModal
          isOpen={showModal}
          config={modalConfig}
          itemId={selectedContractId}
        />
      )}
    </div>
  );
};

export default ContractsTable;
