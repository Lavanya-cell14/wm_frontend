/**
 * Central API Client
 *
 * Responsibilities:
 *   - Single point for all backend HTTP calls
 *   - Auth header injection via isolated getAuthHeaders() — swap here when auth is decided
 *   - Structured error objects for consistent error handling across all service files
 *   - Response normalizer for paginated { count, results } and plain array shapes
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// ---------------------------------------------------------------------------
// AUTH LAYER
// Backend authentication is disabled (AllowAny). No headers required.
// ---------------------------------------------------------------------------
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || 
                localStorage.getItem('accessToken') || 
                localStorage.getItem('access_token') || 
                localStorage.getItem('access');
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }

  // Attach mock headers for local development based on current route/path
  if (typeof window !== 'undefined' && window.location) {
    const path = window.location.pathname;
    let email = 'manager@warehouseai.com';
    let role = 'WAREHOUSE_MANAGER';
    
    if (path.startsWith('/admin')) {
      email = 'admin@warehouseai.com';
      role = 'ADMIN';
    } else if (path.startsWith('/manager')) {
      email = 'manager@warehouseai.com';
      role = 'WAREHOUSE_MANAGER';
    } else if (path.startsWith('/operator') || path.startsWith('/staff')) {
      email = 'staff@warehouseai.com';
      role = 'WAREHOUSE_OPERATOR';
    } else if (path.startsWith('/inventory')) {
      email = 'inventory@warehouseai.com';
      role = 'RECEIVING_INVENTORY_OFFICER';
    }
    
    return {
      'X-Mock-User-Email': email,
      'X-Mock-User-Role': role,
    };
  }
  return {};
};

// ---------------------------------------------------------------------------
// RESPONSE NORMALIZER
// Accepts both Django-style paginated responses and plain arrays.
// Always returns: { results: [...], count: N }
// ---------------------------------------------------------------------------
export const normalizeResponse = (data) => {
  if (Array.isArray(data)) {
    return { results: data, count: data.length };
  }
  if (data && Array.isArray(data.results)) {
    return { results: data.results, count: data.count ?? data.results.length };
  }
  // Single object (detail endpoints) — wrap in results for uniform access
  if (data && typeof data === 'object') {
    return { results: [data], count: 1, single: true };
  }
  return { results: [], count: 0 };
};

// ---------------------------------------------------------------------------
// API CLIENT
// ---------------------------------------------------------------------------
export const apiClient = async (endpoint, options = {}) => {
  if (!BASE_URL) {
    throw new ApiError(0, 'CONFIG_ERROR', 'VITE_API_BASE_URL is not set. Check your .env file.');
  }

  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...getAuthHeaders(),         // auth slot — isolated, single swap point
    ...(options.headers || {}),  // per-call header overrides
  };

  let response;
  try {
    const fullUrl = `${BASE_URL}${endpoint}`;
    console.warn(`[apiClient] Calling: ${fullUrl}`);
    response = await fetch(fullUrl, {
      ...options,
      headers,
    });
    console.warn(`[apiClient] Response Status for ${fullUrl}: ${response.status}`);
  } catch (networkError) {
    console.error(`[apiClient] Network Error for ${BASE_URL}${endpoint}:`, networkError);
    throw new ApiError(0, 'NETWORK_ERROR', `Cannot reach ${BASE_URL}. Is the backend running?`);
  }

  if (!response.ok) {
    let detail = {};
    try {
      detail = await response.json();
    } catch (_) {
      // Response body may not be JSON on some error codes
    }
    console.warn(`[apiClient] Error Response:`, detail);
    throw new ApiError(response.status, response.statusText, detail?.detail || detail);
  }

  // 204 No Content — return null (used by some DELETE responses)
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// ---------------------------------------------------------------------------
// STRUCTURED ERROR CLASS
// Lets service files and pages distinguish error types:
//   err.status === 404  → not found
//   err.status === 0    → network / config error
//   err.code === 'NETWORK_ERROR'
// ---------------------------------------------------------------------------
export class ApiError extends Error {
  constructor(status, code, detail) {
    super(typeof detail === 'string' ? detail : JSON.stringify(detail));
    this.status = status;
    this.code = code;
    this.detail = detail;
    this.name = 'ApiError';
  }
}
