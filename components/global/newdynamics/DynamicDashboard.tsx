"use client";

import React, { useState, useEffect } from "react";
import DynamicSidebar from "./DynamicSidebar";
import { getUserFromToken, DecodedToken } from "@/utilities/jwtUtils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  IoPeople,
  IoPersonAdd,
  IoVideocam,
  IoGrid,
  IoCall,
  IoCheckbox,
  IoSettings,
  IoBusinessOutline,
  IoDocumentText,
  IoCard,
  IoWallet,
  IoStarOutline,
  IoPerson,
  IoHeadset,
  IoCreateOutline,
  IoCamera,
  IoImageOutline,
} from "react-icons/io5";

// Import all admin components
import CustomersManagement from "@/components/admin/CustomersManagement";
import CategoriesManagement from "@/components/admin/CategoriesManagement";
import ServicesManagement from "@/components/admin/ServicesManagement";
import ServiceRequestsManagement from "@/components/admin/ServiceRequestsManagement";
import TasksManagement from "@/components/admin/TasksManagement";
import UsersManagement from "@/components/admin/UsersManagement";
import VideosManagement from "@/components/admin/VideosManagement";
import TeamsManagement from "@/components/admin/TeamsManagement";
import ContactRequestsManagement from "@/components/admin/ContactRequestsManagement";
import CoWorkersManagement from "@/components/admin/CoWorkersManagement";
import TransactionsManagement from "@/components/admin/TransactionsManagement";

// Import user components
import UsersTransActions from "@/components/users/usersTransActions";
import TasksOfTheUsers from "@/components/users/tasksOftheUsers";

// Import customer components
import CustomerProfileEditor from "@/components/customers/CustomerProfileEditor";
import CustomerTaskManagement from "@/components/customers/CustomerTaskManagement";
import CustomerTransactions from "@/components/customers/CustomerTransactions";
import LuxuryServiceRequest from "@/components/customers/LuxuryServiceRequest";

// Import coworker components
import CoWorkerProfileEditor from "@/components/coworkers/CoWorkerProfileEditor";

interface DashboardConfig {
  userType: string;
  items: {
    key: string;
    label: string;
    icon: React.ReactNode;
    component: React.ComponentType;
  }[];
}

interface DynamicDashboardProps {
  userRole?: string; // Optional since we'll get it from token
  userType?: string; // Optional since we'll get it from token
  configs?: DashboardConfig[];
}

const DynamicDashboard: React.FC<DynamicDashboardProps> = ({
  userRole: propUserRole,
  userType: propUserType,
  configs,
}) => {
  const router = useRouter();
  const [activeComponent, setActiveComponent] =
    useState<React.ComponentType | null>(null);
  const [activeKey, setActiveKey] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract user info from token
  useEffect(() => {
    const extractUserFromToken = () => {
      try {
        const decoded = getUserFromToken();

        if (!decoded) {
          toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید");
          router.push("/auth");
          return;
        }

        setUserInfo(decoded);
        setLoading(false);
      } catch (error) {
        console.error("Error decoding token:", error);
        toast.error("خطا در تشخیص هویت. لطفاً مجدداً وارد شوید");
        router.push("/auth");
      }
    };

    extractUserFromToken();
  }, [router]);

  // Get user role and type from token or props
  // For User model, we need to check the 'role' field for admin status
  const actualUserRole =
    propUserRole || userInfo?.role || userInfo?.userType || "user";
  const userType = propUserType || userInfo?.userType || "user";
  const userRole = actualUserRole;

  // Default user configuration (for regular users from User model)
  const defaultUserConfig: DashboardConfig = {
    userType: "user",
    items: [
      {
        key: "tasks",
        label: "تسک‌های من",
        icon: <IoCheckbox />,
        component: TasksOfTheUsers,
      },
      {
        key: "transactions",
        label: "تراکنش‌های من",
        icon: <IoWallet />,
        component: UsersTransActions,
      },
    ],
  };

  // Customer configuration (for users from Customer model)
  const defaultCustomerConfig: DashboardConfig = {
    userType: "customer",
    items: [
      {
        key: "profile",
        label: "پروفایل من",
        icon: <IoPerson />,
        component: CustomerProfileEditor,
      },
      {
        key: "serviceRequest",
        label: "درخواست سرویس",
        icon: <IoHeadset />,
        component: LuxuryServiceRequest,
      },
      {
        key: "taskManagement",
        label: "مدیریت پروژه‌ها",
        icon: <IoCheckbox />,
        component: CustomerTaskManagement,
      },
      {
        key: "transactions",
        label: "تراکنش‌های من",
        icon: <IoWallet />,
        component: CustomerTransactions,
      },
    ],
  };

  // CoWorker configuration (for users from CoWorker model)
  const defaultCoWorkerConfig: DashboardConfig = {
    userType: "coworker",
    items: [
      {
        key: "profile",
        label: "پروفایل من",
        icon: <IoCreateOutline />,
        component: CoWorkerProfileEditor,
      },
    ],
  };

  // Default admin configuration
  const defaultAdminConfig: DashboardConfig = {
    userType: "Admin",
    items: [
      {
        key: "customers",
        label: "مدیریت مشتریان",
        icon: <IoPeople />,
        component: CustomersManagement,
      },
      {
        key: "categories",
        label: "مدیریت دستهبندیها",
        icon: <IoGrid />,
        component: CategoriesManagement,
      },
      {
        key: "services",
        label: "مدیریت سرویسها",
        icon: <IoBusinessOutline />,
        component: ServicesManagement,
      },
      {
        key: "serviceRequests",
        label: "درخواستهای سرویس",
        icon: <IoDocumentText />,
        component: ServiceRequestsManagement,
      },
      {
        key: "tasks",
        label: "مدیریت تسکها",
        icon: <IoCheckbox />,
        component: TasksManagement,
      },
      {
        key: "users",
        label: "مدیریت کاربران",
        icon: <IoPersonAdd />,
        component: UsersManagement,
      },
      {
        key: "videos",
        label: "مدیریت ویدیوها",
        icon: <IoVideocam />,
        component: VideosManagement,
      },
      {
        key: "teams",
        label: "مدیریت تیمها",
        icon: <IoSettings />,
        component: TeamsManagement,
      },
      {
        key: "contactRequests",
        label: "درخواستهای تماس",
        icon: <IoCall />,
        component: ContactRequestsManagement,
      },
      {
        key: "coworkers",
        label: "مدیریت همکاران",
        icon: <IoPersonAdd />,
        component: CoWorkersManagement,
      },
      {
        key: "transactions",
        label: "مدیریت تراکنشها",
        icon: <IoCard />,
        component: TransactionsManagement,
      },
    ],
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get configuration for current user role and type
  const getCurrentConfig = (): DashboardConfig | null => {
    if (!userInfo) return null;

    if (configs) {
      return configs.find((config) => config.userType === userType) || null;
    }

    // Check for admin privileges first (can come from User model role or direct userType)
    const isAdmin =
      userInfo?.role === "admin" || userInfo?.userType === "admin";

    if (isAdmin) {
      return defaultAdminConfig;
    }

    // Default configurations based on userType
    // The userType comes from JWT token and indicates which model the user belongs to
    switch (userType) {
      case "user":
        // Users from User model - they already passed admin check above
        // Other user roles (manager, editor, designer, video-shooter) get user config
    
        return defaultUserConfig;

      case "customer":
        return defaultCustomerConfig;

      case "coworker":
        return defaultCoWorkerConfig;

      default:
    
        return null;
    }
  };

  const currentConfig = getCurrentConfig();

  useEffect(() => {
    // Set first item as default active
    if (currentConfig && currentConfig.items.length > 0 && !activeComponent) {
      const firstItem = currentConfig.items[0];
      setActiveComponent(() => firstItem.component);
      setActiveKey(firstItem.key);
    }
  }, [currentConfig, activeComponent]);

  const handleItemSelect = (key: string, component: React.ComponentType) => {
    setActiveComponent(() => component);
    setActiveKey(key);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-white mb-2">
            در حال بارگذاری...
          </h1>
          <p className="text-white/70">لطفاً صبر کنید</p>
        </div>
      </div>
    );
  }

  // No access state
  if (!currentConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">دسترسی محدود</h1>
          <p className="text-white/70">شما دسترسی به این بخش را ندارید</p>
          <p className="text-white/50 text-sm mt-2">
            نوع کاربر: {userType} | نقش: {userRole}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] relative">
      {/* Sidebar */}
      <DynamicSidebar
        items={currentConfig.items}
        userRole={userInfo?.name || userRole}
        onItemSelect={handleItemSelect}
        activeItem={activeKey}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isMobile
            ? "pt-20" // Mobile: account for fixed header
            : "pr-20" // Desktop: account for collapsed sidebar
        }`}
      >
        {activeComponent && (
          <div className="w-full">{React.createElement(activeComponent)}</div>
        )}
      </div>
    </div>
  );
};

export default DynamicDashboard;
