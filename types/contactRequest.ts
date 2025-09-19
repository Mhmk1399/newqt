export interface ContactRequest {
  _id?: string;
  name: string;
  phoneNumber: string;
  title: string;
  message: string;
  type: 'content' | 'photo' | 'video' | 'social';
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ContactRequestFormData {
  name: string;
  phoneNumber: string;
  title: string;
  message: string;
  type: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ContactRequestStatus {
  submitting: boolean;
  submitted: boolean;
  error: boolean;
  message: string;
}