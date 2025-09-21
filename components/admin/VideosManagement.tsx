"use client";

import React, { useState, useEffect } from "react";
import DynamicTable from "@/components/global/newdynamics/dynamicTable";
import { TableColumn, TableData, FormField, FilterField } from "@/types/dynamicTypes/types";
import toast from "react-hot-toast";
import { IoPlay } from "react-icons/io5";

const VideosManagement: React.FC = () => {
  const [videos, setVideos] = useState<TableData[]>([]);
  const [categories, setCategories] = useState<{_id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoModal, setVideoModal] = useState<{isOpen: boolean, videoUrl: string | null}>({isOpen: false, videoUrl: null});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const columns: TableColumn[] = [
    {
      key: "name",
      header: "نام ویدیو",
      sortable: true,
    },
    {
      key: "description",
      header: "توضیحات",
      sortable: false,
      render: (value) => {
        const text = value as string || "-";
        return (
          <div className="max-w-xs truncate" title={text}>
            {text.length > 50 ? `${text.substring(0, 50)}...` : text}
          </div>
        );
      },
    },
    {
      key: "categoryId",
      header: "دسته‌بندی",
      sortable: false,
      render: (value) => {
        if (typeof value === 'object' && value && 'name' in value) {
          return (value as Record<string, unknown>).name as string;
        }
        return value || "-";
      },
    },
    {
      key: "link",
      header: "لینک ویدیو",
      sortable: false,
      render: (value) => {
        const link = value as string || "";
        return (
          <div className="max-w-xs truncate" title={link}>
            {link.length > 30 ? `${link.substring(0, 30)}...` : link || "-"}
          </div>
        );
      },
    },
    {
      key: "isActive",
      header: "وضعیت",
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {value ? "فعال" : "غیرفعال"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "تاریخ ایجاد",
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString("fa-IR"),
    },
  ];

  const formFields: FormField[] = [
    {
      name: "name",
      label: "نام ویدیو",
      type: "text",
      placeholder: "نام ویدیو را وارد کنید",
      validation: [{ type: "required", message: "نام ویدیو الزامی است" }],
    },
    {
      name: "description",
      label: "توضیحات",
      type: "textarea",
      placeholder: "توضیحات ویدیو را وارد کنید",
      validation: [{ type: "required", message: "توضیحات الزامی است" }],
    },
    {
      name: "link",
      label: "لینک ویدیو",
      type: "url",
      placeholder: "لینک ویدیو را وارد کنید",
      validation: [{ type: "required", message: "لینک ویدیو الزامی است" }],
    },
    {
      name: "categoryId",
      label: "دسته‌بندی",
      type: "select",
      placeholder: "دسته‌بندی را انتخاب کنید",
      options: categories.map(category => ({ label: category.name, value: category._id })),
      validation: [{ type: "required", message: "دسته‌بندی الزامی است" }],
    },
    {
      name: "isActive",
      label: "وضعیت",
      type: "select",
      options: [
        { label: "فعال", value: "true" },
        { label: "غیرفعال", value: "false" },
      ],
      defaultValue: "true",
    },
  ];

  const filterFields: FilterField[] = [
    {
      key: "search",
      label: "جستجو",
      type: "text",
      placeholder: "نام یا توضیحات ویدیو را جستجو کنید...",
    },
    {
      key: "categoryId",
      label: "دسته‌بندی",
      type: "select",
      options: categories.map(category => ({ label: category.name, value: category._id })),
    },
    {
      key: "isActive",
      label: "وضعیت",
      type: "select",
      options: [
        { label: "فعال", value: "true" },
        { label: "غیرفعال", value: "false" },
      ],
    },
  ];

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();
      if (result.success) {
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchVideos = async (page = 1, filters: Record<string, string> = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: (pagination?.itemsPerPage || 10).toString(),
        ...filters,
      });

      const response = await fetch(`/api/videos?${params}`);
      const result = await response.json();

      if (result.success) {
        setVideos(result.data || []);
        setPagination(result.pagination || pagination);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/videos?id=${id}`, {
        method: "DELETE",
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success("ویدیو با موفقیت حذف شد");
        fetchVideos();
      } else {
        toast.error(result.message || "خطا در حذف ویدیو");
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("خطا در حذف ویدیو");
    }
  };

  const openVideoModal = (videoUrl: string) => {
    setVideoModal({isOpen: true, videoUrl});
  };

  const closeVideoModal = () => {
    setVideoModal({isOpen: false, videoUrl: null});
  };

  useEffect(() => {
    fetchCategories();
    fetchVideos();
  }, []);

  // Custom actions for the table
  const customActions = (row: TableData) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        openVideoModal(row.link as string);
      }}
      className="text-blue-500 hover:text-blue-700 ml-2"
      title="مشاهده ویدیو"
    >
      <IoPlay size={18} />
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] relative overflow-hidden" dir="rtl">
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="relative z-10 p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-3">مدیریت ویدیوها</h1>
          <p className="text-white/70 text-lg">مدیریت کامل ویدیوها با امکان جستجو، فیلتر، ویرایش و مشاهده</p>
        </div>
      
        <DynamicTable
          columns={columns}
          data={videos}
          loading={loading}
          formFields={formFields}
          endpoint="/api/videos"
          formTitle="ویرایش ویدیو"
          formSubtitle="اطلاعات ویدیو را ویرایش کنید"
          onRefresh={() => fetchVideos()}
          onDelete={handleDelete}
          pagination={pagination}
          onPageChange={(page) => fetchVideos(page)}
          filterFields={filterFields}
          onFilterChange={(filters) => {
            const stringFilters: Record<string, string> = {};
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                stringFilters[key] = String(value);
              }
            });
            fetchVideos(1, stringFilters);
          }}
          customActions={customActions}
        />
      </div>
      
      {/* Video Modal */}
      {videoModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div 
            className="absolute inset-0 z-10" 
            onClick={closeVideoModal}
          />
          
          <div className="relative z-20 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-4xl p-8"
            style={{
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
            }}
          >
            {/* Decorative corner elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-tr-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/20 to-transparent rounded-bl-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center border-b border-white/20 pb-4 mb-6">
                <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text">
                  مشاهده ویدیو
                </h3>
                <button onClick={closeVideoModal} className="text-white/70 hover:text-white transition-colors text-2xl">
                  ×
                </button>
              </div>
              
              <div className="aspect-video bg-black rounded-xl overflow-hidden">
                {videoModal.videoUrl && (
                  <iframe
                    src={videoModal.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title="Video Player"
                  />
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeVideoModal}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideosManagement;