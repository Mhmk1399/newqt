"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

// Chart configuration types
interface ChartConfig  {
  type: "bar" | "pie" | "line" | "area";
  title: string;
  dataKey: string;
  valueKey: string;
  colors: string[];
  height?: number;
}

interface ChartDataItem {
  [key: string]: string | number | object | null | undefined;
}

interface ProcessedDataItem {
  name: string;
  count: number;
  value: number;
}

interface DynamicBarProps {
  dataType:
    | "customers"
    | "contracts"
    | "projects"
    | "tasks"
    | "teams"
    | "users"
    | "services"
    | "serviceRequests";
  data?: ChartDataItem[];
  endpoint?: string;
  chartType?: "bar" | "pie" | "line" | "area";
  title?: string;
  height?: number;
  refreshInterval?: number;
  customConfig?: Partial<ChartConfig>;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    [key: string]: unknown;
  }>;
  label?: string;
}

interface PieDataEntry {
  name: string;
  percent?: number;
  [key: string]: unknown;
}

// Color palettes for different chart types
const COLOR_PALETTES = {
  primary: [
    "#8B5CF6",
    "#EC4899",
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#6366F1",
    "#14B8A6",
  ],
  secondary: [
    "#A78BFA",
    "#F472B6",
    "#60A5FA",
    "#34D399",
    "#FBBF24",
    "#F87171",
    "#818CF8",
    "#2DD4BF",
  ],
  gradient: [
    "#667eea",
    "#764ba2",
    "#f093fb",
    "#f5576c",
    "#4facfe",
    "#00f2fe",
    "#43e97b",
    "#38f9d7",
  ],
};

// Default chart configurations for each data type
const DEFAULT_CONFIGS: Record<string, ChartConfig> = {
  customers: {
    type: "bar",
    title: "وضعیت تایید مشتریان",
    dataKey: "verificationStatus",
    valueKey: "count",
    colors: COLOR_PALETTES.primary,
    height: 300,
  },
  contracts: {
    type: "pie",
    title: "وضعیت قراردادها",
    dataKey: "status",
    valueKey: "count",
    colors: COLOR_PALETTES.secondary,
    height: 300,
  },
  projects: {
    type: "bar",
    title: "وضعیت پروژه‌ها",
    dataKey: "status",
    valueKey: "count",
    colors: COLOR_PALETTES.gradient,
    height: 300,
  },
  tasks: {
    type: "area",
    title: "اولویت وظایف",
    dataKey: "priority",
    valueKey: "count",
    colors: COLOR_PALETTES.primary,
    height: 300,
  },
  teams: {
    type: "pie",
    title: "تخصص تیم‌ها",
    dataKey: "specialization",
    valueKey: "count",
    colors: COLOR_PALETTES.secondary,
    height: 300,
  },
  users: {
    type: "bar",
    title: "نقش کاربران",
    dataKey: "role",
    valueKey: "count",
    colors: COLOR_PALETTES.gradient,
    height: 300,
  },
  services: {
    type: "line",
    title: "قیمت سرویس‌ها",
    dataKey: "name",
    valueKey: "basePrice",
    colors: COLOR_PALETTES.primary,
    height: 300,
  },
  serviceRequests: {
    type: "bar",
    title: "وضعیت درخواست‌های سرویس",
    dataKey: "status",
    valueKey: "count",
    colors: COLOR_PALETTES.secondary,
    height: 300,
  },
};

// Status label mappings for Persian
const STATUS_LABELS: Record<string, string> = {
  // Customer verification status
  pending: "در انتظار",
  verified: "تایید شده",
  rejected: "رد شده",

  // Contract status
  draft: "پیش‌نویس",
  active: "فعال",
  completed: "تکمیل شده",
  terminated: "خاتمه یافته",
  expired: "منقضی شده",

  // Project status
  planning: "برنامه‌ریزی",
  paused: "متوقف شده",
  cancelled: "لغو شده",

  // Task status
  todo: "انجام نشده",
  "in-progress": "در حال انجام",
  review: "بررسی",

  // Priority
  low: "کم",
  medium: "متوسط",
  high: "بالا",
  urgent: "فوری",

  // Payment status
  partial: "جزئی",
  paid: "پرداخت شده",
  overdue: "معوقه",

  // User roles
  admin: "مدیر سیستم",
  manager: "مدیر",
  employee: "کارمند",
  client: "مشتری",
  viewer: "بازدیدکننده",

  // Team specializations
  shooting: "فیلم‌برداری",
  edit: "تدوین",
  photographi: "عکاسی",
  marketing: "تبلیغات",

  // Service request status
  approved: "تایید شده",
};

const DynamicBar: React.FC<DynamicBarProps> = ({
  dataType,
  data: propData,
  endpoint,
  chartType,
  title,
  height = 300,
  refreshInterval,
  customConfig,
}) => {
  const [data, setData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get chart configuration
  const config = useMemo(
    () => ({
      ...DEFAULT_CONFIGS[dataType],
      ...(chartType && { type: chartType }),
      ...(title && { title }),
      ...(height && { height }),
      ...customConfig,
    }),
    [dataType, chartType, title, height, customConfig]
  );

  // Fetch data from API
  const fetchData = useCallback(async () => {
    if (propData) {
      setData(propData);
      setLoading(false);
      return;
    }

    if (!endpoint) {
      setError("No data source provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(endpoint);

      const result = (await response.json()) as {
        success: boolean;
        data?: ChartDataItem[];
        error?: string;
      };

      if (result.success) {
        setData(result.data || []);
        setError(null);
      } else {
        setError(result.error || "Failed to fetch data");
      }
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  }, [propData, endpoint]);

  // Process data for charts
  const processedData = useMemo(() => {
    if (!data.length) return [];

    // Group data by the specified key
    const grouped = data.reduce<Record<string, ProcessedDataItem>>(
      (
        acc,
        item: {
          [key: string]: unknown;
        }
      ) => {
        let key = item[config.dataKey];

        // Handle nested objects (like populated references)
        if (typeof key === "object" && key !== null) {
          const keyObj = key as Record<string, unknown>;
          key = keyObj?.name || keyObj?.title || keyObj?._id;
        }

        // Convert key to string and get Persian label
        const keyStr = String(key);
        const label = STATUS_LABELS[keyStr] || keyStr;

        if (!acc[label]) {
          acc[label] = { name: label, count: 0, value: 0 };
        }

        acc[label].count += 1;

        // For numeric values (like prices), sum them up
        if (
          config.valueKey !== "count" &&
          typeof item[config.valueKey] === "number"
        ) {
          acc[label].value += item[config.valueKey] as number;
        } else {
          acc[label].value = acc[label].count;
        }

        return acc;
      },
      {}
    );

    return Object.values(grouped);
  }, [data, config.dataKey, config.valueKey]);

  useEffect(() => {
    fetchData();

    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 md:p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-semibold text-gray-800 text-xs md:text-sm truncate">
            {label}
          </p>
          <p className="text-blue-600 text-xs md:text-sm">
            {config.valueKey === "count" ? "تعداد" : "مقدار"}:{" "}
            {payload[0].value.toLocaleString("fa-IR")}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const commonProps = {
      data: processedData,
      margin: isMobile
        ? { top: 10, right: 10, left: 10, bottom: 40 }
        : { top: 20, right: 30, left: 20, bottom: 60 },
    };

    switch (config.type) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: isMobile ? 8 : 10, fill: "#666" }}
              angle={isMobile ? -90 : -45}
              textAnchor="end"
              height={isMobile ? 60 : 80}
              interval={0}
            />
            <YAxis tick={{ fontSize: isMobile ? 8 : 10, fill: "#666" }} />
            <Tooltip content={<CustomTooltip />} />
            {!isMobile && <Legend />}
            <Bar
              dataKey="value"
              fill={config.colors[0]}
              radius={[4, 4, 0, 0]}
              name={config.valueKey === "count" ? "تعداد" : "مقدار"}
            />
          </BarChart>
        );

      case "pie":
        return (
          <PieChart>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={
                isMobile
                  ? false
                  : ({ name, percent = 0 }: PieDataEntry) =>
                      `${
                        name.length > 8 ? name.substring(0, 8) + "..." : name
                      } ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={isMobile ? 60 : 80}
              innerRadius={isMobile ? 20 : 0}
              fill="#8884d8"
              dataKey="value"
            >
              {processedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={config.colors[index % config.colors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {!isMobile && <Legend />}
          </PieChart>
        );

      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: isMobile ? 8 : 10, fill: "#666" }}
              angle={isMobile ? -90 : -45}
              textAnchor="end"
              height={isMobile ? 60 : 80}
              interval={0}
            />
            <YAxis tick={{ fontSize: isMobile ? 8 : 10, fill: "#666" }} />
            <Tooltip content={<CustomTooltip />} />
            {!isMobile && <Legend />}
            <Line
              type="monotone"
              dataKey="value"
              stroke={config.colors[0]}
              strokeWidth={isMobile ? 2 : 3}
              dot={{
                fill: config.colors[0],
                strokeWidth: 2,
                r: isMobile ? 3 : 4,
              }}
              name={config.valueKey === "count" ? "تعداد" : "مقدار"}
            />
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: isMobile ? 8 : 10, fill: "#666" }}
              angle={isMobile ? -90 : -45}
              textAnchor="end"
              height={isMobile ? 60 : 80}
              interval={0}
            />
            <YAxis tick={{ fontSize: isMobile ? 8 : 10, fill: "#666" }} />
            <Tooltip content={<CustomTooltip />} />
            {!isMobile && <Legend />}
            <Area
              type="monotone"
              dataKey="value"
              stroke={config.colors[0]}
              fill={config.colors[0]}
              fillOpacity={0.3}
              name={config.valueKey === "count" ? "تعداد" : "مقدار"}
            />
          </AreaChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">نوع نمودار نامعتبر است</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-lg p-3 md:p-6">
        <div className="animate-pulse">
          <div className="h-4 md:h-6 bg-gray-200 rounded w-1/3 mb-3 md:mb-4"></div>
          <div className="h-48 md:h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white rounded-lg shadow-lg p-3 md:p-6">
        <div className="text-center text-red-600">
          <p className="text-sm md:text-lg font-semibold mb-2">
            خطا در بارگذاری داده‌ها
          </p>
          <p className="text-xs md:text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 md:mt-4 px-3 md:px-4 py-2 text-xs md:text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  if (!processedData.length) {
    return (
      <div className="w-full bg-white rounded-lg shadow-lg p-3 md:p-6">
        <div className="text-center text-gray-500">
          <p className="text-sm md:text-lg font-semibold mb-2">
            داده‌ای موجود نیست
          </p>
          <p className="text-xs md:text-sm">
            هنوز هیچ داده‌ای برای نمایش وجود ندارد
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-3 md:p-6 hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-start md:items-center justify-between mb-4 md:mb-6">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm md:text-xl font-bold text-gray-800 mb-1 truncate">
            {config.title}
          </h3>
          <p className="text-xs md:text-sm text-gray-500">
            مجموع:{" "}
            {processedData
              ?.reduce((sum, item) => sum + item.value, 0)
              .toLocaleString("fa-IR")}
          </p>
        </div>
        <div className="flex items-center space-x-1 md:space-x-2 space-x-reverse flex-shrink-0">
          {/* Chart type indicator */}
          <div className="hidden md:flex items-center space-x-1 space-x-reverse">
            <div
              className={`w-3 h-3 rounded-full ${
                config.type === "bar"
                  ? "bg-blue-500"
                  : config.type === "pie"
                  ? "bg-green-500"
                  : config.type === "line"
                  ? "bg-purple-500"
                  : "bg-orange-500"
              }`}
            ></div>
            <span className="text-xs text-gray-500 capitalize">
              {config.type}
            </span>
          </div>

          {/* Refresh button */}
          <button
            onClick={fetchData}
            className="p-1 md:p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="بروزرسانی"
          >
            <svg
              className="w-3 h-3 md:w-4 md:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div
        className="w-full"
        style={{
          height:
            typeof window !== "undefined" && window.innerWidth < 768
              ? Math.min(config.height ?? 300, 250)
              : config.height ?? 300,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Statistics Footer */}
      <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-blue-600">
              {processedData.length.toLocaleString("fa-IR")}
            </p>
            <p className="text-xs text-gray-500">دسته‌بندی</p>
          </div>
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-green-600">
              {Math.max(
                ...processedData.map((item) => item.value)
              ).toLocaleString("fa-IR")}
            </p>
            <p className="text-xs text-gray-500">بیشترین</p>
          </div>
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-orange-600">
              {Math.min(
                ...processedData.map((item) => item.value)
              ).toLocaleString("fa-IR")}
            </p>
            <p className="text-xs text-gray-500">کمترین</p>
          </div>
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-purple-600">
              {Math.round(
                processedData.reduce((sum, item) => sum + item.value, 0) /
                  processedData.length
              ).toLocaleString("fa-IR")}
            </p>
            <p className="text-xs text-gray-500">میانگین</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicBar;

// Export additional components for specific use cases
export const CustomerChart: React.FC<Omit<DynamicBarProps, "dataType">> = (
  props
) => <DynamicBar {...props} dataType="customers" />;

export const ContractChart: React.FC<Omit<DynamicBarProps, "dataType">> = (
  props
) => <DynamicBar {...props} dataType="contracts" />;

export const ProjectChart: React.FC<Omit<DynamicBarProps, "dataType">> = (
  props
) => <DynamicBar {...props} dataType="projects" />;

export const TaskChart: React.FC<Omit<DynamicBarProps, "dataType">> = (
  props
) => <DynamicBar {...props} dataType="tasks" />;

export const TeamChart: React.FC<Omit<DynamicBarProps, "dataType">> = (
  props
) => <DynamicBar {...props} dataType="teams" />;

export const UserChart: React.FC<Omit<DynamicBarProps, "dataType">> = (
  props
) => <DynamicBar {...props} dataType="users" />;

export const ServiceChart: React.FC<Omit<DynamicBarProps, "dataType">> = (
  props
) => <DynamicBar {...props} dataType="services" />;

export const ServiceRequestChart: React.FC<
  Omit<DynamicBarProps, "dataType">
> = (props) => <DynamicBar {...props} dataType="serviceRequests" />;

// Multi-chart dashboard component
interface DashboardProps {
  charts: Array<{
    dataType: DynamicBarProps["dataType"];
    endpoint?: string;
    chartType?: DynamicBarProps["chartType"];
    title?: string;
    colSpan?: number;
  }>;
  refreshInterval?: number;
}

export const ChartDashboard: React.FC<DashboardProps> = ({
  charts,
  refreshInterval,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {charts.map((chart, index) => (
        <div
          key={index}
          className={`${chart.colSpan ? `col-span-${chart.colSpan}` : ""}`}
        >
          <DynamicBar
            dataType={chart.dataType}
            endpoint={chart.endpoint}
            chartType={chart.chartType}
            title={chart.title}
            refreshInterval={refreshInterval}
          />
        </div>
      ))}
    </div>
  );
};

// Hook for chart data management
export const useChartData = (
  dataType: DynamicBarProps["dataType"],
  endpoint?: string
) => {
  const [data, setData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!endpoint) return;

    try {
      setLoading(true);
      const response = await fetch(endpoint);
      const result = await response.json();

      if (result.success) {
        setData(result.data || []);
        setError(null);
      } else {
        setError(result.error || "Failed to fetch data");
      }
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
