"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStar,
  FaCalendarAlt,
  FaStickyNote,
  FaHashtag,
  FaEdit,
  FaExclamationTriangle,
  FaDollarSign,
} from "react-icons/fa";
import { IoSparkles, IoClose } from "react-icons/io5";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface DecodedToken {
  userId: string;
  phoneNumber: string;
  name: string;
  userType: "user" | "customer" | "coworker" | "admin";
  exp: number;
}

interface ServiceOption {
  key: string;
  values: string;
  images?: string[];
}

interface Service {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  isVip: boolean;
  isActive: boolean;
  teamId: {
    _id: string;
    name: string;
  };
  options?: ServiceOption[];
  requieredFileds?: string[];
  createdAt: string;
  updatedAt: string;
}

// Type for dynamic field values that can be stored in dynamicFields
type DynamicFieldValue = string | Date | null | undefined;

interface ServiceRequestData {
  serviceId: string;
  quantity: number;
  scheduledDate?: Date;
  notes: string;
  dynamicFields: Record<string, DynamicFieldValue>;
}

const LuxuryServiceRequest: React.FC = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);

  const [formData, setFormData] = useState<ServiceRequestData>({
    serviceId: "",
    quantity: 1,
    scheduledDate: undefined,
    notes: "",
    dynamicFields: {},
  });

  // Extract user info from token
  useEffect(() => {
    const extractUserFromToken = () => {
      try {
        const token =
          localStorage.getItem("userToken") || localStorage.getItem("token");

        if (!token) {
          toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
          router.push("/auth");
          return;
        }

        const decoded = JSON.parse(atob(token.split(".")[1])) as DecodedToken;

        if (decoded.exp && decoded.exp < Date.now() / 1000) {
          toast.error("جلسه شما منقضی شده است. لطفا مجدداً وارد شوید");
          localStorage.removeItem("userToken");
          localStorage.removeItem("token");
          router.push("/auth");
          return;
        }

        setUserInfo(decoded);
      } catch (error) {
        console.error("Error decoding token:", error);
        toast.error("خطا در تشخیص هویت. لطفا مجدداً وارد شوید");
        router.push("/auth");
      }
    };

    extractUserFromToken();
  }, [router]);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      if (!userInfo?.userId) return;

      setLoading(true);
      try {
        const token =
          localStorage.getItem("userToken") || localStorage.getItem("token");
        const response = await fetch("/api/services?isActive=true&limit=100", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (result.success) {
          setServices(result.data || []);
        } else {
          console.error("Services API error:", result);
          toast.error("خطا در دریافت سرویس‌ها");
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("خطا در دریافت اطلاعات");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [userInfo]);

  // Handle service selection
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setFormData({
      serviceId: service._id,
      quantity: 1,
      scheduledDate: undefined,
      notes: "",
      dynamicFields: {},
    });
    setShowRequestForm(true);
  };

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!selectedService || !userInfo?.userId) return;

    // Validate required fields
    const missingFields =
      selectedService.requieredFileds?.filter((field) => {
        const fieldValue = formData.dynamicFields[field];
        return (
          !fieldValue ||
          (typeof fieldValue === "string" && fieldValue.trim() === "")
        );
      }) || [];

    if (missingFields.length > 0) {
      toast.error(`لطفا فیلدهای زیر را پر کنید: ${missingFields.join(", ")}`);
      return;
    }

    setSubmitting(true);
    try {
      const token =
        localStorage.getItem("userToken") || localStorage.getItem("token");

      // Prepare request data
      const requestData = {
        title: `${selectedService.name} - ${formData.quantity} عدد`,
        serviceId: formData.serviceId,
        quantity: formData.quantity,
        scheduledDate: formData.scheduledDate,
        requirements: JSON.stringify(formData.dynamicFields),
        notes: formData.notes,
        requestedBy: userInfo.userId,
        requestedDate: new Date(),
      };

      // Submit to API
      const response = await fetch("/api/serviceRequests", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to submit request");
      }

      toast.success("درخواست با موفقیت ثبت شد! 🎉");

      // Reset form
      setShowRequestForm(false);
      setSelectedService(null);
      setFormData({
        serviceId: "",
        quantity: 1,
        scheduledDate: undefined,
        notes: "",
        dynamicFields: {},
      });
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("خطا در ثبت درخواست");
    } finally {
      setSubmitting(false);
    }
  };

  // Get service icon


  // Render dynamic field input
  const renderDynamicField = (fieldName: string) => {
    const fieldValue = formData.dynamicFields[fieldName];

    const updateField = (value: DynamicFieldValue) => {
      setFormData((prev) => ({
        ...prev,
        dynamicFields: {
          ...prev.dynamicFields,
          [fieldName]: value,
        },
      }));
    };

    // Special handling for specific field types
    if (fieldName === "date") {
      return (
        <div key={fieldName}>
          <label className="block text-white/70 text-sm mb-2">
            <FaCalendarAlt className="inline-block ml-2 text-purple-400" />
            تاریخ مطلوب *
          </label>
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            value={fieldValue}
            onChange={(date) => updateField(date?.toDate?.() || null)}
            format="YYYY/MM/DD"
            placeholder="انتخاب تاریخ"
            className="w-full"
            inputClass="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
          />
        </div>
      );
    }

    if (fieldName.includes("scenario") || fieldName.includes("content")) {
      return (
        <div key={fieldName}>
          <label className="block text-white/70 text-sm mb-2">
            <FaEdit className="inline-block ml-2 text-purple-400" />
            {fieldName.replace("_", " ")} *
          </label>
          <textarea
            value={typeof fieldValue === "string" ? fieldValue : ""}
            onChange={(e) => updateField(e.target.value)}
            placeholder={`توضیح ${fieldName.replace(
              "_",
              " "
            )} خود را بنویسید...`}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 resize-none"
            rows={4}
          />
        </div>
      );
    }

    // Default text input
    return (
      <div key={fieldName}>
        <label className="block text-white/70 text-sm mb-2">
          <FaHashtag className="inline-block ml-2 text-purple-400" />
          {fieldName.replace("_", " ")} *
        </label>
        <input
          type="text"
          value={typeof fieldValue === "string" ? fieldValue : ""}
          onChange={(e) => updateField(e.target.value)}
          placeholder={`${fieldName.replace("_", " ")} را وارد کنید...`}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] flex items-center justify-center">
        <div className="text-white text-xl">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] flex items-center justify-center">
        <div className="text-white text-xl">خطا در تشخیص هویت</div>
      </div>
    );
  }

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
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-3">
            سرویس‌های لوکس
          </h1>
      
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {services.map((service, index) => {
            return (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
                onClick={() => handleServiceSelect(service)}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/15 relative overflow-hidden">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* VIP Badge */}
                  {service.isVip && (
                    <div className="absolute top-3 left-3">
                      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full text-gray-900 text-xs font-semibold">
                        <FaStar className="text-xs" />
                      </div>
                    </div>
                  )}

                  {/* Service Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="text-white font-medium text-lg group-hover:text-purple-300 transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-white/60 text-sm">
                          تیم: {service.teamId?.name || "نامشخص"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Service Description */}
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  {/* Options Preview */}
                  {service.options && service.options.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {service.options.slice(0, 3).map((option, idx) => (
                          <div
                            key={idx}
                            className="px-2 py-1 bg-purple-500/20 rounded text-purple-300 text-xs"
                          >
                            {option.key}
                          </div>
                        ))}
                        {service.options.length > 3 && (
                          <div className="px-2 py-1 bg-white/10 rounded text-white/60 text-xs">
                            +{service.options.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price and Action */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1">
                      <FaDollarSign className="text-green-400 text-sm" />
                      <span className="text-white font-bold">
                        {service.basePrice.toLocaleString()}
                      </span>
                      <span className="text-white/60 text-sm">تومان</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty state */}
        {services.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
              <FaExclamationTriangle className="text-yellow-400 text-4xl mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">
                هیچ سرویسی یافت نشد
              </h3>
              <p className="text-white/60">
                در حال حاضر سرویسی برای نمایش وجود ندارد
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Service Request Modal */}
      <AnimatePresence>
        {showRequestForm && selectedService && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRequestForm(false)}
          >
            <motion.div
              className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-luxury  shadow-2xl border border-white/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        selectedService?.isVip
                          ? "bg-yellow-400"
                          : "bg-purple-500"
                      }`}
                    ></div>
                    <h2 className="text-2xl font-bold text-white">
                      درخواست سرویس
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowRequestForm(false)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <IoClose size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Form Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Service Info Header */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-3 mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {selectedService?.name}
                          </h3>
                          <p className="text-white/60 text-sm">
                            تیم: {selectedService?.teamId?.name || "نامشخص"}
                          </p>
                        </div>
                        {selectedService?.isVip && (
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                            <FaStar />
                            VIP
                          </div>
                        )}
                      </div>
                      <p className="text-white/70 text-sm">
                        {selectedService?.description}
                      </p>
                    </div>

                    {/* Quantity */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-white/70 text-sm mb-2">
                        تعداد
                      </label>
                      <select
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quantity: Number(e.target.value),
                          })
                        }
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                      >
                        {[1, 2, 3, 4, 5, 10, 15, 20].map((num) => (
                          <option key={num} value={num} className="bg-gray-800">
                            {num} عدد
                          </option>
                        ))}
                      </select>
                      {formData.quantity >= 3 && (
                        <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                          <IoSparkles className="text-yellow-400" />
                          تخفیف عمده ممکن است اعمال شود!
                        </p>
                      )}
                    </div>

                    {/* Scheduled Date */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-white/70 text-sm mb-2">
                        <FaCalendarAlt className="inline-block ml-2 text-purple-400" />
                        تاریخ تحویل مطلوب
                      </label>
                      <DatePicker
                        calendar={persian}
                        locale={persian_fa}
                        value={formData.scheduledDate}
                        onChange={(date) =>
                          setFormData({
                            ...formData,
                            scheduledDate: date?.toDate?.(),
                          })
                        }
                        format="YYYY/MM/DD"
                        placeholder="انتخاب تاریخ (اختیاری)"
                        className="w-full"
                        inputClass="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                      />
                    </div>

                    {/* Dynamic Required Fields */}
                    {selectedService?.requieredFileds?.map((field) => (
                      <div
                        key={field}
                        className="bg-white/5 rounded-xl p-4 border border-white/10"
                      >
                        {renderDynamicField(field)}
                      </div>
                    ))}

                    {/* Notes */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-white/70 text-sm mb-2">
                        <FaStickyNote className="inline-block ml-2 text-purple-400" />
                        یادداشت‌های اضافی
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder="هرگونه نیاز خاص یا اطلاعات اضافی..."
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 resize-none"
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-4">
                    {/* مجموع درخواست  */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-white/70 text-sm mb-2">
                        مجموع هزینه درخواست
                      </label>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">قیمت پایه:</span>
                          <span className="text-green-400 font-bold">
                            {selectedService?.basePrice.toLocaleString()} تومان
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">
                            تعداد درخواست داده شده:
                          </span>
                          <span className="text-blue-400 font-semibold">
                            {formData.quantity} عدد
                          </span>
                        </div>
                        <div className="border-t border-white/20 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-white/60">محاسبه:</span>
                            <span className="text-white/70 text-xs">
                              {selectedService?.basePrice.toLocaleString()} ×{" "}
                              {formData.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-3 border border-purple-400/30">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-semibold">
                              مجموع کل:
                            </span>
                            <span className="text-yellow-400 font-bold text-lg">
                              {(
                                (selectedService?.basePrice || 0) *
                                formData.quantity
                              ).toLocaleString()}{" "}
                              تومان
                            </span>
                          </div>
                          {formData.quantity >= 3 && (
                            <div className="mt-2 text-green-400 text-xs flex items-center gap-1">
                              <IoSparkles className="text-yellow-400" />
                              تخفیف عمده ممکن است اعمال شود
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Options */}
                    {selectedService?.options &&
                      selectedService.options.length > 0 && (
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <label className="block text-white/70 text-sm mb-2">
                            گزینه‌های موجود
                          </label>
                          <div className="space-y-2">
                            {selectedService.options.map((option, idx) => (
                              <div
                                key={idx}
                                className="bg-white/10 rounded-lg p-2"
                              >
                                <div className="text-purple-300 text-xs font-medium">
                                  {option.key}
                                </div>
                                <div className="text-white/70 text-xs">
                                  {option.values
                                    .split(",")
                                    .slice(0, 3)
                                    .join(", ")}
                                  {option.values.split(",").length > 3 && "..."}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Submit Button */}
                    <motion.button
                      onClick={() => handleSubmit()}
                      disabled={submitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                    >
                      {submitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                          />
                          در حال ارسال...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <IoSparkles />
                          ثبت درخواست
                        </div>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LuxuryServiceRequest;
