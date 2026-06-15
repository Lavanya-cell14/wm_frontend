/**
 * Inventory & Stock Adjustments API Service
 * 
 * TODO: Integrate with backend stock endpoints.
 */

export const adjustStockApi = async (sku, qtyDelta, reason) => {
  // TODO: Call POST /warehouse/inventory/adjust
  return { success: true };
};

export const reportDamageApi = async (sku, qty, reason) => {
  // TODO: Call POST /warehouse/inventory/damage
  return { success: true };
};
