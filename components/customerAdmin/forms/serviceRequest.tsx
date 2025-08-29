"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import {
  HiOutlineShoppingCart,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineExclamation,
  HiOutlineCurrencyDollar,
  HiOutlineUsers,
  HiOutlineClock,
} from "react-icons/hi";

interface Service {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  teamId: {
    _id: string;
    name: string;
    specialization: string;
  } | null;
  isActive: boolean;
  features: string[];
  estimatedDuration: number;
}

interface ServiceRequestForm {
  serviceId: string;
  title: string;
  quantity: number;
  priority: "low" | "medium" | "high" | "urgent";
  requestedDate: DateObject | null; // Changed to DateObject for Persian date
  requirements: string;
  notes: string;
}

interface Project {
  _id: string;
  title: string;
  name: string;
  description: string;
  services: Service[] | string[];
  customerId: string;
  status: string;
}

const ProjectOrderingComponent: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectServices, setProjectServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestForm[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Get customerId from token
  const getCustomerIdFromToken = (): string | null => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        console.error("No customer token found in localStorage");
        return null;
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      console.log("Decoded token:", decodedToken);

      if (decodedToken.userId) {
        return decodedToken.userId;
      } else {
        console.error("customerId not found in token payload");
        return null;
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const customerId = getCustomerIdFromToken();
      if (!customerId) {
        toast.error("خطا در احراز هویت - لطفاً دوباره وارد شوید");
        return;
      }

      const response = await fetch("/api/projects/filterdByCustomer", {
        headers: {
          customerId: customerId || "",
        },
      });
      const result = await response.json();

      if (result.success) {
        setProjects(result.data);
      } else {
        toast.error("خطا در دریافت پروژه‌ها");
      }
    } catch (error) {
      toast.error("خطا در اتصال به سرور");
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch project services when project is selected
  const fetchProjectServices = async (projectId: string) => {
    if (!projectId) {
      setProjectServices([]);
      return;
    }

    try {
      setServicesLoading(true);

      // Find the selected project
      const selectedProject = projects.find((p) => p._id === projectId);

      if (!selectedProject) {
        toast.error("پروژه انتخاب شده یافت نشد");
        setProjectServices([]);
        return;
      }

      // Check if project has services
      if (!selectedProject.services || selectedProject.services.length === 0) {
        setProjectServices([]);
        toast("این پروژه هیچ خدماتی ندارد");
        return;
      }

      // Get service IDs from project - handle both string IDs and populated objects
      const serviceIds = selectedProject.services
        .map((service) => {
          if (typeof service === "string") {
            return service;
          } else if (
            service &&
            typeof service === "object" &&
            "_id" in service
          ) {
            return service._id;
          }
          return null;
        })
        .filter(Boolean); // Remove null values

      console.log("Project service IDs:", serviceIds);

      if (serviceIds.length === 0) {
        setProjectServices([]);
        toast("هیچ خدمات معتبری برای این پروژه یافت نشد");
        return;
      }

      // Fetch services by IDs
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ serviceIds }),
      });

      const result = await response.json();
      console.log("Fetched services result:", result);

      if (result.success) {
        // Filter only active services
        const activeServices = result.data.filter(
          (service: Service) => service.isActive
        );
        setProjectServices(activeServices);

        if (activeServices.length === 0) {
          toast("هیچ خدمات فعالی برای این پروژه یافت نشد");
        } else {
          toast.success(`${activeServices.length} خدمت برای این پروژه یافت شد`);
        }
      } else {
        toast.error("خطا در دریافت خدمات پروژه");
        setProjectServices([]);
      }
    } catch (error) {
      toast.error("خطا در دریافت خدمات پروژه");
      console.error("Error fetching project services:", error);
      setProjectServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  // Handle project selection
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    // Reset selected services and requests when project changes
    setSelectedServices([]);
    setServiceRequests([]);
    // Fetch services for the selected project
    fetchProjectServices(projectId);
  };

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Update fetchProjectServices when projects are loaded
  useEffect(() => {
    if (selectedProjectId && projects.length > 0) {
      fetchProjectServices(selectedProjectId);
    }
  }, [projects, selectedProjectId]);

  // Handle service selection
  const handleServiceSelect = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      // Remove service
      setSelectedServices((prev) => prev.filter((id) => id !== serviceId));
      setServiceRequests((prev) =>
        prev.filter((req) => req.serviceId !== serviceId)
      );
    } else {
      // Add service
      setSelectedServices((prev) => [...prev, serviceId]);

      // Create default form for this service with Persian date
      const service = projectServices.find((s) => s._id === serviceId);
      const defaultForm: ServiceRequestForm = {
        serviceId,
        title: `درخواست ${service?.name || "خدمت"}`,
        quantity: 1,
        priority: "medium",
        requestedDate: null, // Initialize as null for Persian date picker
        requirements: "",
        notes: "",
      };

      setServiceRequests((prev) => [...prev, defaultForm]);
    }
  };

  // Update service request - Updated to handle DateObject
  const updateServiceRequest = (
    serviceId: string,
    field: keyof ServiceRequestForm,
    value: string | number | DateObject | null
  ) => {
    setServiceRequests((prev) =>
      prev.map((req) =>
        req.serviceId === serviceId ? { ...req, [field]: value } : req
      )
    );
  };

  // Submit form - Updated to handle Persian dates
  const handleSubmitAll = async () => {
    if (!selectedProjectId) {
      toast.error("لطفاً پروژه را انتخاب کنید");
      return;
    }

    if (serviceRequests.length === 0) {
      toast.error("لطفاً حداقل یک خدمت انتخاب کنید");
      return;
    }

    // Validate all forms
    for (const request of serviceRequests) {
      if (!request.title.trim() || !request.requirements.trim()) {
        toast.error("لطفاً تمام فیلدهای ضروری را پر کنید");
        return;
      }
    }

    const customerId = getCustomerIdFromToken();
    if (!customerId) {
      toast.error("خطا در احراز هویت - لطفاً دوباره وارد شوید");
      return;
    }

    setSubmitting(true);

    try {
      const promises = serviceRequests.map((request) => {
        // Convert Persian date to Gregorian for API submission
        const formattedRequestedDate = request.requestedDate 
          ? request.requestedDate.toDate() 
          : null;

        return fetch("/api/service-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...request,
            requestedDate: formattedRequestedDate,
            projectId: selectedProjectId,
            requestedBy: customerId,
          }),
        });
      });

      const responses = await Promise.all(promises);
      const results = await Promise.all(responses.map((res) => res.json()));

      const failedRequests = results.filter((result) => !result.success);

      if (failedRequests.length === 0) {
        toast.success(`درخواست با موفقیت ثبت شد`);
        // Reset form
        setSelectedServices([]);
        setServiceRequests([]);
        setSelectedProjectId("");
        setProjectServices([]);
      } else {
        toast.error(`درخواست با خطا مواجه شد`);
      }
    } catch (error) {
      toast.error("خطا در ثبت درخواست‌ها");
      console.error("Error submitting requests:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get priority label
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "low":
        return "کم";
      case "medium":
        return "متوسط";
      case "high":
        return "بالا";
      case "urgent":
        return "فوری";
      default:
        return "متوسط";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-blue-600 rounded-xl p-6 text-white">
        <h1 className="md:text-3xl text-lg font-bold mb-2">
          سفارش خدمات پروژه
        </h1>
        <p className="text-blue-100 text-sm md:text-lg">
          ابتدا پروژه را انتخاب کنید، سپس خدمات مربوط به آن پروژه را انتخاب کرده
          و جزئیات درخواست را تکمیل کنید
        </p>
      </div>

      {/* Project Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="md:text-xl text-lg font-bold mb-4 flex items-center">
          <HiOutlineClipboardList className="ml-2 text-blue-500" />
          انتخاب پروژه
        </h2>
        <div className="relative">
          <select
            value={selectedProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
          >
            <option value="">پروژه را انتخاب کنید</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.title || project.name}
              </option>
            ))}
          </select>
        </div>
        {selectedProjectId && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-blue-800">
                <HiOutlineCheckCircle className="w-4 h-4 ml-2" />
                <span className="font-medium">پروژه انتخاب شده:</span>
                <span className="mr-2">
                  {projects.find((p) => p._id === selectedProjectId)?.title ||
                    projects.find((p) => p._id === selectedProjectId)?.name}
                </span>
              </div>
              <div className="text-sm text-blue-600">
                {projects.find((p) => p._id === selectedProjectId)?.services
                  ?.length || 0}{" "}
                خدمت تعریف شده
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Services Loading */}
      {servicesLoading && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 ml-3"></div>
            <span className="text-gray-600">
              در حال بارگذاری خدمات پروژه...
            </span>
          </div>
        </div>
      )}

      {/* Services Grid - Only show when project is selected and services are loaded */}
      {selectedProjectId && !servicesLoading && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h2 className="md:text-xl text-lg font-bold flex items-center">
                <HiOutlineShoppingCart className="ml-2 text-green-500" />
                خدمات پروژه
              </h2>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {projectServices.length} خدمت موجود
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {selectedServices.length} انتخاب شده
                </span>
                {selectedServices.length > 0 && (
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedServices
                      .reduce((total, serviceId) => {
                        const service = projectServices.find(
                          (s) => s._id === serviceId
                        );
                        const request = serviceRequests.find(
                          (r) => r.serviceId === serviceId
                        );
                        return (
                          total +
                          (service?.basePrice || 0) * (request?.quantity || 1)
                        );
                      }, 0)
                      .toLocaleString()}{" "}
                    تومان
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              {projectServices.length > 0
                ? "خدمات زیر برای این پروژه تعریف شده‌اند. روی هر خدمت کلیک کنید تا آن را انتخاب یا حذف کنید"
                : "هیچ خدمات فعالی برای این پروژه یافت نشد"}
            </p>
          </div>

          {projectServices.length > 0 ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectServices.map((service) => {
                  const isSelected = selectedServices.includes(service._id);

                  return (
                    <div
                      key={service._id}
                      className={`group relative border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                        isSelected
                          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
                      }`}
                      onClick={() => handleServiceSelect(service._id)}
                    >
                      {/* Selection Indicator */}
                      <div className="absolute top-4 left-4 z-10">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            isSelected
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300 group-hover:border-blue-400"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Service Content */}
                      <div className="pr-2">
                        {/* Service Name */}
                        <h3 className="font-bold text-lg mb-3 text-gray-800 group-hover:text-blue-600 transition-colors">
                          {service.name}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                          {service.description ||
                            "توضیحاتی برای این خدمت ارائه نشده است"}
                        </p>

                        {/* Team Info */}
                        {service.teamId ? (
                          <div className="flex items-center mb-3 text-sm text-gray-500 bg-gray-100 rounded-lg p-2">
                            <HiOutlineUsers className="w-4 h-4 ml-2 text-blue-500" />
                            <span className="font-medium">
                              {service.teamId.name}
                            </span>
                            {service.teamId.specialization && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{service.teamId.specialization}</span>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center mb-3 text-sm text-gray-400 bg-gray-50 rounded-lg p-2">
                            <HiOutlineUsers className="w-4 h-4 ml-2" />
                            <span>تیم تعریف نشده</span>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <HiOutlineCurrencyDollar className="w-5 h-5 ml-1 text-green-500" />
                            <span className="font-bold text-lg text-green-600">
                              {service.basePrice.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500 mr-1">
                              تومان
                            </span>
                          </div>
                          {service.estimatedDuration && (
                            <div className="flex items-center text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded-full">
                              <HiOutlineClock className="w-3 h-3 ml-1" />
                              {service.estimatedDuration} روز
                            </div>
                          )}
                        </div>

                        {/* Category and Selection Status */}
                        <div className="flex items-center justify-between">
                          {service.category ? (
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                              {service.category}
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-medium">
                              دسته‌بندی نشده
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-blue-600 text-xs font-medium flex items-center">
                              <HiOutlineCheckCircle className="w-4 h-4 ml-1" />
                              انتخاب شده
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hover Effect Overlay */}
                      <div
                        className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                          isSelected
                            ? "bg-blue-500/5"
                            : "bg-transparent group-hover:bg-blue-500/5"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <HiOutlineShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  هیچ خدمات فعالی یافت نشد
                </h3>
                <p className="text-gray-500 text-sm">
                  برای این پروژه هیچ خدمات فعالی تعریف نشده است یا خدمات موجود
                  غیرفعال هستند.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Service Request Forms */}
      {selectedServices.length > 0 && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
            <h2 className="md:text-xl text-lg font-bold flex items-center mb-2">
              <HiOutlineClipboardList className="ml-2" />
              جزئیات درخواست‌ها
            </h2>
            <p className="text-purple-100 text-sm">
              لطفاً اطلاعات مورد نیاز برای هر خدمت انتخابی را تکمیل کنید
            </p>
          </div>

          {selectedServices.map((serviceId, index) => {
            const service = projectServices.find((s) => s._id === serviceId);
            const request = serviceRequests.find(
              (r) => r.serviceId === serviceId
            );

            if (!service || !request) return null;

            return (
              <div
                key={serviceId}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                {/* Form Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-white/20 rounded-full p-2 ml-3">
                        <span className="text-lg font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">
                          درخواست خدمت: {service.name}
                        </h3>
                        <p className="text-blue-100 text-sm">
                          {service.teamId?.name
                            ? `${service.teamId.name} • `
                            : "تیم نامشخص • "}
                          {service.teamId?.specialization || "تخصص نامشخص"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleServiceSelect(serviceId)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors duration-200"
                      title="حذف این خدمت"
                    >
                      <HiOutlineXCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        عنوان درخواست *
                      </label>
                      <input
                        type="text"
                        value={request.title}
                        onChange={(e) =>
                          updateServiceRequest(
                            serviceId,
                            "title",
                            e.target.value
                          )
                        }
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="عنوان درخواست را وارد کنید"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        تعداد
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateServiceRequest(
                              serviceId,
                              "quantity",
                              Math.max(1, request.quantity - 1)
                            )
                          }
                          className="p-3 border-2 border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                        >
                          <HiOutlineMinus className="w-4 h-4 text-red-500" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={request.quantity}
                          onChange={(e) =>
                            updateServiceRequest(
                              serviceId,
                              "quantity",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-24 p-3 border-2 border-gray-200 rounded-xl text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-bold"
                        />
                        <button
                          onClick={() =>
                            updateServiceRequest(
                              serviceId,
                              "quantity",
                              request.quantity + 1
                            )
                          }
                          className="p-3 border-2 border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                        >
                          <HiOutlinePlus className="w-4 h-4 text-green-500" />
                        </button>
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        اولویت
                      </label>
                      <select
                        value={request.priority}
                        onChange={(e) =>
                          updateServiceRequest(
                            serviceId,
                            "priority",
                            e.target.value as "low" | "medium" | "high" | "urgent"
                          )
                        }
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="low">کم</option>
                        <option value="medium">متوسط</option>
                        <option value="high">بالا</option>
                        <option value="urgent">فوری</option>
                      </select>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            request.priority
                          )}`}
                        >
                          <HiOutlineExclamation className="w-3 h-3 ml-1" />
                          {getPriorityLabel(request.priority)}
                        </span>
                      </div>
                    </div>

                    {/* Persian Date Picker for Requested Date */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        تاریخ تحویل مورد نظر
                      </label>
                      <div className="relative">
                        <div className="flex items-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200">
                          <FaRegCalendarAlt className="text-gray-400 w-5 h-5" />
                          <DatePicker
                            value={request.requestedDate}
                            onChange={(date) =>
                              updateServiceRequest(
                                serviceId,
                                "requestedDate",
                                date
                              )
                            }
                            calendar={persian}
                            locale={persian_fa}
                            format="YYYY/MM/DD"
                            containerClassName="w-full"
                            inputClass="w-full bg-transparent p-2 text-black focus:outline-none"
                            calendarPosition="bottom-right"
                            zIndex={1000}
                            placeholder="تاریخ تحویل مورد نظر را انتخاب کنید"
                            onOpen={() => console.log(`DatePicker opened for service ${serviceId}`)}
                            onClose={() => console.log(`DatePicker closed for service ${serviceId}`)}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          تاریخی که انتظار دارید خدمت تحویل داده شود
                        </p>
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        الزامات و توضیحات *
                      </label>
                      <div className="relative">
                        <textarea
                          value={request.requirements}
                          onChange={(e) =>
                            updateServiceRequest(
                              serviceId,
                              "requirements",
                              e.target.value
                            )
                          }
                          rows={4}
                          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                          placeholder="الزامات، توضیحات و جزئیات مورد نیاز برای این خدمت را شرح دهید..."
                          maxLength={500}
                        />
                        <div className="absolute bottom-3 left-3 text-xs text-gray-400">
                          {request.requirements.length}/500
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        یادداشت‌های اضافی
                      </label>
                      <div className="relative">
                        <textarea
                          value={request.notes}
                          onChange={(e) =>
                            updateServiceRequest(
                              serviceId,
                              "notes",
                              e.target.value
                            )
                          }
                          rows={3}
                          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                          placeholder="یادداشت‌ها و توضیحات اضافی (اختیاری)..."
                          maxLength={300}
                        />
                        <div className="absolute bottom-3 left-3 text-xs text-gray-400">
                          {request.notes.length}/300
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Summary */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <HiOutlineCurrencyDollar className="w-5 h-5 ml-2 text-green-500" />
                      خلاصه هزینه
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">
                          قیمت واحد
                        </div>
                        <div className="font-bold text-lg text-blue-600">
                          {service.basePrice.toLocaleString()} تومان
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">تعداد</div>
                        <div className="font-bold text-lg text-purple-600">
                          {request.quantity} عدد
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">
                          قیمت کل
                        </div>
                        <div className="font-bold text-lg text-green-600">
                          {(
                            service.basePrice * request.quantity
                          ).toLocaleString()}{" "}
                          تومان
                        </div>
                      </div>
                    </div>
                    {service.estimatedDuration && (
                      <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                        <div className="flex items-center text-sm text-yellow-800">
                          <HiOutlineClock className="w-4 h-4 ml-2" />
                          <span className="font-medium">مدت زمان تخمینی:</span>
                          <span className="mr-2 font-bold">
                            {service.estimatedDuration} روز
                          </span>
                        </div>
                      </div>
                    )}
                    {/* Display selected date if available */}
                    {request.requestedDate && (
                      <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
                        <div className="flex items-center text-sm text-blue-800">
                          <HiOutlineCalendar className="w-4 h-4 ml-2" />
                          <span className="font-medium">تاریخ تحویل مورد نظر:</span>
                          <span className="mr-2 font-bold">
                            {request.requestedDate.format("YYYY/MM/DD")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Summary */}
      {selectedServices.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
            <h3 className="text-xl font-bold flex items-center mb-2">
              <HiOutlineCurrencyDollar className="ml-2" />
              خلاصه سفارش
            </h3>
            <p className="text-green-100 text-sm">
              بررسی نهایی خدمات انتخابی و مبلغ کل
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {selectedServices.map((serviceId, index) => {
                const service = projectServices.find(
                  (s) => s._id === serviceId
                );
                const request = serviceRequests.find(
                  (r) => r.serviceId === serviceId
                );

                if (!service || !request) return null;

                return (
                  <div
                    key={serviceId}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">
                          {service.name}
                        </span>
                        <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500 mt-1">
                          <span>تعداد: {request.quantity}</span>
                          <span>•</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                              request.priority
                            )}`}
                          >
                            {getPriorityLabel(request.priority)}
                          </span>
                          {request.requestedDate && (
                            <>
                              <span>•</span>
                              <span className="flex items-center">
                                <HiOutlineCalendar className="w-3 h-3 ml-1" />
                                {request.requestedDate.format("YYYY/MM/DD")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg text-green-600">
                        {(
                          service.basePrice * request.quantity
                        ).toLocaleString()}{" "}
                        تومان
                      </div>
                      <div className="text-sm text-gray-500">
                        {service.basePrice.toLocaleString()} ×{" "}
                        {request.quantity}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Total */}
              <div className="border-t-2 border-gray-200 pt-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <div className="flex items-center">
                    <div className="bg-green-500 text-white rounded-full p-2 ml-3">
                      <HiOutlineCurrencyDollar className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xl font-bold text-gray-800">
                        مجموع کل
                      </span>
                      <div className="text-sm text-gray-600">
                        {selectedServices.length} خدمت انتخاب شده
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedServices
                        .reduce((total, serviceId) => {
                          const service = projectServices.find(
                            (s) => s._id === serviceId
                          );
                          const request = serviceRequests.find(
                            (r) => r.serviceId === serviceId
                          );
                          return (
                            total +
                            (service?.basePrice || 0) * (request?.quantity || 1)
                          );
                        }, 0)
                        .toLocaleString()}{" "}
                      تومان
                    </div>
                    <div className="text-sm text-gray-500">
                      شامل تمام خدمات انتخابی
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {selectedServices.length > 0 && (
        <div className="flex justify-center pb-8">
          <button
            onClick={handleSubmitAll}
            disabled={submitting || !selectedProjectId}
            className={`group relative px-12 py-4 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 ${
              submitting || !selectedProjectId
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl"
            }`}
          >
            <div className="flex items-center space-x-3 space-x-reverse">
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span className="text-lg">در حال ثبت...</span>
                </>
              ) : (
                <>
                  <HiOutlineCheckCircle className="w-6 h-6" />
                  <span className="text-lg">
                    ثبت همه درخواست‌ها ({selectedServices.length} مورد)
                  </span>
                </>
              )}
            </div>
            {!submitting && !selectedProjectId && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
                ابتدا پروژه را انتخاب کنید
              </div>
            )}
          </button>
        </div>
      )}

      {/* Empty State - No Projects */}
      {projects.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <HiOutlineClipboardList className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            هیچ پروژه‌ای یافت نشد
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            در حال حاضر پروژه‌ای برای شما تعریف نشده است. لطفاً با مدیر پروژه
            تماس بگیرید.
          </p>
        </div>
      )}

      {/* Empty State - Project Selected but No Services */}
      {selectedProjectId &&
        projectServices.length === 0 &&
        !servicesLoading && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="bg-yellow-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <HiOutlineShoppingCart className="w-12 h-12 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              هیچ خدمات فعالی برای این پروژه یافت نشد
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              پروژه انتخاب شده هنوز خدمات فعالی ندارد یا خدمات موجود غیرفعال
              هستند. لطفاً با مدیر پروژه تماس بگیرید تا خدمات مورد نیاز را تعریف
              کند.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setSelectedProjectId("");
                  setProjectServices([]);
                }}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-200"
              >
                انتخاب پروژه دیگر
              </button>
            </div>
          </div>
        )}

      {/* Project Info Display - Enhanced */}
      {selectedProjectId && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-blue-800">
              <HiOutlineCheckCircle className="w-4 h-4 ml-2" />
              <span className="font-medium">پروژه انتخاب شده:</span>
              <span className="mr-2">
                {projects.find((p) => p._id === selectedProjectId)?.title ||
                  projects.find((p) => p._id === selectedProjectId)?.name}
              </span>
            </div>
            <div className="text-sm text-blue-600">
              {projects.find((p) => p._id === selectedProjectId)?.services
                ?.length || 0}{" "}
              خدمت تعریف شده
              {projectServices.length > 0 && (
                <span className="mr-2">
                  • {projectServices.length} خدمت فعال
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectOrderingComponent;
