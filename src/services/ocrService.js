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
export const processOcrDocument = async (file, options = {}) => {
  // Validate file is a real File or Blob object
  if (!(file instanceof File || file instanceof Blob)) {
    console.error("[OCR Service] Invalid file object passed:", file);
    throw new Error("Please re-select this file before processing. Browser cannot restore uploaded file after refresh.");
  }

  const formData = new FormData();
  formData.append("file", file, file.name || "upload.pdf");

  // Add console log: file constructor name, file name, file size, Array.from(formData.keys())
  console.log(
    "[OCR Service Log] File constructor name:", file.constructor.name,
    "File name:", file.name || "unknown",
    "File size:", file.size || 0,
    "FormData keys:", Array.from(formData.keys())
  );

  console.warn(`[OCR Service] POST file to OCR Server: ${OCR_API_BASE_URL}/api/v1/ocr/extract`);
  const { headers, ...fetchOptions } = options;
  const response = await fetch(`${OCR_API_BASE_URL}/api/v1/ocr/extract`, {
    method: 'POST',
    body: formData,
    headers: {
      'ngrok-skip-browser-warning': 'true',
      'Accept': 'application/json',
      ...(headers || {})
    },
    ...fetchOptions
  });

  if (!response.ok) {
    throw new Error(`OCR service extraction failed with status: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    console.warn("[OCR Service] Received non-JSON response from OCR API:", text.slice(0, 200));
    return { 
      non_json_response: true, 
      raw_text: text, 
      status: response.status 
    };
  }

  try {
    return await response.json();
  } catch (jsonErr) {
    console.error("[OCR Service] JSON parsing failed:", jsonErr);
    return {
      json_parse_error: true,
      error_message: jsonErr.message,
      status: response.status
    };
  }
};

import { apiClient } from './apiClient';

/**
 * Sends corrected items to Django backend for final WMS ingestion.
 * Hits Django BE.
 */
export const verifyOcrDocumentApi = async (docId, customPayload) => {
  console.warn(`[OCR Service] POST approval to Django BE: /api/ocr/documents/${docId}/approve/`);
  return await apiClient(`/api/ocr/documents/${docId}/approve/`, {
    method: 'POST',
    body: JSON.stringify({ extracted_json: customPayload }),
  });
};

/**
 * Rejects an OCR document on the Django backend.
 * Hits Django BE.
 */
export const rejectOcrDocumentApi = async (docId, reason) => {
  console.warn(`[OCR Service] POST rejection to Django BE: /api/ocr/documents/${docId}/reject/`);
  return await apiClient(`/api/ocr/documents/${docId}/reject/`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
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

export const uploadOcrDocumentDjangoApi = async (file) => {
  const token = localStorage.getItem('token') || 
                localStorage.getItem('accessToken') || 
                localStorage.getItem('access_token') || 
                localStorage.getItem('access');
  if (!token) {
    console.warn("[OCR Service] No access token found in localStorage. Skipping optional Django OCR upload.");
    return { skipped: true };
  }

  const formData = new FormData();
  formData.append('file', file);

  return await apiClient('/api/ocr/upload/', {
    method: 'POST',
    body: formData,
  });
};

export const normalizeOcrResponse = (res, activeDoc) => {
  if (res.json_parse_error || res.non_json_response) {
    throw new Error(res.error_message || "Received non-JSON response/HTML page from OCR API.");
  }
  const extractedData = res.extracted_data || res || {};
  const products = extractedData.products || res.products || extractedData.items || res.items || [];
  const partyInfo = extractedData.party_info || res.party_info || {};
  const docInfo = extractedData.document_info || res.document_info || {};

  const supplierName = partyInfo.supplier_name || partyInfo.name || extractedData.supplier_name || res.supplier_name || activeDoc.supplierName || 'Unknown Supplier';
  const documentNumber = docInfo.invoice_number || docInfo.document_number || docInfo.delivery_number || res.document_id || res.invoice_number || activeDoc.id;
  const documentType = res.document_type || res.documentType || activeDoc.documentType || 'Invoice';
  const confidenceScore = res.confidence_score !== undefined ? Math.round(res.confidence_score * 100) : (activeDoc.confidenceScore || 95);

  const totals = extractedData.totals || res.totals || {};
  const totalAmount = totals.total_amount || totals.total || '';
  const taxAmount = totals.tax_amount || totals.tax || '';

  const mappedItems = products.map((item, idx) => {
    // extract dimensions
    let length = '';
    let width = '';
    let height = '';
    if (item.dimensions) {
      length = item.dimensions.length || '';
      width = item.dimensions.width || '';
      height = item.dimensions.height || '';
    } else {
      length = item.length || '';
      width = item.width || '';
      height = item.height || '';
    }

    // extract weight
    let weight = '';
    if (item.weight && typeof item.weight === 'object') {
      weight = item.weight.value || '';
    } else {
      weight = item.weight || '';
    }

    return {
      id: item.id || `EXT-${Date.now()}-${idx}`,
      sku: item.sku || item.SKU || '',
      productName: item.product_name || item.name || item.productName || item.productTitle || '',
      category: item.category || 'General',
      quantity: Number(item.quantity || item.qty || 0),
      uom: item.uom || item.unit || 'BOX',
      length: length,
      width: width,
      height: height,
      weight: weight,
      batchNumber: item.batch_number || item.batchNumber || `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: item.expiry_date || item.expiryDate || '2028-12-31',
      confidenceScore: item.confidence_score !== undefined ? Math.round(item.confidence_score * 100) : confidenceScore,
      validationStatus: (item.sku || item.SKU) ? 'Valid' : 'Warning',
      storageType: item.storage_type || item.storageType || 'GENERAL',
      isFragile: !!(item.is_fragile || item.fragile || item.isFragile),
      isStackable: !!(item.is_stackable || item.stackable || item.isStackable)
    };
  });

  return {
    documentNumber,
    supplierName,
    documentType,
    confidenceScore,
    totalAmount,
    taxAmount,
    mappedItems
  };
};


