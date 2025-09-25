"use client";
import useSWR from 'swr';
import { FilterValues } from '@/types/dynamicTypes/types';

interface UseDynamicDataProps {
  endpoint: string;
  filters?: FilterValues;
  page?: number;
  limit?: number;
}

interface ApiResponse {
  success: boolean;
  data: any[];
  message?: string;
  pagination?: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

const fetcher = async (url: string): Promise<ApiResponse> => {
  const token = localStorage.getItem("userToken") || localStorage.getItem("token");
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const useDynamicData = ({ endpoint, filters = {}, page = 1, limit = 10 }: UseDynamicDataProps) => {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };

  // Handle search filters
  const searchTerms: string[] = [];
  Object.entries(filters).forEach(([key, value]) => {
    if (key === 'name' || key === 'description') {
      if (value) searchTerms.push(String(value));
    } else if (key === 'dateRange' && Array.isArray(value)) {
      // Handle dateRange as separate dateFrom and dateTo parameters
      const [dateFrom, dateTo] = value as [string, string];
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
    } else if (value !== null && value !== undefined && value !== '') {
      params[key] = String(value);
    }
  });

  if (searchTerms.length > 0) {
    params.search = searchTerms.join(' ');
  }

  const searchParams = new URLSearchParams(params);
  const swrKey = `${endpoint}${endpoint.includes('?') ? '&' : '?'}${searchParams}`;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    swrKey,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    data: data?.data || [],
    pagination: data?.pagination ? {
      currentPage: data.pagination.page,
      totalPages: data.pagination.pages,
      totalItems: data.pagination.total,
      itemsPerPage: data.pagination.limit,
      hasNextPage: data.pagination.page < data.pagination.pages,
      hasPrevPage: data.pagination.page > 1,
    } : null,
    loading: isLoading,
    error,
    mutate,
  };
};