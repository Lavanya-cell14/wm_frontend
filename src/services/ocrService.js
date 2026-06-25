/**
 * OCR Inbound Document Processing Service
 *
 * All OCR requests are routed through the Django backend.
 * The Django backend calls the OCR service using OCR_SERVICE_URL (env var).
 * The frontend must NEVER call the OCR service directly.
 *
 * Correct flow:
 *   Frontend (localhost:5173)
 *   → Django Backend (localhost:8000)  [/api/ocr/upload/]
 *   → OCR Service (ngrok URL, set via OCR_SERVICE_URL on backend)
 *   → Django saves extracted data to Neon DB
 *   → Frontend fetches extracted data from Django [/api/ocr/documents/:id/]
 */

/**
 * Processes a document through the Django backend OCR pipeline.
 * Django will forward the file to the OCR service (configured via OCR_SERVICE_URL env var).
 * Returns the extracted_json from the backend, or throws on failure.
 */
export const processOcrDocument = async (file) => {
  // Validate file is a real File or Blob object
  if (!(file instanceof File || file instanceof Blob)) {
    console.error("[OCR Service] Invalid file object passed:", file);
    throw new Error("Please re-select this file before processing. Browser cannot restore uploaded file after refresh.");
  }

  console.log(
    "[OCR Service] Routing via Django backend. File:", file.name || "unknown",
    "Size:", file.size || 0
  );

  // Step 1: Upload file to Django backend — Django handles OCR extraction internally
  console.warn("[OCR Service] POST file to Django BE: /api/ocr/upload/");
  const djangoRes = await uploadOcrDocumentDjangoApi(file);

  if (!djangoRes?.document_id) {
    throw new Error("Django backend failed to return a document ID after upload.");
  }

  const backendDocId = djangoRes.document_id;
  console.log("[OCR Service] Django upload succeeded. Document ID:", backendDocId);

  // Step 2: Fetch the fully extracted data from Django backend
  console.warn(`[OCR Service] GET extracted data from Django BE: /api/ocr/documents/${backendDocId}/`);
  const docDetails = await fetchOcrDocumentApi(backendDocId);

  if (!docDetails?.extracted_json) {
    throw new Error("Django backend processed the document but returned no extracted data. Check backend OCR logs.");
  }

  console.log("[OCR Service] Extraction succeeded via Django backend.");
  // Return in the same shape callers expect
  return { ...docDetails.extracted_json, _backendDocId: backendDocId };
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
  const formData = new FormData();
  formData.append('file', file);

  return await apiClient('/api/ocr/upload/', {
    method: 'POST',
    body: formData,
  });
};

export const fetchOcrDocumentApi = async (docId) => {
  console.warn(`[OCR Service] GET document details from Django BE: /api/ocr/documents/${docId}/`);
  return await apiClient(`/api/ocr/documents/${docId}/`);
};

/**
 * Fetches the paginated list of all OCR documents from the Django backend.
 * Returns normalized { results, count } shape.
 */
export const getOcrDocuments = async (page = 1) => {
  const data = await apiClient(`/api/ocr/documents/?page=${page}`);
  if (Array.isArray(data)) return { results: data, count: data.length };
  if (data && Array.isArray(data.results)) return data;
  return { results: [], count: 0 };
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


