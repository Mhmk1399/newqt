"use client";

import React, { useState, useEffect } from "react";
import DynamicTable from "@/components/global/newdynamics/dynamicTable";
import DynamicForm from "@/components/global/newdynamics/dynamicForm";
import { TableColumn, FormField, FilterField } from "@/types/dynamicTypes/types";
import { motion, AnimatePresence } from "framer-motion";
import { IoAdd, IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const TasksManagement: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [users, setUsers] = useState<{_id: string, name: string, email: string}[]>([]);
  const [serviceRequests, setServiceRequests] = useState<{_id: string, title: string}[]>([]);

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

  const handleDateUpdate = async (taskId: string, field: string, value: string) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: taskId, [field]: value }),
      });

      if (response.ok) {
        toast.success("تاریخ بهروزرسانی شد");
      }
    } catch (error) {
      console.error('Error updating task date:', error);
      toast.error("خطا در بهروزرسانی تاریخ");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchServiceRequests();
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

        <div className="mb-6 flex justify-end">
          <motion.button
            onClick={() => setIsAddModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-purple-500/25"
          >
            <IoAdd className="text-xl" />
            افزودن
          </motion.button>
        </div>
      
        <DynamicTable
          columns={columns}
          data={[]}
          loading={false}
          formFields={formFields}
          endpoint="/api/tasks"
          formTitle="ویرایش تسک"
          formSubtitle="اطلاعات تسک را ویرایش کنید"
          filterFields={filterFields}
        />

        <AnimatePresence>
          {isAddModalOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
            >
              {/* Luxury Background Elements */}
              <div className="absolute inset-0 z-0">
                <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full filter blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full filter blur-3xl"></div>
              </div>
              
              <motion.div
                className="relative z-10 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl w-full max-w-4xl shadow-2xl border border-white/20"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
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
                    <button onClick={() => setIsAddModalOpen(false)}>
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
                      setIsAddModalOpen(false);
                      toast.success("تسک با موفقیت افزوده شد");
                    }}
                    onError={() => {
                      toast.error("خطا در افزودن تسک");
                    }}
                    onCancel={() => setIsAddModalOpen(false)}
                    className="bg-transparent border-0 shadow-none p-0"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TasksManagement;