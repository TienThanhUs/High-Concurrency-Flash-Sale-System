export interface Product {
  id: string; // UUID
  name: string;
  description: string;
  originalPrice: number;
  generalStock: number;
  createdAt: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  originalPrice: number;
  generalStock: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
