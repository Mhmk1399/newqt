"use client";

import React, { useState, useEffect } from "react";
import DynamicTable from "@/components/global/newdynamics/dynamicTable";
import { TableColumn, FilterField } from "@/types/dynamicTypes/types";
import { motion } from "framer-motion";
import {
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaUser,
  FaExclamationTriangle,
  FaChartLine,
} from "react-icons/fa";
import { IoSparkles, IoTrendingUp, IoTrendingDown } from "react-icons/io5";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { decode } from "punycode";

interface DecodedToken {
  userId: string;
  phoneNumber: string;
  name: string;
  userType: "user" | "customer" | "coworker" | "admin";
  exp: number;
}

interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

const CustomerTransactions: React.FC = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TransactionStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0,
  });

  const columns: TableColumn[] = [
    {
      key: "date",
      header: "تاریخ تراکنش",
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
      header: "نوع تراکنش",
      sortable: true,
      render: (value) => {
        const typeMap: {
          [key: string]: {
            label: string;
            color: string;
            icon: React.ComponentType<{ className?: string }>;
          };
        } = {
          income: { label: "درآمد", color: "text-green-400", icon: FaArrowUp },
          expense: { label: "هزینه", color: "text-red-400", icon: FaArrowDown },
        };
        const typeInfo = typeMap[value as string];
        if (typeInfo) {
          const IconComponent = typeInfo.icon;
          return (
            <div className={`flex items-center gap-2 ${typeInfo.color}`}>
              <IconComponent className="text-sm" />
              {typeInfo.label}
            </div>
          );
        }
        return value;
      },
    },
    {
      key: "amount",
      header: "مبلغ",
      sortable: true,
      render: (value, row: any) => {
        const amount = row.type === "income" ? row.received : row.paid;
        const color = row.type === "income" ? "text-green-400" : "text-red-400";
        const sign = row.type === "income" ? "+" : "-";
        return (
          <div className={`font-bold ${color}`}>
            {sign}
            {Number(amount).toLocaleString()} ریال
          </div>
        );
      },
    },
    {
      key: "createdAt",
      header: "تاریخ ثبت",
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString("fa-IR"),
    },
  ];

  const filterFields: FilterField[] = [
    {
      key: "search",
      label: "جستجو در موضوع",
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
    {
      key: "dateRange",
      label: "بازه تاریخ",
      type: "dateRange",
      placeholder: "انتخاب بازه زمانی",
    },
  ];

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

        const decoded = JSON.parse(atob(token.split(".")[1])) as DecodedToken;

        if (decoded.exp && decoded.exp < Date.now() / 1000) {
          toast.error("جلسه شما منقضی شده است. لطفا مجدداً وارد شوید");
          localStorage.removeItem("userToken");
          localStorage.removeItem("token");
          router.push("/auth");
          return;
        }

        if (decoded.userType !== "customer") {
          toast.error("دسترسی محدود به مشتریان");
          router.push("/");
          return;
        }
        console.log(decoded);
        setUserInfo(decoded);
      } catch (error) {
        console.error("Error decoding token:", error);
        toast.error("خطا در تشخیص هویت. لطفا مجدداً وارد شوید");
        router.push("/auth");
      }
    };

    extractUserFromToken();
  }, [router]);

  // Fetch transaction statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!userInfo?.userId) return;

      setLoading(true);
      try {
        const token =
          localStorage.getItem("userToken") || localStorage.getItem("token");

        // Test both summary and regular data calls
        console.log("Testing customer ID:", userInfo.userId);

        // Fetch summary statistics
        const summaryResponse = await fetch(
          `/api/transactions?customer=${userInfo.userId}&summary=true`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const summaryResult = await summaryResponse.json();
        console.log("Summary response:", summaryResult);

        if (summaryResult.success && summaryResult.summary) {
          setStats(summaryResult.summary);
        }

        // Test regular data call (same as DynamicTable will make)
        const dataResponse = await fetch(
          `/api/transactions?customer=${userInfo.userId}&page=1&limit=10`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const dataResult = await dataResponse.json();
        console.log("Data response:", dataResult);

      } catch (error) {
        console.error("Error fetching transaction stats:", error);
        toast.error("خطا در دریافت آمار");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userInfo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full"
          />
          در حال بارگذاری...
        </div>
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-3">
            تراکنش‌های مالی
          </h1>
          <p className="text-white/70 text-lg">
            مشاهده تاریخچه تراکنش‌های مالی شما
          </p>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
   

          {/* Total Expense */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-red-400/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-500/20 p-3 rounded-xl">
                <IoTrendingDown className="text-red-400 text-2xl" />
              </div>
              <div className="text-red-400 text-sm">کل هزینه</div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {stats.totalExpense.toLocaleString()}
            </div>
            <div className="text-red-300 text-sm">ریال</div>
          </motion.div>

      

          {/* Transaction Count */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 p-3 rounded-xl">
                <FaMoneyBillWave className="text-purple-400 text-2xl" />
              </div>
              <div className="text-purple-400 text-sm">تعداد تراکنش</div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {stats.transactionCount}
            </div>
            <div className="text-purple-300 text-sm">تراکنش</div>
          </motion.div>
        </div>

        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <DynamicTable
            columns={columns}
            data={[]}
            loading={false}
            endpoint={`/api/transactions?customer=${userInfo.userId}`}
            filterFields={filterFields}
            showActions={false} // Hide actions for customers
          />
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerTransactions;
