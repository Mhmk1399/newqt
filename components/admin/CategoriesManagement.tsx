"use client";

import React, { useState } from "react";
import DynamicTable from "@/components/global/newdynamics/dynamicTable";
import DynamicForm from "@/components/global/newdynamics/dynamicForm";
import { TableColumn, FormField, FilterField } from "@/types/dynamicTypes/types";
import { motion, AnimatePresence } from "framer-motion";
import { IoAdd, IoClose } from "react-icons/io5";
import toast from "react-hot-toast";

const CategoriesManagement: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const columns: TableColumn[] = [
    {
      key: "name",
      header: "نام دستهبندی",
      sortable: true,
    },
    {
      key: "description",
      header: "توضیحات",
      sortable: true,
      render: (value) => value || "-",
    },
    {
      key: "icon",
      header: "آیکون",
      sortable: false,
      render: (value) => value || "-",
    },
    {
      key: "isActive",
      header: "وضعیت",
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {value ? "فعال" : "غیرفعال"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "تاریخ ایجاد",
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString("fa-IR"),
    },
  ];

  const formFields: FormField[] = [
    {
      name: "name",
      label: "نام دستهبندی",
      type: "text",
      placeholder: "نام دستهبندی را وارد کنید",
      validation: [{ type: "required", message: "نام دستهبندی الزامی است" }],
    },
    {
      name: "description",
      label: "توضیحات",
      type: "textarea",
      placeholder: "توضیحات دستهبندی را وارد کنید",
    },
    {
      name: "icon",
      label: "آیکون",
      type: "text",
      placeholder: "نام آیکون را وارد کنید",
    },
    {
      name: "isActive",
      label: "وضعیت",
      type: "select",
      options: [
        { label: "فعال", value: "true" },
        { label: "غیرفعال", value: "false" },
      ],
      defaultValue: true,
    },
  ];

  const filterFields: FilterField[] = [
    {
      key: "name",
      label: "جستجو در نام",
      type: "text",
      placeholder: "نام دستهبندی را جستجو کنید...",
    },
    {
      key: "description",
      label: "جستجو در توضیحات",
      type: "text",
      placeholder: "توضیحات را جستجو کنید...",
    },
    {
      key: "isActive",
      label: "وضعیت",
      type: "select",
      options: [
        { label: "فعال", value: "true" },
        { label: "غیرفعال", value: "false" },
      ],
    },
  ];

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
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-3">مدیریت دستهبندیها</h1>
          <p className="text-white/70 text-lg">مدیریت کامل دستهبندیها با امکان جستجو، فیلتر، ویرایش و حذف</p>
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
          endpoint="/api/categories"
          formTitle="ویرایش دستهبندی"
          formSubtitle="اطلاعات دستهبندی را ویرایش کنید"
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
                      افزودن دستهبندی جدید
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
                    endpoint="/api/categories"
                    method="POST"
                    submitButtonText="افزودن دستهبندی"
                    onSuccess={() => {
                      setIsAddModalOpen(false);
                      toast.success("دستهبندی با موفقیت افزوده شد");
                    }}
                    onError={() => {
                      toast.error("خطا در افزودن دستهبندی");
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

export default CategoriesManagement;