import { apiClient, normalizeResponse } from './apiClient';

/**
 * Product Classifications API Service
 */

export const getProductClassificationsApi = async () => {
  const data = await apiClient('/api/product-classifications/');
  return normalizeResponse(data);
};

export const createProductClassificationApi = async (payload) => {
  return await apiClient('/api/product-classifications/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getProductClassificationByIdApi = async (id) => {
  return await apiClient(`/api/product-classifications/${id}/`);
};

export const updateProductClassificationApi = async (id, payload) => {
  return await apiClient(`/api/product-classifications/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const patchProductClassificationApi = async (id, payload) => {
  return await apiClient(`/api/product-classifications/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const deleteProductClassificationApi = async (id) => {
  return await apiClient(`/api/product-classifications/${id}/`, {
    method: 'DELETE',
  });
};
