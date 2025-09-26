"use client";

import DynamicDashboard from "@/components/global/newdynamics/DynamicDashboard";
import { Suspense } from "react";

// Loading component for dashboard
const DashboardLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h1 className="text-xl font-bold text-white mb-2">
          در حال بارگذاری داشبورد...
        </h1>
        <p className="text-white/70">لطفاً صبر کنید</p>
      </div>
    </div>
  );
};

export default function UnifiedDashboard() {
  return (
    <div className="h-screen" dir="rtl">
      <Suspense fallback={<DashboardLoading />}>
        <DynamicDashboard />
      </Suspense>
    </div>
  );
}
