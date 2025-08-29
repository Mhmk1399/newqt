"use client";

import React, { useState } from "react";
import DynamicTable from "@/components/tables/DynamicTable";
import DynamicModal, { ModalConfig } from "@/components/DynamicModal";
import { TableConfig } from "@/types/tables";

// Define interfaces for better type safety
interface TransactionData {
  _id: string;
  date: string;
  subject: string;
  debtor: number;
  fastener: number;
}

interface DecodedToken {
  customerId?: string;
  [key: string]: unknown;
}

const CustomerTransactionsPage = () => {
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);

  const getCustomerIdFromToken = (): string | null => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        console.error("توکن مشتری در localStorage یافت نشد");
        return null;
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1])) as DecodedToken;
      console.log("توکن رمزگشایی شده:", decodedToken);

      if (decodedToken.userId) {
        return decodedToken.userId as string;
      } else {
        console.error("customerId در محتوای توکن یافت نشد");
        return null;
      }
    } catch (error) {
      console.error("خطا در رمزگشایی توکن:", error);
      return null;
    }
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

  // Format currency numbers
  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return "-";
    return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
  };

  // Get transaction type based on debtor and fastener values
  const getTransactionType = (debtor: number, fastener: number) => {
    if (debtor > 0 && fastener === 0) {
      return {
        type: "debt",
        label: "بدهکار",
        color: "bg-red-100 text-red-800 border-red-200",
      };
    } else if (fastener > 0 && debtor === 0) {
      return {
        type: "credit",
        label: "بستانکار",
        color: "bg-green-100 text-green-800 border-green-200",
      };
    } else {
      return {
        type: "unknown",
        label: "نامشخص",
        color: "bg-gray-100 text-gray-800 border-gray-200",
      };
    }
  };

  // Render transaction type badge
  const renderTransactionType = (debtor: number, fastener: number) => {
    const transactionType = getTransactionType(debtor, fastener);
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${transactionType.color}`}
      >
        {transactionType.label}
      </span>
    );
  };

  // Calculate net amount (positive for credit, negative for debt)
  const calculateNetAmount = (debtor: number, fastener: number) => {
    return fastener - debtor;
  };

  // Handle view transaction using DynamicModal
  const handleViewTransaction = (row: TransactionData) => {
    const viewConfig: ModalConfig = {
      title: "جزئیات تراکنش",
      type: "view",
      size: "md",
      endpoint: "/api/transactions/detailes",
      method: "GET",
      onClose: () => setIsModalOpen(false),
      fields: [
        {
          key: "date",
          label: "تاریخ تراکنش",
          type: "date",
          render: (value: unknown) => formatDate(value as string),
        },
        {
          key: "subject",
          label: "موضوع تراکنش",
          type: "text",
        },
        {
          key: "debtor",
          label: "مبلغ بدهکار",
          type: "text",
          render: (value: unknown) => formatCurrency(value as number),
        },
        {
          key: "fastener",
          label: "مبلغ بستانکار",
          type: "text",
          render: (value: unknown) => formatCurrency(value as number),
        },
        {
          key: "transactionType",
          label: "نوع تراکنش",
          type: "text",
          render: (_value: unknown, data: Record<string, unknown>) => {
            const transactionType = getTransactionType(
              data.debtor as number,
              data.fastener as number
            );
            return (
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${transactionType.color}`}
              >
                {transactionType.label}
              </span>
            );
          },
        },
        {
          key: "netAmount",
          label: "مبلغ خالص",
          type: "text",
          render: (_value: unknown, data: Record<string, unknown>) => {
            const netAmount = calculateNetAmount(
              data.debtor as number,
              data.fastener as number
            );
            const isPositive = netAmount > 0;
            const isNegative = netAmount < 0;

            return (
              <span
                className={`font-medium text-lg ${
                  isPositive
                    ? "text-green-600"
                    : isNegative
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {isPositive ? "+" : ""}
                {formatCurrency(Math.abs(netAmount))}
              </span>
            );
          },
        },
      ],
    };

    setModalConfig(viewConfig);
    setSelectedTransactionId(row._id);
    setIsModalOpen(true);
  };

  const customerId = getCustomerIdFromToken();

  const tableConfig: TableConfig = {
    title: `تراکنش‌های من`,
    description: "لیست تراکنش‌های مالی مربوط به حساب شما.",
    endpoint: `/api/transactions/byCustomer`,
    headers: customerId ? { customerId: customerId } : {},
    columns: [
      {
        key: "date",
        label: "تاریخ",
        type: "date",
        sortable: true,
        render: (value: string) => formatDate(value),
      },
      {
        key: "subject",
        label: "موضوع",
        sortable: true,
      },
      {
        key: "debtor",
        label: "بدهکار",
        render: (value: number) => formatCurrency(value),
      },
      {
        key: "fastener",
        label: "بستانکار",
        render: (value: number) => formatCurrency(value),
      },
      {
        key: "type",
        label: "نوع تراکنش",
        render: (_value: unknown, rowData: TransactionData) =>
          renderTransactionType(rowData.debtor, rowData.fastener),
      },
   
    ],
    actions: {
      view: true,
      edit: false, // Customers typically shouldn't edit transactions
      delete: false, // Customers typically shouldn't delete transactions
    },
    onView: handleViewTransaction,
  };

  // Display loading or error state if customer ID is not available
  if (!customerId) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">
            امکان بارگذاری اطلاعات مشتری وجود ندارد. لطفاً دوباره وارد شوید.
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
          itemId={selectedTransactionId}
        />
      )}
    </div>
  );
};

export const Transactions = CustomerTransactionsPage;
