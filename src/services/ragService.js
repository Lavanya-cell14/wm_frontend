/**
 * RAG AI Assistant Service
 * 
 * Queries the RAG FastAPI service on port 8002.
 */

const RAG_API_BASE_URL = import.meta.env.VITE_RAG_API_BASE_URL || 'http://127.0.0.1:8002';

/**
 * Submit a question to the RAG AI Assistant.
 * Endpoint: POST /api/ai/analyze
 */
export const askRag = async (query) => {
  console.warn(`[RAG Service] POST question to RAG Server: ${RAG_API_BASE_URL}/api/ai/analyze`);
  
  const payload = {
    title: query,
    description: query,
    warehouseId: 'WH001',
    attemptCount: 1,
    userId: 1,
    auditTrail: [],
  };

  const response = await fetch(`${RAG_API_BASE_URL}/api/ai/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`RAG service returned status ${response.status}`);
  }

  return await response.json();
};
