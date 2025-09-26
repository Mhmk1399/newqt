"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaComment,
  FaFileUpload,
  FaEdit,
  FaSave,
  FaTimes,
  FaExclamationTriangle,
  FaFlag,
  FaClock,
  FaCheckCircle,
  FaBell,
  FaVideo,
  FaPlay,
} from "react-icons/fa";
import { IoClose, IoChevronForward, IoChevronBack } from "react-icons/io5";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import VideoUploadModal from "@/components/modals/VideoUploadModal";

interface DecodedToken {
  userId: string;
  phoneNumber: string;
  name: string;
  userType: "user" | "customer" | "coworker" | "admin";
  exp: number;
}

// Define task status type for reuse
type TaskStatus =
  | "todo"
  | "in-progress"
  | "review"
  | "completed"
  | "cancelled"
  | "accepted";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high" | "urgent";
  startDate?: string;
  dueDate?: string;
  completedDate?: string;
  notes: string;
  deliverables: string;
  serviceRequestId: {
    _id: string;
    title: string;
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



const TasksOfTheUsers: React.FC = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");

  const [isVideoUploadModalOpen, setIsVideoUploadModalOpen] = useState(false);
  const [videoUploadTaskId, setVideoUploadTaskId] = useState<string | null>(
    null
  );

  // Task status columns configuration
  const statusColumns = [
    {
      id: "todo",
      title: "انجام نشده",
      color: "from-gray-500/20 to-gray-600/10",
      borderColor: "border-gray-500/30",
      icon: FaClock,
      iconColor: "text-gray-400",
    },
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
      title: "تایید شده",
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

  // Fetch user tasks function
  const fetchUserTasks = async () => {
    if (!userInfo?.userId) return;

    try {
      const token =
        localStorage.getItem("userToken") || localStorage.getItem("token");
      const response = await fetch(
        `/api/tasks?assignedUserId=${userInfo.userId}&limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setTasks(result.data || []);
      } else {
        console.error("Tasks API error:", result);
        toast.error("خطا در دریافت تسک‌ها");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("خطا در دریافت اطلاعات");
    }
  };

  // Fetch user tasks on component mount
  useEffect(() => {
    fetchUserTasks();
  }, [userInfo]);

  // Update task status
  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const token =
        localStorage.getItem("userToken") || localStorage.getItem("token");
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: taskId,
          status: newStatus,
          ...(newStatus === "completed"
            ? { completedDate: new Date().toISOString() }
            : {}),
        }),
      });

      if (response.ok) {
        setTasks((prev) =>
          prev.map((task) =>
            task._id === taskId
              ? {
                  ...task,
                  status: newStatus,
                  ...(newStatus === "completed"
                    ? { completedDate: new Date().toISOString() }
                    : {}),
                }
              : task
          )
        );
        toast.success("وضعیت تسک بروزرسانی شد");
      } else {
        throw new Error("Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("خطا در بروزرسانی تسک");
    }
  };

  // Update task field
  const updateTaskField = async (
    taskId: string,
    field: string,
    value: string
  ) => {
    try {
      const token =
        localStorage.getItem("userToken") || localStorage.getItem("token");
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: taskId,
          [field]: value,
        }),
      });

      if (response.ok) {
        setTasks((prev) =>
          prev.map((task) =>
            task._id === taskId ? { ...task, [field]: value } : task
          )
        );
        if (selectedTask && selectedTask._id === taskId) {
          setSelectedTask((prev) =>
            prev ? { ...prev, [field]: value } : null
          );
        }
        toast.success("تسک بروزرسانی شد");
      } else {
        throw new Error("Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("خطا در بروزرسانی تسک");
    }
  };

  // Filter tasks by status
  const getTasksByStatus = (status: string) => {
    return tasks
      .filter((task) => task.status === status)
      .sort((a, b) => {
        // Sort by priority first (urgent > high > medium > low)
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff =
          (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        if (priorityDiff !== 0) return priorityDiff;

        // Then by due date
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;

        return 0;
      });
  };

  // Check if task is overdue
  const isOverdue = (dueDate: string) => {
    return (
      new Date(dueDate) < new Date() &&
      new Date(dueDate).toDateString() !== new Date().toDateString()
    );
  };

  // Get days until due date
  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get priority tasks (overdue + due within 2 days, excluding completed tasks)
  const getUpcomingTasks = () => {
    return tasks
      .filter((task) => {
        if (task.status === "completed" || !task.dueDate) return false;
        const daysUntilDue = getDaysUntilDue(task.dueDate);
        // Include overdue tasks (negative days) AND tasks due within 2 days
        return daysUntilDue <= 2; // This includes negative numbers (overdue) and 0-2 days
      })
      .sort((a, b) => {
        // Sort overdue tasks first, then by priority, then by due date
        const aDaysUntilDue = getDaysUntilDue(a.dueDate!);
        const bDaysUntilDue = getDaysUntilDue(b.dueDate!);

        // Overdue tasks (negative days) come first
        if (aDaysUntilDue < 0 && bDaysUntilDue >= 0) return -1;
        if (bDaysUntilDue < 0 && aDaysUntilDue >= 0) return 1;

        // Then sort by priority
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff =
          (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        if (priorityDiff !== 0) return priorityDiff;

        // Finally by due date (oldest overdue first, earliest upcoming first)
        return new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime();
      });
  };

  // Handle task click
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // Save field edit
  const saveFieldEdit = () => {
    if (selectedTask && editingField) {
      updateTaskField(selectedTask._id, editingField, tempValue);
      setEditingField(null);
      setTempValue("");
    }
  };

  // Cancel field edit
  const cancelFieldEdit = () => {
    setEditingField(null);
    setTempValue("");
  };

  // Handle video upload - Open modal
  const handleVideoUpload = (taskId: string) => {
    setVideoUploadTaskId(taskId);
    setIsVideoUploadModalOpen(true);
  };

  // Handle video upload success
  const handleVideoUploadSuccess = (videoUrl: string) => {
    if (videoUploadTaskId) {
      updateTaskField(videoUploadTaskId, "attachedVideo", videoUrl);
      // Refresh tasks to ensure we have the latest data
      setTimeout(() => {
        fetchUserTasks();
      }, 1000);
      setIsVideoUploadModalOpen(false);
      setVideoUploadTaskId(null);
    }
  };

  // Handle video upload error
  const handleVideoUploadError = (error: string) => {
    console.error("Video upload error:", error);
    setIsVideoUploadModalOpen(false);
    setVideoUploadTaskId(null);
  };

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
            تسک‌های من
          </h1>
    
        </div>

        {/* Upcoming Tasks Priority Box */}
        {getUpcomingTasks().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-red-500/20 via-orange-500/15 to-yellow-500/20 backdrop-blur-xl rounded-2xl border border-red-400/40 p-6 shadow-2xl shadow-red-500/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500 p-2 rounded-full">
                <FaBell className="text-white text-lg animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-300">
                  تسک‌های فوری و اولویت‌دار
                </h3>
                <p className="text-red-200/80 text-sm">
                  {
                    getUpcomingTasks().filter(
                      (t) => getDaysUntilDue(t.dueDate!) < 0
                    ).length
                  }{" "}
                  تسک گذشته +{" "}
                  {
                    getUpcomingTasks().filter(
                      (t) => getDaysUntilDue(t.dueDate!) >= 0
                    ).length
                  }{" "}
                  تسک در ۲ روز آینده - لطفاً فوراً اقدام کنید
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getUpcomingTasks()
                .slice(0, 6)
                .map((task) => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => handleTaskClick(task)}
                    className={`backdrop-blur-sm rounded-xl p-4 border transition-all duration-300 cursor-pointer ${
                      getDaysUntilDue(task.dueDate!) < 0
                        ? "bg-red-500/20 border-red-500/50 hover:border-red-400/70 hover:bg-red-500/25 shadow-lg shadow-red-500/20"
                        : "bg-white/10 border-white/20 hover:border-red-400/40 hover:bg-red-500/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium text-sm line-clamp-2 flex-1">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-1 ml-2">
                        <FaFlag
                          className={`text-xs ${
                            priorityConfig[task.priority].textColor
                          }`}
                        />
                        <div
                          className={`w-2 h-2 rounded-full ${
                            priorityConfig[task.priority].color
                          }`}
                        ></div>
                      </div>
                    </div>

                    <p className="text-white/60 text-xs mb-2 truncate">
                      📋 {task.serviceRequestId?.title || "بدون درخواست سرویس"}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt
                          className={`text-xs ${
                            getDaysUntilDue(task.dueDate!) < 0
                              ? "text-red-500"
                              : "text-red-400"
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            getDaysUntilDue(task.dueDate!) < 0
                              ? "text-red-400 animate-pulse"
                              : "text-red-300"
                          }`}
                        >
                          {getDaysUntilDue(task.dueDate!) < 0
                            ? `${Math.abs(
                                getDaysUntilDue(task.dueDate!)
                              )} روز گذشته ⚠️`
                            : getDaysUntilDue(task.dueDate!) === 0
                            ? "امروز 🔥"
                            : getDaysUntilDue(task.dueDate!) === 1
                            ? "فردا ⏰"
                            : `${getDaysUntilDue(task.dueDate!)} روز دیگر`}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          task.status === "todo"
                            ? "bg-gray-500/20 text-gray-300"
                            : task.status === "in-progress"
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {task.status === "todo"
                          ? "انجام نشده"
                          : task.status === "in-progress"
                          ? "در حال انجام"
                          : "در بررسی"}
                      </span>
                    </div>
                  </motion.div>
                ))}
            </div>

            {getUpcomingTasks().length > 6 && (
              <div className="text-center mt-4">
                <span className="text-red-200/60 text-sm">
                  و {getUpcomingTasks().length - 6} تسک دیگر...
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Task Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
                  <Icon className={`${column.iconColor} text-xl`} />
                  <span className="text-2xl font-bold text-white">
                    {columnTasks.length}
                  </span>
                </div>
                <h3 className={`${column.iconColor} text-sm font-medium`}>
                  {column.title}
                </h3>
              </motion.div>
            );
          })}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6">
          {statusColumns.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            const Icon = column.icon;

            return (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`bg-gradient-to-br ${column.color} backdrop-blur-xl h-70 overflow-y-auto scrollbar-luxury rounded-2xl border ${column.borderColor} p-4`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon className={`${column.iconColor} text-lg`} />
                    <h3 className={`${column.iconColor} font-semibold`}>
                      {column.title}
                    </h3>
                  </div>
                  <span className="bg-white/10 text-white/70 px-2 py-1 rounded-full text-xs">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div className="space-y-3 max-h-[600px] ">
                  {columnTasks.map((task) => (
                    <motion.div
                      key={task._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      onClick={() => handleTaskClick(task)}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer hover:bg-white/15"
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-white font-medium text-sm line-clamp-2 flex-1">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-1 ml-2">
                          <FaFlag
                            className={`text-xs ${
                              priorityConfig[task.priority].textColor
                            }`}
                          />
                          <div
                            className={`w-2 h-2 rounded-full ${
                              priorityConfig[task.priority].color
                            }`}
                          ></div>
                        </div>
                      </div>

                      {/* Service Request */}
                      <p className="text-white/60 text-xs mb-2 truncate">
                        📋{" "}
                        {task.serviceRequestId?.title || "بدون درخواست سرویس"}
                      </p>

                      {/* Due Date */}
                      {task.dueDate && (
                        <div className="flex items-center gap-1 mb-2">
                          <FaCalendarAlt className="text-xs text-white/60" />
                          <span
                            className={`text-xs ${
                              isOverdue(task.dueDate)
                                ? "text-red-400"
                                : getDaysUntilDue(task.dueDate) <= 3
                                ? "text-yellow-400"
                                : "text-white/60"
                            }`}
                          >
                            {new Date(task.dueDate).toLocaleDateString("fa-IR")}
                            {isOverdue(task.dueDate) && " (گذشته)"}
                          </span>
                        </div>
                      )}

                      {/* Progress indicators */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {task.notes && (
                            <div className="flex items-center gap-1">
                              <FaComment className="text-xs text-white/40" />
                              <span className="text-xs text-white/40">
                                یادداشت
                              </span>
                            </div>
                          )}
                          {task.deliverables && (
                            <div className="flex items-center gap-1">
                              <FaFileUpload className="text-xs text-white/40" />
                              <span className="text-xs text-white/40">
                                تحویل
                              </span>
                            </div>
                          )}
                          {task.attachedVideo && (
                            <div className="flex items-center gap-1">
                              <FaVideo className="text-xs text-purple-400" />
                              <span className="text-xs text-purple-400">
                                ویدیو
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Status change buttons for current task */}
                        <div className="flex gap-1">
                          {/* Previous status button - Users can go backwards except from protected statuses */}
                          {column.id !== "todo" &&
                            column.id !== "accepted" &&
                            column.id !== "completed" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const prevStatus =
                                    column.id === "review"
                                      ? "in-progress"
                                      : "todo";
                                  updateTaskStatus(task._id, prevStatus);
                                }}
                                className="text-orange-400 hover:text-orange-300 text-xs p-1 rounded hover:bg-white/10 flex items-center"
                                title="مرحله قبل"
                              >
                                <IoChevronForward />
                              </button>
                            )}

                          {/* Next status button - Users can only go up to 'review', not 'accepted' or 'completed' */}
                          {column.id !== "review" &&
                            column.id !== "completed" &&
                            column.id !== "accepted" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextStatus =
                                    column.id === "todo"
                                      ? "in-progress"
                                      : "review"; // Users can only go up to 'review'
                                  updateTaskStatus(task._id, nextStatus);
                                }}
                                className="text-green-400 hover:text-green-300 text-xs p-1 rounded hover:bg-white/10 flex items-center"
                                title="مرحله بعد"
                              >
                                <IoChevronBack />
                              </button>
                            )}

                          {/* Show locked message for protected statuses */}
                          {(column.id === "accepted" ||
                            column.id === "completed") && (
                            <span className="text-xs text-white/50 px-2 py-1 rounded bg-white/10">
                              🔒 فقط مدیر
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="text-center text-white/40 py-8">
                      <p className="text-sm">تسکی در این مرحله وجود ندارد</p>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsTaskModalOpen(false)}
          >
            <motion.div
              className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-auto shadow-2xl border border-white/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        priorityConfig[selectedTask.priority].color
                      }`}
                    ></div>
                    <h2 className="text-2xl font-bold text-white">
                      جزئیات تسک
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsTaskModalOpen(false)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <IoClose size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Title */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-white/70 text-sm mb-2">
                        عنوان تسک
                      </label>
                      {editingField === "title" ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                            autoFocus
                          />
                          <button
                            onClick={saveFieldEdit}
                            className="text-green-400 hover:text-green-300"
                          >
                            <FaSave />
                          </button>
                          <button
                            onClick={cancelFieldEdit}
                            className="text-red-400 hover:text-red-300"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="flex items-center justify-between group cursor-pointer hover:bg-white/5 rounded p-2 -m-2"
                          onClick={() => {
                            setEditingField("title");
                            setTempValue(selectedTask.title);
                          }}
                        >
                          <p className="text-white font-medium">
                            {selectedTask.title}
                          </p>
                          <FaEdit className="text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-white/70 text-sm mb-2">
                        توضیحات
                      </label>
                      {editingField === "description" ? (
                        <div className="space-y-2">
                          <textarea
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 min-h-[100px]"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={saveFieldEdit}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              ذخیره
                            </button>
                            <button
                              onClick={cancelFieldEdit}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                            >
                              انصراف
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="group cursor-pointer hover:bg-white/5 rounded p-2 -m-2"
                          onClick={() => {
                            setEditingField("description");
                            setTempValue(selectedTask.description);
                          }}
                        >
                          <p className="text-white/90 whitespace-pre-wrap">
                            {selectedTask.description}
                          </p>
                          <FaEdit className="text-white/40 opacity-0 group-hover:opacity-100 transition-opacity mt-2" />
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-white/70 text-sm mb-2">
                        یادداشت‌ها
                      </label>
                      {editingField === "notes" ? (
                        <div className="space-y-2">
                          <textarea
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 min-h-[80px]"
                            placeholder="یادداشت خود را وارد کنید..."
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={saveFieldEdit}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              ذخیره
                            </button>
                            <button
                              onClick={cancelFieldEdit}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                            >
                              انصراف
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="group cursor-pointer hover:bg-white/5 rounded p-2 -m-2 min-h-[40px]"
                          onClick={() => {
                            setEditingField("notes");
                            setTempValue(selectedTask.notes || "");
                          }}
                        >
                          <p className="text-white/90 whitespace-pre-wrap">
                            {selectedTask.notes ||
                              "یادداشتی وجود ندارد. برای افزودن کلیک کنید..."}
                          </p>
                          <FaEdit className="text-white/40 opacity-0 group-hover:opacity-100 transition-opacity mt-2" />
                        </div>
                      )}

                      {/* Video Section - Under Notes */}
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <label className="block text-white/70 text-sm mb-3">
                          ویدیوی ضمیمه
                        </label>

                        {selectedTask.attachedVideo ? (
                          <div className="space-y-4">
                            {/* Video Display */}
                            <div className="bg-black/50 rounded-lg overflow-hidden">
                              <iframe
                                src={selectedTask.attachedVideo}
                                className="w-full h-48 border-0"
                                title="ویدیوی ضمیمه تسک"
                                allowFullScreen
                              />
                            </div>

                            {/* Video Actions */}
                            <div className="flex gap-3">
                              <button
                                onClick={() =>
                                  window.open(
                                    selectedTask.attachedVideo,
                                    "_blank"
                                  )
                                }
                                className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                              >
                                <FaPlay />
                                بازکردن در تب جدید
                              </button>

                              <button
                                onClick={() =>
                                  handleVideoUpload(selectedTask._id)
                                }
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-300 text-sm transition-colors"
                              >
                                <FaVideo />
                                تعویض ویدیو
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center hover:border-white/50 transition-colors">
                            <FaVideo className="mx-auto text-white/50 text-3xl mb-3" />
                            <p className="text-white/60 text-sm mb-4">
                              هنوز ویدیویی آپلود نشده است
                            </p>
                            <button
                              onClick={() =>
                                handleVideoUpload(selectedTask._id)
                              }
                              className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-300 text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
                            >
                              <FaVideo />
                              آپلود ویدیو
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-4">
                    {/* Current Status Display */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-white/70 text-sm mb-2">
                        وضعیت فعلی
                      </label>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            selectedTask.status === "todo"
                              ? "bg-gray-500"
                              : selectedTask.status === "in-progress"
                              ? "bg-blue-500"
                              : selectedTask.status === "review"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                        ></div>
                        <span className="text-white font-medium">
                          {selectedTask.status === "todo"
                            ? "انجام نشده"
                            : selectedTask.status === "in-progress"
                            ? "در حال انجام"
                            : selectedTask.status === "review"
                            ? "در حال بررسی"
                            : "تکمیل شده"}
                        </span>
                      </div>

                      {/* Status Navigation Buttons */}
                      <div className="flex gap-2 mt-3">
                        {/* Previous status button - restricted for users */}
                        {selectedTask.status !== "todo" &&
                          selectedTask.status !== "accepted" &&
                          selectedTask.status !== "completed" && (
                            <button
                              onClick={() => {
                                const prevStatus =
                                  selectedTask.status === "review"
                                    ? "in-progress"
                                    : "todo";
                                updateTaskStatus(selectedTask._id, prevStatus);
                              }}
                              className="flex items-center gap-2 px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg text-orange-300 text-sm transition-colors"
                            >
                              <IoChevronForward /> مرحله قبل
                            </button>
                          )}

                        {/* Next status button - users can only go up to 'review' */}
                        {selectedTask.status !== "review" &&
                          selectedTask.status !== "completed" &&
                          selectedTask.status !== "accepted" && (
                            <button
                              onClick={() => {
                                const nextStatus =
                                  selectedTask.status === "todo"
                                    ? "in-progress"
                                    : "review"; // Users can only go up to 'review'
                                updateTaskStatus(selectedTask._id, nextStatus);
                              }}
                              className="flex items-center gap-2 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-green-300 text-sm transition-colors"
                            >
                              مرحله بعد
                              <IoChevronBack />
                            </button>
                          )}

                        {/* Show restriction message for protected statuses */}
                        {(selectedTask.status === "accepted" ||
                          selectedTask.status === "completed") && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-gray-600/20 border border-gray-500/30 rounded-lg text-gray-300 text-sm">
                            🔒 این وضعیت فقط توسط مدیر قابل تغییر است
                          </div>
                        )}

                        {selectedTask.status === "review" && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-600/20 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm">
                            ⏳ منتظر تایید مدیر
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-white/70 text-sm mb-2">
                        اولویت
                      </label>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            priorityConfig[selectedTask.priority].color
                          }`}
                        ></div>
                        <span className="text-white">
                          {priorityConfig[selectedTask.priority].label}
                        </span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-white/70 text-sm mb-2">
                        تاریخ‌ها
                      </label>
                      <div className="space-y-2 text-sm">
                        {selectedTask.startDate && (
                          <div className="flex items-center gap-2">
                            <span className="text-white/60">شروع:</span>
                            <span className="text-white">
                              {new Date(
                                selectedTask.startDate
                              ).toLocaleDateString("fa-IR")}
                            </span>
                          </div>
                        )}
                        {selectedTask.dueDate && (
                          <div className="flex items-center gap-2">
                            <span className="text-white/60">سررسید:</span>
                            <span
                              className={`${
                                isOverdue(selectedTask.dueDate)
                                  ? "text-red-400"
                                  : "text-white"
                              }`}
                            >
                              {new Date(
                                selectedTask.dueDate
                              ).toLocaleDateString("fa-IR")}
                              {isOverdue(selectedTask.dueDate) && " (گذشته)"}
                            </span>
                          </div>
                        )}
                        {selectedTask.completedDate && (
                          <div className="flex items-center gap-2">
                            <span className="text-white/60">تکمیل:</span>
                            <span className="text-green-400">
                              {new Date(
                                selectedTask.completedDate
                              ).toLocaleDateString("fa-IR")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Service Request */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-white/70 text-sm mb-2">
                        درخواست سرویس
                      </label>
                      <p className="text-white text-sm">
                        {selectedTask.serviceRequestId?.title ||
                          "بدون درخواست سرویس"}
                      </p>
                    </div>

                    {/* Video Upload Section */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-white/70 text-sm mb-3">
                        ویدیوی ضمیمه
                      </label>

                      {selectedTask.attachedVideo ? (
                        <div className="space-y-4">
                          {/* Video Display */}
                          <div className="bg-black/50 rounded-lg overflow-hidden">
                            <iframe
                              src={selectedTask.attachedVideo}
                              className="w-full h-48 border-0"
                              title="ویدیوی ضمیمه تسک"
                              allowFullScreen
                            />
                          </div>

                          {/* Video Actions */}
                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                window.open(
                                  selectedTask.attachedVideo,
                                  "_blank"
                                )
                              }
                              className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                            >
                              <FaPlay />
                              بازکردن در تب جدید
                            </button>

                            <button
                              onClick={() =>
                                handleVideoUpload(selectedTask._id)
                              }
                              className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-300 text-sm transition-colors"
                            >
                              <FaVideo />
                              تعویض ویدیو
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center hover:border-white/50 transition-colors">
                          <FaVideo className="mx-auto text-white/50 text-3xl mb-3" />
                          <p className="text-white/60 text-sm mb-4">
                            هنوز ویدیویی آپلود نشده است
                          </p>
                          <button
                            onClick={() => handleVideoUpload(selectedTask._id)}
                            className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-300 text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
                          >
                            <FaVideo />
                            آپلود ویدیو
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Upload Modal */}
      <VideoUploadModal
        isOpen={isVideoUploadModalOpen}
        taskId={videoUploadTaskId || ""}
        onClose={() => {
          setIsVideoUploadModalOpen(false);
          setVideoUploadTaskId(null);
        }}
        onSuccess={handleVideoUploadSuccess}
        onError={handleVideoUploadError}
      />
    </div>
  );
};

export default TasksOfTheUsers;
