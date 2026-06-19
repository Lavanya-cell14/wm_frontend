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
