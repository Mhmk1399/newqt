"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaChevronLeft, FaHome } from "react-icons/fa";
import { HiOutlineUser, HiOutlineBriefcase } from "react-icons/hi";
import ProfileInfo from "../coworker/forms/profileInfo";
import ProjectsCoworker from "../coworker/tables/projectsCoworker";

type FormType = "profile" | "projects-list";

interface FormOption {
  id: FormType;
  label: string;
  icon: React.ReactNode;
  category: string;
  description: string;
  color: string;
}

const CoWorkerSideBar: React.FC = () => {
  const [activeForm, setActiveForm] = useState<FormType>("profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && formOptions.some((option) => option.id === hash)) {
        setActiveForm(hash as FormType);
      }
    };

    // Set initial form from URL hash
    handleHashChange();

    // Listen for hash changes (back/forward navigation)
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Update URL hash when activeForm changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.hash = activeForm;
    }
  }, [activeForm]);

  const formOptions: FormOption[] = [
    {
      id: "profile",
      label: "پروفایل من",
      icon: <HiOutlineUser className="w-5 h-5" />,
      category: "پروفایل و اطلاعات",
      description: "مشاهده و ویرایش اطلاعات شخصی",
      color: "bg-blue-500",
    },
    {
      id: "projects-list",
      label: "پروژه‌های من",
      icon: <HiOutlineBriefcase className="w-5 h-5" />,
      category: "پروژهها و کار",
      description: "مشاهده پروژههای جاری و تکمیل شده",
      color: "bg-pink-500",
    },
  ];

  const groupedForms = formOptions.reduce((acc, form) => {
    if (!acc[form.category]) {
      acc[form.category] = [];
    }
    acc[form.category].push(form);
    return acc;
  }, {} as Record<string, FormOption[]>);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderForm = () => {
    switch (activeForm) {
      case "profile":
        return <ProfileInfo />;
      case "projects-list":
        return <ProjectsCoworker />;
      default:
        return <ProfileInfo />;
    }
  };

  const itemVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 30 },
    },
    closed: {
      x: 50,
      opacity: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 30 },
    },
  };

  const currentForm = formOptions.find((f) => f.id === activeForm);

  return (
    <div className="flex h-screen" dir="rtl">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            transition={{
              type: "spring" as const,
              stiffness: 300,
              damping: 30,
            }}
            className="fixed lg:relative w-80 bg-white shadow-2xl overflow-y-auto z-40 h-full"
          >
            <motion.div
              variants={itemVariants}
              className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">پنل همکار</h1>
                  <p className="text-green-100 text-sm mt-1">
                    مدیریت پروژهها و فعالیتهای کاری
                  </p>
                </div>
                <motion.button
                  onClick={() => (window.location.href = "/")}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-white p-2 rounded-lg hover:bg-white/20 transition-colors flex flex-col items-center gap-1"
                >
                  <FaHome className="w-6 h-6" />
                  <span className="text-xs">بازگشت به سایت</span>
                </motion.button>
              </div>
            </motion.div>

            <div className="p-4">
              {Object.entries(groupedForms).map(
                ([category, forms], categoryIndex) => (
                  <motion.div
                    key={category}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                    className="mb-6"
                  >
                    <div className="flex items-center mb-3">
                      <div
                        className={`w-3 h-3 rounded-full ml-2 ${
                          categoryIndex === 0
                            ? "bg-blue-500"
                            : categoryIndex === 1
                            ? "bg-pink-500"
                            : "bg-purple-500"
                        }`}
                      />
                      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        {category}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {forms.map((form, index) => (
                        <motion.button
                          key={form.id}
                          onClick={() => {
                            setActiveForm(form.id);
                            window.location.hash = form.id;
                            toggleSidebar();
                          }}
                          className={`w-full text-right p-4 rounded-xl cursor-pointer transition-all duration-300 group ${
                            activeForm === form.id
                              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-md"
                              : "hover:bg-gray-50 border-2 border-transparent hover:border-gray-200"
                          }`}
                          whileHover={{ scale: 1.02, x: -5 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: categoryIndex * 0.1 + index * 0.05,
                          }}
                        >
                          <div className="flex items-center">
                            <motion.div
                              className={`p-2 rounded-lg ml-3 ${
                                activeForm === form.id
                                  ? form.color + " text-white shadow-lg"
                                  : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                              }`}
                              whileHover={{ rotate: 5 }}
                            >
                              {form.icon}
                            </motion.div>
                            <div className="text-right flex-1">
                              <div
                                className={`font-medium text-sm ${
                                  activeForm === form.id
                                    ? "text-green-700"
                                    : "text-gray-700"
                                }`}
                              >
                                {form.label}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {form.description}
                              </div>
                            </div>
                            {activeForm === form.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-2 h-2 bg-green-500 rounded-full mr-2"
                              />
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )
              )}
            </div>

            <motion.div
              variants={itemVariants}
              className="p-4 border-t border-gray-200 bg-gray-50"
            >
              <div className="text-center text-xs text-gray-500">
                <p>نسخه ۱.۰.۰</p>
                <p className="mt-1">© {new Date().getFullYear()} QT studio</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="flex-1 bg-white overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="py-6 px-2">
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-start gap-4">
              <div className="flex items-center">
                <motion.div
                  className={`p-3 rounded-xl ml-1 md:ml-4 cursor-pointer ${
                    currentForm?.color || "bg-green-500"
                  } text-white shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  onClick={toggleSidebar}
                >
                  {currentForm?.icon || <FaUser className="w-6 h-6" />}
                </motion.div>
                <div>
                  <h2 className="md:text-3xl font-bold text-gray-900">
                    {currentForm?.label || "خوش آمدید"}
                  </h2>
                  <p className="text-gray-600 hidden md:block mt-1">
                    {currentForm?.description ||
                      "یکی از گزینههای موجود را انتخاب کنید"}
                  </p>
                </div>
              </div>
              {/* Breadcrumb */}

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <button
                  onClick={() => setActiveForm("profile")}
                  className="hover:text-gray-700 transition-colors"
                >
                  پنل همکار
                </button>
                <FaChevronLeft className="w-3 h-3" />
                <button
                  onClick={() => {
                    const categoryForms = formOptions.filter(
                      (f) => f.category === currentForm?.category
                    );
                    if (categoryForms.length > 0) {
                      setActiveForm(categoryForms[0].id);
                    }
                  }}
                  className="hover:text-gray-700 transition-colors"
                >
                  {currentForm?.category}
                </button>
                <FaChevronLeft className="w-3 h-3" />
                <span className="text-gray-900">{currentForm?.label}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="p-6">{renderForm()}</div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CoWorkerSideBar;
