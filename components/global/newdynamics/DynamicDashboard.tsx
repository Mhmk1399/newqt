"use client";

import React, { useState, useEffect } from "react";
import DynamicSidebar from "./DynamicSidebar";
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
  IoCard
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
  userRole: string;
  configs?: DashboardConfig[];
}

const DynamicDashboard: React.FC<DynamicDashboardProps> = ({ 
  userRole, 
  configs 
}) => {
  const [activeComponent, setActiveComponent] = useState<React.ComponentType | null>(null);
  const [activeKey, setActiveKey] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);

  // Default admin configuration
  const defaultAdminConfig: DashboardConfig = {
    userType: "user",
    items: [
      {
        key: "customers",
        label: "مدیریت مشتریان",
        icon: <IoPeople />,
        component: CustomersManagement
      },
      {
        key: "categories",
        label: "مدیریت دستهبندیها",
        icon: <IoGrid />,
        component: CategoriesManagement
      },
      {
        key: "services",
        label: "مدیریت سرویسها",
        icon: <IoBusinessOutline />,
        component: ServicesManagement
      },
      {
        key: "serviceRequests",
        label: "درخواستهای سرویس",
        icon: <IoDocumentText />,
        component: ServiceRequestsManagement
      },
      {
        key: "tasks",
        label: "مدیریت تسکها",
        icon: <IoCheckbox />,
        component: TasksManagement
      },
      {
        key: "users",
        label: "مدیریت کاربران",
        icon: <IoPersonAdd />,
        component: UsersManagement
      },
      {
        key: "videos",
        label: "مدیریت ویدیوها",
        icon: <IoVideocam />,
        component: VideosManagement
      },
      {
        key: "teams",
        label: "مدیریت تیمها",
        icon: <IoSettings />,
        component: TeamsManagement
      },
      {
        key: "contactRequests",
        label: "درخواستهای تماس",
        icon: <IoCall />,
        component: ContactRequestsManagement
      },
      {
        key: "coworkers",
        label: "مدیریت همکاران",
        icon: <IoPersonAdd />,
        component: CoWorkersManagement
      },
      {
        key: "transactions",
        label: "مدیریت تراکنشها",
        icon: <IoCard />,
        component: TransactionsManagement
      }
    ]
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get configuration for current user role
  const getCurrentConfig = (): DashboardConfig | null => {
    if (configs) {
      return configs.find(config => config.userType === userRole) || null;
    }
    
    // Return default config for admin
    if (userRole === 'user') {
      return defaultAdminConfig;
    }
    
    return null;
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

  if (!currentConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">دسترسی محدود</h1>
          <p className="text-white/70">شما دسترسی به این بخش را ندارید</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] relative">
      {/* Sidebar */}
      <DynamicSidebar
        items={currentConfig.items}
        userRole={userRole}
        onItemSelect={handleItemSelect}
        activeItem={activeKey}
      />

      {/* Main Content */}
      <div 
        className={`transition-all duration-300 ${
          isMobile 
            ? 'pt-20' // Mobile: account for fixed header
            : 'pr-20' // Desktop: account for collapsed sidebar
        }`}
      >
        {activeComponent && (
          <div className="w-full">
            {React.createElement(activeComponent)}
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicDashboard;