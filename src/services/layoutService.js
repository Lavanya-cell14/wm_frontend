import { apiClient, normalizeResponse } from './apiClient';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Layout API Service
 */

export const uploadLayoutApi = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/api/layout/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Layout upload failed with status: ${response.status}`);
  }

  return await response.json();
};

export const analyzeLayoutApi = async (layoutId) => {
  return await apiClient('/api/layout/analyze', {
    method: 'POST',
    body: JSON.stringify({ layout_id: layoutId }),
  });
};

export const generateTopologyApi = async (payload) => {
  return await apiClient('/api/layout/generate-topology', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getLayoutEntitiesApi = async () => {
  const data = await apiClient('/api/layout/entities');
  return normalizeResponse(data);
};

export const getLayoutByIdApi = async (layoutId) => {
  return await apiClient(`/api/layout/${layoutId}`);
};

export const updateLayoutApi = async (layoutId, payload) => {
  return await apiClient(`/api/layout/${layoutId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteLayoutApi = async (layoutId) => {
  return await apiClient(`/api/layout/${layoutId}`, {
    method: 'DELETE',
  });
};
