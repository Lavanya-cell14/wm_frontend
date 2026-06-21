import { apiClient, normalizeResponse } from './apiClient';

/**
 * Routes & Path Optimization API Service
 */

export const getRoutesApi = async () => {
  const data = await apiClient('/api/routes/');
  return normalizeResponse(data);
};

export const createRouteApi = async (payload) => {
  return await apiClient('/api/routes/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const generateRouteApi = async (payload) => {
  return await apiClient('/api/routes/generate/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const blockPathApi = async (payload) => {
  return await apiClient('/api/routes/block-path/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const optimizeMultiPickApi = async (payload) => {
  return await apiClient('/api/routes/multi-pick/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const optimizeRouteApi = async (payload) => {
  return await apiClient('/api/routes/optimize/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const recalculateRouteApi = async (payload) => {
  return await apiClient('/api/routes/recalculate/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getRouteCongestionApi = async () => {
  return await apiClient('/api/routes/congestion/');
};

// TODO: GET /api/routes/{id}/ is blocked/broken and crashes the backend.
// Do not implement getRouteByIdApi or wire it into the UI.
