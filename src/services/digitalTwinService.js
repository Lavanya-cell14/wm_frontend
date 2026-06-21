import { apiClient, normalizeResponse } from './apiClient';

/**
 * Digital Twin API Service
 */

export const getTwinLayoutApi = async (layoutId) => {
  return await apiClient(`/api/twin/layout/${layoutId}`);
};

export const getTwinRacksApi = async () => {
  const data = await apiClient('/api/twin/racks');
  return normalizeResponse(data);
};

export const getTwinZonesApi = async () => {
  const data = await apiClient('/api/twin/zones');
  return normalizeResponse(data);
};

export const getTwinOccupancyApi = async () => {
  const data = await apiClient('/api/twin/occupancy');
  return normalizeResponse(data);
};

export const getTwinPathsApi = async () => {
  const data = await apiClient('/api/twin/paths');
  return normalizeResponse(data);
};

export const getTwinSummaryApi = async () => {
  return await apiClient('/api/twin/summary');
};
