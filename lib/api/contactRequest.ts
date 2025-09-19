import { ContactRequest, ContactRequestFormData, ApiResponse } from "@/types/contactRequest";

const API_BASE_URL = '/api/contactRequest';

export const contactRequestApi = {
  // Create a new contact request
  create: async (data: ContactRequestFormData): Promise<ApiResponse<ContactRequest>> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.json();
  },

  // Get all contact requests with optional filters
  getAll: async (params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<ContactRequest[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}?${searchParams}`);
    return response.json();
  },

  // Get a single contact request by ID
  getById: async (id: string): Promise<ApiResponse<ContactRequest>> => {
    const response = await fetch(`${API_BASE_URL}?id=${id}`);
    return response.json();
  },

  // Update a contact request
  update: async (id: string, data: Partial<ContactRequest>): Promise<ApiResponse<ContactRequest>> => {
    const response = await fetch(API_BASE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...data }),
    });
    
    return response.json();
  },

  // Delete a contact request
  delete: async (id: string): Promise<ApiResponse<ContactRequest>> => {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'DELETE',
    });
    
    return response.json();
  },
};