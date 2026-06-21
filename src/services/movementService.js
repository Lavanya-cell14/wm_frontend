import { apiClient, normalizeResponse } from './apiClient';

/**
 * Stock Movements & Storage Allocation API Service
 */

export const getMovementsApi = async () => {
  const data = await apiClient('/api/movements/');
  return normalizeResponse(data);
};

export const createMovementApi = async (payload) => {
  return await apiClient('/api/movements/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getMovementByIdApi = async (id) => {
  return await apiClient(`/api/movements/${id}/`);
};

export const updateMovementApi = async (id, payload) => {
  return await apiClient(`/api/movements/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const patchMovementApi = async (id, payload) => {
  return await apiClient(`/api/movements/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const deleteMovementApi = async (id) => {
  return await apiClient(`/api/movements/${id}/`, {
    method: 'DELETE',
  });
};

export const getStorageAllocationsApi = async () => {
  const data = await apiClient('/api/movements/allocations/');
  return normalizeResponse(data);
};

export const createStorageAllocationApi = async (payload) => {
  return await apiClient('/api/movements/allocations/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};
