 
export interface TableColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "email" | "phone" | "status" | "boolean" | "custom";
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface TableFilter {
  key: string;
  label: string;
  options?: FilterOption[];
}
export interface CustomAction {
  label: string;
  icon: string;
  className?: string;
  onClick: (row: any) => void;
  condition?: (row: any) => boolean;
}

export interface TableConfig {
  title: string;
  description?: string;
  endpoint: string;
  deleteEndpoint?: string;
  columns: TableColumn[];
  filters?: TableFilter[];
  actions?: {
    view?: boolean;
    edit?: boolean;
    delete?: boolean;
    activate?: boolean;
    custom?: CustomAction[];
  };
  onView?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onActivate?: (row: any, newStatus: boolean) => void;
  headers?: Record<string, string>;
  className?: string;
}

export interface DynamicTableProps {
  config: TableConfig;
}
