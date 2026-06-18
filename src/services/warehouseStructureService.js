import { apiClient, normalizeResponse } from './apiClient';

/**
 * Warehouse Structure Service — Phase 1 (Read-Only)
 *
 * Verified endpoints from API contracts.
 * All functions return normalized { results: [...], count: N }.
 * Detail functions return a single object.
 *
 * DO NOT add create/update/delete until explicitly approved.
 */

// ---------------------------------------------------------------------------
// WAREHOUSES
// ---------------------------------------------------------------------------

/**
 * GET /api/warehouses/
 * Accepts paginated { count, results } or plain array.
 * Returns: { results: Warehouse[], count: number }
 */
export const getWarehouses = async () => {
  const data = await apiClient('/api/warehouses/');
  return normalizeResponse(data);
};

/**
 * GET /api/warehouses/{warehouse_id}/
 * Returns a single Warehouse object.
 */
export const getWarehouseById = async (warehouseId) => {
  return await apiClient(`/api/warehouses/${warehouseId}/`);
};

// ---------------------------------------------------------------------------
// ZONE GROUPS
// ---------------------------------------------------------------------------

/**
 * GET /api/zones/zone-groups/
 * Accepts paginated { count, results } or plain array.
 * Returns: { results: ZoneGroup[], count: number }
 */
export const getZoneGroups = async () => {
  const data = await apiClient('/api/zones/zone-groups/');
  return normalizeResponse(data);
};

/**
 * GET /api/zones/zone-groups/{zone_group_id}/
 * Returns a single ZoneGroup object.
 */
export const getZoneGroupById = async (zoneGroupId) => {
  return await apiClient(`/api/zones/zone-groups/${zoneGroupId}/`);
};

// ---------------------------------------------------------------------------
// ZONES
// ---------------------------------------------------------------------------

/**
 * GET /api/zones/
 * Accepts paginated { count, results } or plain array.
 * Returns: { results: Zone[], count: number }
 */
export const getZones = async () => {
  const data = await apiClient('/api/zones/');
  return normalizeResponse(data);
};

/**
 * GET /api/zones/{zone_id}/
 * Returns a single Zone object.
 */
export const getZoneById = async (zoneId) => {
  return await apiClient(`/api/zones/${zoneId}/`);
};
