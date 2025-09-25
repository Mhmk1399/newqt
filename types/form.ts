import React from 'react';

// Form field types
export type FormFieldType =
  | "text"
  | "email"
  | "tel"
  | "password"
  | "select"
  | "textarea"
  | "number"
  | "date"
  | "checkbox"
  | "checkbox-group"
  | "radio"
  | "hidden"
  | "custom"
  | "array";

export interface FormFieldOption {
  value: string;
  label: string;
  description?: string;
}

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  options?: FormFieldOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  defaultValue?: string | number | boolean;
  description?: string;
  className?: string;
  readonly?: boolean;
  hidden?: boolean;
  onChange?: (fieldName: string, value: string | string[]) => void;
  render?: () => React.ReactNode;
  arrayFields?: FormField[];
}

export interface FormConfig {
  title: string;
  description?: string;
  fields: FormField[];
  endpoint: string;
  method?: "POST" | "PUT" | "PATCH";
  submitButtonText?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onChange?: (fieldName: string, value: string | number | boolean) => void;
  className?: string;
  successMessage?: string;
  errorMessage?: string;
  validationErrorMessage?: string;
}

export interface FormData {
  [key: string]: string | number | boolean | File | string[] | {main: string; thumbnails: string[]};
}

export interface FormState {
  data: FormData;
  errors: { [key: string]: string | null };
  loading: boolean;
  success: boolean;
}
