/**
 * Central API Client Config
 * 
 * TODO: Configure API base URL and interceptors.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://0jejz.wiremockapi.cloud';

export const apiClient = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`API Client Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
