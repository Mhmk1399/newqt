"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import {
  IoAdd,
  IoClose,
  IoChevronBack,
  IoChevronForward,
  IoRefresh,
} from "react-icons/io5";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
  FaCalendarAlt,
  FaUser,
  FaEdit,
  FaSave,
  FaClock,
  FaFlag,
  FaFileUpload,
  FaVideo,
  FaPlay,
} from "react-icons/fa";
import toast from "react-hot-toast";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DynamicForm from "@/components/global/newdynamics/dynamicForm";
import { FormField } from "@/types/dynamicTypes/types";
import VideoUploadModal from "@/components/modals/VideoUploadModal";

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

interface User {
  _id: string;
  name: string;
  email: string;
}

interface ServiceRequest {
  _id: string;
  title: string;
}

const TasksManagement: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVideoUploadModalOpen, setIsVideoUploadModalOpen] = useState(false);
  const [videoUploadTaskId, setVideoUploadTaskId] = useState<string | null>(
    null
  );
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Refs for GSAP animations
  const statisticsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const columnsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const taskRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const modalRef = useRef<HTMLDivElement | null>(null);
  const addModalRef = useRef<HTMLDivElement | null>(null);
  const taskModalRef = useRef<HTMLDivElement | null>(null);

  console.log(loading, serviceRequests);

  // GSAP Animation Functions
  const animateStatistics = () => {
    statisticsRefs.current.forEach((ref, index) => {
      if (ref) {
        gsap.fromTo(
          ref,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: index * 0.1,
            ease: "power2.out",
          }
        );
      }
    });
  };

  const animateColumns = () => {
    columnsRefs.current.forEach((ref, index) => {
      if (ref) {
        gsap.fromTo(
          ref,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            delay: 0.2 + index * 0.1,
            ease: "power2.out",
          }
        );
      }
    });
  };

  const animateTaskCard = (element: HTMLElement, delay = 0) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: 20, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        delay,
        ease: "power2.out",
      }
    );
  };

  const animateModalIn = (element: HTMLElement) => {
    gsap.set(element, { opacity: 0, scale: 0.8 });
    gsap.to(element, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const animateModalOut = (element: HTMLElement): Promise<void> => {
    return new Promise((resolve) => {
      gsap.to(element, {
        opacity: 0,
        scale: 0.8,
        duration: 0.2,
        ease: "power2.in",
        onComplete: resolve,
      });
    });
  };

  const animateButtonHover = (element: HTMLElement, isHover: boolean) => {
    gsap.to(element, {
      scale: isHover ? 1.05 : 1,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  // Drag and Drop Functions
  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
    const taskElement = taskRefs.current[task._id];
    if (taskElement) {
      gsap.to(taskElement, {
        scale: 1.1,
        opacity: 0.8,
        duration: 0.2,
        ease: "power2.out",
      });
    }
  };

  const handleDragEnd = () => {
    if (draggedTask) {
      const taskElement = taskRefs.current[draggedTask._id];
      if (taskElement) {
        gsap.to(taskElement, {
          scale: 1,
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      // Animate the task out before updating
      const taskElement = taskRefs.current[draggedTask._id];
      if (taskElement) {
        await new Promise<void>((resolve) => {
          gsap.to(taskElement, {
            opacity: 0,
            y: -20,
            duration: 0.2,
            ease: "power2.in",
            onComplete: resolve,
          });
        });
      }

      await updateTaskStatus(draggedTask._id, newStatus);
    }
    handleDragEnd();
  };

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

  // Form fields for adding new tasks
  const formFields: FormField[] = [
    {
      name: "title",
      label: "عنوان تسک",
      type: "text",
      placeholder: "عنوان تسک را وارد کنید",
      validation: [{ type: "required", message: "عنوان تسک الزامی است" }],
    },
    {
      name: "description",
      label: "توضیحات",
      type: "textarea",
      placeholder: "توضیحات تسک را وارد کنید",
      validation: [{ type: "required", message: "توضیحات الزامی است" }],
    },
    {
      name: "priority",
      label: "اولویت",
      type: "select",
      options: [
        { label: "کم", value: "low" },
        { label: "متوسط", value: "medium" },
        { label: "بالا", value: "high" },
        { label: "فوری", value: "urgent" },
      ],
      defaultValue: "medium",
      validation: [{ type: "required", message: "اولویت الزامی است" }],
    },
    {
      name: "status",
      label: "وضعیت",
      type: "select",
      options: [
        { label: "انجام نشده", value: "todo" },
        { label: "در حال انجام", value: "in-progress" },
        { label: "در حال بررسی", value: "review" },
        { label: "تایید شده", value: "accepted" },
        { label: "تکمیل شده", value: "completed" },
        { label: "لغو شده", value: "cancelled" },
      ],
      defaultValue: "todo",
    },
    {
      name: "assignedUserId",
      label: "تخصیص به کاربر",
      type: "select",
      placeholder: "کاربر را انتخاب کنید",
      options: users.map((user) => ({ label: user.name, value: user._id })),
    },
    {
      name: "startDate",
      label: "تاریخ شروع",
      type: "date",
    },
    {
      name: "dueDate",
      label: "تاریخ سررسید",
      type: "date",
    },
    {
      name: "notes",
      label: "یادداشت‌ها",
      type: "textarea",
      placeholder: "یادداشت‌های اضافی را وارد کنید",
    },
    {
      name: "deliverables",
      label: "تحویلات مورد انتظار",
      type: "textarea",
      placeholder: "تحویلات مورد انتظار را وارد کنید",
    },
  ];

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tasks");
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
    } finally {
      setLoading(false);
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

        // Then by due date
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;

        return 0;
      });
  };

  // Update task status - Admin can update to any status
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
                  status: newStatus as Task["status"],
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
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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

  // Handle task click
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // Handle modal close with animation
  const closeAddModal = async () => {
    if (addModalRef.current) {
      await animateModalOut(addModalRef.current);
    }
    setIsAddModalOpen(false);
  };

  const closeTaskModal = async () => {
    if (taskModalRef.current) {
      await animateModalOut(taskModalRef.current);
    }
    setIsTaskModalOpen(false);
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
        fetchTasks();
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

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users?dropdown=true");
      const result = await response.json();
      if (result.success) {
        setUsers(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchServiceRequests = async () => {
    try {
      const response = await fetch("/api/serviceRequests");
      const result = await response.json();
      if (result.success) {
        setServiceRequests(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching service requests:", error);
    }
  };

  // Get days until due date
  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Check if task is overdue
  const isOverdue = (dueDate: string) => {
    return (
      new Date(dueDate) < new Date() &&
      new Date(dueDate).toDateString() !== new Date().toDateString()
    );
  };

  // GSAP Effects
  useEffect(() => {
    // Register GSAP plugins
    gsap.registerPlugin(Draggable);
  }, []);

  useEffect(() => {
    if (!loading) {
      // Animate statistics cards
      setTimeout(() => {
        animateStatistics();
      }, 100);

      // Animate columns
      setTimeout(() => {
        animateColumns();
      }, 200);

      // Animate task cards
      setTimeout(() => {
        Object.values(taskRefs.current).forEach((ref, index) => {
          if (ref) {
            animateTaskCard(ref, index * 0.05);
          }
        });
      }, 400);
    }
  }, [loading, tasks]);

  useEffect(() => {
    if (isAddModalOpen && addModalRef.current) {
      animateModalIn(addModalRef.current);
    }
  }, [isAddModalOpen]);

  useEffect(() => {
    if (isTaskModalOpen && taskModalRef.current) {
      animateModalIn(taskModalRef.current);
    }
  }, [isTaskModalOpen]);

  useEffect(() => {
    fetchUsers();
    fetchServiceRequests();
    fetchTasks();
  }, []);

  // Animate statistics when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      animateStatistics();
    }
  }, [tasks]);

  // Animate columns when component mounts
  useEffect(() => {
    if (!loading) {
      animateColumns();
    }
  }, [loading]);

  // Animate task cards when they're added to DOM
  useEffect(() => {
    Object.values(taskRefs.current).forEach((ref, index) => {
      if (ref) {
        animateTaskCard(ref, index * 0.05);
      }
    });
  }, [tasks]);

  // Animate modals when they open
  useEffect(() => {
    if (isAddModalOpen && addModalRef.current) {
      animateModalIn(addModalRef.current);
    }
  }, [isAddModalOpen]);

  useEffect(() => {
    if (isTaskModalOpen && taskModalRef.current) {
      animateModalIn(taskModalRef.current);
    }
  }, [isTaskModalOpen]);

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
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-3">
            مدیریت تسکها
          </h1>
          <p className="text-white/70 text-lg">
            مدیریت کامل تسکها با امکان جستجو، فیلتر، ویرایش و تخصیص
          </p>
        </div>

        <div className="mb-6 flex justify-end gap-3">
          <button
            onClick={fetchTasks}
            onMouseEnter={(e) => animateButtonHover(e.currentTarget, true)}
            onMouseLeave={(e) => animateButtonHover(e.currentTarget, false)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-blue-500/25"
          >
            <IoRefresh className="text-xl" />
            بروزرسانی
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            onMouseEnter={(e) => animateButtonHover(e.currentTarget, true)}
            onMouseLeave={(e) => animateButtonHover(e.currentTarget, false)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-purple-500/25"
          >
            <IoAdd className="text-xl" />
            افزودن
          </button>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {statusColumns.map((column, index) => {
            const columnTasks = getTasksByStatus(column.id);
            const Icon = column.icon;
            return (
              <div
                key={column.id}
                ref={(el) => {
                  statisticsRefs.current[index] = el;
                }}
                className={`bg-gradient-to-br ${column.color} backdrop-blur-xl rounded-2xl p-4 border ${column.borderColor} opacity-0`}
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
              </div>
            );
          })}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6">
          {statusColumns.map((column, columnIndex) => {
            const columnTasks = getTasksByStatus(column.id);
            const Icon = column.icon;

            return (
              <div
                key={column.id}
                ref={(el) => {
                  columnsRefs.current[columnIndex] = el;
                }}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
                className={`bg-gradient-to-br ${
                  column.color
                } backdrop-blur-xl rounded-2xl h-70 scrollbar-luxury p-2 overflow-y-auto border ${
                  dragOverColumn === column.id
                    ? "border-purple-400 shadow-lg shadow-purple-400/25"
                    : column.borderColor
                } p-4 opacity-0 transition-all duration-300`}
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
                  {columnTasks.map((task, taskIndex) => (
                    <div
                      key={task._id}
                      ref={(el) => {
                        taskRefs.current[task._id] = el;
                      }}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleTaskClick(task)}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all duration-300 cursor-move hover:bg-white/15 opacity-0"
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

                      {/* Assigned User - Large Flag */}
                      {task.assignedUserId && (
                        <div className="flex items-center gap-2 mb-3 bg-white/10 rounded-lg p-2">
                          <FaUser className="text-blue-400 text-sm" />
                          <span className="text-white text-sm font-medium">
                            {task.assignedUserId.name}
                          </span>
                        </div>
                      )}

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

                      {/* Video attachment indicator */}
                      {task.attachedVideo && (
                        <div className="flex items-center gap-1 mb-2">
                          <FaVideo className="text-xs text-purple-400" />
                          <span className="text-xs text-purple-400">
                            ویدیو ضمیمه
                          </span>
                        </div>
                      )}

                      {/* Admin Status Controls */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          {task.notes && (
                            <div className="flex items-center gap-1">
                              <FaEdit className="text-xs text-white/40" />
                            </div>
                          )}
                          {task.deliverables && (
                            <div className="flex items-center gap-1">
                              <FaFileUpload className="text-xs text-white/40" />
                            </div>
                          )}
                        </div>

                        {/* Admin Status Change Buttons */}
                        <div className="flex gap-1">
                          {/* Previous status button */}
                          {column.id !== "todo" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const prevStatus =
                                  column.id === "completed"
                                    ? "accepted"
                                    : column.id === "accepted"
                                    ? "review"
                                    : column.id === "review"
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

                          {/* Next status button */}
                          {column.id !== "completed" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextStatus =
                                  column.id === "todo"
                                    ? "in-progress"
                                    : column.id === "in-progress"
                                    ? "review"
                                    : column.id === "review"
                                    ? "accepted"
                                    : "completed";
                                updateTaskStatus(task._id, nextStatus);
                              }}
                              className="text-green-400 hover:text-green-300 text-xs p-1 rounded hover:bg-white/10 flex items-center"
                              title="مرحله بعد"
                            >
                              <IoChevronBack />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="text-center text-white/40 py-8">
                      <p className="text-sm">تسکی در این مرحله وجود ندارد</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Modal */}
        {isAddModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014]"
            onClick={closeAddModal}
          >
            {/* Luxury Background Elements */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full filter blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full filter blur-3xl"></div>
            </div>

            <div
              ref={addModalRef}
              className="relative z-10 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl w-full max-w-4xl shadow-2xl border border-white/20"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              style={{
                boxShadow:
                  "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* Decorative corner elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-tr-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/20 to-transparent rounded-bl-3xl"></div>

              <div className="p-8 overflow-auto max-h-[90vh] relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text">
                    افزودن تسک جدید
                  </h3>
                  <button onClick={closeAddModal}>
                    <IoClose
                      size={24}
                      className="text-white/70 hover:text-white transition-colors"
                    />
                  </button>
                </div>

                <DynamicForm
                  title=""
                  subtitle=""
                  fields={formFields}
                  endpoint="/api/tasks"
                  method="POST"
                  submitButtonText="افزودن تسک"
                  onSuccess={() => {
                    closeAddModal();
                    toast.success("تسک با موفقیت افزوده شد");
                    fetchTasks(); // Refresh the tasks list
                  }}
                  onError={() => {
                    toast.error("خطا در افزودن تسک");
                  }}
                  onCancel={closeAddModal}
                  className="bg-transparent border-0 shadow-none p-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Task Detail Modal - Full Admin Interface */}
        {isTaskModalOpen && selectedTask && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeTaskModal}
          >
            <div
              ref={taskModalRef}
              className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-auto shadow-2xl border border-white/20"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
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
                      ویرایش تسک (مدیر)
                    </h2>
                  </div>
                  <button
                    onClick={closeTaskModal}
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

                      {/* Video Upload Section - Under Notes */}
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

                    {/* Deliverables */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-white/70 text-sm mb-2">
                        تحویلات مورد انتظار
                      </label>
                      {editingField === "deliverables" ? (
                        <div className="space-y-2">
                          <textarea
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 min-h-[80px]"
                            placeholder="تحویلات مورد انتظار را وارد کنید..."
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
                            setEditingField("deliverables");
                            setTempValue(selectedTask.deliverables || "");
                          }}
                        >
                          <p className="text-white/90 whitespace-pre-wrap">
                            {selectedTask.deliverables ||
                              "تحویلاتی تعریف نشده. برای افزودن کلیک کنید..."}
                          </p>
                          <FaEdit className="text-white/40 opacity-0 group-hover:opacity-100 transition-opacity mt-2" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-4">
                    {/* Task Actions Section */}
                    {selectedTask.status === "review" && (
                      <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
                        <label className="block text-yellow-300 text-sm font-medium mb-3">
                          تسک در انتظار تصمیم
                        </label>
                        <div className="flex gap-3">
                          <button
                            onMouseEnter={(e) =>
                              animateButtonHover(e.currentTarget, true)
                            }
                            onMouseLeave={(e) =>
                              animateButtonHover(e.currentTarget, false)
                            }
                            onClick={() =>
                              updateTaskStatus(selectedTask._id, "accepted")
                            }
                            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                          >
                            تایید
                          </button>
                          <button
                            onMouseEnter={(e) =>
                              animateButtonHover(e.currentTarget, true)
                            }
                            onMouseLeave={(e) =>
                              animateButtonHover(e.currentTarget, false)
                            }
                            onClick={() =>
                              updateTaskStatus(selectedTask._id, "todo")
                            }
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                          >
                            رد
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Admin Status Control */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-white/70 text-sm mb-3">
                        کنترل وضعیت (مدیر)
                      </label>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {[
                          {
                            status: "todo",
                            label: "انجام نشده",
                            color: "bg-gray-600",
                          },
                          {
                            status: "in-progress",
                            label: "در حال انجام",
                            color: "bg-blue-600",
                          },
                          {
                            status: "review",
                            label: "در بررسی",
                            color: "bg-yellow-600",
                          },
                          {
                            status: "accepted",
                            label: "تایید شده",
                            color: "bg-emerald-600",
                          },
                          {
                            status: "completed",
                            label: "تکمیل شده",
                            color: "bg-green-600",
                          },
                          {
                            status: "cancelled",
                            label: "لغو شده",
                            color: "bg-red-600",
                          },
                        ].map(({ status, label, color }) => (
                          <button
                            key={status}
                            onMouseEnter={(e) =>
                              animateButtonHover(e.currentTarget, true)
                            }
                            onMouseLeave={(e) =>
                              animateButtonHover(e.currentTarget, false)
                            }
                            onClick={() =>
                              updateTaskStatus(selectedTask._id, status)
                            }
                            className={`p-2 rounded-lg text-white text-xs font-medium transition-all border-2 ${
                              selectedTask.status === status
                                ? `${color} border-white/50 shadow-lg`
                                : `${color}/30 border-white/10 hover:${color}/50`
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      <div className="text-xs text-white/60">
                        ⚠️ به عنوان مدیر می‌توانید وضعیت را به هر مرحله تغییر
                        دهید
                      </div>
                    </div>

                    {/* Priority Circles */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-white/70 text-sm mb-3">
                        اولویت
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {
                            priority: "low",
                            label: "کم",
                            color: "bg-gray-500",
                            dotColor: "bg-gray-400",
                          },
                          {
                            priority: "medium",
                            label: "متوسط",
                            color: "bg-blue-500",
                            dotColor: "bg-blue-400",
                          },
                          {
                            priority: "high",
                            label: "بالا",
                            color: "bg-orange-500",
                            dotColor: "bg-orange-400",
                          },
                          {
                            priority: "urgent",
                            label: "فوری",
                            color: "bg-red-500",
                            dotColor: "bg-red-400",
                          },
                        ].map(({ priority, label, color, dotColor }) => (
                          <button
                            key={priority}
                            onMouseEnter={(e) =>
                              animateButtonHover(e.currentTarget, true)
                            }
                            onMouseLeave={(e) =>
                              animateButtonHover(e.currentTarget, false)
                            }
                            onClick={() =>
                              updateTaskField(
                                selectedTask._id,
                                "priority",
                                priority
                              )
                            }
                            className={`flex items-center gap-2 p-3 rounded-lg transition-all border-2 ${
                              selectedTask.priority === priority
                                ? `${color}/30 border-white/50 shadow-lg`
                                : `bg-white/5 border-white/10 hover:${color}/20`
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full ${
                                selectedTask.priority === priority
                                  ? dotColor
                                  : "bg-white/30"
                              }`}
                            ></div>
                            <span className="text-white text-sm font-medium">
                              {label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Assigned User */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-white/70 text-sm mb-2">
                        تخصیص به کاربر
                      </label>
                      <select
                        value={selectedTask.assignedUserId?._id || ""}
                        onChange={(e) =>
                          updateTaskField(
                            selectedTask._id,
                            "assignedUserId",
                            e.target.value
                          )
                        }
                        className="w-full bg-green/10 border border-white/20 rounded-lg px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all hover:bg-white/15"
                      >
                        <option value="">انتخاب کاربر</option>
                        {users.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                      {selectedTask.assignedUserId && (
                        <div className="mt-2 p-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
                          <p className="text-blue-300 text-sm font-medium">
                            {selectedTask.assignedUserId.name}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-white/70 text-sm mb-3">
                        تاریخ‌ها
                      </label>

                      {/* Start Date */}
                      <div className="mb-3">
                        <label className="block text-white/60 text-xs mb-1">
                          تاریخ شروع
                        </label>
                        <DatePicker
                          value={
                            selectedTask.startDate
                              ? new DateObject(new Date(selectedTask.startDate))
                              : null
                          }
                          onChange={(val) => {
                            const dateValue = val
                              ? val.toDate().toISOString().split("T")[0]
                              : "";
                            updateTaskField(
                              selectedTask._id,
                              "startDate",
                              dateValue
                            );
                          }}
                          calendar={persian}
                          locale={persian_fa}
                          format="YYYY/MM/DD"
                          placeholder="انتخاب تاریخ شروع"
                          inputClass="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-purple-400/50 text-sm"
                          calendarPosition="bottom-center"
                        />
                      </div>

                      {/* Due Date */}
                      <div className="mb-3">
                        <label className="block text-white/60 text-xs mb-1">
                          تاریخ سررسید
                        </label>
                        <DatePicker
                          value={
                            selectedTask.dueDate
                              ? new DateObject(new Date(selectedTask.dueDate))
                              : null
                          }
                          onChange={(val) => {
                            const dateValue = val
                              ? val.toDate().toISOString().split("T")[0]
                              : "";
                            updateTaskField(
                              selectedTask._id,
                              "dueDate",
                              dateValue
                            );
                          }}
                          calendar={persian}
                          locale={persian_fa}
                          format="YYYY/MM/DD"
                          placeholder="انتخاب تاریخ سررسید"
                          inputClass="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-purple-400/50 text-sm"
                          calendarPosition="bottom-center"
                        />
                      </div>

                      {/* Completion Date Display */}
                      {selectedTask.completedDate && (
                        <div>
                          <label className="block text-white/60 text-xs mb-1">
                            تاریخ تکمیل
                          </label>
                          <div className="text-green-400 text-sm">
                            {new Date(
                              selectedTask.completedDate
                            ).toLocaleDateString("fa-IR")}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Video Upload Section - Sidebar */}
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
            </div>
          </div>
        )}

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
    </div>
  );
};

export default TasksManagement;
