import { apiClient, normalizeResponse } from './apiClient';

/**
 * Product Service — Phase 3A (Read-Only)
 */

export const getProducts = async () => {
  const data = await apiClient('/api/products/');
  return normalizeResponse(data);
};

export const getProductById = async (productId) => {
  return await apiClient(`/api/products/${productId}/`);
};
