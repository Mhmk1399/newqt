"use client";
import { useEffect, useState } from "react";
import { useDynamicForm } from "./forms";
import { ApiError, ApiResponse, FormField, FormValues } from "@/types/dynamicTypes/types";
import { formatNumber } from "@/utilities/numberComma";

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
      _id: itemId,
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
      method: "PATCH",
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
      className={`max-w-5xl mx-auto max-h-[500px] overflow-auto bg-white shadow-md rounded-lg p-8 space-y-6 ${className}`}
      dir="rtl"
    >
      {title && (
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      )}
      {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}

      {fields.map((field) => {
        const fieldError = errors[field.name];
        return (
          <div key={field.name} className="space-y-1 grid grid-cols-1">
            {field.type !== "checkbox" && (
              <label className="block text-sm font-medium text-gray-700">
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
                      className="w-full px-3 py-2 border border-gray-300 placeholder:text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      disabled={field.disabled}
                      // readOnly={field.readOnly}
                      autoComplete={field.autoComplete}
                    />
                  );
                case "select":
                  return (
                    <select
                      name={field.name}
                      value={String(formValues[field.name] || "")}
                      onChange={(e) => handleChange(e, field)}
                      className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      disabled={field.disabled}
                    >
                      <option value="">
                        {field.placeholder || "انتخاب کنید"}
                      </option>
                      {field.options?.map((option, i) => (
                        <option
                          key={i}
                          value={option.value}
                          disabled={option.disabled}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      disabled={field.disabled}
                    >
                      {field.options?.map((option, i) => (
                        <option
                          key={i}
                          value={option.value}
                          disabled={option.disabled}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  );
                case "checkbox":
                  return (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name={field.name}
                        checked={!!formValues[field.name]}
                        onChange={(e) => handleChange(e, field)}
                        disabled={field.disabled}
                        // readOnly={field.readOnly}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="mr-2 text-gray-700">{field.label}</span>
                    </div>
                  );
                case "radio":
                  return (
                    <div className="space-y-2">
                      {field.options?.map((option, i) => (
                        <label key={i} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={field.name}
                            value={option.value}
                            checked={formValues[field.name] === option.value}
                            onChange={(e) => handleChange(e, field)}
                            disabled={field.disabled || option.disabled}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{option.label}</span>
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
                      className="w-full text-gray-700 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                        className="w-full px-3 py-2 border text-right placeholder:text-black/40 text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                      className="w-full px-3 py-2 border placeholder:text-black/40 text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      disabled={field.disabled}
                      readOnly={field.readOnly}
                      autoComplete={field.autoComplete}
                    />
                  );
              }
            })()}
            {fieldError && (
              <p className="text-xs text-red-600 mt-1">{fieldError}</p>
            )}
          </div>
        );
      })}

      <div className="flex justify-start space-x-4">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 cursor-pointer text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          {isSubmitting ? "در حال ارسال..." : submitButtonText}
        </button>

        <button
          type="button"
          onClick={() => {
            resetForm();
            onCancel?.();
          }}
          className="px-6 py-2 text-rose-500 cursor-pointer hover:text-rose-600 rounded-md hover:bg-gray-50 transition-colors"
        >
          {cancelButtonText}
        </button>
      </div>
    </form>
  );
};

export default DynamicUpdateForm;
