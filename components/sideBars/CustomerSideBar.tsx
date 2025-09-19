"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaChevronLeft, FaHome } from "react-icons/fa";
import {
  HiOutlineDocumentText,
  HiOutlineCurrencyDollar,
  HiOutlineUser,
  HiOutlineClipboardList,
  HiOutlineBookOpen,
  HiOutlineVideoCamera,
} from "react-icons/hi";
import CustomerForm from "../forms/customers/CustomerForm";
import ContractFormHidden from "../forms/ContractForm";
import UserRegisterForm from "../forms/usersAndTeams/UserRegisterForm";
import TeamForm from "../forms/usersAndTeams/TeamForm";
import ServiceForm from "../forms/ServiceForm";
import ServiceRequestForm from "../forms/ServiceRequestForm";
import TaskForm from "../forms/TaskForm";
import ProjectForm from "../forms/projectAndServices/ProjectForm";
import CustomerInfoTable from "../customerAdmin/tables/customerTable";
import ProjectOrderingComponent from "../customerAdmin/forms/serviceRequest";
import CustomerProjectsList from "../customerAdmin/tables/projectList";
import { Transactions } from "../customerAdmin/tables/transactions";
import TransBar from "../customerAdmin/tables/transBar";
type FormType =
  | "customer"
  | "contract"
  | "user-register"
  | "team"
  | "service"
  | "service-request"
  | "task"
  | "project"
  | "contracts-list"
  | "transactions"
  | "personal-info"
  | "projects-list"
  | "service-requests-list"
  | "latest-blogs"
  | "transactions"
  | "transactions-bar"
  | "latest-videos";

interface FormOption {
  id: FormType;
  label: string;
  icon: React.ReactNode;
  category: string;
  description: string;
  color: string;
}

const CustomerSideBar: React.FC = () => {
  const [activeForm, setActiveForm] = useState<FormType>("personal-info");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
      id: "personal-info",
      label: "اطلاعات شخصی",
      icon: <HiOutlineUser className="w-5 h-5" />,
      category: "مالی و حسابداری",
      description: "مدیریت اطلاعات حساب کاربری",
      color: "bg-blue-500",
    },
    // مالی و حسابداری
    {
      id: "contracts-list",
      label: "لیست قراردادها",
      icon: <HiOutlineDocumentText className="w-5 h-5" />,
      category: "مالی و حسابداری",
      description: "مشاهده و مدیریت قراردادهای شما",
      color: "bg-blue-500",
    },
    {
      id: "transactions",
      label: "تراکنش‌ها",
      icon: <HiOutlineCurrencyDollar className="w-5 h-5" />,
      category: "مالی و حسابداری",
      description: "تاریخچه پرداخت‌ها و تراکنش‌های مالی",
      color: "bg-blue-500",
    },
    {
      id: "transactions-bar",
      label: "نمودار تراکنش‌ها ",
      icon: <HiOutlineCurrencyDollar className="w-5 h-5" />,
      category: "مالی و حسابداری",
      description: " پرداخت‌ها و تراکنش‌های مالی",
      color: "bg-blue-500",
    },

    {
      id: "service-request",
      label: "درخواست سرویس",
      icon: <HiOutlineDocumentText className="w-5 h-5" />,
      category: "پروژه‌ها و خدمات",
      description: "ایجاد درخواست‌های جدید برای خدمات",
      color: "bg-green-500",
    },

    {
      id: "service-requests-list",
      label: "لیست درخواست خدمات",
      icon: <HiOutlineClipboardList className="w-5 h-5" />,
      category: "پروژه‌ها و خدمات",
      description: "پیگیری درخواست‌های خدماتی شما",
      color: "bg-green-500",
    },

    // آموزش‌ها و بلاگ‌ها
    {
      id: "latest-blogs",
      label: "آخرین بلاگ‌ها",
      icon: <HiOutlineBookOpen className="w-5 h-5" />,
      category: "آموزش‌ها و بلاگ‌ها",
      description: "مطالعه جدیدترین مقالات و راهنماها",
      color: "bg-purple-500",
    },
    {
      id: "latest-videos",
      label: "آخرین ویدیوها",
      icon: <HiOutlineVideoCamera className="w-5 h-5" />,
      category: "آموزش‌ها و بلاگ‌ها",
      description: "تماشای آموزش‌های ویدیویی جدید",
      color: "bg-purple-500",
    },
  ];

  // Group forms by category
  const groupedForms = formOptions.reduce((acc, form) => {
    if (!acc[form.category]) {
      acc[form.category] = [];
    }
    acc[form.category].push(form);
    return acc;
  }, {} as Record<string, FormOption[]>);

  const handleSuccess = (data: unknown) => {
    setMessage({ type: "success", text: "عملیات با موفقیت انجام شد!" });
    console.log("Success:", data);
    setTimeout(() => setMessage(null), 5000);
  };

  const handleError = (error: string) => {
    setMessage({ type: "error", text: error });
    console.error("Error:", error);
    setTimeout(() => setMessage(null), 8000);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderForm = () => {
    switch (activeForm) {
      case "customer":
        return <CustomerForm onSuccess={handleSuccess} onError={handleError} />;
      case "contracts-list":
        return <CustomerProjectsList />;
      case "contract":
        return (
          <ContractFormHidden onSuccess={handleSuccess} onError={handleError} />
        );
      case "project":
        return <ProjectForm onSuccess={handleSuccess} onError={handleError} />;
      case "user-register":
        return (
          <UserRegisterForm onSuccess={handleSuccess} onError={handleError} />
        );
      case "team":
        return <TeamForm onSuccess={handleSuccess} onError={handleError} />;
      case "service":
        return <ServiceForm onSuccess={handleSuccess} onError={handleError} />;
      case "service-request":
        return (
          <ServiceRequestForm onSuccess={handleSuccess} onError={handleError} />
        );
      case "task":
        return <TaskForm onSuccess={handleSuccess} onError={handleError} />;
      case "service-requests-list":
        return <ProjectOrderingComponent />;
      case "transactions-bar":
        return <TransBar />;
      case "contracts-list":
        return (
          <div className="text-center p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              📋
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              لیست قراردادها
            </h3>
            <p className="text-gray-500">
              در اینجا می‌توانید تمام قراردادهای خود را مشاهده کنید
            </p>
          </div>
        );
      case "transactions":
        return <Transactions />;
      case "personal-info":
        return <CustomerInfoTable />;
      case "projects-list":
        return (
          <div className="text-center p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              🚀
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              پروژه‌های شما
            </h3>
            <p className="text-gray-500">
              مشاهده پروژه‌های در حال اجرا و تکمیل شده
            </p>
          </div>
        );
      case "service-requests-list":
        return (
          <div className="text-center p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              📝
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              درخواست‌های خدماتی
            </h3>
            <p className="text-gray-500">پیگیری درخواست‌های خدماتی شما</p>
          </div>
        );
      case "latest-blogs":
        return (
          <div className="text-center p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              📚
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              آخرین مقالات
            </h3>
            <p className="text-gray-500">مطالعه جدیدترین مقالات و راهنماها</p>
          </div>
        );
      case "latest-videos":
        return (
          <div className="text-center p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              🎥
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              آخرین ویدیوها
            </h3>
            <p className="text-gray-500">تماشای آموزش‌های ویدیویی جدید</p>
          </div>
        );
      default:
        return (
          <div className="text-center p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              🏠
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              خوش آمدید
            </h3>
            <p className="text-gray-500">
              یکی از گزینه‌های موجود در نوار کناری را انتخاب کنید
            </p>
          </div>
        );
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
    <div className="flex h-screen " dir="rtl">
      {/* Backdrop */}
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

      {/* Animated Sidebar */}
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
            {/* Header */}
            <motion.div
              variants={itemVariants}
              className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">پنل مشتری</h1>
                  <p className="text-blue-100 text-sm mt-1">
                    مدیریت حساب کاربری و خدمات
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

            {/* Navigation Items */}
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
                            ? "bg-green-500"
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
                            if (window.innerWidth < 1024) {
                              setIsSidebarOpen(false);
                            }
                          }}
                          className={`w-full text-right p-4 rounded-xl transition-all duration-300 group ${
                            activeForm === form.id
                              ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md"
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
                                    ? "text-blue-700"
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
                                className="w-2 h-2 bg-blue-500 rounded-full mr-2"
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

            {/* Footer */}
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

      {/* Main Content */}
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
              <div className="flex items-center gap-2 text-[10px] text-nowrap text-gray-500">
                <button
                  onClick={() => setActiveForm("customer")}
                  className="hover:text-gray-700 transition-colors"
                >
                  پنل مشتری
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

          {/* Message Display */}
          {/* <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                className={`mb-6 p-4 rounded-xl border-r-4 ${
                  message.type === "success"
                    ? "bg-green-50 border-green-400 text-green-700"
                    : "bg-red-50 border-red-400 text-red-700"
                }`}
              >
                <div className="flex items-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                    className="mr-3"
                  >
                    {message.type === "success" ? "✅" : "❌"}
                  </motion.div>
                  <p className="font-medium">{message.text}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence> */}

          {/* Form Content */}
          <motion.div
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
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

export default CustomerSideBar;
