import { axiosClient } from './axiosClient';
import { CreateProductRequest, PagedResult, Product } from '../../types/product';

// In-memory cache for products by ID to avoid redundant requests when displaying campaign items
const productCache = new Map<string, Product>();

export const productService = {
  async getProducts(page = 0, size = 20): Promise<PagedResult<Product>> {
    const response = await axiosClient.get<PagedResult<Product>>('/products', {
      params: { page, size },
    });
    // Prime cache with retrieved products
    response.data.items.forEach((p) => productCache.set(p.id, p));
    return response.data;
  },

  async getProductById(id: string): Promise<Product> {
    if (productCache.has(id)) {
      return productCache.get(id)!;
    }
    const response = await axiosClient.get<Product>(`/products/${id}`);
    productCache.set(id, response.data);
    return response.data;
  },

  async createProduct(payload: CreateProductRequest): Promise<Product> {
    const response = await axiosClient.post<Product>('/products', payload);
    productCache.set(response.data.id, response.data);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await axiosClient.delete(`/products/${id}`);
    productCache.delete(id);
  },

  clearCache(): void {
    productCache.clear();
  },
};
