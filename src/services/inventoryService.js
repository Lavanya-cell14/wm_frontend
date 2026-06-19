import { apiClient, normalizeResponse } from './apiClient';

/**
 * Inventory Service — Phase 3A
 */

export const getInventory = async () => {
  const data = await apiClient('/api/inventory/');
  return normalizeResponse(data);
};

export const getInventoryById = async (inventoryId) => {
  return await apiClient(`/api/inventory/${inventoryId}/`);
};

export const updateInventory = async (inventoryId, patchData) => {
  const data = await apiClient(`/api/inventory/${inventoryId}/`, {
    method: 'PATCH',
    body: JSON.stringify(patchData),
  });
  return data;
};

export const getStorageAllocations = async () => {
  const data = await apiClient('/api/movements/allocations/');
  return normalizeResponse(data);
};
