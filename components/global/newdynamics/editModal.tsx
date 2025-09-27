"use client";
import { useEffect, useState } from "react";
import { useDynamicForm } from "./forms";
import { ApiError, ApiResponse, FormField, FormValues } from "@/types/dynamicTypes/types";
import { formatNumber } from "@/utilities/numberComma";
import { IoClose } from "react-icons/io5";

export interface DynamicUpdateFormProps {
  title?: string;
  subtitle?: string;
  fields: FormField[];
  endpoint: string;
  itemId: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  onSuccess?: (data: ApiResponse) => void;
  onError?: (error: ApiError) => void;
  onCancel?: () => void;
  resetAfterSubmit?: boolean;
  method?: "POST" | "PATCH" | "PUT";
  encType?:
    | "application/json"
    | "multipart/form-data"
    | "application/x-www-form-urlencoded";
  className?: string;
  setFormValues?: (values: FormValues) => void;
  isSubmitting?: boolean;
  initialValues?: FormValues;
}

const DynamicUpdateForm: React.FC<DynamicUpdateFormProps> = ({
  title,
  subtitle,
  fields,
  endpoint,
  itemId,
  initialValues, // Add this prop
  submitButtonText = "بروزرسانی",
  cancelButtonText = "انصراف",
  onSuccess,
  onError,
  onCancel,
  resetAfterSubmit = true,
  encType = "application/json",
  className,
}) => {
  const {
    formValues,
    errors,
    handleChange,
    validateForm,
    resetForm,
    setFormValues,
  } = useDynamicForm(fields, initialValues);

  const [isSubmitting, setIsSubmitting] = useState(false);
  // Submission function using the Fetch API.
  const submissionFunction = async (data: FormValues): Promise<Response> => {
    const headers: Record<string, string> = {};
    let body: string | FormData;

    // Add the ID to the data object for the update operation
    const dataWithId: FormValues = {
      ...data,
      id: itemId,
    };

    if (encType === "application/json") {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(dataWithId);
    } else {
      // For multipart/form-data, create a FormData object
      const formData = new FormData();
      Object.entries(dataWithId).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (value instanceof File || value instanceof FileList) {
            if (value instanceof FileList) {
              Array.from(value).forEach((file) => {
                formData.append(key, file);
              });
            } else {
              formData.append(key, value);
            }
          } else if (Array.isArray(value)) {
            value.forEach((item) => {
              formData.append(key, String(item));
            });
          } else {
            formData.append(key, String(value));
          }
        }
      });
      body = formData;
    }

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        ...headers,
        "x-item-id": itemId,
      },
      body,
    });

    return response;
  };

  // Modify this useEffect in the DynamicUpdateForm component
  useEffect(() => {
    if (initialValues) {
      setFormValues(initialValues);
    }
  }, [initialValues]);

  // Handle form submission.
  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await submissionFunction(formValues);
      if (response.ok) {
        if (onSuccess) {
          const responseData: ApiResponse = await response.json();
          onSuccess(responseData);
        }
        // Only reset after successful submission
        if (resetAfterSubmit) {
          resetForm();
        }
      } else {
        if (onError) {
          const errorData: ApiError = new Error("Failed to update item");
          onError(errorData);
        }
      }
    } catch (error) {
      if (onError) {
        onError(error as ApiError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onFormSubmit}
      className={`relative w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto max-h-[70vh] sm:max-h-[80vh] overflow-auto bg-transparent p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 scrollbar-luxury ${className}`}
      dir="rtl"
    >
      {/* Close Button */}
      <button
        type="button"
        onClick={onCancel}
        className="absolute top-4 left-4 z-10 p-2 sm:p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl text-white/70 hover:text-white hover:bg-red-500/20 hover:border-red-400/30 transition-all duration-300 group"
        title="بستن"
      >
        <IoClose size={20} className="group-hover:text-red-400" />
      </button>

      {title && (
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-center mb-2 pt-8 sm:pt-6">{title}</h2>
      )}
      {subtitle && <p className="text-white/70 text-sm sm:text-base text-center mb-4 sm:mb-6 lg:mb-8">{subtitle}</p>}

      {fields.map((field) => {
        const fieldError = errors[field.name];
        return (
          <div key={field.name} className="space-y-2 sm:space-y-3 grid grid-cols-1">
            {field.type !== "checkbox" && (
              <label className="block text-sm sm:text-base font-medium text-white/90 mb-2 sm:mb-3">
                {field.label}
              </label>
            )}
            {(() => {
              switch (field.type) {
                case "textarea":
                  return (
                    <textarea
                      name={field.name}
                      placeholder={field.placeholder}
                      value={
                        typeof formValues[field.name] === "boolean" ||
                        formValues[field.name] instanceof File
                          ? ""
                          : String(formValues[field.name] || "")
                      }
                      onChange={(e) => handleChange(e, field)}
                      rows={field.rows || 3}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
                      disabled={field.disabled}
                      autoComplete={field.autoComplete}
                    />
                  );
                case "select":
                  const selectValue = formValues[field.name];
                  const displayValue = typeof selectValue === 'boolean' ? String(selectValue) : String(selectValue || "");
                  return (
                    <select
                      name={field.name}
                      value={displayValue}
                      onChange={(e) => {
                        // Handle boolean conversion for boolean fields
                        const value = e.target.value;
                        let convertedValue: string | boolean = value;
                        if (value === 'true') convertedValue = true;
                        else if (value === 'false') convertedValue = false;
                        
                        const syntheticEvent = {
                          target: { name: field.name, value: convertedValue }
                        } as React.ChangeEvent<HTMLSelectElement>;
                        handleChange(syntheticEvent, field);
                      }}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
                      disabled={field.disabled}
                    >
                      <option value="" className="bg-gray-800 text-white">
                        {field.placeholder || "انتخاب کنید"}
                      </option>
                      {field.options?.map((option, i) => (
                        <option
                          key={i}
                          value={option.value}
                          disabled={option.disabled}
                          className="bg-gray-800 text-white"
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  );
                case "multiselect":
                  return (
                    <select
                      name={field.name}
                      multiple
                      value={
                        Array.isArray(formValues[field.name])
                          ? (formValues[field.name] as string[])
                          : []
                      }
                      onChange={(e) => handleChange(e, field)}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
                      disabled={field.disabled}
                    >
                      {field.options?.map((option, i) => (
                        <option
                          key={i}
                          value={option.value}
                          disabled={option.disabled}
                          className="bg-gray-800 text-white"
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  );
                case "checkbox":
                case "switch":
                  return (
                    <div className="flex items-center py-2">
                      <input
                        type="checkbox"
                        name={field.name}
                        checked={!!formValues[field.name]}
                        onChange={(e) => handleChange(e, field)}
                        disabled={field.disabled}
                        className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 border-white/30 rounded focus:ring-purple-400/50 bg-white/10"
                      />
                      <span className="mr-3 sm:mr-4 text-sm sm:text-base text-white/90 font-medium">{field.label}</span>
                    </div>
                  );
                case "radio":
                  return (
                    <div className="space-y-3 sm:space-y-4">
                      {field.options?.map((option, i) => (
                        <label key={i} className="flex items-center space-x-2 py-1">
                          <input
                            type="radio"
                            name={field.name}
                            value={option.value}
                            checked={formValues[field.name] === option.value}
                            onChange={(e) => handleChange(e, field)}
                            disabled={field.disabled || option.disabled}
                            className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 border-white/30 focus:ring-purple-400/50 bg-white/10"
                          />
                          <span className="text-sm sm:text-base text-white/90 mr-3 sm:mr-4">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  );
                case "file":
                  return (
                    <input
                      type="file"
                      name={field.name}
                      onChange={(e) => handleChange(e, field)}
                      className="w-full text-sm sm:text-base text-white/90 p-3 sm:p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-lg file:border-0 file:bg-purple-500/20 file:text-purple-200 hover:file:bg-purple-500/30 file:text-xs sm:file:text-sm"
                      accept={field.accept}
                      multiple={field.multiple}
                      disabled={field.disabled}
                      readOnly={field.readOnly}
                    />
                  );
                case "number":
                  if (
                    field.name === "sellPrice" ||
                    field.name === "serviceFeeValue" ||
                    field.name === "buyPrice" || 
                    field.name === "price"
                  ) {
                    const rawValue = String(formValues[field.name] || "");

                    return (
                      <input
                        type="text"
                        name={field.name}
                        placeholder={field.placeholder}
                        value={formatNumber(rawValue)}
                        onChange={(e) => {
                          const onlyNumbers = e.target.value.replace(/\D/g, "");
                          handleChange(
                            {
                              target: { name: field.name, value: onlyNumbers },
                            } as unknown as React.ChangeEvent<HTMLInputElement>,
                            field
                          );
                        }}
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl text-white text-right placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
                        disabled={field.disabled}
                        readOnly={field.readOnly}
                        autoComplete={field.autoComplete}
                      />
                    );
                  }
                default:
                  // This covers default types: text, number, email, password, date, etc.
                  return (
                    <input
                      type={field.type}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={String(formValues[field.name] || "")}
                      onChange={(e) => handleChange(e, field)}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 text-right"
                      disabled={field.disabled}
                      readOnly={field.readOnly}
                      autoComplete={field.autoComplete}
                    />
                  );
              }
            })()}
            {fieldError && (
              <p className="text-xs sm:text-sm text-red-400 mt-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 sm:px-4 py-2 sm:py-3">{fieldError}</p>
            )}
          </div>
        );
      })}

      <div className="flex flex-col sm:flex-row justify-start gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-white/20 mt-6">
        <button
          type="submit"
          className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg sm:rounded-xl font-medium hover:from-purple-700 hover:to-violet-700 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-purple-500/25 min-h-[48px] touch-manipulation"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
          )}
          {isSubmitting ? "در حال ارسال..." : submitButtonText}
        </button>

        <button
          type="button"
          onClick={() => {
            resetForm();
            onCancel?.();
          }}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 rounded-lg sm:rounded-xl font-medium hover:bg-white/20 transition-all duration-300 min-h-[48px] touch-manipulation"
        >
          {cancelButtonText}
        </button>
      </div>
    </form>
  );
};

export default DynamicUpdateForm;
