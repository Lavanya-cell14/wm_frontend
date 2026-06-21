import { apiClient, normalizeResponse } from './apiClient';

/**
 * Users & Identity API Service
 */

export const loginApi = async (username, password) => {
  return await apiClient('/api/users/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
};

export const refreshTokenApi = async (refresh) => {
  return await apiClient('/api/users/token/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh }),
  });
};

export const getUsersApi = async () => {
  const data = await apiClient('/api/users/');
  return normalizeResponse(data);
};

export const createUserApi = async (payload) => {
  return await apiClient('/api/users/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getUserByIdApi = async (id) => {
  return await apiClient(`/api/users/${id}/`);
};

export const updateUserApi = async (id, payload) => {
  return await apiClient(`/api/users/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const patchUserApi = async (id, payload) => {
  return await apiClient(`/api/users/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const deleteUserApi = async (id) => {
  return await apiClient(`/api/users/${id}/`, {
    method: 'DELETE',
  });
};
