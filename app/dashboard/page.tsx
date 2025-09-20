"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


interface DecodedToken {
  userId: string;
  phoneNumber: string;
  name: string;
  userType: "user" | "customer" | "coworker";
  exp: number;
}

export default function UnifiedDashboard() {
  const router = useRouter();
  const [userType, setUserType] = useState<string | null>(null);
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
        ["user", "customer", "coworker"].includes(decoded.userType)
      ) {
        setUserType(decoded.userType);
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

  const renderDashboard = () => {
    switch (userType) {
      case "user":
        return <FormsSidebar />;
      case "customer":
        return <CustomerSideBar />;
      case "coworker":
        return <CoWorkerSideBar />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen" dir="rtl">
      {renderDashboard()}
    </div>
  );
}
