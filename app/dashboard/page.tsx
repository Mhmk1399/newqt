"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DynamicDashboard from "@/components/global/newdynamics/DynamicDashboard";

interface DecodedToken {
  userId: string;
  phoneNumber: string;
  name: string;
  userType: "user" | "customer" | "coworker" | "admin";
  role?: string;
  exp: number;
}

export default function UnifiedDashboard() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearTokenAndRedirect = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("token");
    router.push("/auth");
  };

  const verifyUserAndToken = async () => {
    const token =
      localStorage.getItem("userToken") || localStorage.getItem("token");

    if (!token) {
      clearTokenAndRedirect();
      return;
    }

    try {
      // Decode token
      const decoded = JSON.parse(atob(token.split(".")[1])) as DecodedToken;

      // Check if token is expired
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        clearTokenAndRedirect();
        return;
      }

      // Verify user exists on backend
      const response = await fetch("/api/verify-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: decoded.userId }),
      });

      if (!response.ok) {
        clearTokenAndRedirect();
        return;
      }

      const userData = await response.json();

      if (
        userData.exists &&
        decoded.userType &&
        ["user", "customer", "coworker", "admin"].includes(decoded.userType)
      ) {
        // Use role from API response, fallback to token role or userType
        const role = userData.role || decoded.role || decoded.userType;
        console.log("User role:", role);
        setUserRole(role);
      } else {
        clearTokenAndRedirect();
      }
    } catch (error: unknown) {
      console.log(error);
      clearTokenAndRedirect();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyUserAndToken();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014]">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            خطا در احراز هویت
          </h1>
          <p className="text-white/70">لطفاً دوباره وارد شوید</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen" dir="rtl">
      <DynamicDashboard userRole={userRole} />
    </div>
  );
}
