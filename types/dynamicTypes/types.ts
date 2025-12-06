import React from 'react';

export type FormFieldValue =
  | string
  | number
  | boolean
  | string[]
  | null
  | FileList
  | File
  | null;
export type FormValues = Record<string, FormFieldValue | undefined>;
export type SubmissionData = FormValues | FormData;

export type FormFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "textarea"
  | "select"
  | "date"
  | "checkbox"
  | "radio"
  | "multiselect"
  | "file"
  | "switch"
  | "modelRef" // New type for fields that reference other models
  | "hidden"
  | "custom"
  | "array";

export type ValidationRule =
  | {
      type: "required";
      message: string;
      validator?: (value: FormFieldValue, formValues?: FormValues) => boolean;
    }
  | { type: "minLength"; value: number; message: string }
  | { type: "maxLength"; value: number; message: string }
  | { type: "min"; value: number; message: string }
  | { type: "max"; value: number; message: string }
  | { type: "pattern"; value: string; message: string }
  | { type: "email"; message: string }
  | {
      type: "custom";
      message: string;
      validator?: (value: FormFieldValue, formValues?: FormValues) => boolean;
    };

export interface FormFieldOption {
  label: string;
  value: string | number;
  disabled?: boolean; // Optional property to disable specific options
}

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  rows?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  options?: FormFieldOption[];
  validation?: ValidationRule[];
  dependency?: FormFieldDependency;
  disabled?: boolean;
  defaultValue?: FormFieldValue;
  accept?: string; // For file inputs, specify accepted file types
  className?: string;
  dependsOn?: {
    field: string;
    operator: "eq" | "neq" | "gt" | "lt" | "contains";
    value: string | number | boolean;
  };
  refModel?: string;
  multiple?: boolean;
  isRequired?: boolean;
  render?: () => React.ReactNode;
  arrayFields?: FormField[];
  onScroll?: (e: React.UIEvent<HTMLSelectElement>) => void; // For infinite scroll on select dropdowns
}
export interface FormFieldDependency {
  field: string;
  value: string | number | boolean;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: FormValues;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface DynamicFormProps<TFormData = FormValues> {
  title?: string;
  subtitle?: string;
  fields: FormField[];
  endpoint: string;
  method?: "POST" | "PUT" | "PATCH" | "DELETE" | "GET";
  submitButtonText?: string;
  cancelButtonText?: string;
  onSuccess?: (data: ApiResponse) => void;
  onError?: (error: ApiError) => void;
  onCancel?: () => void;
  resetAfterSubmit?: boolean;
  encType?:
    | "application/json"
    | "multipart/form-data"
    | "application/x-www-form-urlencoded";
  className?: string;
  initialValues?: FormValues;
  onFieldChange?: (name: string, value: FormFieldValue) => void;
  transformFormData?: (formData: TFormData) => Partial<TFormData>;
  transformData?: (data: FormValues) => FormValues;
}

//-----------------------table types ---------------------------

export interface DynamicTableProps {
  columns: TableColumn[];
  data: TableData[];
  loading?: boolean;
  initialSort?: { key: string; direction: "asc" | "desc" };
  onSort?: (key: string, direction: "asc" | "desc") => void;
  formFields?: FormField[];
  endpoint?: string;
  formTitle?: string;
  formSubtitle?: string;
  onRefresh?: () => void;
  transformForEdit?: (item: TableData) => FormValues;
  onEditSuccess?: (data: ApiResponse) => void;
  onEditError?: (error: ApiError) => void;
  resetAfterSubmit?: boolean;
  onEditClick?: (item: TableData) => boolean | void;
  transformData?: (data: FormValues) => FormValues;
  showActions?: boolean;
  onDelete?: (id: string) => Promise<void>;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange?: (page: number) => void;
  filterFields?: FilterField[];
  onFilterChange?: (filters: FilterValues) => void;
  onAdd?: () => void;
  addButtonText?: string;
}
export interface TableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (
    value: string | number | boolean,
    row?: TableData
  ) => React.ReactNode;
}

export interface TableData {
  _id?: string;
  name: string;
  [key: string]: string | number | boolean | undefined;
  code: string;
  type: number | string;
  approved?: boolean; // Add approved field
}

export interface FilterField {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "number" | "dateRange" | "numberRange";
  placeholder?: string;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
}

export interface FilterValues {
  [key: string]:
    | string
    | number
    | [string, string]
    | [number, number]
    | { from: string; to: string }
    | null;
}

export interface UseDynamicFormReturn {
  formValues: FormValues;
  errors: Record<string, string>;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    field: FormField
  ) => void;
  validateForm: () => boolean;
  handleSubmit: (
    submissionFn: (data: FormValues | FormData) => Promise<Response>
  ) => Promise<void>;
  resetForm: () => void;
  setFormValues: (values: FormValues) => void;
  isSubmitting: boolean;
  initialValues?: FormValues;
}
