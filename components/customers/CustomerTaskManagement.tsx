"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaClock,
  FaEdit,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
  FaEye,
  FaThumbsUp,
  FaThumbsDown,
} from "react-icons/fa";
import { IoSparkles, IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface DecodedToken {
  userId: string;
  phoneNumber: string;
  name: string;
  userType: "user" | "customer" | "coworker" | "admin";
  exp: number;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status:
    | "todo"
    | "in-progress"
    | "review"
    | "accepted"
    | "completed"
    | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  startDate?: string;
  dueDate?: string;
  completedDate?: string;
  notes: string;
  deliverables: string;
  serviceRequestId: {
    _id: string;
    title: string;
    customer: string;
  };
  assignedUserId: {
    _id: string;
    name: string;
    email: string;
  };
  attachedVideo?: string;
  createdAt: string;
  updatedAt: string;
}

const CustomerTaskManagement: React.FC = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Task status columns configuration (customer view)
  const statusColumns = [
    {
      id: "in-progress",
      title: "در حال انجام",
      color: "from-blue-500/20 to-blue-600/10",
      borderColor: "border-blue-500/30",
      icon: FaEdit,
      iconColor: "text-blue-400",
    },
    {
      id: "review",
      title: "در حال بررسی",
      color: "from-yellow-500/20 to-yellow-600/10",
      borderColor: "border-yellow-500/30",
      icon: FaExclamationTriangle,
      iconColor: "text-yellow-400",
    },
    {
      id: "accepted",
      title: "آماده تایید",
      color: "from-emerald-500/20 to-emerald-600/10",
      borderColor: "border-emerald-500/30",
      icon: FaCheckCircle,
      iconColor: "text-emerald-400",
    },
    {
      id: "completed",
      title: "تکمیل شده",
      color: "from-green-500/20 to-green-600/10",
      borderColor: "border-green-500/30",
      icon: FaCheckCircle,
      iconColor: "text-green-400",
    },
  ];

  // Priority colors and labels
  const priorityConfig = {
    low: { label: "کم", color: "bg-gray-500", textColor: "text-gray-400" },
    medium: {
      label: "متوسط",
      color: "bg-blue-500",
      textColor: "text-blue-400",
    },
    high: {
      label: "بالا",
      color: "bg-orange-500",
      textColor: "text-orange-400",
    },
    urgent: { label: "فوری", color: "bg-red-500", textColor: "text-red-400" },
  };

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
        console.log(decoded);

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

  // Fetch customer tasks
  const fetchCustomerTasks = async () => {
    if (!userInfo?.userId) return;

    try {
      const token =
        localStorage.getItem("userToken") || localStorage.getItem("token");
      const response = await fetch(
        `/api/customer-tasks?customer=${userInfo.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      console.log(result);

      if (result.success) {
        setTasks(result.data || []);
      } else {
        console.error("Customer Tasks API error:", result);
        toast.error("خطا در دریافت تسک‌ها");
      }
    } catch (error) {
      console.error("Error fetching customer tasks:", error);
      toast.error("خطا در دریافت اطلاعات");
    }
  };

  // Filter tasks by status
  const getTasksByStatus = (status: string) => {
    return tasks
      .filter((task) => task.status === status)
      .sort((a, b) => {
        // Sort by priority first
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff =
          (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        if (priorityDiff !== 0) return priorityDiff;

        // Then by creation date (newest first)
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  };

  // Handle task approval
  const handleTaskApproval = async (
    taskId: string,
    action: "approve" | "reject"
  ) => {
    try {
      const token =
        localStorage.getItem("userToken") || localStorage.getItem("token");
      const response = await fetch("/api/customer-tasks", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          action,
          ...(action === "reject" ? { rejectionReason } : {}),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          action === "approve"
            ? "تسک با موفقیت تایید شد"
            : "تسک رد شد و به مرحله بررسی بازگشت"
        );

        // Update local state
        fetchCustomerTasks();

        // Close modals
        setIsTaskModalOpen(false);
        setIsRejectionModalOpen(false);
        setRejectionReason("");
        setSelectedTask(null);
      } else {
        toast.error(result.message || "خطا در عملیات");
      }
    } catch (error) {
      console.error("Error handling task approval:", error);
      toast.error("خطا در انجام عملیات");
    }
  };

  // Handle task click
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // Handle rejection modal
  const handleRejectionClick = () => {
    setIsTaskModalOpen(false);
    setIsRejectionModalOpen(true);
  };

  useEffect(() => {
    fetchCustomerTasks();
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
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-3">
            پیگیری پروژه‌ها
          </h1>
          <p className="text-white/70 text-lg">
            مشاهده وضعیت و پیشرفت پروژه‌های شما
          </p>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statusColumns.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            const Icon = column.icon;
            return (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`bg-gradient-to-br ${column.color} backdrop-blur-xl rounded-2xl p-4 border ${column.borderColor}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`${column.iconColor.replace(
                      "text-",
                      "bg-"
                    )}/20 p-2 rounded-lg`}
                  >
                    <Icon className={`${column.iconColor} text-lg`} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {columnTasks.length}
                </div>
                <div className={`${column.iconColor} text-sm`}>
                  {column.title}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {statusColumns.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            const Icon = column.icon;

            return (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`bg-gradient-to-br ${column.color} backdrop-blur-xl rounded-2xl p-6 border ${column.borderColor}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`${column.iconColor.replace(
                      "text-",
                      "bg-"
                    )}/20 p-3 rounded-xl`}
                  >
                    <Icon className={`${column.iconColor} text-xl`} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {column.title}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {columnTasks.length} تسک
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {columnTasks.map((task) => (
                      <motion.div
                        key={task._id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleTaskClick(task)}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 cursor-pointer hover:bg-white/15 transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-white font-medium text-sm leading-tight">
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            {/* Priority Badge */}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                priorityConfig[task.priority].color
                              } text-white`}
                            >
                              {priorityConfig[task.priority].label}
                            </span>
                            {/* Acceptance Actions for "accepted" status */}
                            {task.status === "accepted" && (
                              <div
                                className="flex gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() =>
                                    handleTaskApproval(task._id, "approve")
                                  }
                                  className="p-1 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
                                  title="تایید"
                                >
                                  <FaThumbsUp className="text-green-400 text-xs" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedTask(task);
                                    handleRejectionClick();
                                  }}
                                  className="p-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                                  title="رد"
                                >
                                  <FaThumbsDown className="text-red-400 text-xs" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-white/70 text-xs mb-3 line-clamp-2">
                          {task.description}
                        </p>

                        {/* Service Request Info */}
                        <div className="text-white/50 text-xs mb-2">
                          پروژه: {task.serviceRequestId?.title}
                        </div>

                        {/* Assigned User */}
                        <div className="text-white/50 text-xs mb-3">
                          مسئول: {task.assignedUserId?.name}
                        </div>

                        {/* Due Date */}
                        {task.dueDate && (
                          <div className="text-white/60 text-xs">
                            سررسید:{" "}
                            {new Date(task.dueDate).toLocaleDateString("fa-IR")}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {columnTasks.length === 0 && (
                    <div className="text-white/40 text-sm text-center py-8">
                      تسکی در این مرحله وجود ندارد
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {isTaskModalOpen && selectedTask && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsTaskModalOpen(false);
              setSelectedTask(null);
            }}
          >
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full filter blur-3xl"></div>
            </div>

            <motion.div
              className="relative z-10 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-auto shadow-2xl border border-white/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {selectedTask.title}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          priorityConfig[selectedTask.priority].color
                        } text-white`}
                      >
                        {priorityConfig[selectedTask.priority].label}
                      </span>
                      <span className="text-white/60 text-sm">
                        پروژه: {selectedTask.serviceRequestId?.title}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsTaskModalOpen(false);
                      setSelectedTask(null);
                    }}
                  >
                    <IoClose
                      size={24}
                      className="text-white/70 hover:text-white transition-colors"
                    />
                  </button>
                </div>

                {/* Task Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        توضیحات
                      </label>
                      <p className="text-white/90 bg-white/5 rounded-xl p-4 border border-white/10">
                        {selectedTask.description}
                      </p>
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        تحویلات مورد انتظار
                      </label>
                      <p className="text-white/90 bg-white/5 rounded-xl p-4 border border-white/10">
                        {selectedTask.deliverables || "تحویلاتی مشخص نشده"}
                      </p>
                    </div>

                    {selectedTask.notes && (
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          یادداشت‌ها
                        </label>
                        <p className="text-white/90 bg-white/5 rounded-xl p-4 border border-white/10 whitespace-pre-wrap">
                          {selectedTask.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        مسئول انجام
                      </label>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-white/90">
                          {selectedTask.assignedUserId?.name}
                        </p>
                        <p className="text-white/60 text-sm">
                          {selectedTask.assignedUserId?.email}
                        </p>
                      </div>
                    </div>

                    {selectedTask.startDate && (
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          تاریخ شروع
                        </label>
                        <p className="text-white/90 bg-white/5 rounded-xl p-4 border border-white/10">
                          {new Date(selectedTask.startDate).toLocaleDateString(
                            "fa-IR"
                          )}
                        </p>
                      </div>
                    )}

                    {selectedTask.dueDate && (
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          تاریخ سررسید
                        </label>
                        <p className="text-white/90 bg-white/5 rounded-xl p-4 border border-white/10">
                          {new Date(selectedTask.dueDate).toLocaleDateString(
                            "fa-IR"
                          )}
                        </p>
                      </div>
                    )}

                    {selectedTask.completedDate && (
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          تاریخ تکمیل
                        </label>
                        <p className="text-white/90 bg-white/5 rounded-xl p-4 border border-white/10">
                          {new Date(
                            selectedTask.completedDate
                          ).toLocaleDateString("fa-IR")}
                        </p>
                      </div>
                    )}

                    {selectedTask.attachedVideo && (
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          ویدیو پیوست
                        </label>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <video
                            controls
                            className="w-full rounded-lg"
                            style={{ maxHeight: "200px" }}
                          >
                            <source
                              src={selectedTask.attachedVideo}
                              type="video/mp4"
                            />
                            مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                          </video>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons for Accepted Tasks */}
                {selectedTask.status === "accepted" && (
                  <div className="mt-8 flex justify-center gap-4">
                    <motion.button
                      onClick={() =>
                        handleTaskApproval(selectedTask._id, "approve")
                      }
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center gap-3"
                    >
                      <FaThumbsUp />
                      تایید نهایی
                    </motion.button>
                    <motion.button
                      onClick={handleRejectionClick}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-medium rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-3"
                    >
                      <FaThumbsDown />
                      رد و درخواست اصلاح
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rejection Modal */}
      <AnimatePresence>
        {isRejectionModalOpen && (
          <motion.div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsRejectionModalOpen(false);
              setRejectionReason("");
            }}
          >
            <motion.div
              className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-2xl p-6 w-full max-w-md border border-white/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">دلیل رد تسک</h3>
              <p className="text-white/70 mb-4">
                لطفا دلیل رد این تسک را بیان کنید:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="دلیل رد تسک را وارد کنید..."
                className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-red-400/50 resize-none"
                rows={4}
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setIsRejectionModalOpen(false);
                    setRejectionReason("");
                  }}
                  className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                >
                  انصراف
                </button>
                <button
                  onClick={() => {
                    if (selectedTask && rejectionReason.trim()) {
                      handleTaskApproval(selectedTask._id, "reject");
                    } else {
                      toast.error("لطفا دلیل رد را وارد کنید");
                    }
                  }}
                  disabled={!rejectionReason.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  رد تسک
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerTaskManagement;
