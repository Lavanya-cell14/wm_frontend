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

/**
 * GET /api/warehouses/{warehouse_id}/cad-layout/
 * Returns CAD spatial layout data for a specific warehouse.
 */
export const getWarehouseCadLayout = async (warehouseId) => {
  return await apiClient(`/api/warehouses/${warehouseId}/cad-layout/`);
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

// ---------------------------------------------------------------------------
// NAVIGATION NODES
// ---------------------------------------------------------------------------

/**
 * GET /api/warehouses/navigation-nodes/
 * Returns: { results: NavigationNode[], count: number }
 */
export const getNavigationNodes = async () => {
  const data = await apiClient('/api/warehouses/navigation-nodes/');
  return normalizeResponse(data);
};

/**
 * POST /api/warehouses/navigation-nodes/
 * Returns the created NavigationNode.
 */
export const createNavigationNode = async (payload) => {
  return await apiClient('/api/warehouses/navigation-nodes/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * PATCH /api/warehouses/navigation-nodes/{id}/
 * Returns the updated NavigationNode.
 */
export const updateNavigationNode = async (id, payload) => {
  return await apiClient(`/api/warehouses/navigation-nodes/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

/**
 * DELETE /api/warehouses/navigation-nodes/{id}/
 */
export const deleteNavigationNode = async (id) => {
  return await apiClient(`/api/warehouses/navigation-nodes/${id}/`, {
    method: 'DELETE',
  });
};

// ---------------------------------------------------------------------------
// WALKING PATHS
// ---------------------------------------------------------------------------

/**
 * GET /api/warehouses/paths/
 * Returns: { results: WarehousePath[], count: number }
 */
export const getWarehousePaths = async () => {
  const data = await apiClient('/api/warehouses/paths/');
  return normalizeResponse(data);
};

/**
 * POST /api/warehouses/paths/
 * Returns the created WarehousePath.
 */
export const createWarehousePath = async (payload) => {
  return await apiClient('/api/warehouses/paths/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * PATCH /api/warehouses/paths/{id}/
 * Returns the updated WarehousePath.
 */
export const updateWarehousePath = async (id, payload) => {
  return await apiClient(`/api/warehouses/paths/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

/**
 * DELETE /api/warehouses/paths/{id}/
 */
export const deleteWarehousePath = async (id) => {
  return await apiClient(`/api/warehouses/paths/${id}/`, {
    method: 'DELETE',
  });
};

// ---------------------------------------------------------------------------
// MUTATIONS
// ---------------------------------------------------------------------------

export const createWarehouseApi = async (payload) => {
  return await apiClient('/api/warehouses/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateWarehouseApi = async (id, payload) => {
  return await apiClient(`/api/warehouses/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const patchWarehouseApi = async (id, payload) => {
  return await apiClient(`/api/warehouses/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const deleteWarehouseApi = async (id) => {
  return await apiClient(`/api/warehouses/${id}/`, {
    method: 'DELETE',
  });
};

export const createRackApi = async (payload) => {
  return await apiClient('/api/warehouses/racks/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateRackApi = async (id, payload) => {
  return await apiClient(`/api/warehouses/racks/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const patchRackApi = async (id, payload) => {
  return await apiClient(`/api/warehouses/racks/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const deleteRackApi = async (id) => {
  return await apiClient(`/api/warehouses/racks/${id}/`, {
    method: 'DELETE',
  });
};

export const createZoneApi = async (payload) => {
  return await apiClient('/api/zones/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateZoneApi = async (id, payload) => {
  return await apiClient(`/api/zones/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const patchZoneApi = async (id, payload) => {
  return await apiClient(`/api/zones/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const deleteZoneApi = async (id) => {
  return await apiClient(`/api/zones/${id}/`, {
    method: 'DELETE',
  });
};

export const createBinApi = async (payload) => {
  return await apiClient('/api/bins/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateBinApi = async (id, payload) => {
  return await apiClient(`/api/bins/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const patchBinApi = async (id, payload) => {
  return await apiClient(`/api/bins/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const deleteBinApi = async (id) => {
  return await apiClient(`/api/bins/${id}/`, {
    method: 'DELETE',
  });
};

// ---------------------------------------------------------------------------
// SPATIAL ENTITIES CRUD
// ---------------------------------------------------------------------------

export const getSpatialEntitiesApi = async () => {
  const data = await apiClient('/api/warehouses/spatial-entities/');
  return normalizeResponse(data);
};

export const createSpatialEntityApi = async (payload) => {
  return await apiClient('/api/warehouses/spatial-entities/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getSpatialEntityByIdApi = async (id) => {
  return await apiClient(`/api/warehouses/spatial-entities/${id}/`);
};

export const updateSpatialEntityApi = async (id, payload) => {
  return await apiClient(`/api/warehouses/spatial-entities/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const patchSpatialEntityApi = async (id, payload) => {
  return await apiClient(`/api/warehouses/spatial-entities/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const deleteSpatialEntityApi = async (id) => {
  return await apiClient(`/api/warehouses/spatial-entities/${id}/`, {
    method: 'DELETE',
  });
};

// ---------------------------------------------------------------------------
// AISLE MUTATIONS
// ---------------------------------------------------------------------------

export const createAisleApi = async (payload) => {
  return await apiClient('/api/zones/aisles/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateAisleApi = async (id, payload) => {
  return await apiClient(`/api/zones/aisles/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const patchAisleApi = async (id, payload) => {
  return await apiClient(`/api/zones/aisles/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const deleteAisleApi = async (id) => {
  return await apiClient(`/api/zones/aisles/${id}/`, {
    method: 'DELETE',
  });
};

// ---------------------------------------------------------------------------
// ZONE GROUPS MUTATIONS
// ---------------------------------------------------------------------------

export const createZoneGroupApi = async (payload) => {
  return await apiClient('/api/zones/zone-groups/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateZoneGroupApi = async (id, payload) => {
  return await apiClient(`/api/zones/zone-groups/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const patchZoneGroupApi = async (id, payload) => {
  return await apiClient(`/api/zones/zone-groups/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const deleteZoneGroupApi = async (id) => {
  return await apiClient(`/api/zones/zone-groups/${id}/`, {
    method: 'DELETE',
  });
};

// ---------------------------------------------------------------------------
// ZONE BOUNDARIES MUTATIONS
// ---------------------------------------------------------------------------

export const createZoneBoundaryApi = async (payload) => {
  return await apiClient('/api/zones/boundaries/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateZoneBoundaryApi = async (id, payload) => {
  return await apiClient(`/api/zones/boundaries/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const patchZoneBoundaryApi = async (id, payload) => {
  return await apiClient(`/api/zones/boundaries/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const deleteZoneBoundaryApi = async (id) => {
  return await apiClient(`/api/zones/boundaries/${id}/`, {
    method: 'DELETE',
  });
};




