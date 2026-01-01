"use client";

import React, { useState, useEffect } from "react";
import DynamicTable from "@/components/global/newdynamics/dynamicTable";
import DynamicForm from "@/components/global/newdynamics/dynamicForm";
import { TableColumn, FormField, FilterField } from "@/types/dynamicTypes/types";
import { motion, AnimatePresence } from "framer-motion";
import { IoAdd, IoClose, IoPersonAdd } from "react-icons/io5";
import toast from "react-hot-toast";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const ServiceRequestsManagement: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [users, setUsers] = useState<{_id: string, name: string, email: string}[]>([]);
  const [services, setServices] = useState<{_id: string, name: string}[]>([]);
  const [customers, setCustomers] = useState<{_id: string, name: string}[]>([]);
  const [customersPage, setCustomersPage] = useState(1);
  const [hasMoreCustomers, setHasMoreCustomers] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [assignmentModal, setAssignmentModal] = useState<{isOpen: boolean, serviceRequestId: string | null}>({isOpen: false, serviceRequestId: null});

  const columns: TableColumn[] = [
    {
      key: "title",
      header: "عنوان درخواست",
      sortable: true,
    },
    {
      key: "serviceId",
      header: "سرویس",
      sortable: false,
      render: (value) => {
        if (typeof value === 'object' && value && 'name' in value) {
          return (value as Record<string, unknown>).name as string;
        }
        return value || "-";
      },
    },
    {
      key: "requestedBy",
      header: "درخواست کننده",
      sortable: false,
      render: (value) => {
        if (typeof value === 'object' && value && 'name' in value) {
          return (value as Record<string, unknown>).name as string;
        }
        return value || "-";
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
      key: "status",
      header: "وضعیت",
      sortable: true,
      render: (value) => {
        const statusMap: { [key: string]: { label: string, color: string } } = {
          pending: { label: "در انتظار", color: "bg-yellow-100 text-yellow-800" },
          approved: { label: "تایید شده", color: "bg-green-100 text-green-800" },
          "in-progress": { label: "در حال انجام", color: "bg-blue-100 text-blue-800" },
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
      key: "asiginedto",
      header: "تخصیص یافته به",
      sortable: false,
      render: (value) => {
        if (Array.isArray(value) && value.length > 0) {
          return value.map((user: Record<string, unknown> | string) => 
            typeof user === 'object' && user && 'name' in user ? user.name as string : user
          ).join(", ");
        }
        return "-";
      },
    },
    {
      key: "requestedDate",
      header: "تاریخ درخواست",
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString("fa-IR"),
    },
    {
      key: "scheduledDate",
      header: "تاریخ برنامهریزی",
      sortable: true,
      render: (value, row) => {
        return (
          <div className="relative">
            <DatePicker
              value={value ? new DateObject(new Date(value as string)) : null}
              onChange={(val) => {
                const dateValue = val ? val.toDate().toISOString().split('T')[0] : '';
                handleScheduledDateUpdate(row?._id as string, dateValue);
              }}
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              placeholder="انتخاب تاریخ"
              inputClass="bg-transparent border border-white/20 rounded px-2 py-1 text-xs text-white/90 placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-purple-400/50 w-24"
              calendarPosition="bottom-center"
              containerClassName="w-fit "
              portalTarget={document.body}
              className="z-[9999]"
            />
          </div>
        );
      },
    },
    {
      key: "requirements",
      header: "الزامات",
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
    {
      key: "notes",
      header: "یادداشتها",
      sortable: false,
      render: (value) => {
        const text = value as string || "-";
        return (
          <div className="max-w-xs truncate" title={text}>
            {text.length > 30 ? `${text.substring(0, 30)}...` : text}
          </div>
        );
      },
    },
  ];

  const formFields: FormField[] = [
    {
      name: "title",
      label: "عنوان درخواست",
      type: "text",
      placeholder: "عنوان درخواست را وارد کنید",
      validation: [{ type: "required", message: "عنوان درخواست الزامی است" }],
    },
    {
      name: "serviceId",
      label: "سرویس",
      type: "select",
      placeholder: "سرویس را انتخاب کنید",
      options: services.map(service => ({ label: service.name, value: service._id })),
      validation: [{ type: "required", message: "سرویس الزامی است" }],
    },
    {
      name: "requestedBy",
      label: "درخواست کننده",
      type: "select",
      placeholder: "مشتری را انتخاب کنید",
      options: customers.map(customer => ({ label: customer.name, value: customer._id })),
      onScroll: (e: React.UIEvent<HTMLSelectElement>) => {
        const target = e.target as HTMLSelectElement;
        const scrolledToBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
        if (scrolledToBottom && hasMoreCustomers && !loadingCustomers) {
          loadMoreCustomers();
        }
      },
    },
    {
      name: "quantity",
      label: "تعداد",
      type: "number",
      placeholder: "تعداد را وارد کنید",
      defaultValue: 1,
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
      name: "status",
      label: "وضعیت",
      type: "select",
      options: [
        { label: "در انتظار", value: "pending" },
        { label: "تایید شده", value: "approved" },
        { label: "در حال انجام", value: "in-progress" },
        { label: "تکمیل شده", value: "completed" },
        { label: "لغو شده", value: "cancelled" },
      ],
      defaultValue: "pending",
    },
    {
      name: "requestedDate",
      label: "تاریخ درخواست",
      type: "date",
      validation: [{ type: "required", message: "تاریخ درخواست الزامی است" }],
    },
    {
      name: "scheduledDate",
      label: "تاریخ برنامهریزی شده",
      type: "date",
    },
    {
      name: "requirements",
      label: "الزامات",
      type: "textarea",
      placeholder: "الزامات درخواست را وارد کنید",
      validation: [{ type: "required", message: "الزامات الزامی است" }],
    },
    {
      name: "notes",
      label: "یادداشتها",
      type: "textarea",
      placeholder: "یادداشتهای اضافی را وارد کنید",
    },
  ];

  const filterFields: FilterField[] = [
    {
      key: "title",
      label: "جستجو در عنوان",
      type: "text",
      placeholder: "عنوان درخواست را جستجو کنید...",
    },
    {
      key: "requirements",
      label: "جستجو در الزامات",
      type: "text",
      placeholder: "الزامات را جستجو کنید...",
    },
    {
      key: "status",
      label: "وضعیت",
      type: "select",
      options: [
        { label: "در انتظار", value: "pending" },
        { label: "تایید شده", value: "approved" },
        { label: "در حال انجام", value: "in-progress" },
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

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services?limit=9999');
      const result = await response.json();
      if (result.success) {
        setServices(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchCustomers = async (page: number = 1, append: boolean = false) => {
    if (loadingCustomers) return;
    
    try {
      setLoadingCustomers(true);
      const response = await fetch(`/api/customers?page=${page}&limit=20`);
      const result = await response.json();
      if (result.success) {
        const newCustomers = result.data || [];
        setCustomers(prev => append ? [...prev, ...newCustomers] : newCustomers);
        setHasMoreCustomers(newCustomers.length === 20);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadMoreCustomers = () => {
    if (hasMoreCustomers && !loadingCustomers) {
      const nextPage = customersPage + 1;
      setCustomersPage(nextPage);
      fetchCustomers(nextPage, true);
    }
  };

  const openAssignmentModal = (serviceRequestId: string) => {
    setAssignmentModal({isOpen: true, serviceRequestId});
  };

  const closeAssignmentModal = () => {
    setAssignmentModal({isOpen: false, serviceRequestId: null});
  };

  const handleScheduledDateUpdate = async (serviceRequestId: string, newDate: string) => {
    try {
      const response = await fetch("/api/serviceRequests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: serviceRequestId, scheduledDate: newDate || null }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        toast.success("تاریخ برنامهریزی بهروزرسانی شد");
      } else {
        toast.error(result.message || "خطا در بهروزرسانی تاریخ");
      }
    } catch (error) {
      console.error("Error updating scheduled date:", error);
      toast.error("خطا در بهروزرسانی تاریخ");
    }
  };

  const handleAssignUser = async (userId: string) => {
    if (!assignmentModal.serviceRequestId) return;
    
    try {
      const response = await fetch("/api/serviceRequests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: assignmentModal.serviceRequestId, asiginedto: [userId] }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        const user = users.find(u => u._id === userId);
        toast.success(`کاربر ${user?.name} تخصیص یافت`);
      } else {
        toast.error(result.message || "خطا در تخصیص کاربر");
      }
    } catch (error) {
      console.error("Error assigning user:", error);
      toast.error("خطا در تخصیص کاربر");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchServices();
    fetchCustomers();
  }, []);

  // Custom actions for the table
  const customActions = (row: Record<string, unknown>) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        openAssignmentModal(row._id as string);
      }}
      className="text-purple-500 hover:text-purple-700 ml-2"
      title="تخصیص کاربر"
    >
      <IoPersonAdd size={18} />
    </button>
  );

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
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-3">مدیریت درخواست های سرویس</h1>
          <p className="text-white/70 text-lg">مدیریت کامل درخواست های سرویس با امکان جستجو، فیلتر، ویرایش و تخصیص</p>
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
          endpoint="/api/serviceRequests"
          formTitle="ویرایش درخواست سرویس"
          formSubtitle="اطلاعات درخواست سرویس را ویرایش کنید"
          filterFields={filterFields}
          customActions={customActions}
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
                      افزودن درخواست سرویس جدید
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
                    endpoint="/api/serviceRequests"
                    method="POST"
                    submitButtonText="افزودن درخواست سرویس"
                    onSuccess={() => {
                      setIsAddModalOpen(false);
                      toast.success("درخواست سرویس با موفقیت افزوده شد");
                    }}
                    onError={() => {
                      toast.error("خطا در افزودن درخواست سرویس");
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
      
      {/* Assignment Modal */}
      {assignmentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014]">
          {/* Luxury Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full filter blur-3xl"></div>
          </div>
          
          <div 
            className="absolute inset-0 z-10" 
            onClick={closeAssignmentModal}
          />
          
          <div className="relative z-20 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-md p-8"
            style={{
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
            }}
          >
            {/* Decorative corner elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-tr-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/20 to-transparent rounded-bl-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center border-b border-white/20 pb-4 mb-6">
                <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text">
                  تخصیص کاربر
                </h3>
                <button onClick={closeAssignmentModal} className="text-white/70 hover:text-white transition-colors">
                  ×
                </button>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleAssignUser(user._id)}
                    className="w-full text-right px-4 py-3 rounded-xl transition-all duration-200 bg-white/10 text-white/90 border border-white/20 hover:bg-white/20"
                  >
                    <div className="flex justify-between items-center">
                      <span>{user.name}</span>
                    </div>
                    <div className="text-sm text-white/60 text-right">{user.email}</div>
                  </button>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeAssignmentModal}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRequestsManagement;