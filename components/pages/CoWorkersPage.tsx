"use client";

import React, { useState } from "react";
import CoWorkerTable from "../tables/CoWorkerTable";
import CoWorkerForm from "../forms/CoWorkerForm";
import { HiPlus, HiViewList } from "react-icons/hi";

const CoWorkersPage: React.FC = () => {
  const [activeView, setActiveView] = useState<"list" | "add">("list");

  const handleAddSuccess = () => {
    setActiveView("list");
  };

  const handleCancel = () => {
    setActiveView("list");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">مدیریت همکاران</h1>
              <p className="text-gray-600 mt-1">
                مدیریت اطلاعات همکاران و تیم کاری
              </p>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeView === "list"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <HiViewList className="w-5 h-5" />
                لیست همکاران
              </button>
              
              <button
                onClick={() => setActiveView("add")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeView === "add"
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <HiPlus className="w-5 h-5" />
                افزودن همکار
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="transition-all duration-300">
          {activeView === "list" ? (
            <CoWorkerTable />
          ) : (
            <div className="bg-white rounded-lg shadow-md">
              <CoWorkerForm 
                onSuccess={handleAddSuccess}
                onCancel={handleCancel}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoWorkersPage;