"use client";

import React, { useState, useEffect, useCallback } from "react";
import { HiX, HiExclamationCircle } from "react-icons/hi";
import { HiOutlineSparkles } from "react-icons/hi2";

export interface FieldOption {
  value: string | number | boolean;
  label: string;
}

export interface FormField {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
  options?: FieldOption[];
  optionsEndpoint?: string;
  optionLabelKey?: string;
  render?: (value: unknown, data: Record<string, unknown>) => React.ReactNode;
}

export interface ModalConfig {
  title: string;
  type: "view" | "edit" | "delete" | "custom";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  fields?: FormField[];
  onSuccess?: (data: {
    [key: string]: unknown; 
  }) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
  customContent?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

interface DynamicModalProps {
  isOpen: boolean;
  config: ModalConfig;
  itemId?: string | undefined | null;
  initialData?: Record<string, unknown>;
}

const DynamicModal: React.FC<DynamicModalProps> = ({
  isOpen,
  config,
  itemId,
  initialData,
}) => {
  const [data, setData] = useState<Record<string, unknown>>(initialData || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldOptions, setFieldOptions] = useState<{[key: string]: FieldOption[]}>({});

  const fetchData = useCallback(async () => {
    if (!itemId || !config.endpoint) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(config.endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          id: itemId,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch data");
      }

      setData(result.data || {});
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      if (config.onError) {
        config.onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [itemId, config.endpoint, config.onError]);

  const fetchFieldOptions = useCallback(async () => {
    const fieldsWithEndpoints = config.fields?.filter(field => field.optionsEndpoint) || [];
    
    for (const field of fieldsWithEndpoints) {
      try {
        const response = await fetch(field.optionsEndpoint!);
        const result = await response.json();
        
        if (response.ok && result.success) {
          const options = result.data.map((item: Record<string, unknown>) => ({
            value: item._id as string,
            label: field.optionLabelKey ? (item[field.optionLabelKey] as string) : (item.name as string)
          }));
          
          setFieldOptions(prev => ({
            ...prev,
            [field.key]: options
          }));
        }
      } catch (err) {
        console.error(`Failed to fetch options for ${field.key}:`, err);
      }
    }
  }, [config.fields]);

  const handleClose = useCallback(() => {
    if (loading) return; // Prevent closing while loading
    setData({});
    setError(null);
    if (config.onClose) {
      config.onClose();
    }
  }, [loading, config.onClose]);

  useEffect(() => {
    if (isOpen && itemId && config.endpoint && config.type !== "delete") {
      fetchData();
    }
    if (isOpen) {
      fetchFieldOptions();
    }
  }, [isOpen, itemId, config.endpoint, config.type, fetchData, fetchFieldOptions]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, loading, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId || !config.endpoint) return;

    try {
      setLoading(true);
      setError(null);

      const method =
        config.method || (config.type === "delete" ? "DELETE" : "PATCH");

      const response = await fetch(config.endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          id: itemId,
        },
        body: config.type !== "delete" ? JSON.stringify(data) : undefined,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Operation failed");
      }

      if (config.onSuccess) {
        config.onSuccess(result);
      }

      handleClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      if (config.onError) {
        config.onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName: string, value: unknown) => {
    setData((prev: Record<string, unknown>) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const getSizeClass = () => {
    switch (config.size) {
      case "sm":
        return "max-w-sm sm:max-w-md";
      case "lg":
        return "max-w-2xl sm:max-w-4xl";
      case "xl":
        return "max-w-4xl sm:max-w-6xl";
      case "full":
        return "max-w-full mx-4 sm:mx-8";
      default:
        return "max-w-lg sm:max-w-2xl";
    }
  };

  const getTypeIcon = () => {
    switch (config.type) {
      case "delete":
        return (
          <HiExclamationCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        );
      case "view":
        return <HiOutlineSparkles className="w-8 h-8 text-blue-500" />;
      case "edit":
        return <HiOutlineSparkles className="w-8 h-8 text-amber-500" />;
      default:
        return null;
    }
  };

  const renderField = (field: FormField) => {
    const value = data[field.key] || "";
    const isReadOnly = config.type === "view";

    // Use custom render function if available and in view mode
    if (isReadOnly && field.render && typeof field.render === 'function') {
      const renderedValue = field.render(value, data);
      return (
        <div
          key={field.key}
          className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed text-gray-600 border-gray-200 min-h-[44px] flex items-center"
        >
          {renderedValue || "-"}
        </div>
      );
    }

    const baseClassName = `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
      isReadOnly
        ? "bg-gray-50 cursor-not-allowed text-gray-600 border-gray-200"
        : "border-gray-300 hover:border-gray-400 focus:hover:border-blue-500"
    }`;

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            key={field.key}
            value={value as string}
            onChange={(e) =>
              !isReadOnly && handleInputChange(field.key, e.target.value)
            }
            placeholder={field.placeholder}
            className={`${baseClassName} min-h-[100px] resize-vertical`}
            readOnly={isReadOnly}
            rows={4}
          />
        );

      case "select":
        const options = field.optionsEndpoint ? fieldOptions[field.key] || [] : field.options || [];
        return (
          <select
            key={field.key}
            value={value as string}
            onChange={(e) =>
              !isReadOnly && handleInputChange(field.key, e.target.value)
            }
            className={baseClassName}
            disabled={isReadOnly}
          >
            <option value="">انتخاب کنید...</option>
            {options.map((option: FieldOption) => (
              <option key={String(option.value)} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "date":
        return (
          <input
            key={field.key}
            type="text"
            value={value ? new Date(value as string).toLocaleDateString("fa-IR") : ""}
            className={`${baseClassName} bg-gray-50`}
            readOnly
          />
        );

      default:
        return (
          <input
            key={field.key}
            type={field.type || "text"}
            value={value as string}
            onChange={(e) =>
              !isReadOnly && handleInputChange(field.key, e.target.value)
            }
            placeholder={field.placeholder}
            className={baseClassName}
            readOnly={isReadOnly}
          />
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <div
        className={`bg-white rounded-xl shadow-2xl ${getSizeClass()} w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center p-4 sm:p-6 border-b `}
        >
          <div className="flex items-center space-x-3 space-x-reverse">
            {/* {config.type !== "delete" && getTypeIcon()} */}
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {config.title}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-full p-2 transition-all duration-200"
            disabled={loading}
            aria-label="بستن"
          >
            <HiX className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-160px)]">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-32 sm:h-40">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-base">
                در حال بارگذاری...
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3 space-x-reverse">
                <HiExclamationCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-red-800 font-medium mb-1">
                    خطا در بارگذاری
                  </h4>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          ) : config.type === "delete" ? (
            <div className="text-center py-4 sm:py-6">
              {getTypeIcon()}
              <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                تأیید حذف
              </h4>
              <p className="text-gray-600 mb-6 text-sm sm:text-base px-4">
                آیا از حذف این آیتم اطمینان دارید؟ این عمل قابل بازگشت نیست و
                تمام اطلاعات مرتبط حذف خواهد شد.
              </p>
            </div>
          ) : config.customContent ? (
            <div className="custom-content">{config.customContent}</div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {config.fields?.map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 mr-1">*</span>
                    )}
                  </label>
                  {renderField(field)}
                  {field.description && (
                    <p className="text-gray-500 text-xs sm:text-sm">
                      {field.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-start gap-2 p-4  border-t border-gray-200 bg-gray-50/50">
          <button
            onClick={handleClose}
            className="w-full sm:w-auto  px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm sm:text-base"
            disabled={loading}
            type="button"
          >
            {config.cancelText || "لغو"}
          </button>

          {config.type !== "view" && (
            <button
              onClick={(e)=>handleSubmit(e)}
              disabled={loading}
              type="button"
              className={`w-full sm:w-auto px-4 py-2.5 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                config.type === "delete"
                  ? "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                  در حال پردازش...
                </div>
              ) : (
                config.confirmText ||
                (config.type === "delete" ? "حذف" : "ذخیره تغییرات")
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default DynamicModal;
