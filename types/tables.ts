 
export interface TableColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "email" | "phone" | "status"| "custom";
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
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
  actions?: {
    view?: boolean;
    edit?: boolean;
    delete?: boolean;
    custom?: CustomAction[];
  };
  onView?: (row: any) => void;
  headers?: Record<string, string>; // ✅ Optional headers
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  className?: string;
}

export interface DynamicTableProps {
  config: TableConfig;
}
