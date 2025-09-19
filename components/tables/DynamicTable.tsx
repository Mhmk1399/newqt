"use client";

import React, { useState, useEffect, useImperativeHandle } from "react";
import {
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineSearch,
  HiOutlineFilter,
} from "react-icons/hi";
import { TableColumn, DynamicTableProps } from "@/types/tables";

interface FilterState {
  [key: string]: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const DynamicTable = React.forwardRef(({ config }: DynamicTableProps, ref) => {
  type RowType = {
    [key: string]: unknown;
    _id?: string | number;
    id?: string | number;
  };
  
  const [data, setData] = useState<RowType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  
  type SortConfig = { key: string; direction: "asc" | "desc" | string } | null;
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  useEffect(() => {
    fetchData();
  }, [config.endpoint, filters, search, pagination.page, pagination.limit]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const searchParams = new URLSearchParams();
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
      
      // Add search
      if (search) searchParams.append('search', search);
      
      // Add pagination
      searchParams.append('page', pagination.page.toString());
      searchParams.append('limit', pagination.limit.toString());
      
      const url = `${config.endpoint}?${searchParams.toString()}`;
      
      const options: RequestInit = {
        method: "GET",
        headers: config.headers ? { ...config.headers } : {},
      };
      
      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || "Failed to fetch data");
      }

      setData(result.data || []);
      if (result.pagination) {
        setPagination(result.pagination);
      }
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
      case "boolean":
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              value
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {value ? "فعال" : "غیرفعال"}
          </span>
        );
      default:
        return value !== undefined && value !== null ? String(value) : "-";
    }
  };

  const refreshData = () => {
    fetchData();
  };

  const handleActivateToggle = async (row: RowType) => {
    try {
      const response = await fetch(config.endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(config.headers || {})
        },
        body: JSON.stringify({
          id: row._id || row.id,
          isActive: !row.isActive
        })
      });

      const result = await response.json();
      if (result.success) {
        fetchData(); // Refresh data
        config.onActivate?.(row, !row.isActive);
      }
    } catch (error) {
      console.error('Error toggling activation:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
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
        <p className="text-red-700">خطا در بارگذاری دادهها: {error}</p>
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
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
            {config.description && (
              <p className="text-gray-600 mt-1">{config.description}</p>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <HiOutlineFilter className="w-4 h-4" />
            فیلترها
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <HiOutlineSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="جستجو..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          {showFilters && config.filters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              {config.filters.map((filter) => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {filter.label}
                  </label>
                  <select
                    value={filters[filter.key] || ""}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">همه</option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
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
                config.actions?.delete ||
                config.actions?.activate) && (
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
                  هیچ دادهای یافت نشد
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
                    config.actions?.delete ||
                    config.actions?.activate) && (
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
                        {config.actions?.activate && (
                          <div className="relative group">
                            <button
                              onClick={() => handleActivateToggle(row)}
                              className={`border px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                                row.isActive
                                  ? "text-red-600 hover:text-red-900 hover:bg-red-50"
                                  : "text-green-600 hover:text-green-900 hover:bg-green-50"
                              }`}
                            >
                              {row.isActive ? (
                                <HiOutlineXCircle className="w-4 h-4" />
                              ) : (
                                <HiOutlineCheckCircle className="w-4 h-4" />
                              )}
                            </button>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              {row.isActive ? "غیرفعال کردن" : "فعال کردن"}
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
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-700">
                نمایش {((pagination.page - 1) * pagination.limit) + 1} تا{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} از{' '}
                {pagination.total} مورد
              </div>
              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value={10}>10 مورد</option>
                <option value={25}>25 مورد</option>
                <option value={50}>50 مورد</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
              >
                قبلی
              </button>
              <span className="px-3 py-1 text-sm">
                صفحه {pagination.page} از {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
              >
                بعدی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

DynamicTable.displayName = "DynamicTable";

export default DynamicTable;