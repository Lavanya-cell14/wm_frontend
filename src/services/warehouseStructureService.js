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

// ---------------------------------------------------------------------------
// AISLES (Optional / Conditional)
// ---------------------------------------------------------------------------

/**
 * GET /api/zones/aisles/
 * Accepts paginated { count, results } or plain array.
 * Returns: { results: Aisle[], count: number }
 */
export const getAisles = async () => {
  const data = await apiClient('/api/zones/aisles/');
  return normalizeResponse(data);
};

/**
 * GET /api/zones/aisles/{aisle_id}/
 * Returns a single Aisle object.
 */
export const getAisleById = async (aisleId) => {
  return await apiClient(`/api/zones/aisles/${aisleId}/`);
};

// ---------------------------------------------------------------------------
// ZONE BOUNDARIES
// ---------------------------------------------------------------------------

/**
 * GET /api/zones/boundaries/
 * Accepts paginated { count, results } or plain array.
 * Returns: { results: ZoneBoundary[], count: number }
 */
export const getZoneBoundaries = async () => {
  const data = await apiClient('/api/zones/boundaries/');
  return normalizeResponse(data);
};

/**
 * GET /api/zones/boundaries/{boundary_id}/
 * Returns a single ZoneBoundary object.
 */
export const getZoneBoundaryById = async (boundaryId) => {
  return await apiClient(`/api/zones/boundaries/${boundaryId}/`);
};

// ---------------------------------------------------------------------------
// RACKS
// ---------------------------------------------------------------------------

/**
 * GET /api/warehouses/racks/
 * Accepts paginated { count, results } or plain array.
 * Returns: { results: Rack[], count: number }
 */
export const getRacks = async () => {
  const data = await apiClient('/api/warehouses/racks/');
  return normalizeResponse(data);
};

/**
 * GET /api/warehouses/racks/{rack_id}/
 * Returns a single Rack object.
 */
export const getRackById = async (rackId) => {
  return await apiClient(`/api/warehouses/racks/${rackId}/`);
};

// ---------------------------------------------------------------------------
// RACK COORDINATES
// ---------------------------------------------------------------------------

/**
 * GET /api/warehouses/rack-coordinates/
 * Accepts paginated { count, results } or plain array.
 * Returns: { results: RackCoordinate[], count: number }
 */
export const getRackCoordinates = async () => {
  const data = await apiClient('/api/warehouses/rack-coordinates/');
  return normalizeResponse(data);
};

/**
 * GET /api/warehouses/rack-coordinates/{rack_coordinate_id}/
 * Returns a single RackCoordinate object.
 */
export const getRackCoordinateById = async (coordinateId) => {
  return await apiClient(`/api/warehouses/rack-coordinates/${coordinateId}/`);
};

// ---------------------------------------------------------------------------
// BINS
// ---------------------------------------------------------------------------

/**
 * GET /api/bins/
 * Accepts paginated { count, results } or plain array.
 * Returns: { results: Bin[], count: number }
 */
export const getBins = async () => {
  const data = await apiClient('/api/bins/');
  return normalizeResponse(data);
};

/**
 * GET /api/bins/{bin_id}/
 * Returns a single Bin object.
 */
export const getBinById = async (binId) => {
  return await apiClient(`/api/bins/${binId}/`);
};

