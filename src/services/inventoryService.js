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

export const relocateInventory = async (payload) => {
  const data = await apiClient('/api/inventory/relocate/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
};

export const adjustInventory = async (payload) => {
  const data = await apiClient('/api/inventory/adjust/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
};

export const auditInventory = async (payload) => {
  const data = await apiClient('/api/inventory/audit/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
};

export const getMovementById = async (movementId) => {
  return await apiClient(`/api/movements/${movementId}/`);
};

