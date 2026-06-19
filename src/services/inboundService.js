import { apiClient, normalizeResponse } from './apiClient';

/**
 * Inbound API Service
 */

export const getInboundShipments = async () => {
  const data = await apiClient('/api/inbound/');
  return normalizeResponse(data);
};

export const createInboundShipmentApi = async (payload) => {
  const data = await apiClient('/api/inbound/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
};

export const getInboundById = async (id) => {
  return await apiClient(`/api/inbound/${id}/`);
};

export const patchInboundShipment = async (id, payload) => {
  const data = await apiClient(`/api/inbound/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return data;
};
