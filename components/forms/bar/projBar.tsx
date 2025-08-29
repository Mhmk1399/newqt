'use client';

import React, { useState, useEffect } from 'react';
import DynamicBar from '@/components/dynamicBar';

// Project interface based on your actual API structure
interface Project {
  _id: string;
  title: string;
  description: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  contractId: string;
  projectManagerId: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
  paidAmount: number;
  services: string[];
  totalPrice: number;
  finalPrice: number;
  discount: number;
  notes: string;
  internalNotes: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  avgProjectValue: number;
  totalDiscount: number;
  recentProjects: Project[];
}

// Chart data interface
interface ChartData {
  [key: string]: string | number;
  name: string;
  count: number;
  value: number;
  revenue: number;
}

// Customer summary interface
interface CustomerSummary {
  name: string;
  email: string;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  totalDiscount: number;
}

// Manager summary interface
interface ManagerSummary {
  name: string;
  email: string;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  avgProjectValue: number;
}

export const ProjBar: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
    avgProjectValue: 0,
    totalDiscount: 0,
    recentProjects: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects data
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      const result = await response.json();

      if (result.success) {
        const projectData = result.data || [];
        setProjects(projectData);
        
        // Calculate statistics
        const totalProjects = projectData.length;
        const activeProjects = projectData.filter((p: Project) => p.status === 'active').length;
        const completedProjects = projectData.filter((p: Project) => p.status === 'completed').length;
        const totalRevenue = projectData.reduce((sum: number, p: Project) => sum + (p.finalPrice || 0), 0);
        const avgProjectValue = totalProjects > 0 ? totalRevenue / totalProjects : 0;
        const totalDiscount = projectData.reduce((sum: number, p: Project) => sum + (p.discount || 0), 0);
        const recentProjects = projectData.slice(0, 5);

        setStats({
          totalProjects,
          activeProjects,
          completedProjects,
          totalRevenue,
          avgProjectValue,
          totalDiscount,
          recentProjects,
        });
        
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch projects');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Process projects data for different chart types
  const processProjectsByStatus = (): ChartData[] => {
    const statusGroups = projects.reduce((acc, project) => {
      const status = project.status || 'unknown';
      
      if (!acc[status]) {
        acc[status] = { 
          name: status, 
          count: 0, 
          value: 0,
          revenue: 0
        };
      }
      acc[status].count += 1;
      acc[status].revenue += project.finalPrice || 0;
      acc[status].value = acc[status].count;
      return acc;
    }, {} as Record<string, ChartData>);

    return Object.values(statusGroups);
  };

  const processProjectsByPaymentStatus = (): ChartData[] => {
    const paymentGroups = projects.reduce((acc, project) => {
      const paymentStatus = project.paymentStatus || 'unknown';
      
      if (!acc[paymentStatus]) {
        acc[paymentStatus] = { 
          name: paymentStatus, 
          count: 0, 
          value: 0,
          revenue: 0
        };
      }
      acc[paymentStatus].count += 1;
      acc[paymentStatus].revenue += project.finalPrice || 0;
      acc[paymentStatus].value = acc[paymentStatus].revenue;
      return acc;
    }, {} as Record<string, ChartData>);

    return Object.values(paymentGroups);
  };

  const processProjectsByCustomer = (): ChartData[] => {
    const customerGroups = projects.reduce((acc, project) => {
      const customerName = project.customerId?.name || 'نامشخص';
      
      if (!acc[customerName]) {
        acc[customerName] = { 
          name: customerName, 
          count: 0, 
          value: 0,
          revenue: 0
        };
      }
      acc[customerName].count += 1;
      acc[customerName].revenue += project.finalPrice || 0;
      acc[customerName].value = acc[customerName].revenue;
      return acc;
    }, {} as Record<string, ChartData>);

    return Object.values(customerGroups);
  };

  const processProjectsByManager = (): ChartData[] => {
    const managerGroups = projects.reduce((acc, project) => {
      const managerName = project.projectManagerId?.name || 'نامشخص';
      
      if (!acc[managerName]) {
        acc[managerName] = { 
          name: managerName, 
          count: 0, 
          value: 0,
          revenue: 0
        };
      }
      acc[managerName].count += 1;
      acc[managerName].revenue += project.finalPrice || 0;
      acc[managerName].value = acc[managerName].count;
      return acc;
    }, {} as Record<string, ChartData>);

    return Object.values(managerGroups);
  };

  const processProjectsByMonth = (): ChartData[] => {
    const monthGroups = projects.reduce((acc, project) => {
      const date = new Date(project.createdAt);
      const monthKey = date.toLocaleDateString('fa-IR', { 
        year: 'numeric', 
        month: 'short'
      });

      if (!acc[monthKey]) {
        acc[monthKey] = { 
          name: monthKey, 
          count: 0, 
          value: 0,
          revenue: 0
        };
      }
      acc[monthKey].count += 1;
      acc[monthKey].revenue += project.finalPrice || 0;
      acc[monthKey].value = acc[monthKey].revenue;
      return acc;
    }, {} as Record<string, ChartData>);

    return Object.values(monthGroups).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  };

  if (loading) {
    return (
      <div className="p-3 md:p-6">
        <div className="animate-pulse space-y-4 md:space-y-6">
          <div className="h-6 md:h-8 bg-gray-200 rounded w-1/2 md:w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 md:h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-60 md:h-80 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold">خطا در بارگذاری پروژه‌ها</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button 
            onClick={fetchProjects}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800 truncate">تحلیل پروژه‌ها</h1>
          <p className="text-xs md:text-base text-gray-600 mt-1">نمای کلی از وضعیت پروژه‌ها و درآمد</p>
        </div>
        <button
          onClick={fetchProjects}
          className="flex items-center justify-center space-x-1 md:space-x-2 space-x-reverse px-3 md:px-4 py-2 text-xs md:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
        >
          <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden md:inline">بروزرسانی</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4 lg:gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 md:p-6 text-white relative">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-blue-100 text-xs md:text-sm truncate">کل پروژه‌ها</p>
              <p className="text-sm md:text-xl font-bold">{stats.totalProjects.toLocaleString('fa-IR')}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-1 md:p-3 absolute top-1 left-1">
              <svg className="w-3 h-3 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 md:p-6 text-white relative">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-green-100 text-xs md:text-sm truncate">فعال</p>
              <p className="text-sm md:text-xl font-bold">{stats.activeProjects.toLocaleString('fa-IR')}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-1 md:p-3 absolute top-1 left-1">
              <svg className="w-3 h-3 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 md:p-6 text-white relative">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-purple-100 text-xs md:text-sm truncate">تکمیل</p>
              <p className="text-sm md:text-xl font-bold">{stats.completedProjects.toLocaleString('fa-IR')}</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-1 md:p-3 absolute top-1 left-1">
              <svg className="w-3 h-3 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z " />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-3 md:p-6 text-white relative">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-emerald-100 text-xs md:text-sm truncate">درآمد</p>
              <p className="text-sm md:text-xl font-bold">{stats.totalRevenue.toLocaleString('fa-IR')}</p>
            </div>
            <div className="bg-emerald-400 bg-opacity-30 rounded-full p-1 md:p-3 absolute top-1 left-1">
              <svg className="w-3 h-3 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 relative rounded-lg p-3 md:p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-orange-100 text-xs md:text-sm truncate">میانگین</p>
              <p className="text-sm md:text-xl font-bold">{Math.round(stats.avgProjectValue).toLocaleString('fa-IR')}</p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 rounded-full p-1 md:p-3 absolute top-1 left-1">
              <svg className="w-3 h-3 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-3 md:p-6 text-white relative">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-red-100 text-xs md:text-sm truncate">تخفیف</p>
              <p className="text-sm md:text-xl font-bold">{stats.totalDiscount.toLocaleString('fa-IR')}</p>
            </div>
            <div className="bg-red-400 bg-opacity-30 rounded-full p-1 md:p-3 absolute top-1 left-1">
              <svg className="w-3 h-3 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid using DynamicBar component */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Chart */}
        <DynamicBar
          dataType="projects"
          data={processProjectsByStatus()}
          chartType="pie"
          title="وضعیت پروژه‌ها"
          height={350}
          customConfig={{
            dataKey: 'name',
            valueKey: 'count',
            colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
          }}
        />

        {/* Payment Status Chart */}
        <DynamicBar
          dataType="projects"
          data={processProjectsByPaymentStatus()}
          chartType="bar"
          title="وضعیت پرداخت پروژه‌ها"
          height={350}
          customConfig={{
            dataKey: 'name',
            valueKey: 'value',
            colors: ['#EC4899', '#10B981', '#F59E0B', '#EF4444'],
          }}
        />

        {/* Projects by Customer Chart */}
        <DynamicBar
          dataType="customers"
          data={processProjectsByCustomer()}
          chartType="bar"
          title="درآمد پروژه‌ها بر اساس مشتری"
          height={350}
          customConfig={{
            dataKey: 'name',
            valueKey: 'value',
            colors: ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'],
          }}
        />

        {/* Projects by Manager Chart */}
        <DynamicBar
          dataType="users"
          data={processProjectsByManager()}
          chartType="pie"
          title="تعداد پروژه‌ها بر اساس مدیر پروژه"
          height={350}
          customConfig={{
            dataKey: 'name',
            valueKey: 'count',
            colors: ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'],
          }}
        />
      </div>

      {/* Monthly Revenue Trend */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">روند ماهانه درآمد پروژه‌ها</h3>
        
        <DynamicBar
          dataType="projects"
          data={processProjectsByMonth()}
          chartType="line"
          title=""
          height={400}
          customConfig={{
            dataKey: 'name',
            valueKey: 'value',
            colors: ['#3B82F6'],
          }}
        />
      </div>

      {/* Recent Projects Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">آخرین پروژه‌ها</h3>
          <span className="text-sm text-gray-500">
            {stats.recentProjects.length} از {stats.totalProjects} پروژه
          </span>
        </div>

        {stats.recentProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">عنوان پروژه</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">مشتری</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">مدیر پروژه</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">وضعیت</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">وضعیت پرداخت</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">قیمت نهایی</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">تاریخ ایجاد</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentProjects.map((project, index) => (
                  <tr key={project._id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900 truncate max-w-xs" title={project.title}>
                        {project.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate max-w-xs" title={project.description}>
                        {project.description}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{project.customerId?.name || 'نامشخص'}</p>
                        <p className="text-sm text-gray-500">{project.customerId?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{project.projectManagerId?.name || 'نامشخص'}</p>
                        <p className="text-sm text-gray-500">{project.projectManagerId?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                        project.status === 'paused' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {project.status === 'active' ? 'فعال' :
                         project.status === 'completed' ? 'تکمیل شده' :
                         project.status === 'planning' ? 'برنامه‌ریزی' :
                         project.status === 'paused' ? 'متوقف شده' :
                         'لغو شده'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        project.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        project.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        project.paymentStatus === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.paymentStatus === 'paid' ? 'پرداخت شده' :
                         project.paymentStatus === 'partial' ? 'جزئی' :
                         project.paymentStatus === 'overdue' ? 'معوقه' :
                         'در انتظار'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-semibold text-green-600">
                          {project.finalPrice.toLocaleString('fa-IR')}
                        </span>
                        {project.discount > 0 && (
                          <p className="text-xs text-red-500">
                            تخفیف: {project.discount.toLocaleString('fa-IR')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(project.createdAt).toLocaleDateString('fa-IR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p>هیچ پروژه‌ای موجود نیست</p>
          </div>
        )}
      </div>

      {/* Project Summary by Customer */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">خلاصه پروژه‌ها بر اساس مشتری</h3>
        
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              projects.reduce((acc, project) => {
                const customerName = project.customerId?.name || 'نامشخص';
                const customerEmail = project.customerId?.email || '';
                
                if (!acc[customerName]) {
                  acc[customerName] = {
                    name: customerName,
                    email: customerEmail,
                                        totalProjects: 0,
                    activeProjects: 0,
                    completedProjects: 0,
                    totalRevenue: 0,
                    totalDiscount: 0,
                  };
                }
                
                acc[customerName].totalProjects += 1;
                if (project.status === 'active') acc[customerName].activeProjects += 1;
                if (project.status === 'completed') acc[customerName].completedProjects += 1;
                acc[customerName].totalRevenue += project.finalPrice || 0;
                acc[customerName].totalDiscount += project.discount || 0;
                
                return acc;
              }, {} as Record<string, CustomerSummary>)
            )
            .sort(([,a], [,b]) => b.totalRevenue - a.totalRevenue)
            .slice(0, 6)
            .map(([customerName, data]) => (
              <div key={customerName} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 truncate">{data.name}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {data.totalProjects} پروژه
                  </span>
                </div>
                {data.email && (
                  <p className="text-sm text-gray-600 mb-3 truncate">{data.email}</p>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">فعال:</span>
                    <span className="text-sm font-semibold text-green-600">
                      {data.activeProjects}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">تکمیل شده:</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {data.completedProjects}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">کل درآمد:</span>
                    <span className="text-sm font-semibold text-emerald-600">
                      {data.totalRevenue.toLocaleString('fa-IR')}
                    </span>
                  </div>
                  {data.totalDiscount > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-600">تخفیف:</span>
                      <span className="text-sm font-semibold text-red-600">
                        {data.totalDiscount.toLocaleString('fa-IR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>داده‌ای برای نمایش موجود نیست</p>
          </div>
        )}
      </div>

      {/* Project Summary by Manager */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">خلاصه پروژه‌ها بر اساس مدیر پروژه</h3>
        
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(
              projects.reduce((acc, project) => {
                const managerName = project.projectManagerId?.name || 'نامشخص';
                const managerEmail = project.projectManagerId?.email || '';
                
                if (!acc[managerName]) {
                  acc[managerName] = {
                    name: managerName,
                    email: managerEmail,
                    totalProjects: 0,
                    activeProjects: 0,
                    completedProjects: 0,
                    totalRevenue: 0,
                    avgProjectValue: 0,
                  };
                }
                
                acc[managerName].totalProjects += 1;
                if (project.status === 'active') acc[managerName].activeProjects += 1;
                if (project.status === 'completed') acc[managerName].completedProjects += 1;
                acc[managerName].totalRevenue += project.finalPrice || 0;
                acc[managerName].avgProjectValue = acc[managerName].totalRevenue / acc[managerName].totalProjects;
                
                return acc;
              }, {} as Record<string, ManagerSummary>)
            )
            .sort(([,a], [,b]) => b.totalProjects - a.totalProjects)
            .map(([managerName, data]) => (
              <div key={managerName} className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 truncate">{data.name}</h4>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    {data.totalProjects}
                  </span>
                </div>
                {data.email && (
                  <p className="text-xs text-gray-500 mb-3 truncate">{data.email}</p>
                )}
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">فعال:</span>
                    <span className="text-xs font-semibold text-green-600">
                      {data.activeProjects}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">تکمیل شده:</span>
                    <span className="text-xs font-semibold text-blue-600">
                      {data.completedProjects}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">کل درآمد:</span>
                    <span className="text-xs font-semibold text-emerald-600">
                      {data.totalRevenue.toLocaleString('fa-IR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                    <span className="text-xs font-medium text-gray-700">میانگین:</span>
                    <span className="text-sm font-bold text-orange-600">
                      {Math.round(data.avgProjectValue).toLocaleString('fa-IR')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>داده‌ای برای نمایش موجود نیست</p>
          </div>
        )}
      </div>

      {/* Project Summary Footer */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-white bg-opacity-10 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-2xl font-bold">{stats.totalProjects}</p>
            <p className="text-gray-300 text-sm">کل پروژه‌ها</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white bg-opacity-10 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-green-300">{stats.activeProjects}</p>
            <p className="text-gray-300 text-sm">پروژه‌های فعال</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white bg-opacity-10 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-emerald-300">{stats.totalRevenue.toLocaleString('fa-IR')}</p>
            <p className="text-gray-300 text-sm">کل درآمد</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white bg-opacity-10 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-orange-300">{Math.round(stats.avgProjectValue).toLocaleString('fa-IR')}</p>
            <p className="text-gray-300 text-sm">میانگین ارزش پروژه</p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-700 text-center">
          <p className="text-gray-300 text-sm">
            آخرین بروزرسانی: {new Date().toLocaleDateString('fa-IR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjBar;
