"use client";
import { DynamicFormProps, FormValues } from "@/types/dynamicTypes/types";
import React from "react";
import { useDynamicForm } from "./forms";
import { formatNumber } from "@/utilities/numberComma";

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
  // transformFormData,
  // transformData,
}) => {
  const {
    formValues,
    errors,
    handleChange,
    validateForm,
    handleSubmit,
    resetForm,
    isSubmitting,
    // setFormValues,
  } = useDynamicForm(fields, initialValues);
  // Submission function using the Fetch API.
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

  // Handle form submission.
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
    <form
      onSubmit={onFormSubmit}
      className={`max-w-5xl mx-auto bg-white  my-4 rounded-lg p-8 space-y-6 ${className}`}
      dir="rtl"
    >
      {title && (
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      )}
      {subtitle && (
        <p className="text-sm text-gray-500  border-b pb-4">{subtitle}</p>
      )}

      {fields.map((field) => {
        // Only render fields that should be visible based on dependency rules.
        const fieldError = errors[field.name];
        return (
          <div key={field.name} className="space-y-1 ">
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
                      value={String(formValues[field.name] || "")}
                      onChange={(e) => handleChange(e, field)}
                      rows={field.rows || 3}
                      className="w-full px-3 py-2 border border-gray-300 text-black placeholder:text-black/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                      className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      disabled={field.disabled}
                      //   readOnly={field.readOnly}
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
                      //   readOnly={field.readOnly}
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
                        readOnly={field.readOnly}
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
                      value={shouldFormat ? formatNumber(rawValue) : rawValue}
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

                case "hidden":
                  return (
                    <input
                      type="hidden"
                      name={field.name}
                      value={String(formValues[field.name] || "")}
                      onChange={(e) => handleChange(e, field)}
                    />
                  );
                default:
                  // This covers default types: text, number, email, password, date, etc.
                  return (
                    <input
                      type={field.type}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={String(formValues[field.name] || "")}
                      onChange={(e) => handleChange(e, field)}
                      className="w-full px-3 py-2 border text-right placeholder:text-black/40 text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 cursor-pointer text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
          className="px-6 py-2 text-rose-500 cursor-pointer hover:text-rose-600 rounded-md hover:bg-gray-50 transition-colors"
        >
          {cancelButtonText}
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;
