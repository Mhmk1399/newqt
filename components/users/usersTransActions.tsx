"use client";

import React, { useState, useEffect } from "react";
import DynamicTable from "@/components/global/newdynamics/dynamicTable";
import { TableColumn, FilterField } from "@/types/dynamicTypes/types";
import { motion } from "framer-motion";
import { FaReceipt, FaArrowUp, FaArrowDown, FaCalendar } from "react-icons/fa";
import { IoWallet } from "react-icons/io5";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface DecodedToken {
  userId: string;
  phoneNumber: string;
  name: string;
  userType: "user" | "customer" | "coworker" | "admin";
  exp: number;
}

interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

const UsersTransActions: React.FC = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // State for transactions data
  const [transactionsData, setTransactionsData] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // Extract user info from token
  useEffect(() => {
    const extractUserFromToken = () => {
      try {
        const token =
          localStorage.getItem("userToken") || localStorage.getItem("token");

        if (!token) {
          toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
          router.push("/auth");
          return;
        }

        // Decode JWT token
        const decoded = JSON.parse(atob(token.split(".")[1])) as DecodedToken;

        // Check if token is expired
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
          toast.error("جلسه شما منقضی شده است. لطفا مجدداً وارد شوید");
          localStorage.removeItem("userToken");
          localStorage.removeItem("token");
          router.push("/auth");
          return;
        }

        setUserInfo(decoded);
      } catch (error) {
        console.error("Error decoding token:", error);
        toast.error("خطا در تشخیص هویت. لطفا مجدداً وارد شوید");
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };

    extractUserFromToken();
  }, [router]);

  // Fetch user transactions and summary
  useEffect(() => {
    const fetchTransactionsData = async () => {
      if (!userInfo?.userId) return;

      setTransactionsLoading(true);
      try {
        const token =
          localStorage.getItem("userToken") || localStorage.getItem("token");
        console.log("Fetching transactions for user:", userInfo.userId);

        // Fetch transactions
        const transactionsResponse = await fetch(
          `/api/transactions?users=${userInfo.userId}&limit=1000`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const transactionsResult = await transactionsResponse.json();
        console.log("Transactions API response:", transactionsResult);

        if (transactionsResult.success) {
          setTransactionsData(transactionsResult.data || []);
        } else {
          console.error("Transactions API error:", transactionsResult);
          toast.error("خطا در دریافت تراکنش‌ها");
        }

        // Fetch summary
        const summaryResponse = await fetch(
          `/api/transactions?users=${userInfo.userId}&summary=true`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const summaryResult = await summaryResponse.json();
        console.log("Summary API response:", summaryResult);

        if (summaryResult.success && summaryResult.summary) {
          console.log("Setting summary:", summaryResult.summary);
          setSummary(summaryResult.summary);
        } else {
          console.error("Summary API error:", summaryResult);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        toast.error("خطا در دریافت اطلاعات");
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactionsData();
  }, [userInfo]);

  // Calculate summary from client-side data as fallback
  useEffect(() => {
    if (transactionsData && transactionsData.length > 0) {
      console.log("Transactions data for calculation:", transactionsData);

      const calculatedSummary = {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: transactionsData.length,
      };

      transactionsData.forEach((transaction: any, index: number) => {
        console.log(`Transaction ${index}:`, {
          type: transaction.type,
          received: transaction.received,
          paid: transaction.paid,
          subject: transaction.subject,
        });

        if (transaction.type === "income") {
          const amount = Number(transaction.received) || 0;
          calculatedSummary.totalIncome += amount;
          console.log(
            `Added income: ${amount}, total now: ${calculatedSummary.totalIncome}`
          );
        } else if (transaction.type === "expense") {
          const amount = Number(transaction.paid) || 0;
          calculatedSummary.totalExpense += amount;
          console.log(
            `Added expense: ${amount}, total now: ${calculatedSummary.totalExpense}`
          );
        }
      });

      calculatedSummary.balance =
        calculatedSummary.totalIncome - calculatedSummary.totalExpense;

      console.log("Client-side calculated summary:", calculatedSummary);
      console.log("Current summary state:", summary);

      // Always update with client-side calculation if we have transactions
      setSummary(calculatedSummary);
    } else if (transactionsData && transactionsData.length === 0) {
      console.log("No transactions found for user");
      // Reset summary if no transactions
      setSummary({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: 0,
      });
    }
  }, [transactionsData]);

  const columns: TableColumn[] = [
    {
      key: "date",
      header: "تاریخ",
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString("fa-IR"),
    },
    {
      key: "subject",
      header: "موضوع",
      sortable: true,
    },
    {
      key: "type",
      header: "نوع",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          {value === "income" ? (
            <>
              <FaArrowUp className="text-green-400" />
              <span className="text-green-400 font-medium">درآمد</span>
            </>
          ) : (
            <>
              <FaArrowDown className="text-red-400" />
              <span className="text-red-400 font-medium">هزینه</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      header: "مبلغ",
      sortable: true,
      render: (value, row: any) => {
        const amount = row.type === "income" ? row.received : row.paid;
        const isIncome = row.type === "income";
        return (
          <span
            className={`font-bold ${
              isIncome ? "text-green-400" : "text-red-400"
            }`}
          >
            {isIncome ? "+" : "-"} {Number(amount).toLocaleString()} ریال
          </span>
        );
      },
    },
    {
      key: "customer",
      header: "مشتری",
      sortable: false,
      render: (value) => {
        if (typeof value === "object" && value && "name" in value) {
          return (value as Record<string, unknown>).name as string;
        }
        return value || "-";
      },
    },
    {
      key: "createdAt",
      header: "تاریخ ایجاد",
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString("fa-IR"),
    },
  ];

  const filterFields: FilterField[] = [
    {
      key: "search",
      label: "جستجو",
      type: "text",
      placeholder: "موضوع تراکنش را جستجو کنید...",
    },
    {
      key: "type",
      label: "نوع تراکنش",
      type: "select",
      options: [
        { label: "همه", value: "" },
        { label: "درآمد", value: "income" },
        { label: "هزینه", value: "expense" },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] flex items-center justify-center">
        <div className="text-white text-xl">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] flex items-center justify-center">
        <div className="text-white text-xl">خطا در تشخیص هویت</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] relative overflow-hidden"
      dir="rtl"
    >
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-3">
            تراکنش‌های من
          </h1>
          <p className="text-white/70 text-lg">
            خوش آمدید {userInfo.name} - مشاهده تراکنش‌های مالی شما
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Income */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30"
          >
            <div className="flex items-center justify-between mb-4">
              <FaArrowUp className="text-green-400 text-2xl" />
              <IoWallet className="text-green-400/50 text-3xl" />
            </div>
            <h3 className="text-green-400 text-sm font-medium mb-1">
              کل درآمد
            </h3>
            <p className="text-white text-2xl font-bold">
              {summary.totalIncome.toLocaleString()} ریال
            </p>
          </motion.div>

          {/* Total Expense */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-500/20 to-red-600/10 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30"
          >
            <div className="flex items-center justify-between mb-4">
              <FaArrowDown className="text-red-400 text-2xl" />
              <IoWallet className="text-red-400/50 text-3xl" />
            </div>
            <h3 className="text-red-400 text-sm font-medium mb-1">کل هزینه</h3>
            <p className="text-white text-2xl font-bold">
              {summary.totalExpense.toLocaleString()} ریال
            </p>
          </motion.div>

          {/* Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`bg-gradient-to-br ${
              summary.balance >= 0
                ? "from-blue-500/20 to-blue-600/10 border-blue-500/30"
                : "from-orange-500/20 to-orange-600/10 border-orange-500/30"
            } backdrop-blur-xl rounded-2xl p-6 border`}
          >
            <div className="flex items-center justify-between mb-4">
              <IoWallet
                className={`text-2xl ${
                  summary.balance >= 0 ? "text-blue-400" : "text-orange-400"
                }`}
              />
              <FaReceipt
                className={`text-3xl ${
                  summary.balance >= 0
                    ? "text-blue-400/50"
                    : "text-orange-400/50"
                }`}
              />
            </div>
            <h3
              className={`text-sm font-medium mb-1 ${
                summary.balance >= 0 ? "text-blue-400" : "text-orange-400"
              }`}
            >
              موجودی
            </h3>
            <p className="text-white text-2xl font-bold">
              {summary.balance.toLocaleString()} ریال
            </p>
          </motion.div>

          {/* Transaction Count */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30"
          >
            <div className="flex items-center justify-between mb-4">
              <FaReceipt className="text-purple-400 text-2xl" />
              <FaCalendar className="text-purple-400/50 text-3xl" />
            </div>
            <h3 className="text-purple-400 text-sm font-medium mb-1">
              تعداد تراکنش
            </h3>
            <p className="text-white text-2xl font-bold">
              {summary.transactionCount} عدد
            </p>
          </motion.div>
        </div>

        {/* Transactions Table */}
        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-2">
              لیست تراکنش‌ها
            </h2>
            <p className="text-white/70">تاریخچه کامل تراکنش‌های مالی شما</p>
          </div>

          <DynamicTable
            columns={columns}
            data={transactionsData || []}
            loading={transactionsLoading}
            filterFields={filterFields}
            showActions={false}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default UsersTransActions;
