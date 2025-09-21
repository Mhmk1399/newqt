"use client";

import React, { useState, useEffect } from "react";
import DynamicTable from "@/components/global/newdynamics/dynamicTable";
import { TableColumn, TableData, FormField, FilterField } from "@/types/dynamicTypes/types";
import toast from "react-hot-toast";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const TasksManagement: React.FC = () => {
  const [tasks, setTasks] = useState<TableData[]>([]);
  const [users, setUsers] = useState<{_id: string, name: string, email: string}[]>([]);
  const [serviceRequests, setServiceRequests] = useState<{_id: string, title: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const columns: TableColumn[] = [
    {
      key: "title",
      header: "عنوان تسک",
      sortable: true,
    },
    {
      key: "serviceRequestId",
      header: "درخواست سرویس",
      sortable: false,
      render: (value) => {
        if (typeof value === 'object' && value && 'title' in value) {
          return (value as Record<string, unknown>).title as string;
        }
        return value || "-";
      },
    },
    {
      key: "assignedUserId",
      header: "تخصیص یافته به",
      sortable: false,
      render: (value) => {
        if (typeof value === 'object' && value && 'name' in value) {
          return (value as Record<string, unknown>).name as string;
        }
        return value || "-";
      },
    },
    {
      key: "status",
      header: "وضعیت",
      sortable: true,
      render: (value) => {
        const statusMap: { [key: string]: { label: string, color: string } } = {
          todo: { label: "انجام نشده", color: "bg-gray-100 text-gray-800" },
          "in-progress": { label: "در حال انجام", color: "bg-blue-100 text-blue-800" },
          review: { label: "بررسی", color: "bg-yellow-100 text-yellow-800" },
          completed: { label: "تکمیل شده", color: "bg-green-100 text-green-800" },
          cancelled: { label: "لغو شده", color: "bg-red-100 text-red-800" }
        };
        const status = statusMap[value as string] || { label: value, color: "bg-gray-100 text-gray-800" };
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
            {status.label}
          </span>
        );
      },
    },
    {
      key: "priority",
      header: "اولویت",
      sortable: true,
      render: (value) => {
        const priorityMap: { [key: string]: { label: string, color: string } } = {
          low: { label: "کم", color: "bg-gray-100 text-gray-800" },
          medium: { label: "متوسط", color: "bg-blue-100 text-blue-800" },
          high: { label: "بالا", color: "bg-orange-100 text-orange-800" },
          urgent: { label: "فوری", color: "bg-red-100 text-red-800" }
        };
        const priority = priorityMap[value as string] || { label: value, color: "bg-gray-100 text-gray-800" };
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${priority.color}`}>
            {priority.label}
          </span>
        );
      },
    },
    {
      key: "startDate",
      header: "تاریخ شروع",
      sortable: true,
      render: (value, row) => {
        return (
          <div className="relative">
            <DatePicker
              value={value ? new DateObject(new Date(value as string)) : null}
              onChange={(val) => {
                const dateValue = val ? val.toDate().toISOString().split('T')[0] : '';
                handleDateUpdate(row?._id as string, 'startDate', dateValue);
              }}
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              placeholder="انتخاب تاریخ"
              inputClass="bg-transparent border border-white/20 rounded px-2 py-1 text-xs text-white/90 placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-purple-400/50 w-24"
              calendarPosition="bottom-center"
              containerClassName="w-full"
              portalTarget={document.body}
              className=" fixed"
            />
          </div>
        );
      },
    },
    {
      key: "dueDate",
      header: "تاریخ سررسید",
      sortable: true,
      render: (value, row) => {
        return (
          <div className="relative">
            <DatePicker
              value={value ? new DateObject(new Date(value as string)) : null}
              onChange={(val) => {
                const dateValue = val ? val.toDate().toISOString().split('T')[0] : '';
                handleDateUpdate(row?._id as string, 'dueDate', dateValue);
              }}
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              placeholder="انتخاب تاریخ"
              inputClass="bg-transparent border border-white/20 rounded px-2 py-1 text-xs text-white/90 placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-purple-400/50 w-24"
              calendarPosition="bottom-center"
              containerClassName="w-full"
              portalTarget={document.body}
              className="z-[9999]"
            />
          </div>
        );
      },
    },
    {
      key: "completedDate",
      header: "تاریخ تکمیل",
      sortable: true,
      render: (value) => value ? new Date(value as string).toLocaleDateString("fa-IR") : "-",
    },
    {
      key: "description",
      header: "توضیحات",
      sortable: false,
      render: (value) => {
        const text = value as string || "-";
        return (
          <div className="max-w-xs truncate" title={text}>
            {text.length > 50 ? `${text.substring(0, 50)}...` : text}
          </div>
        );
      },
    },
  ];

  const formFields: FormField[] = [
    {
      name: "title",
      label: "عنوان تسک",
      type: "text",
      placeholder: "عنوان تسک را وارد کنید",
      validation: [{ type: "required", message: "عنوان تسک الزامی است" }],
    },
    {
      name: "serviceRequestId",
      label: "درخواست سرویس",
      type: "select",
      placeholder: "درخواست سرویس را انتخاب کنید",
      options: serviceRequests.map(sr => ({ label: sr.title, value: sr._id })),
      validation: [{ type: "required", message: "درخواست سرویس الزامی است" }],
    },
    {
      name: "assignedUserId",
      label: "تخصیص به کاربر",
      type: "select",
      placeholder: "کاربر را انتخاب کنید",
      options: users.map(user => ({ label: user.name, value: user._id })),
    },
    {
      name: "description",
      label: "توضیحات",
      type: "textarea",
      placeholder: "توضیحات تسک را وارد کنید",
      validation: [{ type: "required", message: "توضیحات الزامی است" }],
    },
    {
      name: "status",
      label: "وضعیت",
      type: "select",
      options: [
        { label: "انجام نشده", value: "todo" },
        { label: "در حال انجام", value: "in-progress" },
        { label: "بررسی", value: "review" },
        { label: "تکمیل شده", value: "completed" },
        { label: "لغو شده", value: "cancelled" },
      ],
      defaultValue: "todo",
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
      label: "یادداشتها",
      type: "textarea",
      placeholder: "یادداشتهای اضافی را وارد کنید",
    },
    {
      name: "deliverables",
      label: "تحویلات",
      type: "textarea",
      placeholder: "تحویلات مورد انتظار را وارد کنید",
    },
  ];

  const filterFields: FilterField[] = [
    {
      key: "title",
      label: "جستجو در عنوان",
      type: "text",
      placeholder: "عنوان تسک را جستجو کنید...",
    },
    {
      key: "status",
      label: "وضعیت",
      type: "select",
      options: [
        { label: "انجام نشده", value: "todo" },
        { label: "در حال انجام", value: "in-progress" },
        { label: "بررسی", value: "review" },
        { label: "تکمیل شده", value: "completed" },
        { label: "لغو شده", value: "cancelled" },
      ],
    },
    {
      key: "priority",
      label: "اولویت",
      type: "select",
      options: [
        { label: "کم", value: "low" },
        { label: "متوسط", value: "medium" },
        { label: "بالا", value: "high" },
        { label: "فوری", value: "urgent" },
      ],
    },
    {
      key: "assignedUserId",
      label: "تخصیص یافته به",
      type: "select",
      options: users.map(user => ({ label: user.name, value: user._id })),
    },
  ];

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users?dropdown=true');
      const result = await response.json();
      if (result.success) {
        setUsers(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchServiceRequests = async () => {
    try {
      const response = await fetch('/api/serviceRequests');
      const result = await response.json();
      if (result.success) {
        setServiceRequests(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching service requests:', error);
    }
  };

  const fetchTasks = async (page = 1, filters: Record<string, string> = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        ...filters,
      });

      const response = await fetch(`/api/tasks?${params}`);
      const result = await response.json();

      if (result.success) {
        setTasks(result.data || []);
        setPagination(result.pagination || pagination);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateUpdate = async (taskId: string, field: string, value: string) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: taskId, [field]: value }),
      });

      if (response.ok) {
        fetchTasks(pagination.currentPage);
      }
    } catch (error) {
      console.error('Error updating task date:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: "DELETE",
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success("تسک با موفقیت حذف شد");
        fetchTasks();
      } else {
        toast.error(result.message || "خطا در حذف تسک");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("خطا در حذف تسک");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchServiceRequests();
    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] relative overflow-hidden" dir="rtl">
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="relative z-10 p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-3">مدیریت تسکها</h1>
          <p className="text-white/70 text-lg">مدیریت کامل تسکها با امکان جستجو، فیلتر، ویرایش و تخصیص</p>
        </div>
      
        <DynamicTable
          columns={columns}
          data={tasks}
          loading={loading}
          formFields={formFields}
          endpoint="/api/tasks"
          formTitle="ویرایش تسک"
          formSubtitle="اطلاعات تسک را ویرایش کنید"
          onRefresh={() => fetchTasks()}
          onDelete={handleDelete}
          pagination={pagination}
          onPageChange={(page) => fetchTasks(page)}
          filterFields={filterFields}
          onFilterChange={(filters) => {
            const stringFilters: Record<string, string> = {};
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                stringFilters[key] = String(value);
              }
            });
            fetchTasks(1, stringFilters);
          }}
        />
      </div>
    </div>
  );
};

export default TasksManagement;