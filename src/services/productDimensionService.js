import { apiClient, normalizeResponse } from './apiClient';

/**
 * Product Dimensions & Storage Rules API Service
 */

// Dimensions CRUD
export const getProductDimensionsApi = async () => {
  const data = await apiClient('/api/product-dimensions/');
  return normalizeResponse(data);
};

export const createProductDimensionApi = async (payload) => {
  return await apiClient('/api/product-dimensions/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getProductDimensionByIdApi = async (id) => {
  return await apiClient(`/api/product-dimensions/${id}/`);
};

export const updateProductDimensionApi = async (id, payload) => {
  return await apiClient(`/api/product-dimensions/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const patchProductDimensionApi = async (id, payload) => {
  return await apiClient(`/api/product-dimensions/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const deleteProductDimensionApi = async (id) => {
  return await apiClient(`/api/product-dimensions/${id}/`, {
    method: 'DELETE',
  });
};

// Storage Rules CRUD
export const getStorageRulesApi = async () => {
  const data = await apiClient('/api/product-dimensions/storage-rules/');
  return normalizeResponse(data);
};

export const createStorageRuleApi = async (payload) => {
  return await apiClient('/api/product-dimensions/storage-rules/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getStorageRuleByIdApi = async (id) => {
  return await apiClient(`/api/product-dimensions/storage-rules/${id}/`);
};

export const updateStorageRuleApi = async (id, payload) => {
  return await apiClient(`/api/product-dimensions/storage-rules/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const patchStorageRuleApi = async (id, payload) => {
  return await apiClient(`/api/product-dimensions/storage-rules/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const deleteStorageRuleApi = async (id) => {
  return await apiClient(`/api/product-dimensions/storage-rules/${id}/`, {
    method: 'DELETE',
  });
};
