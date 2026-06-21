import { apiClient, normalizeResponse } from './apiClient';

/**
 * Outbound Orders API Service
 */

export const getOrders = async () => {
  const data = await apiClient('/api/orders/');
  return normalizeResponse(data);
};

export const getOrderById = async (id) => {
  return await apiClient(`/api/orders/${id}/`);
};

export const createOrderApi = async (orderPayload) => {
  const data = await apiClient('/api/orders/', {
    method: 'POST',
    body: JSON.stringify(orderPayload),
  });
  return data;
};

export const dispatchOrderApi = async (orderId, patchData = { status: 'COMPLETED' }) => {
  const data = await apiClient(`/api/orders/${orderId}/`, {
    method: 'PATCH',
    body: JSON.stringify(patchData),
  });
  return data;
};

export const deleteOrderApi = async (id) => {
  return await apiClient(`/api/orders/${id}/`, {
    method: 'DELETE',
  });
};

export const generatePicklistApi = async (payload) => {
  return await apiClient('/api/orders/generate-picklist/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const optimizeOrderRouteApi = async (payload) => {
  return await apiClient('/api/orders/optimize-route/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const packOrderApi = async (payload) => {
  return await apiClient('/api/orders/pack/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const dispatchOrderPostApi = async (payload) => {
  return await apiClient('/api/orders/dispatch/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

