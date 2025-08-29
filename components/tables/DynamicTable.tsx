"use client";

import React, { useState, useEffect, useImperativeHandle } from "react";
import {
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlineTrash,
} from "react-icons/hi";
import { TableColumn, DynamicTableProps } from "@/types/tables";

const DynamicTable = React.forwardRef(({ config }: DynamicTableProps, ref) => {
  type RowType = {
    [key: string]: unknown; // Allow any type for flexibility
    _id?: string | number;
    id?: string | number;
  };
  const [data, setData] = useState<RowType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  type SortConfig = { key: string; direction: "asc" | "desc" | string } | null;
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  useEffect(() => {
    fetchData();
  }, [config.endpoint]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const options: RequestInit = {
        method: "GET",
        headers: config.headers ? { ...config.headers } : {},
      };
      const response = await fetch(config.endpoint, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch data");
      }

      setData(result.data || []);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    let direction = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === "asc" ? 1 : -1;
      if (bValue == null) return sortConfig.direction === "asc" ? -1 : 1;

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const formatCellValue = (value: unknown, column: TableColumn, row?: RowType): React.ReactNode => {
    // If a custom render function is provided, use it with the raw value
    if (column.render) {
      return column.render(value, row);
    }

    // Handle different column types
    switch (column.type) {
      case "date":
        if (value instanceof Date) {
          return value.toLocaleDateString("fa-IR");
        }
        if (typeof value === "string" || typeof value === "number") {
          const date = new Date(value);
          return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("fa-IR");
        }
        return "-";
      case "phone":
        return value ? String(value) : "-";
      case "email":
        return value ? String(value) : "-";
      case "status":
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              value === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {value === "active" ? "فعال" : "غیرفعال"}
          </span>
        );
      default:
        return value !== undefined && value !== null ? String(value) : "-";
    }
  };

  const refreshData = () => {
    fetchData();
  };

  useImperativeHandle(ref, () => ({
    refreshData,
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700">خطا در بارگذاری داده‌ها: {error}</p>
        <button
          onClick={fetchData}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${config.className || ""}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
        {config.description && (
          <p className="text-gray-600 mt-1">{config.description}</p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {config.columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center justify-between">
                    {column.label}
                    {column.sortable && (
                      <span className="ml-2">
                        {sortConfig?.key === column.key
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : "↕"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {(config.actions?.view ||
                config.actions?.edit ||
                config.actions?.delete) && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عملیات
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={config.columns.length + 1}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  هیچ داده‌ای یافت نشد
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => (
                <tr
                  key={row._id || row.id || index}
                  className="hover:bg-gray-50"
                >
                  {config.columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {formatCellValue(row[column.key], column, row)}
                    </td>
                  ))}
                  {(config.actions?.view ||
                    config.actions?.edit ||
                    config.actions?.delete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1">
                        {config.actions?.view && (
                          <div className="relative group">
                            <button
                              onClick={() => config.onView?.(row)}
                              className="text-blue-600 border hover:text-blue-900 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center justify-center"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                            </button>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              مشاهده جزئیات
                            </span>
                          </div>
                        )}
                        {config.actions?.edit && (
                          <div className="relative group">
                            <button
                              onClick={() => config.onEdit?.(row)}
                              className="text-amber-600 border hover:text-amber-900 px-3 py-2 rounded-lg hover:bg-amber-50 transition-all duration-200 flex items-center justify-center"
                            >
                              <HiOutlinePencilAlt className="w-4 h-4" />
                            </button>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              ویرایش
                            </span>
                          </div>
                        )}
                        {config.actions?.delete && (
                          <div className="relative group">
                            <button
                              onClick={() => config.onDelete?.(row)}
                              className="text-red-600 border hover:text-red-900 px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 flex items-center justify-center"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              حذف
                            </span>
                          </div>
                        )}
                        {config.actions?.custom?.map((action, index) => (
                          <div key={index} className="relative group">
                            <button
                              onClick={() => action.onClick(row)}
                              className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                                action.className ||
                                "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                              }`}
                              style={{
                                display: action.condition
                                  ? action.condition(row)
                                    ? "flex"
                                    : "none"
                                  : "flex",
                              }}
                            >
                              <span className="w-4 h-4 text-sm flex items-center justify-center">
                                {action.icon}
                              </span>
                            </button>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              {action.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            نمایش {sortedData.length} آیتم
          </div>
          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            بروزرسانی
          </button>
        </div>
      </div>
    </div>
  );
});

DynamicTable.displayName = "DynamicTable";

export default DynamicTable;