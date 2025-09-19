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

interface DynamicTablePropsExtended extends DynamicTableProps {
  onToggleApproval?: (id: string, currentStatus: string) => Promise<void>;
}

const DynamicTable: React.FC<DynamicTablePropsExtended> = ({
  columns,
  data,
  loading = false,
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
  pagination,
  onPageChange,
  filterFields = [],
  onFilterChange,
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
    onFilterChange?.(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    if (onFilterChange) {
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
              value={String(value || "")}
              onChange={(e) => {
                const inputValue = e.target.value;
                updateFilter(field.key, inputValue === "" ? null : inputValue);
              }}
              placeholder={field.placeholder}
              className="w-full p-3 pl-10 pr-4 border border-gray-300 rounded-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
            />
            <BiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 text-lg" />
          </div>
        );

      case "select":
        return (
          <select
            value={String(value || "")}
            onChange={(e) => {
              const selectValue = e.target.value;
              updateFilter(field.key, selectValue === "" ? null : selectValue);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
          >
            <option value="">{field.placeholder || "انتخاب کنید"}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "number":
        return (
          <input
            type="number"
            value={String(value || "")}
            onChange={(e) => updateFilter(field.key, Number(e.target.value))}
            placeholder={field.placeholder}
            min={field.min || 0}
            className="w-full p-3 border border-gray-300 rounded-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
          />
        );

      case "numberRange":
        const numRange = Array.isArray(value)
          ? (value as [number, number])
          : ([0, 0] as [number, number]);
        return (
          <div className="flex gap-2">
            <input
              type="number"
              value={String(numRange[0] || "")}
              onChange={(e) =>
                updateFilter(field.key, [
                  Number(e.target.value) || 0,
                  Number(numRange[1]) || 0,
                ])
              }
              placeholder="حداقل"
              className="w-full p-3 border border-gray-300 rounded-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
            />
            <span className="flex items-center text-gray-400">-</span>
            <input
              type="number"
              value={String(numRange[1] || "")}
              onChange={(e) =>
                updateFilter(field.key, [
                  Number(numRange[0]) || 0,
                  Number(e.target.value) || 0,
                ])
              }
              placeholder="حداکثر"
              className="w-full p-3 border border-gray-300 rounded-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
            />
          </div>
        );

      case "date":
        return (
          <input
            type="date"
            value={String(value || "")}
            onChange={(e) => updateFilter(field.key, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
          />
        );

      case "dateRange":
        const dateRange = Array.isArray(value)
          ? (value as [string, string])
          : (["", ""] as [string, string]);
        return (
          <div className="flex gap-2">
            <div className="relative flex-1">
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
                containerClassName="w-full"
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
                containerClassName="w-full"
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
      if (onRefresh) onRefresh();
    } catch (error) {
      console.log("Error deleting item:", error);
      toast.error("خطا در حذف آیتم");
    }
  };

  return (
    <div className="w-full">
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <BiFilterAlt className="text-blue-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-800">فیلترها</h3>
        </div>
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
          {filterFields &&
            filterFields.map((field) => (
              <motion.div
                key={field.key}
                className="relative flex-1 min-w-0"
                transition={{ duration: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm flex items-center gap-2"
                >
                  <IoClose className="text-lg" />
                  <span className="hidden sm:inline">پاک کردن</span>
                </motion.button>
              )}
            </AnimatePresence>

            <motion.div
              className="flex items-center px-3 py-3.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <span className="hidden sm:inline">
                {filteredData.length} نتیجه
              </span>
              <span className="sm:hidden">{filteredData.length}</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <div className="overflow-x-auto shadow rounded-lg md:overflow-x-scroll">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 text-left text-sm font-medium text-gray-600"
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
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">
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
                  className="text-center text-gray-700 py-6"
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
                  className={`border-b hover:bg-gray-50 cursor-pointer`}
                >
                  {columns.map((col, index) => (
                    <td
                      key={index}
                      className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap"
                    >
                      {col.render
                        ? col.render(
                            row[col.key] as string | number | boolean,
                            row
                          )
                        : isPriceColumn(col.key, row[col?.key] ?? "")
                        ? `${Number(row[col.key]).toLocaleString()} ریال`
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
          className="flex flex-col sm:flex-row items-center justify-between mt-6 px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl shadow-sm gap-3 sm:gap-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center text-xs sm:text-sm font-medium text-gray-600">
            <span className="bg-gray-100 px-2 sm:px-3 py-1 rounded-full text-center">
              <span className="hidden sm:inline">
                نمایش{" "}
                <span className="font-bold text-blue-600">
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                </span>{" "}
                تا{" "}
                <span className="font-bold text-blue-600">
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )}
                </span>{" "}
                از{" "}
                <span className="font-bold text-green-600">
                  {pagination.totalItems}
                </span>{" "}
                نتیجه
              </span>
              <span className="sm:hidden">
                <span className="font-bold text-blue-600">
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )}
                </span>{" "}
                از{" "}
                <span className="font-bold text-green-600">
                  {pagination.totalItems}
                </span>
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              whileHover={pagination.hasPrevPage ? { scale: 1.05 } : {}}
              whileTap={pagination.hasPrevPage ? { scale: 0.95 } : {}}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                pagination.hasPrevPage
                  ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              قبلی
            </motion.button>
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md">
              {pagination.currentPage} / {pagination.totalPages}
            </div>
            <motion.button
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              whileHover={pagination.hasNextPage ? { scale: 1.05 } : {}}
              whileTap={pagination.hasNextPage ? { scale: 0.95 } : {}}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                pagination.hasNextPage
                  ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              بعدی
            </motion.button>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {isModalOpen && selectedRow && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl w-11/12 md:max-w-xl p-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  جزئیات رکورد
                </h3>
                <button onClick={closeModal}>
                  <IoClose
                    size={24}
                    className="text-gray-600 hover:text-gray-800"
                  />
                </button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto px-4">
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
                      return new Date(String(val)).toLocaleDateString("fa-IR");
                    }

                    if (val !== undefined && isPriceColumn(key, val)) {
                      return `${Number(val).toLocaleString()} ریال`;
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
                        obj.name ?? obj.code ?? obj.title ?? obj._id ?? "نامشخص"
                      );
                    }

                    return String(val || "");
                  };

                  return (
                    <div
                      key={key}
                      className="flex justify-between border-b pb-2"
                    >
                      <span className="font-medium text-gray-700">
                        {translateField(key)}
                      </span>
                      <span className="text-gray-900 break-all">
                        {getDisplayValue()}
                      </span>
                    </div>
                  );
                })}
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeEditModal}
            >
              <motion.div
                className="rounded-lg w-full max-w-6xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 overflow-auto rounded-lg ">
                  {isEditModalOpen && selectedRow && (
                    <DynamicUpdateForm
                      title={formTitle}
                      subtitle={formSubtitle}
                      fields={formFields}
                      endpoint={endpoint}
                      itemId={selectedRow._id as string}
                      initialValues={selectedRow}
                      onSuccess={(data) => {
                        console.log(data, "data from edit modal");
                        setIsEditModalOpen(false);
                        onRefresh?.();
                        toast.success("آیتم با موفقیت بروزرسانی شد");
                      }}
                      onError={(error) => {
                        console.log("Error updating item:", error);
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
    </div>
  );
};

export default DynamicTable;
