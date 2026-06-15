/**
 * OCR Inbound Document Processing Service
 * 
 * Configured with backend API environment variables.
 * Currently uses mock/stub implementation for demo-ready execution.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://0jejz.wiremockapi.cloud';

export const processOcrDocument = async (file) => {
  console.log(`[OCR Service] POST request manifest file to: ${API_BASE_URL}/ocr/process`);
  
  // Simulate network request latency
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  return {
    document_type: 'Invoice',
    document_number: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    supplier: 'Dell Sourcing Ltd',
    invoice_number: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    po_number: `PO-${Math.floor(10000 + Math.random() * 90000)}`,
    sku: 'SKU-1001',
    product_name: file.name ? file.name.split('.')[0] : 'Dell Monitor 27" UltraSharp',
    category: 'Electronics',
    quantity: '50',
    length: '65 cm',
    width: '18 cm',
    height: '42 cm',
    weight: '6.5 kg',
    confidence_score: 95,
    validation_status: 'Valid',
    warnings: []
  };
};

export const submitOcrDataToBackend = async (ocrResult) => {
  console.log(`[OCR Service] POST staging receipt payload to: ${API_BASE_URL}/inbound/receipt`);
  
  // Simulate network request
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  console.log('Sending OCR Data to Inbound Backend:', ocrResult);
  return { success: true, message: 'Mock data prepared successfully.' };
};

export const verifyOcrDocument = async (docId, updatedItems) => {
  console.log(`[OCR Service] PUT request verified items to: ${API_BASE_URL}/ocr/${docId}/verify`);
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { success: true };
};

export const rejectOcrDocument = async (docId, reason) => {
  console.log(`[OCR Service] POST rejection logs to: ${API_BASE_URL}/ocr/${docId}/reject`);
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { success: true };
};
