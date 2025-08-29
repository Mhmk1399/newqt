"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiCalendar } from "react-icons/fi";

interface Project {
  _id: string;
  title: string;
  description: string;
  customerId: string;
  projectManagerId: string;
  status: string;
  services: string[];
  startDate: string;
  expectedEndDate: string;
  actualEndDate: string;
  paymentStatus: string;
  paidAmount: number;
  totalPrice: number;
  finalPrice: number;
  discount: number;
  notes: string;
  internalNotes: string;
  createdAt: string;
  updatedAt: string;
}

const ProjectsCoworker = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch("/api/coworkers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setProjects(data.data.projects || []);
      }
    } catch (error: unknown) {
      console.log(error);
      toast.error("خطا در دریافت پروژه‌ها");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "فعال";
      case "completed":
        return "تکمیل شده";
      case "pending":
        return "در انتظار";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className=" " dir="rtl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">پروژه‌های من</h2>
        <p className="text-gray-600 mt-1">مشاهده و مدیریت پروژه‌های شما</p>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            هیچ پروژه‌ای یافت نشد
          </h3>
          <p className="text-gray-500">
            شما هنوز در هیچ پروژه‌ای شرکت نکرده‌اید
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {projects.map((project) => (
            <motion.div
              key={project._id}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl   transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                  {project.title}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(
                    project.status
                  )}`}
                >
                  {getStatusText(project.status)}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-700 text-sm mb-6 leading-relaxed line-clamp-2">
                {project.description}
              </p>

              {/* Financial Info */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 font-medium">قیمت کل:</span>
                    <p className="text-gray-900 font-bold">
                      {project.totalPrice?.toLocaleString()} تومان
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">
                      قیمت نهایی:
                    </span>
                    <p className="text-gray-900 font-bold">
                      {project.finalPrice?.toLocaleString()} تومان
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">
                      پرداخت شده:
                    </span>
                    <p className="text-gray-900 font-bold">
                      {project.paidAmount?.toLocaleString()} تومان
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">تخفیف:</span>
                    <p className="text-gray-900 font-bold">
                      {project.discount?.toLocaleString()} تومان
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="bg-green-50 rounded-xl p-4 mb-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 font-medium">شروع:</span>
                    <span className="text-gray-900">
                      {new Date(project.startDate).toLocaleDateString("fa-IR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 font-medium">
                      پایان مورد انتظار:
                    </span>
                    <span className="text-gray-900">
                      {new Date(project.expectedEndDate).toLocaleDateString(
                        "fa-IR"
                      )}
                    </span>
                  </div>
                  {project.actualEndDate && (
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4 text-green-600" />
                      <span className="text-green-700 font-medium">
                        پایان واقعی:
                      </span>
                      <span className="text-gray-900">
                        {new Date(project.actualEndDate).toLocaleDateString(
                          "fa-IR"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Status */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 font-medium">وضعیت پرداخت:</span>
                <span
                  className={`px-3 py-2 rounded-lg text-sm font-semibold shadow-sm ${
                    project.paymentStatus === "paid"
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : project.paymentStatus === "pending"
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {project.paymentStatus === "paid"
                    ? "پرداخت شده"
                    : project.paymentStatus === "pending"
                    ? "در انتظار پرداخت"
                    : "پرداخت نشده"}
                </span>
              </div>

              {/* Notes */}
              {project.notes && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <span className="text-gray-600 font-medium text-sm">
                    یادداشت:
                  </span>
                  <p className="text-gray-800 text-sm mt-1">{project.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    ایجاد:{" "}
                    {new Date(project.createdAt).toLocaleDateString("fa-IR")}
                  </span>
                  <span>
                    بروزرسانی:{" "}
                    {new Date(project.updatedAt).toLocaleDateString("fa-IR")}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsCoworker;
