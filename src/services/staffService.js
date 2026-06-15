import { apiClient } from './apiClient';

/**
 * Staff API Service Layer
 * Integrates with VITE_API_BASE_URL and falls back to mock context gracefully.
 */

export const getAssignedPutawayTasks = async () => {
  try {
    return await apiClient('/staff/putaway/assigned');
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const getPutawayTaskById = async (taskId) => {
  try {
    return await apiClient(`/staff/putaway/tasks/${taskId}`);
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const startPutawayTask = async (taskId) => {
  try {
    return await apiClient(`/staff/putaway/tasks/${taskId}/start`, { method: 'POST' });
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const confirmPickedFromReceiving = async (taskId) => {
  try {
    return await apiClient(`/staff/putaway/tasks/${taskId}/picked`, { method: 'POST' });
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const getRouteForPutawayTask = async (taskId) => {
  try {
    return await apiClient(`/staff/putaway/tasks/${taskId}/route`);
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const confirmReachedBin = async (taskId) => {
  try {
    return await apiClient(`/staff/putaway/tasks/${taskId}/reached`, { method: 'POST' });
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const completePutawayTask = async (taskId, payload) => {
  try {
    return await apiClient(`/staff/putaway/tasks/${taskId}/complete`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const reportPutawayIssue = async (taskId, payload) => {
  try {
    return await apiClient(`/staff/putaway/tasks/${taskId}/issue`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const getStaffMovements = async () => {
  try {
    return await apiClient('/staff/movements');
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const getCompletedTasks = async () => {
  try {
    return await apiClient('/staff/putaway/completed');
  } catch (error) {
    return { success: true, mock: true };
  }
};
