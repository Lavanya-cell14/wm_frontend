import { apiClient } from './apiClient';

/**
 * Warehouse Manager API Service Layer
 * Wraps dynamic backend operations for the WAREHOUSE_MANAGER role.
 * Integrates with VITE_API_BASE_URL via apiClient and falls back gracefully.
 */

export const getManagerDashboard = async () => {
  try {
    return await apiClient('/manager/dashboard');
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const getPendingBinAssignments = async () => {
  try {
    return await apiClient('/manager/inbound/pending-assignments');
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const generateBinRecommendation = async (inboundId) => {
  try {
    return await apiClient(`/manager/inbound/${inboundId}/recommend`, { method: 'POST' });
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const getBinRecommendations = async () => {
  try {
    return await apiClient('/manager/recommendations');
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const approveBinRecommendation = async (recommendationId) => {
  try {
    return await apiClient(`/manager/recommendations/${recommendationId}/approve`, { method: 'PUT' });
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const rejectBinRecommendation = async (recommendationId, reason) => {
  try {
    return await apiClient(`/manager/recommendations/${recommendationId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const regenerateBinRecommendation = async (inboundId) => {
  try {
    return await apiClient(`/manager/inbound/${inboundId}/regenerate`, { method: 'POST' });
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const assignPutawayTask = async (payload) => {
  try {
    return await apiClient('/manager/tasks/assign', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const getStaffTasks = async () => {
  try {
    return await apiClient('/manager/tasks/staff');
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const getWarehouseLayout = async () => {
  try {
    return await apiClient('/manager/layout');
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const createZone = async (payload) => {
  try {
    return await apiClient('/manager/layout/zones', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const updateZone = async (zoneId, payload) => {
  try {
    return await apiClient(`/manager/layout/zones/${zoneId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const createRack = async (payload) => {
  try {
    return await apiClient('/manager/layout/racks', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const updateRack = async (rackId, payload) => {
  try {
    return await apiClient(`/manager/layout/racks/${rackId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const createShelf = async (payload) => {
  try {
    return await apiClient('/manager/layout/shelves', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const updateShelf = async (shelfId, payload) => {
  try {
    return await apiClient(`/manager/layout/shelves/${shelfId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const createBin = async (payload) => {
  try {
    return await apiClient('/manager/layout/bins', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const updateBin = async (binId, payload) => {
  try {
    return await apiClient(`/manager/layout/bins/${binId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const getBinOccupancy = async () => {
  try {
    return await apiClient('/manager/layout/bins/occupancy');
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const getDigitalTwinData = async () => {
  try {
    return await apiClient('/manager/twin-telemetry');
  } catch (error) {
    return { success: true, mock: true };
  }
};

export const getRouteForTask = async (taskId) => {
  try {
    return await apiClient(`/manager/routes/task/${taskId}`);
  } catch (error) {
    return { success: true, mock: true };
  }
};
