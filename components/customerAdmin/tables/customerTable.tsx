"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import DynamicModal, { ModalConfig } from "../../DynamicModal";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineOfficeBuilding,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlinePencil,
} from "react-icons/hi";

interface CustomerInfo {
  _id?: string;
  businessName: string;
  customerId: string;
  email: string;
  isActive: boolean;
  name: string;
  phoneNumber: string;
  verificationStatus: string;
  createdAt?: string;
  updatedAt?: string;
}

const CustomersTable: React.FC = () => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);

  // Function to extract customer ID from JWT token
  const getCustomerIdFromToken = (): string | null => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        console.error("No customer token found in localStorage");
        return null;
      }

      // Decode JWT token to extract customer ID
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      console.log("Decoded token:", decodedToken);

      return decodedToken._id || decodedToken.userId || null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Function to fetch customer data from API
  const fetchCustomerData = async (): Promise<CustomerInfo | null> => {
    try {
      const customerId = getCustomerIdFromToken();
      if (!customerId) {
        console.error("No customer ID found in token");
        return null;
      }

      const response = await fetch("/api/customers/detailes", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "id": customerId,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch customer data");
      }

      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
      return null;
    }
  };

  // Handle edit customer
  const handleEdit = () => {
    if (!customerInfo || !customerInfo._id) {
      toast.error("اطلاعات کاربری یافت نشد");
      return;
    }

    const config: ModalConfig = {
      title: "ویرایش اطلاعات کاربری",
      type: "edit",
      size: "lg",
      endpoint: `/api/customers/detailes`,
      method: "PATCH",
      fields: [
        {
          key: "name",
          label: "نام و نام خانوادگی",
          type: "text",
          required: true,
          placeholder: "نام و نام خانوادگی خود را وارد کنید",
        },
        {
          key: "email",
          label: "آدرس ایمیل",
          type: "email",
          required: true,
          placeholder: "آدرس ایمیل خود را وارد کنید",
        },
        {
          key: "phoneNumber",
          label: "شماره تلفن",
          type: "tel",
          required: true,
          placeholder: "شماره تلفن خود را وارد کنید",
        },
        {
          key: "businessName",
          label: "نام کسب‌وکار",
          type: "text",
          required: true,
          placeholder: "نام کسب‌وکار خود را وارد کنید",
        },

      ],
      onSuccess: async (data) => {
        console.log("Customer updated successfully:", data);
        toast.success("اطلاعات کاربری با موفقیت به‌روزرسانی شد");
        
        // Refresh customer info from API
        const updatedInfo = await fetchCustomerData();
        if (updatedInfo) {
          setCustomerInfo(updatedInfo);
        }
        
        setShowModal(false);
      },
      onError: (error) => {
        toast.error("خطا در به‌روزرسانی اطلاعات: " + error);
        console.error("Update error:", error);
      },
      onClose: () => setShowModal(false),
      confirmText: "ذخیره تغییرات",
      cancelText: "لغو",
    };

    setModalConfig(config);
    setShowModal(true);
  };


  useEffect(() => {
    const loadCustomerData = async () => {
      setLoading(true);
      const info = await fetchCustomerData();
      if (info) {
        setCustomerInfo(info);
      } else {
        toast.error("خطا در احراز هویت - لطفاً دوباره وارد شوید");
      }
      setLoading(false);
    };

    loadCustomerData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getVerificationStatusConfig = (status: string) => {
    switch (status) {
      case "verified":
        return {
          label: "تأیید شده",
          className: "bg-green-100 text-green-800 border-green-200",
          icon: <HiOutlineCheckCircle className="w-4 h-4" />,
        };
      case "rejected":
        return {
          label: "رد شده",
          className: "bg-red-100 text-red-800 border-red-200",
          icon: <HiOutlineXCircle className="w-4 h-4" />,
        };
      default:
        return {
          label: "در انتظار تأیید",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <HiOutlineClock className="w-4 h-4" />,
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="mr-3 text-gray-600">در حال بارگذاری اطلاعات...</span>
      </div>
    );
  }

  if (!customerInfo) {
    return (
      <div className="text-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <HiOutlineXCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">
            خطا در بارگذاری اطلاعات
          </h3>
          <p className="text-red-600">
            امکان دریافت اطلاعات کاربری وجود ندارد. لطفاً دوباره وارد شوید.
          </p>
        </div>
      </div>
    );
  }

  const verificationConfig = getVerificationStatusConfig(
    customerInfo.verificationStatus
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Section */}
      <div className="bg-blue-600 rounded-t-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">پروفایل کاربری</h1>
            <p className="text-blue-100">اطلاعات حساب کاربری شما</p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                customerInfo.verificationStatus === 'verified'
                  ? "bg-green-500 text-white"
                  : "bg-yellow-500 text-white"
              }`}
            >
              {customerInfo.verificationStatus === 'verified' ? (
                <>
                  <HiOutlineCheckCircle className="w-4 h-4" />
                  حساب فعال
                </>
              ) : (
                <>
                  <HiOutlineClock className="w-4 h-4" />
                  در انتظار تأیید
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-b-xl shadow-lg overflow-hidden">
        {/* Personal Information Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <HiOutlineUser className="w-5 h-5 text-blue-600" />
            اطلاعات شخصی
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <HiOutlineUser className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">نام و نام خانوادگی</p>
                  <p className="text-lg font-medium text-gray-800">
                    {customerInfo.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <HiOutlineMail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">ایمیل</p>
                  <p className="text-lg font-medium text-gray-800">
                    {customerInfo.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <HiOutlinePhone className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">شماره تلفن</p>
                  <p className="text-lg font-medium text-gray-800">
                    {customerInfo.phoneNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Business Name */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <HiOutlineOfficeBuilding className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">نام کسب‌وکار</p>
                  <p className="text-lg font-medium text-gray-800">
                    {customerInfo.businessName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
            وضعیت حساب
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Verification Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">وضعیت تأیید</p>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${verificationConfig.className}`}
                  >
                    {verificationConfig.icon}
                    {verificationConfig.label}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer ID */}
          
          </div>
        </div>

        {/* Account Information Section */}
        {(customerInfo.createdAt || customerInfo.updatedAt) && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <HiOutlineCalendar className="w-5 h-5 text-indigo-600" />
              اطلاعات حساب
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Created */}
              {customerInfo.createdAt && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <HiOutlineCalendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">تاریخ ایجاد حساب</p>
                      <p className="text-sm font-medium text-gray-800">
                        {formatDate(customerInfo.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Last Updated */}
              {customerInfo.updatedAt && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <HiOutlineClock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">آخرین به‌روزرسانی</p>
                      <p className="text-sm font-medium text-gray-800">
                        {formatDate(customerInfo.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
       

          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
          >
            <HiOutlinePencil className="w-4 h-4" />
            ویرایش اطلاعات
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("customerToken");
              window.location.href = "/customers/login";
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            خروج از حساب
          </button>
        </div>
      </div>

      {/* Dynamic Modal */}
      {showModal && modalConfig && (
        <DynamicModal
          isOpen={showModal}
          config={modalConfig}
          itemId={customerInfo._id || customerInfo.customerId}
        />
      )}
    </div>
  );
};

export default CustomersTable;
