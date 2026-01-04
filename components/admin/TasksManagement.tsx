"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { motion } from "framer-motion";
import {
  IoAdd,
  IoClose,
  IoChevronBack,
  IoChevronForward,
  IoRefresh,
  IoFilter,
  IoSearch,
  IoChevronUp,
  IoChevronDown,
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
  FaTrash,
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
    | "cancelled"
    | "paid";
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
  const [allTasks, setAllTasks] = useState<Task[]>([]); // Store all tasks for filtering
  const [users, setUsers] = useState<User[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVideoUploadModalOpen, setIsVideoUploadModalOpen] = useState(false);
  const [videoUploadTaskId, setVideoUploadTaskId] = useState<string | null>(
    null
  );
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [fullscreenColumnId, setFullscreenColumnId] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Filter states
  const [dateRange, setDateRange] = useState<[string, string]>(["", ""]);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignedUserId: "",
    title: "",
    serviceRequestId: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states for each column
  const [columnPagination, setColumnPagination] = useState({
    todo: { page: 1, itemsPerPage: 10 },
    "in-progress": { page: 1, itemsPerPage: 10 },
    review: { page: 1, itemsPerPage: 10 },
    accepted: { page: 1, itemsPerPage: 10 },
    completed: { page: 1, itemsPerPage: 10 },
    paid: { page: 1, itemsPerPage: 10 },
  });

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

  // Selection helpers for bulk actions
  const toggleSelectTask = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const clearSelection = () => setSelectedTaskIds([]);

  const selectAllVisible = (visibleTasks: Task[]) => {
    const ids = visibleTasks.map((t) => t._id);
    setSelectedTaskIds((prev) => Array.from(new Set([...prev, ...ids])));
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
    {
      id: "paid",
      title: "پرداخت شده",
      color: "from-indigo-500/20 to-indigo-600/10",
      borderColor: "border-indigo-500/30",
      icon: FaFileUpload,
      iconColor: "text-indigo-400",
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
          { label: "پرداخت شده", value: "paid" },
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

  // Fetch all tasks with filters
  const fetchTasks = async (applyFilters = false) => {
    try {
      setLoading(true);

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.set("limit", "1000"); // Get a large number to ensure we get all tasks
      queryParams.set("sortBy", "createdAt");
      queryParams.set("sortOrder", "desc");

      // Apply date range filter using createdAt if specified
      if (applyFilters && dateRange[0]) {
        queryParams.set("completedDateFrom", dateRange[0]);
        console.log("Setting date filter from:", dateRange[0]);
      }
      if (applyFilters && dateRange[1]) {
        queryParams.set("completedDateTo", dateRange[1]);
        console.log("Setting date filter to:", dateRange[1]);
      }

      // Apply other filters if specified
      if (applyFilters) {
        if (filters.status) queryParams.set("status", filters.status);
        if (filters.priority) queryParams.set("priority", filters.priority);
        if (filters.assignedUserId)
          queryParams.set("assignedUserId", filters.assignedUserId);
        if (filters.title) queryParams.set("title", filters.title);
      }

      const response = await fetch(`/api/tasks?${queryParams.toString()}`);
      const result = await response.json();

      if (result.success) {
        let tasksData = result.data || [];

        // If we have a large dataset and still hit pagination, fetch more pages
        if (result.pagination && result.pagination.totalPages > 1) {
          // Fetch all remaining pages
          const additionalRequests = [];
          for (let page = 2; page <= result.pagination.totalPages; page++) {
            const pageParams = new URLSearchParams(queryParams);
            pageParams.set("page", page.toString());
            additionalRequests.push(
              fetch(`/api/tasks?${pageParams.toString()}`).then((res) =>
                res.json()
              )
            );
          }

          const additionalResults = await Promise.all(additionalRequests);
          additionalResults.forEach((res) => {
            if (res.success) {
              tasksData = [...tasksData, ...(res.data || [])];
            }
          });
        }

        // Apply client-side filters for fields not supported by API
        if (applyFilters) {
          // Filter by service request if specified
          if (filters.serviceRequestId) {
            tasksData = tasksData.filter(
              (task: Task) =>
                task.serviceRequestId?._id === filters.serviceRequestId
            );
          }
        }

        setAllTasks(tasksData);
        setTasks(tasksData);

        // Reset pagination when new data is loaded
        setColumnPagination({
          todo: { page: 1, itemsPerPage: 10 },
          "in-progress": { page: 1, itemsPerPage: 10 },
          review: { page: 1, itemsPerPage: 10 },
          accepted: { page: 1, itemsPerPage: 10 },
          completed: { page: 1, itemsPerPage: 10 },
          paid: { page: 1, itemsPerPage: 10 },
        });

        // Show success message if filters were applied
        if (applyFilters) {
          const totalTasks = tasksData.length;
          toast.success(`${totalTasks} تسک با فیلترهای اعمال شده یافت شد`);
        }
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

  // Filter tasks by status with pagination
  const getTasksByStatus = (status: string) => {
    const filtered = tasks
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

    // Apply pagination
    const pagination =
      columnPagination[status as keyof typeof columnPagination];
    const startIndex = (pagination.page - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;

    return {
      tasks: filtered.slice(startIndex, endIndex),
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / pagination.itemsPerPage),
      currentPage: pagination.page,
    };
  };

  // Function to change page for a specific column
  const changeColumnPage = (status: string, newPage: number) => {
    setColumnPagination((prev) => ({
      ...prev,
      [status]: {
        ...prev[status as keyof typeof prev],
        page: newPage,
      },
    }));

    // Animate the new task cards after pagination change
    setTimeout(() => {
      const columnData = getTasksByStatus(status);
      console.log(`Animating ${columnData.tasks.length} tasks for status ${status}`);
      
      columnData.tasks.forEach((task: Task, index: number) => {
        const taskElement = taskRefs.current[task._id];
        if (taskElement) {
          // Reset the element first
          gsap.set(taskElement, { opacity: 0, y: 20, scale: 0.9 });
          // Then animate it in
          gsap.to(taskElement, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            delay: index * 0.1,
            ease: "power2.out",
          });
        } else {
          console.log(`Task element not found for task ID: ${task._id}`);
        }
      });
    }, 100);
  };

  // Helper functions for better pagination display
  const getTotalTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status).length;
  };

  const getTotalPagesByStatus = (status: string) => {
    const totalTasks = getTotalTasksByStatus(status);
    const pagination = columnPagination[status as keyof typeof columnPagination];
    return Math.ceil(totalTasks / (pagination?.itemsPerPage || 10));
  };

  const handleItemsPerPageChange = (status: string, itemsPerPage: number) => {
    setColumnPagination(prev => ({
      ...prev,
      [status]: {
        page: 1, // Reset to first page
        itemsPerPage
      }
    }));
    
    // Animate the new task cards after items per page change
    setTimeout(() => {
      const columnData = getTasksByStatus(status);
      columnData.tasks.forEach((task: Task, index: number) => {
        const taskElement = taskRefs.current[task._id];
        if (taskElement) {
          // Reset the element first
          gsap.set(taskElement, { opacity: 0, y: 20, scale: 0.9 });
          // Then animate it in
          gsap.to(taskElement, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            delay: index * 0.1,
            ease: "power2.out",
          });
        }
      });
    }, 100);
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

  // Bulk update selected tasks' status
  const updateSelectedTasksStatus = async (newStatus: string) => {
    try {
      toast.loading("در حال اعمال تغییرات...");
      const requests = selectedTaskIds.map((taskId) =>
        fetch("/api/tasks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: taskId, status: newStatus }),
        }).then((res) => res.json())
      );

      const results = await Promise.all(requests);
      const failed = results.filter((r) => !r.success);
      if (failed.length > 0) {
        toast.error(`${failed.length} تسک با خطا مواجه شد`);
      } else {
        toast.success("وضعیت تسک‌ها با موفقیت به‌روز شد");
      }

      clearSelection();
      fetchTasks();
    } catch (error) {
      console.error("Bulk update error:", error);
      toast.error("خطا در اعمال تغییرات گروهی");
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

  // Delete task function
  const deleteTask = async (taskId: string) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این تسک را حذف کنید؟ این عمل غیرقابل بازگشت است.")) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        // Remove task from state
        setTasks((prev) => prev.filter((task) => task._id !== taskId));
        setAllTasks((prev) => prev.filter((task) => task._id !== taskId));
        
        // Close modal if the deleted task was selected
        if (selectedTask && selectedTask._id === taskId) {
          closeTaskModal();
        }
        
        toast.success("تسک با موفقیت حذف شد");
      } else {
        throw new Error(result.message || "Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("خطا در حذف تسک");
    }
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

  // Animate task cards when pagination changes
  useEffect(() => {
    if (!loading && tasks.length > 0) {
      setTimeout(() => {
        Object.values(taskRefs.current).forEach((ref, index) => {
          if (ref) {
            // Check if element is visible (not opacity 0)
            const computedStyle = window.getComputedStyle(ref);
            if (computedStyle.opacity === "0" || parseFloat(computedStyle.opacity) < 0.1) {
              // Reset and animate the element
              gsap.set(ref, { opacity: 0, y: 20, scale: 0.9 });
              gsap.to(ref, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.4,
                delay: index * 0.02,
                ease: "power2.out",
              });
            }
          }
        });
      }, 150);
    }
  }, [columnPagination, tasks, loading]);

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
            onClick={() => fetchTasks(true)}
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

        {/* Enhanced Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
          }}
        >
          {/* Decorative corner elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-tr-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/20 to-transparent rounded-bl-3xl"></div>
          
          <div className="relative z-10">
            {/* Header */}
            {/* Bulk status change control */}
            <div className="mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => selectAllVisible(tasks)}
                  className="px-4 py-2.5 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-all"
                >
                  انتخاب همه
                </button>
                <button
                  onClick={clearSelection}
                  className="px-4 py-2.5 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-all"
                >
                  پاک کردن
                </button>
                <span className="text-white/70 text-sm px-2 py-1 bg-white/5 rounded-lg">
                  انتخاب شده: <span className="font-bold text-white">{selectedTaskIds.length}</span>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select 
                  id="bulk-status" 
                  className="bg-black/40 text-white px-4 py-2.5 rounded-lg text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400/50 min-w-[200px]" 
                  defaultValue=""
                >
                  <option value="" disabled>تغییر وضعیت گروهی...</option>
                  <option value="todo">انجام نشده</option>
                  <option value="in-progress">در حال انجام</option>
                  <option value="review">در بررسی</option>
                  <option value="accepted">تایید شده</option>
                  <option value="completed">تکمیل شده</option>
                  <option value="paid">پرداخت شده</option>
                  <option value="cancelled">لغو شده</option>
                </select>
                <button
                  onClick={() => {
                    const sel = (document.getElementById("bulk-status") as HTMLSelectElement)?.value;
                    if (!sel) { toast.error("لطفا یک وضعیت انتخاب کنید"); return; }
                    if (selectedTaskIds.length === 0) { toast.error("هیچ تسکی انتخاب نشده است"); return; }
                    updateSelectedTasksStatus(sel);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg text-sm hover:from-purple-700 hover:to-violet-700 transition-all font-medium whitespace-nowrap"
                >
                  تغییر وضعیت
                </button>
              </div>
            </div>
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-2">
                فیلتر و جستجوی تسکها
              </h2>
              <p className="text-white/70 text-sm sm:text-base">
                برای دسترسی سریعتر به تسکها از فیلترهای زیر استفاده کنید
              </p>
            </div>

            {/* Date Range Section */}
            <div className="mb-6 p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-base sm:text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-purple-400" />
                فیلتر بر اساس تاریخ
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2 font-medium">از تاریخ</label>
                  <div className="relative">
                    <DatePicker
                      value={dateRange[0] ? new DateObject(new Date(dateRange[0])) : null}
                      onChange={(val) => {
                        const fromDate = val ? val.toDate().toISOString().split("T")[0] : "";
                        setDateRange([fromDate, dateRange[1]]);
                      }}
                      calendar={persian}
                      locale={persian_fa}
                      format="YYYY/MM/DD"
                      placeholder="تاریخ شروع"
                      inputClass="w-full p-3 sm:p-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 text-center pr-10 text-sm sm:text-base"
                      calendarPosition="bottom-center"
                    />
                    <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2 font-medium">تا تاریخ</label>
                  <div className="relative">
                    <DatePicker
                      value={dateRange[1] ? new DateObject(new Date(dateRange[1])) : null}
                      onChange={(val) => {
                        const toDate = val ? val.toDate().toISOString().split("T")[0] : "";
                        setDateRange([dateRange[0], toDate]);
                      }}
                      calendar={persian}
                      locale={persian_fa}
                      format="YYYY/MM/DD"
                      placeholder="تاریخ پایان"
                      inputClass="w-full p-3 sm:p-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 text-center pr-10 text-sm sm:text-base"
                      calendarPosition="bottom-center"
                    />
                    <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 text-sm" />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => fetchTasks(true)}
                    disabled={loading}
                    className="w-full px-4 py-3 sm:py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px]"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">در حال بارگذاری...</span>
                        <span className="sm:hidden">بارگذاری...</span>
                      </>
                    ) : (
                      <>
                        <IoSearch className="text-lg" />
                        <span className="hidden sm:inline">اعمال فیلتر</span>
                        <span className="sm:hidden">اعمال</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setDateRange(["", ""]);
                      setFilters({
                        status: "",
                        priority: "",
                        assignedUserId: "",
                        title: "",
                        serviceRequestId: "",
                      });
                      fetchTasks(false);
                    }}
                    disabled={loading}
                    className="w-full px-4 py-3 sm:py-3.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px]"
                  >
                    <IoClose className="text-lg" />
                    <span className="hidden sm:inline">پاک کردن</span>
                    <span className="sm:hidden">پاک</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center gap-2 p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 mb-4 text-sm sm:text-base min-h-[44px]"
            >
              <IoFilter className="text-lg flex-shrink-0" />
              <span className="font-medium">فیلترهای پیشرفته</span>
              {showFilters ? (
                <IoChevronUp className="text-lg flex-shrink-0" />
              ) : (
                <IoChevronDown className="text-lg flex-shrink-0" />
              )}
            </button>

            {/* Advanced Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* Title Search */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-white/70 text-sm mb-2 font-medium">
                      جستجو در عنوان
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={filters.title}
                        onChange={(e) =>
                          setFilters({ ...filters, title: e.target.value })
                        }
                        placeholder="عنوان تسک..."
                        className="w-full p-3 sm:p-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 pr-10 text-sm sm:text-base"
                      />
                      <IoSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-white/70 text-sm mb-2 font-medium">
                      وضعیت
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                      className="w-full p-3 sm:p-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 text-sm sm:text-base"
                    >
                      <option value="" className="bg-gray-800">همه وضعیت‌ها</option>
                      <option value="todo" className="bg-gray-800">انجام نشده</option>
                      <option value="in-progress" className="bg-gray-800">در حال انجام</option>
                      <option value="review" className="bg-gray-800">در حال بررسی</option>
                      <option value="accepted" className="bg-gray-800">تایید شده</option>
                      <option value="completed" className="bg-gray-800">تکمیل شده</option>
                      <option value="cancelled" className="bg-gray-800">لغو شده</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="block text-white/70 text-sm mb-2 font-medium">
                      اولویت
                    </label>
                    <select
                      value={filters.priority}
                      onChange={(e) =>
                        setFilters({ ...filters, priority: e.target.value })
                      }
                      className="w-full p-3 sm:p-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 text-sm sm:text-base"
                    >
                      <option value="" className="bg-gray-800">همه اولویت‌ها</option>
                      <option value="low" className="bg-gray-800">کم</option>
                      <option value="medium" className="bg-gray-800">متوسط</option>
                      <option value="high" className="bg-gray-800">بالا</option>
                      <option value="urgent" className="bg-gray-800">فوری</option>
                    </select>
                  </div>

                  {/* Assigned User Filter */}
                  <div>
                    <label className="block text-white/70 text-sm mb-2 font-medium">
                      کاربر تخصیص یافته
                    </label>
                    <select
                      value={filters.assignedUserId}
                      onChange={(e) =>
                        setFilters({ ...filters, assignedUserId: e.target.value })
                      }
                      className="w-full p-3 sm:p-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 text-sm sm:text-base"
                    >
                      <option value="" className="bg-gray-800">همه کاربران</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id} className="bg-gray-800">
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>

           
                </div>

                {/* Apply Advanced Filters Button */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => fetchTasks(true)}
                    disabled={loading}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/25 text-sm sm:text-base min-h-[44px]"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">در حال اعمال فیلتر...</span>
                        <span className="sm:hidden">در حال اعمال...</span>
                      </>
                    ) : (
                      <>
                        <IoFilter className="text-lg" />
                        <span className="hidden sm:inline">اعمال فیلترهای پیشرفته</span>
                        <span className="sm:hidden">اعمال فیلترها</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Filter Status Indicator */}
        {(dateRange[0] || dateRange[1] || Object.values(filters).some((f) => f)) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-violet-500/10 backdrop-blur-sm rounded-2xl border border-purple-400/20"
          >
            <div className="flex items-center justify-center gap-3 text-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-purple-200 font-medium">
                  فیلتر فعال
                </span>
              </div>
              <span className="text-white/90">
                نمایش {tasks.length} تسک
              </span>
              {dateRange[0] && dateRange[1] && (
                <div className="flex items-center gap-2 text-white/70">
                  <FaCalendarAlt className="text-sm" />
                  <span>
                    {new Date(dateRange[0]).toLocaleDateString("fa-IR")} تا{" "}
                    {new Date(dateRange[1]).toLocaleDateString("fa-IR")}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Task Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {statusColumns.map((column, index) => {
            const totalTasks = getTotalTasksByStatus(column.id);
            const Icon = column.icon;
            return (
              <div
                key={column.id}
                ref={(el) => {
                  statisticsRefs.current[index] = el;
                }}
                className={`bg-gradient-to-br ${column.color} backdrop-blur-xl rounded-2xl p-4 border ${column.borderColor}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`${column.iconColor} text-xl`} />
                  <span className="text-2xl font-bold text-white">
                    {totalTasks}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-1">
          {statusColumns.map((column, columnIndex) => {
            const columnData = getTasksByStatus(column.id);
            const totalTasks = getTotalTasksByStatus(column.id);
            const totalPages = getTotalPagesByStatus(column.id);
            const currentPage = columnPagination[column.id as keyof typeof columnPagination]?.page || 1;
            const itemsPerPage = columnPagination[column.id as keyof typeof columnPagination]?.itemsPerPage || 10;
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
                onDoubleClick={() => setFullscreenColumnId(column.id)}
                className={`bg-gradient-to-br ${
                  column.color
                } backdrop-blur-xl rounded-2xl min-h-[360px] flex flex-col border ${
                  dragOverColumn === column.id
                    ? "border-purple-400 shadow-lg shadow-purple-400/25"
                    : column.borderColor
                } p-4 transition-all duration-300`}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`${column.iconColor} text-lg`} />
                      <h3 className={`${column.iconColor} font-semibold`}>
                        {column.title}
                      </h3>
                    </div>
                    <span className="bg-white/10 text-white/70 px-2 py-1 rounded-full text-xs">
                      {totalTasks}
                    </span>
                  </div>

                  {/* Pagination Controls */}
                  {totalTasks > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-white/60">نمایش:</span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => handleItemsPerPageChange(column.id, parseInt(e.target.value))}
                          className="bg-white/10 border rounded-md border-white/20  px-2 py-1 text-white text-xs focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value={5} className="bg-gray-800">5</option>
                          <option value={10} className="bg-gray-800">10</option>
                          <option value={20} className="bg-gray-800">20</option>
                          <option value={50} className="bg-gray-800">50</option>
                        </select>
                        <span className="text-white/60">تسک</span>
                      </div>

                      {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => changeColumnPage(column.id, currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-1 rounded ${
                              currentPage === 1
                                ? "text-white/20 cursor-not-allowed"
                                : "text-white/60 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            <IoChevronForward />
                          </button>
                          <span className="text-white/60 px-2">{currentPage}/{totalPages}</span>
                          <button
                            onClick={() => changeColumnPage(column.id, currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`p-1 rounded ${
                              currentPage === totalPages
                                ? "text-white/20 cursor-not-allowed"
                                : "text-white/60 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            <IoChevronBack />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Task Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto scrollbar-luxury">
                  {columnData.tasks.map((task: Task, taskIndex: number) => (
                    <div
                      key={task._id}
                      ref={(el) => {
                        taskRefs.current[task._id] = el;
                      }}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleTaskClick(task)}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all duration-300 cursor-move hover:bg-white/15"
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between mb-3 h-40">
                          <div className="flex items-start gap-2 w-full">
                            <input
                              type="checkbox"
                              checked={selectedTaskIds.includes(task._id)}
                              onChange={(e) => { e.stopPropagation(); toggleSelectTask(task._id); }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 mt-1 ml-2"
                            />
                            <h4 className="text-white font-medium text-sm line-clamp-2 flex-1">
                              {task.title}
                            </h4>
                          </div>
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
                                  column.id === "paid"
                                    ? "completed"
                                    : column.id === "completed"
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
                          {column.id !== "paid" && (
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
                                    : column.id === "accepted"
                                    ? "completed"
                                    : /* column.id === 'completed' */ "paid";
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

                  {columnData.tasks.length === 0 && (
                    <div className="text-center text-white/40 py-8 flex-1 flex items-center justify-center">
                      <p className="text-sm">
                        {columnData.totalCount === 0
                          ? "تسکی در این مرحله وجود ندارد"
                          : "تسک‌های این صفحه موجود نیست"}
                      </p>
                      {totalTasks > 0 && (
                        <p className="text-xs mt-1">
                          {totalTasks} تسک در صفحات دیگر موجود است
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* If user double-clicks the column, open fullscreen modal — handled globally below */}

                {/* Column Footer - Page Info */}
                {totalPages > 1 && (
                  <div className="p-3 border-t border-white/10">
                    <div className="text-center text-xs text-white/50">
                      صفحه {currentPage} از {totalPages} 
                      {totalTasks > itemsPerPage && (
                        <span className="block mt-1">
                          نمایش {((currentPage - 1) * itemsPerPage) + 1} تا {Math.min(currentPage * itemsPerPage, totalTasks)} از {totalTasks}
                        </span>
                      )}
                    </div>
                  </div>
                )}
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

        {/* Fullscreen Column Modal (shows all tasks for a status in 4-column grid) */}
        {fullscreenColumnId && (
          <div
            className="fixed mt-20  inset-0 z-999 flex items-start justify-center p-6 bg-black/90 rounded-md border-white border"
            onClick={() => setFullscreenColumnId(null)}
          >
            <div
              className="w-full h-full max-w-[1400px]  rounded-2xl overflow-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white">
                  نمایش همه تسک‌های مرحله: {statusColumns.find(c => c.id === fullscreenColumnId)?.title}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFullscreenColumnId(null)}
                    className="px-3 py-2 bg-white/10 text-white rounded-md"
                  >
                    بستن
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allTasks
                  .filter((t) => t.status === fullscreenColumnId)
                  .map((task) => (
                    <div
                      key={task._id}
                      className="bg-white/6 rounded-xl p-4 border border-white/10 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-white font-medium text-sm line-clamp-2">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${priorityConfig[task.priority].color}`}></div>
                        </div>
                      </div>

                      {task.assignedUserId && (
                        <div className="flex items-center gap-2 mb-2 text-sm text-white/80">
                          <FaUser className="text-sm text-blue-300" />
                          <span>{task.assignedUserId.name}</span>
                        </div>
                      )}

                      <p className="text-white/60 text-sm mb-3 truncate">
                        {task.serviceRequestId?.title || "بدون درخواست سرویس"}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-white/70">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString("fa-IR") : "بدون تاریخ"}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateTaskStatus(task._id, fullscreenColumnId === "paid" ? "completed" : "paid"); }}
                          className="text-xs px-2 py-1 bg-purple-600/20 rounded text-white"
                        >
                          سریع تغییر
                        </button>
                      </div>
                    </div>
                  ))}
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
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => deleteTask(selectedTask._id)}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-red-500/25"
                      title="حذف تسک"
                    >
                      <FaTrash className="text-sm" />
                      حذف
                    </button>
                    <button
                      onClick={closeTaskModal}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <IoClose size={24} />
                    </button>
                  </div>
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
                            status: "paid",
                            label: "پرداخت شده",
                            color: "bg-indigo-600",
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
