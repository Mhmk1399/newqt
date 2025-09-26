"use client";
import { DynamicFormProps, FormValues } from "@/types/dynamicTypes/types";
import React from "react";
import { useDynamicForm } from "./forms";
import { formatNumber } from "@/utilities/numberComma";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const DynamicForm: React.FC<DynamicFormProps> = ({
  title,
  subtitle,
  fields,
  endpoint,
  method = "POST",
  submitButtonText = "ارسال",
  cancelButtonText = "انصراف",
  onSuccess,
  onError,
  onCancel,
  resetAfterSubmit = true,
  encType = "application/json",
  className = "",
  initialValues = {},
}) => {
  const {
    formValues,
    errors,
    handleChange,
    validateForm,
    handleSubmit,
    resetForm,
    isSubmitting,
  } = useDynamicForm(fields, initialValues);

  const submissionFunction = async (data: FormValues | FormData) => {
    const headers: Record<string, string> = {};
    let body: BodyInit;
    if (encType === "application/json") {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    } else if (data instanceof FormData) {
      body = data;
    } else {
      body = JSON.stringify(data);
    }
    const response = await fetch(endpoint, { method, headers, body });
    return response;
  };

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    await handleSubmit(async (data: FormValues | FormData) => {
      const response = await submissionFunction(data);
      if (response.ok) {
        if (onSuccess) {
          const responseData = await response.json();
          onSuccess(responseData);
        }
      } else {
        if (onError) {
          onError(Error(`Error: ${response.status} ${response.statusText}`));
        }
      }
      return response;
    });
    if (resetAfterSubmit) {
      resetForm();
    }
  };

  return (
    <div className=" relative overflow-hidden" dir="rtl">
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6 flex items-center justify-center min-h-screen w-full">
        <form
          onSubmit={onFormSubmit}
          className={`w-full max-w-5xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-6 ${className}`}
          style={{
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Decorative corner elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-tr-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/20 to-transparent rounded-bl-3xl"></div>

          <div className="relative z-10">
            {title && (
              <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text mb-2">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-white/70 text-lg border-b border-white/20 pb-4 mb-6">
                {subtitle}
              </p>
            )}

            {fields.map((field) => {
              const fieldError = errors[field.name];

              // Check if field should be visible based on dependencies
              const shouldShowField = () => {
                if (!field.dependsOn) return true;

                const dependentValue = formValues[field.dependsOn.field];
                const { operator, value } = field.dependsOn;

                switch (operator) {
                  case "eq":
                    return dependentValue === value;
                  case "neq":
                    return dependentValue !== value;
                  case "gt":
                    return Number(dependentValue) > Number(value);
                  case "lt":
                    return Number(dependentValue) < Number(value);
                  case "contains":
                    return String(dependentValue).includes(String(value));
                  default:
                    return true;
                }
              };

              if (!shouldShowField()) return null;

              return (
                <div key={field.name} className="space-y-1">
                  {field.type !== "checkbox" && (
                    <label className="block text-sm font-medium text-white/90 my-4">
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
                            value={String(formValues[field.name] || "")}
                            onChange={(e) => handleChange(e, field)}
                            rows={field.rows || 3}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 placeholder:text-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
                            disabled={field.disabled}
                            readOnly={field.readOnly}
                            autoComplete={field.autoComplete}
                          />
                        );
                      case "select":
                        return (
                          <select
                            name={field.name}
                            value={String(formValues[field.name] || "")}
                            onChange={(e) => handleChange(e, field)}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
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
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
                            disabled={field.disabled}
                          >
                            {field.options?.map((option, i) => (
                              <option
                                key={i}
                                value={option.value}
                                disabled={option.disabled}
                                className="bg-transparent text-white"
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
                              readOnly={field.readOnly}
                              className="h-5 w-5 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
                            />
                            <span className="mr-3 text-white/90 font-medium">
                              {field.label}
                            </span>
                          </div>
                        );
                      case "radio":
                        return (
                          <div className="space-y-2">
                            {field.options?.map((option, i) => (
                              <label
                                key={i}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="radio"
                                  name={field.name}
                                  value={option.value}
                                  checked={
                                    formValues[field.name] === option.value
                                  }
                                  onChange={(e) => handleChange(e, field)}
                                  disabled={field.disabled || option.disabled}
                                  className="h-5 w-5 text-purple-600 bg-white/10 border-white/20 focus:ring-purple-500 focus:ring-2"
                                />
                                <span className="text-white/90 mr-3">
                                  {option.label}
                                </span>
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
                            className="w-full text-white/90 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500/20 file:text-purple-200 hover:file:bg-purple-500/30"
                            accept={field.accept}
                            multiple={field.multiple}
                            disabled={field.disabled}
                            readOnly={field.readOnly}
                          />
                        );
                      case "number":
                        const rawValue = String(formValues[field.name] || "");
                        const shouldFormat = [
                          "sellPrice",
                          "serviceFeeValue",
                          "buyPrice",
                          "price",
                          "amount",
                        ].includes(field.name);

                        return (
                          <input
                            type="text"
                            name={field.name}
                            placeholder={field.placeholder}
                            value={
                              shouldFormat ? formatNumber(rawValue) : rawValue
                            }
                            onChange={(e) => {
                              const onlyNumbers = e.target.value.replace(
                                /\D/g,
                                ""
                              );
                              handleChange(
                                {
                                  target: {
                                    name: field.name,
                                    value: onlyNumbers,
                                  },
                                } as unknown as React.ChangeEvent<HTMLInputElement>,
                                field
                              );
                            }}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 placeholder:text-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 text-right"
                            disabled={field.disabled}
                            readOnly={field.readOnly}
                            autoComplete={field.autoComplete}
                          />
                        );

                      case "hidden":
                        return (
                          <input
                            type="hidden"
                            name={field.name}
                            value={String(formValues[field.name] || "")}
                            onChange={(e) => handleChange(e, field)}
                          />
                        );
                      case "date":
                        return (
                          <div className="relative">
                            <DatePicker
                              value={
                                formValues[field.name]
                                  ? new DateObject(
                                      new Date(formValues[field.name] as string)
                                    )
                                  : null
                              }
                              onChange={(val) => {
                                const dateValue = val
                                  ? val.toDate().toISOString()
                                  : "";
                                handleChange(
                                  {
                                    target: {
                                      name: field.name,
                                      value: dateValue,
                                    },
                                  } as unknown as React.ChangeEvent<HTMLInputElement>,
                                  field
                                );
                              }}
                              calendar={persian}
                              locale={persian_fa}
                              format="YYYY/MM/DD"
                              placeholder={
                                field.placeholder || "تاریخ را انتخاب کنید"
                              }
                              inputClass="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 placeholder:text-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 text-right"
                              calendarPosition="bottom-right"
                              containerClassName="w-full"
                              disabled={field.disabled}
                              readOnly={field.readOnly}
                            />
                          </div>
                        );
                      case "custom":
                        return field.render ? field.render() : null;
                      case "array":
                        // For now, we'll handle array fields as a simple text input
                        // You can extend this to have a more sophisticated array editor
                        return (
                          <div className="space-y-2">
                            <textarea
                              name={field.name}
                              placeholder={
                                field.placeholder ||
                                "Enter items separated by commas"
                              }
                              value={
                                Array.isArray(formValues[field.name])
                                  ? (formValues[field.name] as string[]).join(
                                      ", "
                                    )
                                  : String(formValues[field.name] || "")
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                const arrayValue = value
                                  .split(",")
                                  .map((item) => item.trim())
                                  .filter((item) => item);
                                handleChange(
                                  {
                                    target: {
                                      name: field.name,
                                      value: arrayValue,
                                    },
                                  } as unknown as React.ChangeEvent<HTMLInputElement>,
                                  field
                                );
                              }}
                              rows={3}
                              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 placeholder:text-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
                              disabled={field.disabled}
                              readOnly={field.readOnly}
                            />
                            <p className="text-xs text-white/60">
                              Items should be separated by commas
                            </p>
                          </div>
                        );
                      default:
                        return (
                          <input
                            type={field.type}
                            name={field.name}
                            placeholder={field.placeholder}
                            value={String(formValues[field.name] || "")}
                            onChange={(e) => handleChange(e, field)}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 placeholder:text-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 text-right"
                            disabled={field.disabled}
                            readOnly={field.readOnly}
                            autoComplete={field.autoComplete}
                          />
                        );
                    }
                  })()}
                  {fieldError && (
                    <p className="text-xs text-red-400 mt-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1">
                      {fieldError}
                    </p>
                  )}
                </div>
              );
            })}

            <div className="flex justify-start gap-4 pt-6 border-t border-white/20">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg hover:shadow-purple-500/25"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                {isSubmitting ? "در حال ارسال..." : submitButtonText}
              </button>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onCancel?.();
                }}
                className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 font-medium rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                {cancelButtonText}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DynamicForm;
