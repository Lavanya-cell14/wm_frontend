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

export const createProductApi = async (payload) => {
  return await apiClient('/api/products/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateProductApi = async (id, payload) => {
  return await apiClient(`/api/products/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const patchProductApi = async (id, payload) => {
  return await apiClient(`/api/products/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const deleteProductApi = async (id) => {
  return await apiClient(`/api/products/${id}/`, {
    method: 'DELETE',
  });
};

