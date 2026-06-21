/**
 * OCR Inbound Document Processing Service
 * 
 * Configured with environment variables for OCR server and Django BE.
 */

const OCR_API_BASE_URL = import.meta.env.VITE_OCR_API_BASE_URL || 'http://127.0.0.1:8001';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Extracts invoice/manifest details from a document file.
 * Hits OCR FastAPI server on port 8001.
 */
export const processOcrDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  console.warn(`[OCR Service] POST file to OCR Server: ${OCR_API_BASE_URL}/api/v1/ocr/extract`);
  const response = await fetch(`${OCR_API_BASE_URL}/api/v1/ocr/extract`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`OCR service extraction failed with status: ${response.status}`);
  }

  return await response.json();
};

/**
 * Sends corrected items to Django backend for final WMS ingestion.
 * Hits Django BE on port 8000.
 */
export const verifyOcrDocumentApi = async (docId, customPayload) => {
  console.warn(`[OCR Service] POST approval to Django BE: ${API_BASE_URL}/api/ocr/documents/${docId}/approve/`);
  const response = await fetch(`${API_BASE_URL}/api/ocr/documents/${docId}/approve/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ extracted_json: customPayload }),
  });

  if (!response.ok) {
    let errDetail = '';
    try {
      const data = await response.json();
      errDetail = data.detail || JSON.stringify(data);
    } catch (_) {}
    throw new Error(`OCR approval failed with status: ${response.status}. ${errDetail}`);
  }

  return await response.json();
};

/**
 * Rejects an OCR document on the Django backend.
 * Hits Django BE on port 8000.
 */
export const rejectOcrDocumentApi = async (docId, reason) => {
  console.warn(`[OCR Service] POST rejection to Django BE: ${API_BASE_URL}/api/ocr/documents/${docId}/reject/`);
  const response = await fetch(`${API_BASE_URL}/api/ocr/documents/${docId}/reject/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    let errDetail = '';
    try {
      const data = await response.json();
      errDetail = data.detail || JSON.stringify(data);
    } catch (_) {}
    throw new Error(`OCR rejection failed with status: ${response.status}. ${errDetail}`);
  }

  return await response.json();
};

// Keep backward compatibility mappings if needed
export const submitOcrDataToBackend = async (ocrResult) => {
  console.log('Sending OCR Data to Inbound Backend:', ocrResult);
  return { success: true, message: 'Mock data prepared successfully.' };
};

export const verifyOcrDocument = async (docId, updatedItems) => {
  return { success: true };
};

export const rejectOcrDocument = async (docId, reason) => {
  return { success: true };
};
