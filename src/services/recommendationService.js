import { apiClient, normalizeResponse } from './apiClient';

/**
 * AI Recommendations Engine Service
 */

// Legacy stubs for backward compatibility
export const acceptRecommendationApi = async (id) => {
  return { success: true };
};

export const rejectRecommendationApi = async (id) => {
  return { success: true };
};

export const generateStorageRecommendationApi = async (productId) => {
  console.warn(`[AI Recommendation] Request payload:`, { product_id: productId });
  const res = await apiClient('/api/recommendations/storage/', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId })
  });
  console.warn(`[AI Recommendation] Response:`, res);
  return res;
};

export const generateBinAllocationApi = async (productId, inboundLineId) => {
  console.warn(`[AI Allocation] Request payload:`, { product_id: productId, inbound_line_id: inboundLineId });
  const res = await apiClient('/api/recommendations/bin-allocation/', {
    method: 'POST',
    body: JSON.stringify({
      product_id: productId,
      inbound_line_id: inboundLineId
    })
  });
  console.warn(`[AI Allocation] Response:`, res);
  return res;
};

export const completeBinAllocationApi = async (allocationId, operator) => {
  console.warn(`[AI Allocation Complete] Request payload:`, { operator });
  const res = await apiClient(`/api/recommendations/bin-allocation/${allocationId}/complete/`, {
    method: 'PATCH',
    body: JSON.stringify({ operator })
  });
  console.warn(`[AI Allocation Complete] Response:`, res);
  return res;
};

// ---------------------------------------------------------------------------
// RECOMMENDATIONS
// ---------------------------------------------------------------------------

export const getRecommendationsApi = async () => {
  const data = await apiClient('/api/recommendations/');
  return normalizeResponse(data);
};

export const createRecommendationApi = async (payload) => {
  return await apiClient('/api/recommendations/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getRecommendationByIdApi = async (id) => {
  return await apiClient(`/api/recommendations/${id}/`);
};

export const updateRecommendationApi = async (id, payload) => {
  return await apiClient(`/api/recommendations/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteRecommendationApi = async (id) => {
  return await apiClient(`/api/recommendations/${id}/`, {
    method: 'DELETE',
  });
};

export const allocateRecommendationApi = async (payload) => {
  return await apiClient('/api/recommendations/allocate/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const suggestBinRecommendationApi = async (payload) => {
  return await apiClient('/api/recommendations/suggest-bin/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// ---------------------------------------------------------------------------
// AI INSIGHTS & ANALYTICS
// ---------------------------------------------------------------------------

export const getAiAlertsApi = async () => {
  const data = await apiClient('/api/ai/alerts/');
  return normalizeResponse(data);
};

export const getAiCongestionRiskApi = async () => {
  return await apiClient('/api/ai/congestion-risk/');
};

export const submitAiFeedbackApi = async (payload) => {
  return await apiClient('/api/ai/feedback/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getAiHotspotPreventionApi = async () => {
  return await apiClient('/api/ai/hotspot-prevention/');
};

export const getAiOperationalScoresApi = async () => {
  return await apiClient('/api/ai/operational-scores/');
};

export const optimizeSlottingApi = async (payload) => {
  return await apiClient('/api/ai/optimize-slotting/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Predict Demand - POST method (verified in backend)
 */
export const predictDemandApi = async (payload) => {
  return await apiClient('/api/ai/predict-demand/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getAiRecommendationsApi = async () => {
  const data = await apiClient('/api/ai/recommendations/');
  return normalizeResponse(data);
};

export const getAiSlottingScoreApi = async () => {
  return await apiClient('/api/ai/slotting-score/');
};

export const queryAiCopilotApi = async (queryText) => {
  return await apiClient('/api/ai/query/', {
    method: 'POST',
    body: JSON.stringify({ query: queryText }),
  });
};

export const recommend3dPlacementApi = async (payload) => {
  return await apiClient('/api/recommendations/3d-placement/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

