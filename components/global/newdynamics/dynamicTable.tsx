"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoClose,
  IoEyeOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoAdd,
  IoRefresh,
} from "react-icons/io5";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { BiFilterAlt, BiSearch } from "react-icons/bi";
import toast from "react-hot-toast";
import DynamicUpdateForm from "./editModal";
import {
  DynamicTableProps,
  FormFieldValue,
  TableData,
  FilterField,
  FilterValues,
} from "@/types/dynamicTypes/types";
import { translateField } from "@/utilities/fieldTranslations";
import { useDynamicData } from "@/hooks/useDynamicData";

interface DynamicTablePropsExtended extends DynamicTableProps {
  onToggleApproval?: (id: string, currentStatus: string) => Promise<void>;
  customActions?: (row: TableData) => React.ReactNode;
  onAdd?: () => void;
  addButtonText?: string;
}

const DynamicTable: React.FC<DynamicTablePropsExtended> = ({
  columns,
  data: propData,
  loading: propLoading = false,
  initialSort = null,
  onSort,
  formFields = [],
  endpoint = "",
  formTitle = "ویرایش",
  formSubtitle = "لطفا اطلاعات را ویرایش کنید",
  onRefresh,
  onEditClick,
  showActions = true,
  onDelete,
  onToggleApproval, // New prop for approval toggle
  pagination: propPagination,
  onPageChange,
  filterFields = [],
  onFilterChange,
  customActions,
  onAdd,
  addButtonText = "افزودن",
}) => {
  const [sortConfig, setSortConfig] = useState<null | {
    key: string;
    direction: "asc" | "desc";
  }>(initialSort);
  const [selectedRow, setSelectedRow] = useState<TableData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Use SWR hook when endpoint is provided
  const {
    data: swrData,
    loading: swrLoading,
    pagination: swrPagination,
    mutate,
  } = useDynamicData({
    endpoint,
    filters,
    page: currentPage,
    limit: 10,
  });

  // Use SWR data if endpoint is provided, otherwise use props
  const data = endpoint ? swrData : propData || [];
  const loading = endpoint ? swrLoading : propLoading;
  const pagination = endpoint ? swrPagination : propPagination;

  const handleRefresh = () => {
    if (endpoint) {
      mutate();
    } else if (onRefresh) {
      onRefresh();
    }
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    const newConfig = { key, direction };
    setSortConfig(newConfig);
    onSort?.(key, direction);
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let cmp = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }
      return sortConfig.direction === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [data, sortConfig]);

  const filteredData = useMemo(() => {
    if (onFilterChange) {
      return sortedData;
    }

    if (!filterFields || filterFields.length === 0) {
      return sortedData;
    }

    return sortedData.filter((row) => {
      return filterFields.every((field) => {
        const filterValue = filters[field.key];
        if (!filterValue) return true;

        const rowValue = row[field.key];
        if (rowValue === undefined || rowValue === null) return false;

        switch (field.type) {
          case "text":
            return String(rowValue)
              .toLowerCase()
              .includes(String(filterValue).toLowerCase());

          case "select":
            return String(rowValue) === String(filterValue);

          case "number":
            return Number(rowValue) === Number(filterValue);

          case "numberRange":
            if (Array.isArray(filterValue) && filterValue.length >= 2) {
              const [min, max] = filterValue;
              const numValue = Number(rowValue);
              return numValue >= Number(min) && numValue <= Number(max);
            }
            return true;

          case "date":
            const rowDate = new Date(String(rowValue));
            const filterDate = new Date(String(filterValue));
            return rowDate.toDateString() === filterDate.toDateString();

          case "dateRange":
            if (Array.isArray(filterValue) && filterValue.length >= 2) {
              const [startDate, endDate] = filterValue;
              const rowDate = new Date(String(rowValue));
              const start = new Date(String(startDate));
              const end = new Date(String(endDate));
              start.setHours(0, 0, 0, 0);
              end.setHours(23, 59, 59, 999);
              return rowDate >= start && rowDate <= end;
            }
            return true;

          default:
            return true;
        }
      });
    });
  }, [sortedData, filters, filterFields, onFilterChange]);

  const openModal = (row: TableData) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const openEditModal = (row: TableData) => {
    if (onEditClick) {
      const shouldPreventDefault = onEditClick(row) === false;
      if (shouldPreventDefault) {
        return;
      }
    }

    setSelectedRow(row);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (e: React.MouseEvent, row: TableData) => {
    e.stopPropagation();
    setSelectedRow(row);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRow(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedRow(null);
  };

  const handleToggleApproval = async (row: TableData) => {
    if (!row._id) return;
    const currentStatus = row.approved ? "approved" : "not_approved";
    const newStatus =
      currentStatus === "approved" ? "not_approved" : "approved";

    try {
      if (onToggleApproval) {
        await onToggleApproval(row._id as string, newStatus);
      }
    } catch (error) {
      console.error("Error toggling approval status:", error);
      toast.error("خطا در تغییر وضعیت فاکتور");
    }
  };

  const isPriceColumn = (key: string, value: FormFieldValue): boolean => {
    const priceKeywords = [
      "price",
      "amount",
      "total",
      "serviceFeeValue",
      "serviceFee",
      "fee",
      "cost",
      "قیمت",
      "مبلغ",
      "هزینه",
      "قیمت کل",
    ];
    const isPriceKey = priceKeywords.some((keyword) =>
      key.toLowerCase().includes(keyword)
    );

    const isNumeric =
      typeof value === "number" ||
      (typeof value === "string" &&
        !isNaN(Number(value)) &&
        value.trim() !== "");

    return isPriceKey && isNumeric;
  };

  const updateFilter = (key: string, value: FilterValues[string]) => {
    const newFilters = { ...filters };

    if (
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.every((v) => !v))
    ) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }

    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
    if (!endpoint) {
      onFilterChange?.(newFilters);
    }
  };

  const clearAllFilters = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    setCurrentPage(1); // Reset to first page when clearing filters
    if (!endpoint && onFilterChange) {
      onFilterChange(emptyFilters);
    }
  };

  const renderFilterField = (field: FilterField) => {
    const value = filters[field.key];

    switch (field.type) {
      case "text":
        return (
          <div className="relative">
            <input
              type="text"
              value={value ? String(value) : ""}
              onChange={(e) => {
                const inputValue = e.target.value;
                updateFilter(field.key, inputValue === "" ? null : inputValue);
              }}
              placeholder={field.placeholder}
              className="w-full p-4 pl-12 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
            />
            <BiSearch className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white/50 text-lg" />
          </div>
        );

      case "select":
        return (
          <select
            value={value ? String(value) : ""}
            onChange={(e) => {
              const selectValue = e.target.value;
              updateFilter(field.key, selectValue === "" ? null : selectValue);
            }}
            className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
          >
            <option value="" className="bg-gray-800 text-white">
              {field.placeholder || "انتخاب کنید"}
            </option>
            {field.options?.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-gray-800 text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
        );

      case "number":
        return (
          <input
            type="number"
            value={value ? String(value) : ""}
            onChange={(e) => {
              const numValue = e.target.value;
              updateFilter(
                field.key,
                numValue === "" ? null : Number(numValue)
              );
            }}
            placeholder={field.placeholder}
            min={field.min || 0}
            className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
          />
        );

      case "numberRange":
        const numRange = Array.isArray(value)
          ? (value as [number, number])
          : ([null, null] as [number | null, number | null]);
        return (
          <div className="flex gap-2">
            <input
              type="number"
              value={numRange[0] ? String(numRange[0]) : ""}
              onChange={(e) => {
                const minValue =
                  e.target.value === "" ? null : Number(e.target.value);
                const maxValue = numRange[1];
                if (minValue !== null || maxValue !== null) {
                  updateFilter(field.key, [minValue || 0, maxValue || 0]);
                } else {
                  updateFilter(field.key, null);
                }
              }}
              placeholder="حداقل"
              className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
            />
            <span className="flex items-center text-white/50">-</span>
            <input
              type="number"
              value={numRange[1] ? String(numRange[1]) : ""}
              onChange={(e) => {
                const maxValue =
                  e.target.value === "" ? null : Number(e.target.value);
                const minValue = numRange[0];
                if (minValue !== null || maxValue !== null) {
                  updateFilter(field.key, [minValue || 0, maxValue || 0]);
                } else {
                  updateFilter(field.key, null);
                }
              }}
              placeholder="حداکثر"
              className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
            />
          </div>
        );

      case "date":
        return (
          <input
            type="date"
            value={value ? String(value) : ""}
            onChange={(e) => {
              const dateValue = e.target.value;
              updateFilter(field.key, dateValue === "" ? null : dateValue);
            }}
            className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
          />
        );

      case "dateRange":
        const dateRange = Array.isArray(value)
          ? (value as [string, string])
          : (["", ""] as [string, string]);
        return (
          <div className="flex gap-2 relative">
            <div className="relative flex-1 z-100">
              <DatePicker
                value={
                  dateRange[0] ? new DateObject(new Date(dateRange[0])) : null
                }
                onChange={(val) => {
                  const fromDate = val
                    ? val.toDate().toISOString().split("T")[0]
                    : "";
                  const newRange: [string, string] = [fromDate, dateRange[1]];
                  if (fromDate || dateRange[1]) {
                    updateFilter(field.key, newRange);
                  } else {
                    updateFilter(field.key, null);
                  }
                }}
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD"
                placeholder="از تاریخ"
                inputClass="w-full p-3 pr-4 pl-8 border border-gray-300 rounded-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-right"
                calendarPosition="bottom-center"
                containerClassName="w-full z-100"
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                📅
              </div>
            </div>
            <div className="relative flex-1">
              <DatePicker
                value={
                  dateRange[1] ? new DateObject(new Date(dateRange[1])) : null
                }
                onChange={(val) => {
                  const toDate = val
                    ? val.toDate().toISOString().split("T")[0]
                    : "";
                  const newRange: [string, string] = [dateRange[0], toDate];
                  if (dateRange[0] || toDate) {
                    updateFilter(field.key, newRange);
                  } else {
                    updateFilter(field.key, null);
                  }
                }}
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD"
                placeholder="تا تاریخ"
                inputClass="w-full p-3 pr-4 pl-8 border border-gray-300 rounded-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-right"
                calendarPosition="bottom-center"
                containerClassName="w-full z-100"
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                📅
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleDelete = async () => {
    if (!selectedRow || !selectedRow._id) return;

    try {
      if (onDelete) {
        await onDelete(selectedRow._id as string);
      } else if (endpoint) {
        const response = await fetch(`${endpoint}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: selectedRow._id }),
        });

        if (response.ok) {
          toast.success("آیتم با موفقیت حذف شد");
        } else {
          toast.error("خطا در حذف آیتم");
        }
      }

      closeDeleteModal();
      if (endpoint) {
        mutate();
      } else if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.log(error);
      toast.error("خطا در حذف آیتم");
    }
  };

  return (
    <div className="w-full">
      {/* Mobile Action Bar - Only show on small screens */}
      <motion.div
        className="flex lg:hidden items-center justify-between gap-3 mb-6 p-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 flex-1">
          {onAdd && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAdd}
              className="flex items-center gap-2 px-4 py-3 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-200 rounded-xl hover:bg-blue-500/30 transition-all duration-300 font-medium text-sm"
            >
              <IoAdd className="text-lg" />
              <span className="hidden sm:inline">{addButtonText}</span>
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-3 bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-200 rounded-xl hover:bg-green-500/30 transition-all duration-300 font-medium text-sm"
          >
            <IoRefresh className="text-lg" />
            <span className="hidden sm:inline">بروزرسانی</span>
          </motion.button>

          {filterFields && filterFields.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 text-purple-200 rounded-xl hover:bg-purple-500/30 transition-all duration-300 font-medium text-sm relative"
            >
              <BiFilterAlt className="text-lg" />
              <span className="hidden sm:inline">فیلتر</span>
              {Object.keys(filters).some((key) => filters[key]) && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">
                    {Object.keys(filters).filter(key => filters[key]).length}
                  </span>
                </div>
              )}
            </motion.button>
          )}
        </div>

        <motion.div
          className="flex items-center px-3 py-3 bg-purple-500/20 text-purple-200 rounded-xl text-xs font-medium border border-purple-400/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {filteredData.length}
        </motion.div>
      </motion.div>

      {/* Desktop Filter Bar - Only show on large screens */}
      <motion.div
        className="hidden lg:block bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <BiFilterAlt className="text-purple-400 text-2xl" />
          <h3 className="text-xl font-bold text-white/90">فیلترها</h3>
        </div>
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
          {filterFields &&
            filterFields.map((field) => (
              <motion.div
                key={field.key}
                className="relative flex-1 min-w-0"
                transition={{ duration: 0.2 }}
              >
                <label className="block text-sm font-medium text-white/90 mb-3">
                  {field.label}
                </label>
                {renderFilterField(field)}
              </motion.div>
            ))}

          <motion.div
            className="flex gap-2 lg:flex-shrink-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {onAdd && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={onAdd}
                className="px-6 py-3 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-200 rounded-xl hover:bg-blue-500/30 transition-all duration-300 font-medium text-sm flex items-center gap-2"
              >
                <IoAdd className="text-lg" />
                <span>{addButtonText}</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={handleRefresh}
              className="px-6 py-3 bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-200 rounded-xl hover:bg-green-500/30 transition-all duration-300 font-medium text-sm flex items-center gap-2"
            >
              <IoRefresh className="text-lg" />
              <span>بروزرسانی</span>
            </motion.button>

            <AnimatePresence>
              {Object.keys(filters).some((key) => filters[key]) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium text-sm flex items-center gap-2"
                >
                  <IoClose className="text-lg" />
                  <span>پاک کردن</span>
                </motion.button>
              )}
            </AnimatePresence>

            <motion.div
              className="flex items-center px-4 py-5 bg-purple-500/20 text-purple-200 rounded-xl text-sm font-medium border border-purple-400/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {filteredData.length} نتیجه
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <div className="overflow-x-auto shadow-2xl rounded-2xl md:overflow-x-scroll bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 scrollbar-luxury">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 backdrop-blur-sm">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-left text-sm font-semibold text-white/90"
                >
                  <div
                    className={`flex items-center gap-1 ${
                      col.sortable ? "cursor-pointer hover:underline" : ""
                    }`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span>{col.header}</span>
                    {col.sortable && sortConfig?.key === col.key && (
                      <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
              ))}
              {showActions && (
                <th className="px-6 py-4 text-right text-sm font-semibold text-white/90">
                  عملیات
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="text-center text-white/70 py-8"
                >
                  در حال بارگذاری...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="text-center text-black py-6"
                >
                  داده‌ای برای نمایش وجود ندارد.
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => (
                <tr
                  key={idx}
                  data-row-id={row._id}
                  className="border-b border-white/10 hover:bg-white/5 cursor-pointer transition-all duration-200"
                >
                  {columns.map((col, index) => (
                    <td
                      key={index}
                      className="px-6 py-4 text-sm text-white/90 whitespace-nowrap"
                    >
                      {col.render
                        ? col.render(
                            row[col.key] as string | number | boolean,
                            row
                          )
                        : isPriceColumn(col.key, row[col?.key] ?? "")
                        ? `${Number(row[col.key]).toLocaleString()} تومان`
                        : row[col.key] || ""}
                    </td>
                  ))}

                  {showActions && (
                    <td className="px-6 py-4 text-sm ">
                      <div className="flex justify-start items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(row);
                          }}
                          className="text-blue-500 hover:text-blue-700"
                          title="نمایش"
                        >
                          <IoEyeOutline size={18} />
                        </button>
                        {endpoint && formFields.length > 0 && (
                          <>
                            <button
                              onClick={() => openEditModal(row)}
                              className="text-yellow-500 hover:text-yellow-700"
                              title="ویرایش"
                            >
                              <IoPencilOutline size={18} />
                            </button>
                            <button
                              onClick={(e) => openDeleteModal(e, row)}
                              className="text-red-500 hover:text-red-700"
                              title="حذف"
                            >
                              <IoTrashOutline size={18} />
                            </button>
                            {onToggleApproval && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleApproval(row);
                                }}
                                className={`${
                                  row.approved
                                    ? "text-green-500 hover:text-green-700"
                                    : "text-red-500 hover:text-red-700"
                                }`}
                                title={row.approved ? "عدم تایید" : "تایید"}
                              >
                                {row.approved ? (
                                  <IoCheckmarkCircleOutline size={18} />
                                ) : (
                                  <IoCloseCircleOutline size={18} />
                                )}
                              </button>
                            )}
                          </>
                        )}
                        {customActions && customActions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <motion.div
          className="flex items-center justify-between mt-8 px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl gap-2 sm:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Mobile-optimized info section */}
          <div className="flex items-center text-xs font-medium text-white/80 min-w-0 flex-shrink">
            <span className="bg-white/10 backdrop-blur-sm px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-center border border-white/20 truncate">
              <span className="hidden md:inline">
                نمایش{" "}
                <span className="font-bold text-blue-400">
                  {((pagination?.currentPage || 1) - 1) *
                    (pagination?.itemsPerPage || 10) +
                    1}
                </span>{" "}
                تا{" "}
                <span className="font-bold text-blue-400">
                  {Math.min(
                    (pagination?.currentPage || 1) *
                      (pagination?.itemsPerPage || 10),
                    pagination?.totalItems || 0
                  )}
                </span>{" "}
                از{" "}
                <span className="font-bold text-green-400">
                  {pagination?.totalItems || 0}
                </span>{" "}
                نتیجه
              </span>
              <span className="md:hidden text-xs">
                <span className="font-bold text-blue-400">
                  {((pagination?.currentPage || 1) - 1) *
                    (pagination?.itemsPerPage || 10) +
                    1}
                  -
                  {Math.min(
                    (pagination?.currentPage || 1) *
                      (pagination?.itemsPerPage || 10),
                    pagination?.totalItems || 0
                  )}
                </span>
                {" / "}
                <span className="font-bold text-green-400">
                  {pagination?.totalItems || 0}
                </span>
              </span>
            </span>
          </div>

          {/* Compact pagination controls */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <motion.button
              onClick={() => {
                const newPage = (pagination?.currentPage || 1) - 1;
                if (endpoint) {
                  setCurrentPage(newPage);
                } else {
                  onPageChange?.(newPage);
                }
              }}
              disabled={!pagination?.hasPrevPage}
              whileHover={pagination?.hasPrevPage ? { scale: 1.05 } : {}}
              whileTap={pagination?.hasPrevPage ? { scale: 0.95 } : {}}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs font-medium rounded-lg transition-all duration-300 ${
                pagination?.hasPrevPage
                  ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:from-purple-600 hover:to-violet-600 shadow-md"
                  : "bg-white/10 text-white/40 cursor-not-allowed border border-white/20"
              }`}
            >
              <span className="hidden sm:inline">قبلی</span>
              <span className="sm:hidden">‹</span>
            </motion.button>

            <div className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs font-bold bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg shadow-md border border-purple-400/30 min-w-[50px] sm:min-w-[60px] text-center">
              {pagination?.currentPage || 1} / {pagination?.totalPages || 1}
            </div>

            <motion.button
              onClick={() => {
                const newPage = (pagination?.currentPage || 1) + 1;
                if (endpoint) {
                  setCurrentPage(newPage);
                } else {
                  onPageChange?.(newPage);
                }
              }}
              disabled={!pagination?.hasNextPage}
              whileHover={pagination?.hasNextPage ? { scale: 1.05 } : {}}
              whileTap={pagination?.hasNextPage ? { scale: 0.95 } : {}}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs font-medium rounded-lg transition-all duration-300 ${
                pagination?.hasNextPage
                  ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:from-purple-600 hover:to-violet-600 shadow-md"
                  : "bg-white/10 text-white/40 cursor-not-allowed border border-white/20"
              }`}
            >
              <span className="hidden sm:inline">بعدی</span>
              <span className="sm:hidden">›</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {isModalOpen && selectedRow && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            {/* Luxury Background Elements */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full filter blur-3xl"></div>
            </div>

            <motion.div
              className="relative z-10 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 w-11/12 md:max-w-2xl p-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                boxShadow:
                  "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* Decorative corner elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-tr-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/20 to-transparent rounded-bl-3xl"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-center border-b border-white/20 pb-4 mb-6">
                  <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text">
                    جزئیات رکورد
                  </h3>
                  <button onClick={closeModal}>
                    <IoClose
                      size={24}
                      className="text-white/70 hover:text-white transition-colors"
                    />
                  </button>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto px-2 scrollbar-luxury">
                  {Object.entries(selectedRow).map(([key, val]) => {
                    if (
                      [
                        "_id",
                        "type",
                        "phone",
                        "provider",
                        "date",
                        "updatedAt",
                        "glass",
                      ].includes(key)
                    )
                      return null;

                    const column = columns.find((col) => col.key === key);

                    const getDisplayValue = () => {
                      if (key === "glassCount") {
                        if (
                          selectedRow.glass &&
                          Array.isArray(selectedRow.glass)
                        ) {
                          return selectedRow.glass.length.toString();
                        }
                        return "0";
                      }

                      if (key === "approved") {
                        return val ? "تایید شده" : "تایید نشده";
                      }

                      if (column?.render) {
                        return column.render(
                          val as string | number | boolean,
                          selectedRow
                        );
                      }

                      if (key === "createdAt" || key === "updatedAt") {
                        return new Date(String(val)).toLocaleDateString(
                          "fa-IR"
                        );
                      }

                      if (val !== undefined && isPriceColumn(key, val)) {
                        return `${Number(val).toLocaleString()} تومان`;
                      }

                      if (Array.isArray(val)) {
                        type ItemWithNameOrId =
                          | string
                          | number
                          | boolean
                          | {
                              name?: string;
                              code?: string;
                              title?: string;
                              _id?: string;
                            };

                        return val
                          .map((item: ItemWithNameOrId) => {
                            if (typeof item === "object" && item !== null) {
                              return (
                                item.name ??
                                item.code ??
                                item.title ??
                                item._id ??
                                "نامشخص"
                              );
                            }
                            return String(item);
                          })
                          .join(", ");
                      }

                      if (typeof val === "object" && val !== null) {
                        const obj = val as {
                          name?: string;
                          code?: string;
                          title?: string;
                          _id?: string;
                        };
                        return (
                          obj.name ??
                          obj.code ??
                          obj.title ??
                          obj._id ??
                          "نامشخص"
                        );
                      }

                      return String(val || "");
                    };

                    return (
                      <div
                        key={key}
                        className="flex justify-between border-b border-white/10 pb-3 mb-3"
                      >
                        <span className="font-medium text-white/90">
                          {translateField(key)}
                        </span>
                        <span className="text-white/80 break-all">
                          {getDisplayValue()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen &&
          selectedRow &&
          formFields.length > 0 &&
          endpoint && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeEditModal}
            >
              {/* Luxury Background Elements */}
              <div className="absolute inset-0 z-0">
                <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full filter blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full filter blur-3xl"></div>
              </div>

              <motion.div
                className="relative z-10 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl w-full max-w-4xl shadow-2xl border border-white/20"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  boxShadow:
                    "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                }}
              >
                {/* Decorative corner elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-tr-3xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/20 to-transparent rounded-bl-3xl"></div>

                <div className="p-8 overflow-auto max-h-[90vh] relative z-10 scrollbar-luxury">
                  {isEditModalOpen && selectedRow && (
                    <DynamicUpdateForm
                      title={formTitle}
                      subtitle={formSubtitle}
                      fields={formFields}
                      endpoint={endpoint}
                      itemId={selectedRow._id as string}
                      initialValues={selectedRow}
                      onSuccess={() => {
                        setIsEditModalOpen(false);
                        if (endpoint) {
                          mutate();
                        } else {
                          onRefresh?.();
                        }
                        toast.success("آیتم با موفقیت بروزرسانی شد");
                      }}
                      onError={(error) => {
                        console.log(error);
                        toast.error("خطا در بروزرسانی آیتم");
                      }}
                      onCancel={() => setIsEditModalOpen(false)}
                    />
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && selectedRow && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDeleteModal}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl w-11/12 md:max-w-md p-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  تایید حذف
                </h3>
                <button onClick={closeDeleteModal}>
                  <IoClose
                    size={24}
                    className="text-gray-600 hover:text-gray-800"
                  />
                </button>
              </div>
              <div className="py-4">
                <p className="text-gray-700">
                  آیا از حذف {selectedRow.name} اطمینان دارید؟
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  این عملیات غیرقابل بازگشت است.
                </p>
              </div>
              <div className="flex justify-start gap-2">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md transition-all duration-300 hover:bg-gray-200"
                >
                  انصراف
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-red-600 font-medium rounded-md transition-all duration-300 hover:bg-red-600 hover:text-white"
                >
                  حذف
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFilterModalOpen(false)}
          >
            {/* Luxury Background Elements */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full filter blur-3xl"></div>
            </div>

            <motion.div
              className="relative z-10 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 w-11/12 max-w-2xl p-8 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                boxShadow:
                  "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* Decorative corner elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-tr-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/20 to-transparent rounded-bl-3xl"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-center border-b border-white/20 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <BiFilterAlt className="text-purple-400 text-2xl" />
                    <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text">
                      فیلترها
                    </h3>
                  </div>
                  <button onClick={() => setIsFilterModalOpen(false)}>
                    <IoClose
                      size={24}
                      className="text-white/70 hover:text-white transition-colors"
                    />
                  </button>
                </div>

                <div className="space-y-6 scrollbar-luxury">
                  {filterFields &&
                    filterFields.map((field) => (
                      <motion.div
                        key={field.key}
                        className="relative"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <label className="block text-sm font-medium text-white/90 mb-3">
                          {field.label}
                        </label>
                        {renderFilterField(field)}
                      </motion.div>
                    ))}
                </div>

                <div className="flex gap-3 mt-8 pt-6 border-t border-white/20">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsFilterModalOpen(false)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all duration-300 font-medium"
                  >
                    اعمال فیلتر
                  </motion.button>
                  
                  <AnimatePresence>
                    {Object.keys(filters).some((key) => filters[key]) && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          clearAllFilters();
                          setIsFilterModalOpen(false);
                        }}
                        className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium flex items-center gap-2"
                      >
                        <IoClose className="text-lg" />
                        پاک کردن
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                <motion.div
                  className="flex items-center justify-center gap-2 mt-4 px-4 py-3 bg-purple-500/20 text-purple-200 rounded-xl text-sm font-medium border border-purple-400/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <BiSearch className="text-lg" />
                  <span>{filteredData.length} نتیجه یافت شد</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DynamicTable;
