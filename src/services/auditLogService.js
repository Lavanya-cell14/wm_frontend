import { apiClient, normalizeResponse } from './apiClient';

/**
 * Audit Logs API Service
 */

export const getAuditLogsApi = async () => {
  const data = await apiClient('/api/audit-logs/');
  return normalizeResponse(data);
};

export const getAuditLogByIdApi = async (id) => {
  return await apiClient(`/api/audit-logs/${id}/`);
};

export const getScanLogsApi = async () => {
  const data = await apiClient('/api/audit-logs/scan-logs/');
  return normalizeResponse(data);
};

export const getScanLogByIdApi = async (id) => {
  return await apiClient(`/api/audit-logs/scan-logs/${id}/`);
};
