"use client";

import React, { useState, useEffect } from "react";
import DynamicTable from "@/components/global/newdynamics/dynamicTable";
import {
  TableColumn,
  FilterField,
  TableData,
} from "@/types/dynamicTypes/types";
import { motion } from "framer-motion";
import {
  FaReceipt,
  FaArrowUp,
  FaArrowDown,
  FaCalendar,
  FaTasks,
  FaMoneyBillWave,
  FaCheckCircle,
} from "react-icons/fa";
import { IoWallet } from "react-icons/io5";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
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
  const [transactionsData, setTransactionsData] = useState<TableData[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // State for salary calculation
  const [salaryDateRange, setSalaryDateRange] = useState<[string, string]>([
    "",
    "",
  ]);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [taskAmount, setTaskAmount] = useState(0); // Will be loaded from user's team
  const [totalSalary, setTotalSalary] = useState(0);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [teamInfo, setTeamInfo] = useState<TableData | null>(null);
  const [teamLoading, setTeamLoading] = useState(false);

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

        if (summaryResult.success && summaryResult.summary) {
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
      const calculatedSummary = {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: transactionsData.length,
      };

      transactionsData.forEach((transaction: TableData) => {
        if (transaction.type === "income") {
          const amount = Number(transaction.received) || 0;
          calculatedSummary.totalIncome += amount;
        } else if (transaction.type === "expense") {
          const amount = Number(transaction.paid) || 0;
          calculatedSummary.totalExpense += amount;
        }
      });

      calculatedSummary.balance =
        calculatedSummary.totalIncome - calculatedSummary.totalExpense;

      // Always update with client-side calculation if we have transactions
      setSummary(calculatedSummary);
    } else if (transactionsData && transactionsData.length === 0) {
      // Reset summary if no transactions
      setSummary({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: 0,
      });
    }
  }, [transactionsData]);

  // Fetch user's team information and amount
  const fetchUserTeamInfo = async () => {
    if (!userInfo?.userId) return;

    setTeamLoading(true);
    try {
      const token =
        localStorage.getItem("userToken") || localStorage.getItem("token");

      // Get user details with team information populated
      const userResponse = await fetch(`/api/users?id=${userInfo.userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const userResult = await userResponse.json();

      if (userResult.success && userResult.data.teamId) {
        // Team info is already populated in the user response
        setTeamInfo(userResult.data.teamId);
        setTaskAmount(Number(userResult.data.teamId.amount) || 0);
      } else {
        setTaskAmount(0);
        setTeamInfo(null);
      }
    } catch (error) {
      console.error("Error fetching team info:", error);
      toast.error("خطا در دریافت اطلاعات تیم");
    } finally {
      setTeamLoading(false);
    }
  };

  // Fetch completed tasks count based on date range
  const fetchCompletedTasks = async () => {
    if (!userInfo?.userId || !salaryDateRange[0] || !salaryDateRange[1]) {
      setCompletedTasksCount(0);
      return;
    }

    setSalaryLoading(true);
    try {
      const token =
        localStorage.getItem("userToken") || localStorage.getItem("token");

      const response = await fetch(
        `/api/tasks?assignedUserId=${userInfo.userId}&status=completed&completedDateFrom=${salaryDateRange[0]}&completedDateTo=${salaryDateRange[1]}&limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        const completedTasks = result.data || [];
        const count = completedTasks.length;
        setCompletedTasksCount(count);
      } else {
        console.error("Tasks API error:", result);
        toast.error("خطا در دریافت تسک‌ها");
      }
    } catch (error) {
      console.error("Error fetching completed tasks:", error);
      toast.error("خطا در دریافت اطلاعات تسک‌ها");
    } finally {
      setSalaryLoading(false);
    }
  };

  // Update salary calculation when count or amount changes
  useEffect(() => {
    setTotalSalary(completedTasksCount * taskAmount);
  }, [completedTasksCount, taskAmount]);

  // Fetch user team info when user info is available
  useEffect(() => {
    if (userInfo?.userId) {
      fetchUserTeamInfo();
    }
  }, [userInfo]);

  // Fetch completed tasks when date range changes
  useEffect(() => {
    if (salaryDateRange[0] && salaryDateRange[1]) {
      fetchCompletedTasks();
    } else {
      setCompletedTasksCount(0);
    }
  }, [salaryDateRange, userInfo]);

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
      render: (value: string | number | boolean, row?: TableData | undefined) => {
        if (!row) return "-";
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

        {/* Salary Calculation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-2">
              محاسبه حقوق
            </h2>
            <p className="text-white/70">
              محاسبه حقوق بر اساس تسک‌های تکمیل شده
            </p>
          </div>

          {/* Date Range Picker */}
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-md">
              <label className="block text-white/70 text-sm mb-3 text-center">
                بازه زمانی محاسبه حقوق
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <DatePicker
                    value={
                      salaryDateRange[0]
                        ? new DateObject(new Date(salaryDateRange[0]))
                        : null
                    }
                    onChange={(val) => {
                      const fromDate = val
                        ? val.toDate().toISOString().split("T")[0]
                        : "";
                      const newRange: [string, string] = [
                        fromDate,
                        salaryDateRange[1],
                      ];
                      setSalaryDateRange(newRange);
                    }}
                    calendar={persian}
                    locale={persian_fa}
                    format="YYYY/MM/DD"
                    placeholder="از تاریخ"
                    inputClass="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 text-center"
                    calendarPosition="bottom-center"
                    containerClassName="w-full"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 text-sm">
                    📅
                  </div>
                </div>
                <div className="flex items-center px-2">
                  <span className="text-white/50">تا</span>
                </div>
                <div className="relative flex-1">
                  <DatePicker
                    value={
                      salaryDateRange[1]
                        ? new DateObject(new Date(salaryDateRange[1]))
                        : null
                    }
                    onChange={(val) => {
                      const toDate = val
                        ? val.toDate().toISOString().split("T")[0]
                        : "";
                      const newRange: [string, string] = [
                        salaryDateRange[0],
                        toDate,
                      ];
                      setSalaryDateRange(newRange);
                    }}
                    calendar={persian}
                    locale={persian_fa}
                    format="YYYY/MM/DD"
                    placeholder="تا تاریخ"
                    inputClass="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 text-center"
                    calendarPosition="bottom-center"
                    containerClassName="w-full"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 text-sm">
                    📅
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Calculation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Completed Tasks Count */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <FaTasks className="text-blue-400 text-2xl" />
                <FaCheckCircle className="text-blue-400/50 text-3xl" />
              </div>
              <h3 className="text-blue-400 text-sm font-medium mb-1">
                تسک‌های تکمیل شده
              </h3>
              <p className="text-white text-2xl font-bold">
                {salaryLoading ? (
                  <span className="animate-pulse">...</span>
                ) : salaryDateRange[0] && salaryDateRange[1] ? (
                  `${completedTasksCount} عدد`
                ) : (
                  <span className="text-white/50 text-lg">
                    بازه زمانی را انتخاب کنید
                  </span>
                )}
              </p>
              {salaryDateRange[0] && salaryDateRange[1] && (
                <p className="text-blue-300/70 text-xs mt-2">
                  از {new Date(salaryDateRange[0]).toLocaleDateString("fa-IR")}{" "}
                  تا {new Date(salaryDateRange[1]).toLocaleDateString("fa-IR")}
                </p>
              )}
            </motion.div>

            {/* Amount Per Task from Team */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <FaMoneyBillWave className="text-green-400 text-2xl" />
                <IoWallet className="text-green-400/50 text-3xl" />
              </div>
              <h3 className="text-green-400 text-sm font-medium mb-2">
                مبلغ هر تسک (از تیم)
              </h3>

              {teamLoading ? (
                <div className="text-center">
                  <span className="text-white/50 animate-pulse">
                    در حال بارگذاری...
                  </span>
                </div>
              ) : teamInfo ? (
                <div>
                  <div className="bg-white/10 rounded-lg px-3 py-2 text-center mb-2">
                    <p className="text-white text-lg font-bold">
                      {taskAmount.toLocaleString()} ریال
                    </p>
                  </div>
                  <p className="text-green-300/70 text-xs text-center">
                    تیم: {teamInfo.name}
                  </p>
                  <p className="text-green-300/50 text-xs text-center">
                    {teamInfo.specialization}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-white/10 rounded-lg px-3 py-2 mb-2">
                    <p className="text-white/50 text-sm">
                      تیمی تخصیص داده نشده
                    </p>
                  </div>
                  <p className="text-green-300/50 text-xs">
                    لطفاً با مدیر تماس بگیرید
                  </p>
                </div>
              )}
            </motion.div>

            {/* Total Salary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <FaReceipt className="text-purple-400 text-2xl" />
                <FaMoneyBillWave className="text-purple-400/50 text-3xl" />
              </div>
              <h3 className="text-purple-400 text-sm font-medium mb-1">
                کل حقوق
              </h3>
              <p className="text-white text-2xl font-bold">
                {salaryDateRange[0] && salaryDateRange[1] ? (
                  `${totalSalary.toLocaleString()} ریال`
                ) : (
                  <span className="text-white/50 text-lg">-</span>
                )}
              </p>
              {salaryDateRange[0] && salaryDateRange[1] && (
                <p className="text-purple-300/70 text-xs mt-2">
                  {completedTasksCount} × {taskAmount.toLocaleString()}
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>

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
