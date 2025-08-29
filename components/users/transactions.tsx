"use client";

import React, { useState } from "react";
import DynamicTable from "@/components/tables/DynamicTable";
import DynamicModal, { ModalConfig } from "@/components/DynamicModal";
import { TableConfig } from "@/types/tables";

const UserTransactionsPage = () => {
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);

  const getUserIdFromToken = (): string | null => {
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


  // Calculate net amount (positive for credit, negative for debt)
  const calculateNetAmount = (debtor: number, fastener: number) => {
    return fastener - debtor;
  };

  // Render net amount with appropriate color
  // const renderNetAmount = (debtor: number, fastener: number) => {
  //   const netAmount = calculateNetAmount(debtor, fastener);
  //   const isPositive = netAmount > 0;
  //   const isNegative = netAmount < 0;

  //   return (
  //     <span
  //       className={`font-medium ${
  //         isPositive
  //           ? "text-green-600"
  //           : isNegative
  //           ? "text-red-600"
  //           : "text-gray-600"
  //       }`}
  //     >
  //       {isPositive ? "+" : ""}
  //       {formatCurrency(Math.abs(netAmount))}
  //     </span>
  //   );
  // };

  // Handle view transaction using DynamicModal
  const handleViewTransaction = (row: {
    id: string;
    userId: string;
    _id: string;
    debtor: number;
    fastener: number;
    subject: string;
    date: string;
    type: string;
    netAmount: number;

  }) => {
    const viewConfig: ModalConfig = {
      title: "جزئیات تراکنش",
      type: "view",
      size: "md",
      endpoint: "/api/transactions/detailes", // You'll need to create this endpoint
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
        // {
        //   key: "transactionType",
        //   label: "نوع تراکنش",
        //   type: "text",
        //   render: (_value: unknown, data: Record<string, unknown>) => {
        //     const debtor = typeof data.debtor === "number" ? data.debtor : 0;
        //     const fastener = typeof data.fastener === "number" ? data.fastener : 0;
        //     const transactionType = getTransactionType(debtor, fastener);
        //     return (
        //       <span
        //         className={`px-3 py-1 rounded-full text-xs font-medium border ${transactionType.color}`}
        //       >
        //         {transactionType.label}
        //       </span>
        //     );
        //   },
        // },
        {
          key: "netAmount",
          label: "مبلغ خالص",
          type: "text",
          render: (_value: unknown, data: Record<string, unknown>) => {
            const debtor = typeof data.debtor === "number" ? data.debtor : 0;
            const fastener = typeof data.fastener === "number" ? data.fastener : 0;
            const netAmount = calculateNetAmount(debtor, fastener);
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

  const id = getUserIdFromToken();

  const tableConfig: TableConfig = {
    title: `تراکنش‌های من`,
    description: "لیست تراکنش‌های مالی اختصاص داده شده به شما.",
    endpoint: `/api/transactions/byUsers`,
    headers: id ? { id: id } : {},
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
      // {
      //   key: "type",
      //   label: "نوع تراکنش",
      //   render: ( rowData: { debtor: number; fastener: number }) =>
      //     renderTransactionType(rowData.debtor, rowData.fastener),
      // },
    //   {
    //     key: "netAmount",
    //     label: "مبلغ خالص",
    //     render: (value: any, rowData: any) =>
    //       renderNetAmount(rowData.debtor, rowData.fastener),
    //   },
    ],
    actions: {
      view: true,
      edit: false, // Users typically shouldn't edit transactions
      delete: false, // Users typically shouldn't delete transactions
    },
    onView: handleViewTransaction,
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
          itemId={selectedTransactionId}
        />
      )}
    </div>
  );
};

export default UserTransactionsPage;
