"use client";
import {
  FormField,
  FormValues,
  SubmissionData,
  UseDynamicFormReturn,
} from "@/types/dynamicTypes/types";
import { useState, useEffect, useRef } from "react";

const modelCodeLengths: Record<string, number> = {
  Glass: 3,
  SideMaterial: 3,
  GlassTreatment: 3,
  Inventory: 3,
  InvoiceSideMaterial: 3,
  Layer: 3,
  Priority: 3,
  Seller: 3,
  Customer: 4,
};

export function useDynamicForm(
  fields: FormField[],
  initialValues?: FormValues
): UseDynamicFormReturn {
  const [formValues, setFormValues] = useState<FormValues>(initialValues || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Keep ref for file inputs for resetting purposes.
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Initialize default values from the provided field definitions.
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      // If initial values are provided, use them
      setFormValues(initialValues);
    } else {
      // Otherwise, use default values from field definitions
      const defaultValues: FormValues = {};
      fields.forEach((field) => {
        if (field.defaultValue !== undefined) {
          defaultValues[field.name] = field.defaultValue;
        } else {
          switch (field.type) {
            case "checkbox":
            case "switch":
              defaultValues[field.name] = false;
              break;
            case "multiselect":
              defaultValues[field.name] = [];
              break;
            case "file":
              defaultValues[field.name] = null;
              break;
            default:
              defaultValues[field.name] = "";
          }
        }
      });
      setFormValues(defaultValues);
    }
  }, []);

  // Checks whether the given field should be visible based on its dependency rules.
  const shouldShowField = (field: FormField): boolean => {
    if (!field.dependsOn) return true;
    const { dependsOn } = field;
    const dependentValue = formValues[dependsOn.field];
    if (dependentValue === undefined) return false;
    switch (dependsOn.operator) {
      case "neq":
        return dependentValue !== dependsOn.value;
      case "gt":
        return (
          typeof dependentValue === "number" &&
          typeof dependsOn.value === "number" &&
          dependentValue > dependsOn.value
        );
      case "lt":
        return (
          typeof dependentValue === "number" &&
          typeof dependsOn.value === "number" &&
          dependentValue < dependsOn.value
        );
      case "contains":
        return (
          Array.isArray(dependentValue) &&
          typeof dependsOn.value === "string" &&
          dependentValue.includes(dependsOn.value)
        );
      case "eq":
      default:
        return dependentValue === dependsOn.value;
    }
  };
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    field?: FormField
  ) => {
    const { name, type } = e.target;
    let value;

    // Handle different input types
    if (type === "checkbox") {
      value = (e.target as HTMLInputElement).checked;
    } else if (type === "file") {
      value = (e.target as HTMLInputElement).files;
    } else if (field?.type === "multiselect") {
      // Handle multiselect
      const selectElement = e.target as HTMLSelectElement;
      value = Array.from(selectElement.selectedOptions).map(option => option.value);
    } else {
      value = e.target.value;
    }

    // Update form values with the new value
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear any errors for this field
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Validate the form fields based on provided rules and extra modelRef validations.
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.dependsOn && !shouldShowField(field)) return;
      const value = formValues[field.name];

      // Run custom validations if provided.
      if (field.validation) {
        for (const rule of field.validation) {
          if (
            rule.type === "required" &&
            (value === undefined ||
              value === null ||
              value === "" ||
              (Array.isArray(value) && value.length === 0))
          ) {
            newErrors[field.name] = rule.message;
            break;
          }
          if (
            value === undefined ||
            value === null ||
            value === "" ||
            (Array.isArray(value) && value.length === 0)
          ) {
            continue;
          }
          if (
            rule.type === "minLength" &&
            typeof value === "string" &&
            value.length < rule.value
          ) {
            newErrors[field.name] = rule.message;
            break;
          }
          if (
            rule.type === "maxLength" &&
            typeof value === "string" &&
            value.length > rule.value
          ) {
            newErrors[field.name] = rule.message;
            break;
          }
          if (
            rule.type === "pattern" &&
            typeof value === "string" &&
            !new RegExp(rule.value).test(value)
          ) {
            newErrors[field.name] = rule.message;
            break;
          }
          if (
            rule.type === "min" &&
            typeof value === "number" &&
            value < rule.value
          ) {
            newErrors[field.name] = rule.message;
            break;
          }
          if (
            rule.type === "max" &&
            typeof value === "number" &&
            value > rule.value
          ) {
            newErrors[field.name] = rule.message;
            break;
          }
          if (
            rule.type === "custom" &&
            rule.validator &&
            !rule.validator(value, formValues)
          ) {
            newErrors[field.name] = rule.message;
            break;
          }
        }
      }

      // For fields using modelRef (typically the "code" field),
      // enforce the expected code string length.
      if (
        field.refModel &&
        field.name === "code" &&
        typeof value === "string"
      ) {
        const requiredLength = modelCodeLengths[field.refModel];
        if (requiredLength && value.length !== requiredLength) {
          newErrors[
            field.name
          ] = `Code must be exactly ${requiredLength} characters long.`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset the form values to their initial state.
  const resetForm = (): void => {
    const initialValues: FormValues = {};

    fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initialValues[field.name] = field.defaultValue;
      } else {
        switch (field.type) {
          case "checkbox":
            initialValues[field.name] = false;
            break;
          case "multiselect":
            initialValues[field.name] = [];
            break;
          case "file":
            initialValues[field.name] = null;
            if (fileInputRefs.current[field.name]) {
              fileInputRefs.current[field.name]!.value = "";
            }
            break;
          case "switch":
            initialValues[field.name] = false;
            break;
          default:
            initialValues[field.name] = "";
        }
      }
    });
    setFormValues(initialValues);
  };

  const handleSubmit = async (
    submissionFn: (data: SubmissionData) => Promise<Response>
  ): Promise<void> => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const submissionData =
        typeof formValues === "object" &&
        Object.values(formValues).some(
          (v) => v instanceof File || v instanceof FileList
        )
          ? (() => {
              const formData = new FormData();
              Object.entries(formValues).forEach(([key, value]) => {
                if (value === null || value === undefined) return;
                const field = fields.find((f) => f.name === key);
                if (field?.type === "file") {
                  if (field.multiple && value instanceof FileList) {
                    for (let i = 0; i < value.length; i++) {
                      formData.append(key, value[i]);
                    }
                  } else if (value instanceof File) {
                    formData.append(key, value);
                  }
                } else if (Array.isArray(value)) {
                  // For multiselect arrays
                  value.forEach((item) => formData.append(`${key}[]`, item));
                } else {
                  formData.append(key, value.toString());
                }
              });
              return formData;
            })()
          : { ...formValues };

      const response = await submissionFn(submissionData);
      if (response.ok) {
      }
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formValues,
    errors,
    handleChange,
    validateForm,
    handleSubmit,
    resetForm,
    setFormValues,
    isSubmitting,
  };
}
