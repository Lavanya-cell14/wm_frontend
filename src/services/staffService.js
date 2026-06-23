import { apiClient, normalizeResponse } from './apiClient';

/**
 * Staff API Service Layer
 * Integrates with /api/inbound/putaway/ backend endpoints.
 */

export const getAssignedPutawayTasks = async () => {
  return await apiClient('/api/inbound/putaway/assigned/');
};

export const getPutawayTaskById = async (taskId) => {
  return await apiClient(`/api/inbound/putaway/${taskId}/`);
};

export const dispatchPutawayTaskApi = async (payload) => {
  return await apiClient('/api/inbound/putaway/dispatch/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const startPutawayTask = async (taskId) => {
  return await apiClient(`/api/inbound/putaway/${taskId}/start/`, { method: 'POST' });
};

export const confirmPickedFromReceiving = async (taskId) => {
  return await apiClient(`/api/inbound/putaway/${taskId}/picked/`, { method: 'POST' });
};

export const getRouteForPutawayTask = async (taskId) => {
  // Fallback to route optimizer or details mapping
  return await apiClient(`/api/routes/`);
};

export const confirmReachedBin = async (taskId) => {
  return await apiClient(`/api/inbound/putaway/${taskId}/reached/`, { method: 'POST' });
};

export const completePutawayTask = async (taskId, payload) => {
  return await apiClient(`/api/inbound/putaway/${taskId}/complete/`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const reportPutawayIssue = async (taskId, payload) => {
  return await apiClient(`/api/inbound/putaway/${taskId}/issue/`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const getStaffMovements = async () => {
  const data = await apiClient('/api/movements/');
  return normalizeResponse(data);
};

export const getCompletedTasks = async () => {
  return await apiClient('/api/inbound/putaway/?status=COMPLETED');
};
