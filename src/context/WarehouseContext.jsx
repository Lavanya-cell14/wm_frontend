import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const WarehouseContext = createContext();

// Helper for alphabetical & numeric sequence auto-generation
export const generateNextId = (prefix, existingIds) => {
  if (prefix === 'Zone ') {
    const letters = existingIds
      .map(id => {
        const match = id.match(/Zone\s+([A-Z]+)/i);
        return match ? match[1].toUpperCase() : '';
      })
      .filter(Boolean);
    
    if (letters.length === 0) return 'Zone A';
    
    const letterToNumber = (str) => {
      let num = 0;
      for (let i = 0; i < str.length; i++) {
        num = num * 26 + (str.charCodeAt(i) - 64);
      }
      return num;
    };
    
    const numberToLetter = (num) => {
      let str = '';
      while (num > 0) {
        let rem = (num - 1) % 26;
        str = String.fromCharCode(65 + rem) + str;
        num = Math.floor((num - rem) / 26);
      }
      return str;
    };
    
    const numbers = letters.map(letterToNumber);
    const maxNum = Math.max(...numbers, 0);
    return `Zone ${numberToLetter(maxNum + 1)}`;
  }
  
  if (prefix === 'ZONE-') {
    const letters = existingIds
      .map(id => {
        const match = id.match(/ZONE-([A-Z]+)/i);
        return match ? match[1].toUpperCase() : '';
      })
      .filter(Boolean);
    
    if (letters.length === 0) return 'ZONE-A';
    
    const letterToNumber = (str) => {
      let num = 0;
      for (let i = 0; i < str.length; i++) {
        num = num * 26 + (str.charCodeAt(i) - 64);
      }
      return num;
    };
    
    const numberToLetter = (num) => {
      let str = '';
      while (num > 0) {
        let rem = (num - 1) % 26;
        str = String.fromCharCode(65 + rem) + str;
        num = Math.floor((num - rem) / 26);
      }
      return str;
    };
    
    const numbers = letters.map(letterToNumber);
    const maxNum = Math.max(...numbers, 0);
    return `ZONE-${numberToLetter(maxNum + 1)}`;
  }

  const nums = existingIds
    .map(id => {
      if (!id || typeof id !== 'string') return 0;
      const regex = new RegExp(`${prefix}(\\d+)`, 'i');
      const match = id.match(regex);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => n > 0);
  
  const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
  const nextNum = maxNum + 1;
  const padded = String(nextNum).padStart(3, '0');
  return `${prefix}${padded}`;
};

// Helper for alphabetical & numeric sequence validation
export const validateId = (id, prefix, existingIds) => {
  if (!id) return { isValid: false, message: 'Identifier cannot be empty.' };

  if (existingIds.includes(id)) {
    return { isValid: false, message: 'Duplicate ID already exists.' };
  }

  if (prefix === 'Zone ') {
    const match = id.match(/^Zone\s+([A-Z]+)$/i);
    if (!match) {
      return { isValid: false, message: 'Zone name must follow alphabetical sequence (e.g., Zone D).' };
    }
  } else if (prefix === 'ZONE-') {
    const match = id.match(/^ZONE-([A-Z]+)$/i);
    if (!match) {
      return { isValid: false, message: 'Zone ID must follow alphabetical sequence (e.g., ZONE-D).' };
    }
  } else {
    const regex = new RegExp(`^${prefix}(\\d+)$`, 'i');
    if (!id.match(regex)) {
      return { isValid: false, message: `Identifier must match the sequential format ${prefix}001.` };
    }
  }

  const nextValid = generateNextId(prefix, existingIds);
  if (id.toUpperCase() !== nextValid.toUpperCase()) {
    if (prefix === 'Zone ') {
      return { isValid: false, message: `Skipped sequence is not allowed. Next valid name should be ${nextValid}.` };
    }
    return { isValid: false, message: `Skipped sequence is not allowed. Next valid ID should be ${nextValid}.` };
  }

  return { isValid: true, message: '' };
};

export function WarehouseProvider({ children }) {
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState([
    {
      id: "WH-001",
      name: "Central Fulfillment A",
      location: "Chicago, IL",
      status: "operational",
      totalZones: 4,
      capacity: 85,
      activeStaff: 45,
      area: "50,000 sq ft",
    },
  ]);

  const [zones, setZones] = useState([
    {
      id: "ZONE-Z1",
      name: "Zone A",
      type: "Fast Moving",
      warehouse: "Central Fulfillment A",
      x: 10,
      y: 5,
      z: 0,
      width: 20,
      height: 10,
      depth: 15,
      capacityPercent: 65,
      status: "Active",
    },
    {
      id: "ZONE-Z2",
      name: "Zone B",
      type: "Electronics",
      warehouse: "Central Fulfillment A",
      x: 35,
      y: 5,
      z: 0,
      width: 20,
      height: 10,
      depth: 15,
      capacityPercent: 72,
      status: "Active",
    },
    {
      id: "ZONE-Z3",
      name: "Zone C",
      type: "Bulk Storage",
      warehouse: "Central Fulfillment A",
      x: 60,
      y: 5,
      z: 0,
      width: 20,
      height: 10,
      depth: 15,
      capacityPercent: 88,
      status: "Active",
    },
    {
      id: "ZONE-Z4",
      name: "Zone D",
      type: "Cold Storage",
      warehouse: "Central Fulfillment A",
      x: 85,
      y: 5,
      z: 0,
      width: 20,
      height: 10,
      depth: 15,
      capacityPercent: 40,
      status: "Active",
    },
  ]);

  const [racks, setRacks] = useState([
    { id: "RACK-001", zoneId: "ZONE-Z1", name: "Rack 1", maxWeight: 1000, currentWeight: 350, status: "Active" },
    { id: "RACK-002", zoneId: "ZONE-Z2", name: "Rack 2", maxWeight: 1500, currentWeight: 450, status: "Active" },
    { id: "RACK-003", zoneId: "ZONE-Z3", name: "Rack 3", maxWeight: 2000, currentWeight: 800, status: "Active" },
    { id: "RACK-004", zoneId: "ZONE-Z4", name: "Rack 4", maxWeight: 1200, currentWeight: 120, status: "Active" },
  ]);

  const [shelves, setShelves] = useState([
    { id: "SHELF-001", rackId: "RACK-001", shelfLevel: "Level 1", maxWeight: 300, currentWeight: 100, status: "Active" },
    { id: "SHELF-002", rackId: "RACK-001", shelfLevel: "Level 2", maxWeight: 300, currentWeight: 150, status: "Active" },
    { id: "SHELF-003", rackId: "RACK-002", shelfLevel: "Level 1", maxWeight: 500, currentWeight: 200, status: "Active" },
    { id: "SHELF-004", rackId: "RACK-003", shelfLevel: "Level 1", maxWeight: 600, currentWeight: 400, status: "Active" },
  ]);

  const [bins, setBins] = useState([
    {
      code: "BIN-001",
      zone: "Zone A",
      shelf: "S-01",
      maxCapacity: 200,
      currentCapacity: 120,
      status: "Active",
      x: 12,
      y: 5,
      z: 1,
    },
    {
      code: "BIN-002",
      zone: "Zone B",
      shelf: "S-10",
      maxCapacity: 50,
      currentCapacity: 15,
      status: "Active",
      x: 32,
      y: 5,
      z: 1,
    },
    {
      code: "BIN-003",
      zone: "Zone B",
      shelf: "S-03",
      maxCapacity: 100,
      currentCapacity: 50,
      status: "Active",
      x: 35,
      y: 5,
      z: 2,
    },
    {
      code: "BIN-004",
      zone: "Zone C",
      shelf: "S-04",
      maxCapacity: 100,
      currentCapacity: 45,
      status: "Active",
      x: 58,
      y: 6,
      z: 2,
    },
  ]);

  const [inventory, setInventory] = useState([
    {
      sku: "PRD-001",
      name: "Dell Laptop",
      category: "Electronics",
      quantity: 50,
      reserved: 0,
      damaged: 0,
      availableQuantity: 50,
      reorderLevel: 10,
      status: "In Stock",
      warehouse: "Central Fulfillment A",
      zone: "Zone B",
      rack: "RACK-003",
      shelf: "S-03",
      bin: "BIN-003",
      weight: "2.4 kg",
      dimensions: "35 x 24 x 3 cm",
      lastUpdated: "Just scanned",
    },
    {
      sku: "PRD-002",
      name: "MacBook Pro",
      category: "Electronics",
      quantity: 15,
      reserved: 2,
      damaged: 0,
      availableQuantity: 13,
      reorderLevel: 10,
      status: "In Stock",
      warehouse: "Central Fulfillment A",
      zone: "Zone B",
      rack: "RACK-002",
      shelf: "S-01",
      bin: "BIN-002",
      weight: "1.4 kg",
      dimensions: "30 x 21 x 2 cm",
      lastUpdated: "10 mins ago",
    },
    {
      sku: "PRD-003",
      name: "Logitech Mouse",
      category: "Accessories",
      quantity: 120,
      reserved: 10,
      damaged: 1,
      availableQuantity: 109,
      reorderLevel: 10,
      status: "In Stock",
      warehouse: "Central Fulfillment A",
      zone: "Zone A",
      rack: "RACK-001",
      shelf: "S-01",
      bin: "BIN-001",
      weight: "0.1 kg",
      dimensions: "10 x 6 x 4 cm",
      lastUpdated: "30 mins ago",
    },
    {
      sku: "PRD-004",
      name: "Industrial Drills Pro",
      category: "Industrial Tools",
      quantity: 25,
      reserved: 4,
      damaged: 0,
      availableQuantity: 21,
      reorderLevel: 10,
      status: "In Stock",
      warehouse: "Central Fulfillment A",
      zone: "Zone C",
      rack: "RACK-004",
      shelf: "S-04",
      bin: "BIN-004",
      weight: "5.5 kg",
      dimensions: "26 x 22 x 32 cm",
      lastUpdated: "1 hr ago",
    },
  ]);

  const [recentScans, setRecentScans] = useState([
    {
      id: "SCN-001",
      sku: "PRD-002",
      name: "MacBook Pro",
      category: "Electronics",
      time: "10:15 AM",
      operator: "Warehouse Staff",
      suggested: "BIN-002",
      status: "Stored",
    },
  ]);

  const [workers, setWorkers] = useState([
    { id: 'WRK-001', name: 'System Admin', email: 'admin@warehouseai.com', role: 'ADMIN', warehouse: 'All Facilities', status: 'Active', lastLogin: '5 mins ago', createdAt: '2026-01-10' },
    { id: 'WRK-002', name: 'Warehouse Manager', email: 'manager@warehouseai.com', role: 'MANAGER', warehouse: 'Central Fulfillment A', status: 'Active', lastLogin: '1 hr ago', createdAt: '2026-01-12' },
    { id: 'WRK-003', name: 'Warehouse Staff', email: 'staff@warehouseai.com', role: 'STAFF', warehouse: 'East Coast Distribution', status: 'Active', lastLogin: '3 hrs ago', createdAt: '2026-01-15' },
    { id: 'WRK-004', name: 'Inventory Clerk', email: 'inventory@warehouseai.com', role: 'INVENTORY_CLERK', warehouse: 'Central Fulfillment A', status: 'Active', lastLogin: '2 hrs ago', createdAt: '2026-02-01' }
  ]);

  const [putawayTasks, setPutawayTasks] = useState([
    {
      id: "PTW-001",
      inboundId: "IR-001",
      product: "Heavy Duty Drilling Rig 500W",
      sku: "SKU-3092",
      quantity: 8,
      pickupLocation: "Receiving Dock",
      destinationZone: "Zone C",
      destinationRack: "RACK-004",
      destinationShelf: "S-04",
      destinationBin: "BIN-004",
      assignedStaffId: "WRK-003",
      assignedStaffName: "Warehouse Staff",
      priority: "High",
      dueTime: "Today, 18:00",
      routePath: "Receiving Dock -> Aisle 1 -> Zone C -> RACK-004 -> S-04 -> BIN-004",
      status: "ASSIGNED",
      createdAt: new Date().toISOString()
    },
    {
      id: "PTW-002",
      inboundId: "IR-002",
      product: "Dell Laptop",
      sku: "PRD-001",
      quantity: 15,
      pickupLocation: "Receiving Dock",
      destinationZone: "Zone B",
      destinationRack: "RACK-003",
      destinationShelf: "S-03",
      destinationBin: "BIN-003",
      assignedStaffId: "WRK-003",
      assignedStaffName: "Warehouse Staff",
      priority: "Medium",
      dueTime: "Today, 16:30",
      routePath: "Receiving Dock -> Aisle 2 -> Zone B -> RACK-003 -> S-03 -> BIN-003",
      status: "COMPLETED",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      completedAt: new Date(Date.now() - 3600000).toISOString(),
      estTime: "12 mins",
      duration: "9 mins"
    },
    {
      id: "PTW-003",
      inboundId: "IR-003",
      product: "MacBook Pro",
      sku: "PRD-002",
      quantity: 5,
      pickupLocation: "Receiving Dock",
      destinationZone: "Zone B",
      destinationRack: "RACK-002",
      destinationShelf: "S-01",
      destinationBin: "BIN-002",
      assignedStaffId: "WRK-003",
      assignedStaffName: "Warehouse Staff",
      priority: "Low",
      dueTime: "Today, 17:00",
      routePath: "Receiving Dock -> Aisle 2 -> Zone B -> RACK-002 -> S-01 -> BIN-002",
      status: "COMPLETED",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 3.5).toISOString(),
      estTime: "10 mins",
      duration: "11 mins"
    }
  ]);
  const [stockAdjustments, setStockAdjustments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [damagedRecords, setDamagedRecords] = useState([]);

  const [ocrDocuments, setOcrDocuments] = useState([
    {
      id: "OCR-001",
      fileName: "dell_monitor_invoice.pdf",
      documentType: "Invoice",
      supplierName: "Dell Sourcing Ltd",
      uploadedAt: "2026-06-15T09:00:00Z",
      uploadedBy: "inventory@warehouseai.com",
      status: "VERIFICATION_PENDING",
      confidenceScore: 94,
      extractedItems: [
        {
          id: "EXT-001",
          sku: "", // Missing SKU
          productName: 'Dell Monitor 27" UltraSharp',
          category: "Electronics",
          quantity: 40,
          uom: "BOX",
          length: 65,
          width: 18,
          height: 42,
          weight: 6.5,
          batchNumber: "BAT-9921",
          expiryDate: "2028-12-31",
          confidenceScore: 94,
          validationStatus: "Warning"
        }
      ],
      warnings: 2
    },
    {
      id: "OCR-002",
      fileName: "hp_printer_packing_slip.jpg",
      documentType: "Packing List",
      supplierName: "HP Supply Logistics",
      uploadedAt: "2026-06-14T14:30:00Z",
      uploadedBy: "inventory@warehouseai.com",
      status: "OCR_UPLOADED",
      confidenceScore: 88,
      extractedItems: [
        {
          id: "EXT-002",
          sku: "SKU-7734",
          productName: "HP LaserJet Printer Pro",
          category: "Electronics",
          quantity: 15,
          uom: "BOX",
          length: "",
          width: "",
          height: "",
          weight: 14.2,
          batchNumber: "BAT-1029",
          expiryDate: "2029-06-30",
          confidenceScore: 88,
          validationStatus: "Warning"
        }
      ],
      warnings: 1
    },
    {
      id: "OCR-003",
      fileName: "logitech_mouse_bol.png",
      documentType: "Bill of Lading",
      supplierName: "Logitech Imports Inc",
      uploadedAt: "2026-06-14T10:15:00Z",
      uploadedBy: "inventory@warehouseai.com",
      status: "OCR_PROCESSING",
      confidenceScore: 68,
      extractedItems: [
        {
          id: "EXT-003",
          sku: "SKU-1198",
          productName: "Logitech Wireless Mouse M510",
          category: "Accessories",
          quantity: 250,
          uom: "PCS",
          length: 12,
          width: 6,
          height: 4,
          weight: 0.12,
          batchNumber: "BAT-0881",
          expiryDate: "2031-01-01",
          confidenceScore: 68,
          validationStatus: "Warning"
        }
      ],
      warnings: 2
    },
    {
      id: "OCR-004",
      fileName: "drill_delivery_docket.pdf",
      documentType: "Delivery Docket",
      supplierName: "Industrial Tools Corp",
      uploadedAt: "2026-06-13T16:00:00Z",
      uploadedBy: "inventory@warehouseai.com",
      status: "VERIFIED",
      confidenceScore: 98,
      extractedItems: [
        {
          id: "EXT-004",
          sku: "SKU-3092",
          productName: "Heavy Duty Drilling Rig 500W",
          category: "Industrial Tools",
          quantity: 8,
          uom: "BOX",
          length: 52,
          width: 32,
          height: 28,
          weight: 18.5,
          batchNumber: "BAT-4412",
          expiryDate: "2030-05-01",
          confidenceScore: 98,
          validationStatus: "Valid"
        }
      ],
      warnings: 0
    }
  ]);

  const [inboundReceipts, setInboundReceipts] = useState([
    {
      id: "IR-001",
      documentId: "OCR-004",
      documentReference: "DD-9901",
      sku: "SKU-3092",
      productName: "Heavy Duty Drilling Rig 500W",
      category: "Industrial Tools",
      quantityReceived: 8,
      verifiedQuantity: 8,
      supplier: "Industrial Tools Corp",
      receivedDate: "2026-06-13",
      dimensions: "52 x 32 x 28 cm",
      weight: "18.5 kg",
      status: "WAITING_FOR_BIN_ASSIGNMENT",
      binRecommendationStatus: "WAITING_FOR_BIN_ASSIGNMENT"
    }
  ]);

  const addOcrDocument = (doc) => {
    setOcrDocuments(prev => [doc, ...prev]);
  };

  const verifyOcrDocument = (docId, updatedItems, docDetails) => {
    setOcrDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'VERIFIED', extractedItems: updatedItems } : d));
    
    updatedItems.forEach((item, idx) => {
      const receiptId = `IR-${Date.now()}-${idx}`;
      const newReceipt = {
        id: receiptId,
        documentId: docId,
        documentReference: docDetails.document_number || 'REF-UNK',
        sku: item.sku,
        productName: item.productName,
        category: item.category,
        quantityReceived: Number(item.quantity),
        verifiedQuantity: Number(item.quantity),
        supplier: docDetails.supplier || 'Unknown Supplier',
        receivedDate: new Date().toISOString().split('T')[0],
        dimensions: item.length ? `${item.length} x ${item.width} x ${item.height} cm` : 'Not Measured',
        weight: item.weight ? `${item.weight} kg` : 'N/A',
        status: 'WAITING_FOR_BIN_ASSIGNMENT',
        binRecommendationStatus: 'WAITING_FOR_BIN_ASSIGNMENT'
      };

      setInboundReceipts(prev => [newReceipt, ...prev]);

      setInventory(prev => {
        const existingIdx = prev.findIndex(inv => inv.sku === item.sku);
        if (existingIdx > -1) {
          return prev.map((inv, index) => index === existingIdx ? {
            ...inv,
            status: "PENDING_PUTAWAY"
          } : inv);
        } else {
          return [...prev, {
            sku: item.sku,
            name: item.productName,
            category: item.category,
            quantity: 0,
            reserved: 0,
            damaged: 0,
            availableQuantity: 0,
            reorderLevel: 10,
            status: "PENDING_PUTAWAY",
            warehouse: "Central Fulfillment A",
            zone: "Zone A",
            rack: "RACK-001",
            shelf: "S-01",
            bin: "Pending Bin",
            weight: item.weight ? `${item.weight} kg` : 'N/A',
            dimensions: item.length ? `${item.length} x ${item.width} x ${item.height} cm` : 'Not Measured',
            lastUpdated: "Just added from OCR"
          }];
        }
      });

      const nextMovId = generateNextId('MOV-', movements.map(m => m.id));
      setMovements(prev => [
        {
          id: nextMovId,
          item: item.productName,
          sku: item.sku,
          from: "Receiving Dock",
          to: "Inventory",
          user: user?.email || "inventory@warehouseai.com",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "INBOUND_RECEIVED",
          status: "Completed",
          qty: Number(item.quantity),
          timestamp: new Date().toISOString(),
          reason: `Auto-created from verified OCR document ${docDetails.document_number}`
        },
        ...prev
      ]);
    });
  };

  const rejectOcrDocument = (docId, reason) => {
    setOcrDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'REJECTED', rejectReason: reason } : d));
  };

  const [inboundTasks, setInboundTasks] = useState([
    {
      id: "INB-001",
      supplier: "Dell Logistics",
      supplierId: "SUP-001",
      expectedArrival: "Today, 14:00",
      product: "Dell Laptop",
      sku: "PRD-001",
      quantity: 50,
      priority: "High",
      status: "Pending",
      assignedStaff: "Unassigned",
    },
  ]);

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [movements, setMovements] = useState([]);
  const [routes, setRoutes] = useState([
    {
      id: "ROUTE-001",
      from: "Receiving Dock A",
      to: "BIN-003",
      distance: "65m",
      time: "4 mins",
      operator: "Warehouse Staff",
      status: "Active",
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const baseUrl = "https://0jejz.wiremockapi.cloud";
        
        // Fetch all 12 endpoints including newly added products, recommendations, and inbound-shipments
        const [
          layoutRes, 
          utilRes, 
          invRes, 
          workersRes, 
          routesRes, 
          ordersRes, 
          movementsRes, 
          scansRes, 
          suppliersRes,
          productsRes,
          recsRes,
          inboundsRes
        ] = await Promise.all([
          fetch(`${baseUrl}/warehouse/warehouse-layout`).then(r => r.ok ? r.json() : null),
          fetch(`${baseUrl}/warehouse/utilization`).then(r => r.ok ? r.json() : null),
          fetch(`${baseUrl}/warehouse/inventory`).then(r => r.ok ? r.json() : null),
          fetch(`${baseUrl}/warehouse/workers`).then(r => r.ok ? r.json() : null),
          fetch(`${baseUrl}/warehouse/routes`).then(r => r.ok ? r.json() : null),
          fetch(`${baseUrl}/warehouse/order`).then(r => r.ok ? r.json() : null),
          fetch(`${baseUrl}/warehouse/movements`).then(r => r.ok ? r.json() : null),
          fetch(`${baseUrl}/warehouse/scanner-response`).then(r => r.ok ? r.json() : null),
          fetch(`${baseUrl}/warehouse/suppliers`).then(r => r.ok ? r.json() : null),
          fetch(`${baseUrl}/warehouse/products`).then(r => r.ok ? r.json() : null),
          fetch(`${baseUrl}/warehouse/ai-recommendations`).then(r => r.ok ? r.json() : null),
          fetch(`${baseUrl}/warehouse/inbound-shipments`).then(r => r.ok ? r.json() : null)
        ]);

        // Map layout & utilization to zones and bins
        if (layoutRes) {
          const utilMap = {};
          if (utilRes) {
            utilRes.forEach(u => {
              utilMap[u.zone] = u.utilizationPercent;
            });
          }

          // Enforce exactly 4 zones: Zone A, Zone B, Zone C, and Zone D by default
          const requiredZones = [
            {
              id: "ZONE-Z1",
              name: "Zone A",
              type: "Fast Moving Storage",
              warehouse: layoutRes.name || "Central Fulfillment A",
              x: 10,
              y: 5,
              z: 0,
              width: 20,
              height: 10,
              depth: 15,
              capacityPercent: utilMap["Z1"] || 65,
              status: "Active"
            },
            {
              id: "ZONE-Z2",
              name: "Zone B",
              type: "Electronics Storage",
              warehouse: layoutRes.name || "Central Fulfillment A",
              x: 35,
              y: 5,
              z: 0,
              width: 20,
              height: 10,
              depth: 15,
              capacityPercent: utilMap["Z2"] || 72,
              status: "Active"
            },
            {
              id: "ZONE-Z3",
              name: "Zone C",
              type: "Bulk Storage",
              warehouse: layoutRes.name || "Central Fulfillment A",
              x: 60,
              y: 5,
              z: 0,
              width: 20,
              height: 10,
              depth: 15,
              capacityPercent: utilMap["Z3"] || 88,
              status: "Active"
            },
            {
              id: "ZONE-Z4",
              name: "Zone D",
              type: "Cold Storage",
              warehouse: layoutRes.name || "Central Fulfillment A",
              x: 85,
              y: 5,
              z: 0,
              width: 20,
              height: 10,
              depth: 15,
              capacityPercent: utilMap["Z4"] || 40,
              status: "Active"
            }
          ];

          setZones(requiredZones);

          // Dynamically synchronize the warehouse name, location, and area from the API to match the filtered zones list
          if (layoutRes.name) {
            setWarehouses(prev => prev.map(w => w.id === "WH-001" ? {
              ...w,
              name: layoutRes.name,
              location: layoutRes.location || w.location,
              area: layoutRes.area || w.area
            } : w));
          }

          // Bins parsing
          const mappedBins = [];
          (layoutRes.zones || []).forEach((z, zIdx) => {
            const zId = z.zoneId;
            // Only map bins for Z1, Z2, Z3, Z4 (enforce 4 active zones limit)
            if (zId !== 'Z1' && zId !== 'Z2' && zId !== 'Z3' && zId !== 'Z4') return;

            let zoneName = `Zone ${zId}`;
            if (zId === 'Z1') zoneName = "Zone A";
            else if (zId === 'Z2') zoneName = "Zone B";
            else if (zId === 'Z3') zoneName = "Zone C";
            else if (zId === 'Z4') zoneName = "Zone D";

            (z.racks || []).forEach((rack, rackIdx) => {
              (rack.levels || []).forEach((level, levelIdx) => {
                (level.bins || []).forEach((b, binIdx) => {
                  mappedBins.push({
                    code: b.binId,
                    zone: zoneName,
                    shelf: `S-0${levelIdx + 1}`,
                    maxCapacity: b.maxLoadKg || 250,
                    currentCapacity: b.occupied ? Math.floor((b.maxLoadKg || 250) * 0.6) : 0,
                    status: "Active",
                    x: 10 + rackIdx * 6 + binIdx * 2,
                    y: 5 + levelIdx * 2,
                    z: 1 + binIdx
                  });
                });
              });
            });
          });

          if (mappedBins.length > 0) {
            setBins(mappedBins);
          }
        }

        // Helper to distribute date timestamps cleanly across Jan 2026 to Jun 2026
        const getDateForIdx = (idx) => {
          const dates = [
            "2026-01-12T09:15:00Z", "2026-01-26T14:40:00Z",
            "2026-02-08T10:20:00Z", "2026-02-22T16:15:00Z",
            "2026-03-05T08:45:00Z", "2026-03-19T13:30:00Z",
            "2026-04-03T11:10:00Z", "2026-04-17T15:50:00Z",
            "2026-05-02T07:30:00Z", "2026-05-15T12:00:00Z",
            "2026-05-28T16:30:00Z", "2026-06-04T10:45:00Z",
            "2026-06-18T14:00:00Z"
          ];
          return dates[idx % dates.length];
        };

        // Map products catalog with enterprise datasets expansion & proper 6-month dates (22 items)
        let mappedProducts = [];
        if (productsRes) {
          mappedProducts = productsRes.map((p, idx) => {
            const date = getDateForIdx(idx);
            return {
              sku: p.sku || `SKU-100${idx + 1}`,
              productId: p.productId || `PRD-000${idx + 1}`,
              name: p.name,
              category: p.category || "Electronics",
              weight: `${p.weightKg || 2.0} kg`,
              dimensions: p.dimensions || "25x25x25 cm",
              reorderLevel: p.reorderPoint || 10,
              unitOfMeasure: p.unitOfMeasure || "BOX",
              quantity: 45 + idx,
              bin: `BIN-00${(idx % 4) + 1}`,
              createdAt: date,
              updatedAt: new Date(new Date(date).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
            };
          });
        }

        const categoriesList = ["Electronics", "Accessories", "Industrial Tools", "Safety Equipment", "Packaging Supplies"];
        const namesList = [
          "Lenovo ThinkPad", "Dell XPS 15", "Apple MacBook Air", "Logitech MX Master", 
          "Mechanical Keyboard", "USB-C Hub Multiport", "Pro Heavy Drill", "Handheld Circular Saw", 
          "Safety Helmet Premium", "High-Visibility Vest", "Bubble Wrap Heavy-Duty", "Heavy Duty Cardboard Box"
        ];
        
        while (mappedProducts.length < 22) {
          const idx = mappedProducts.length;
          const name = namesList[idx % namesList.length];
          const cat = categoriesList[idx % categoriesList.length];
          const prdNum = idx + 1;
          const skuCode = `SKU-10${10 + prdNum}`;
          const date = getDateForIdx(idx);
          mappedProducts.push({
            productId: `PRD-000${prdNum}`,
            sku: skuCode,
            name,
            category: cat,
            weight: `${(1.2 + idx * 0.4).toFixed(1)} kg`,
            dimensions: `${15 + idx}x${10 + idx}x${2 + idx} cm`,
            reorderLevel: 10 + (idx % 3) * 5,
            unitOfMeasure: idx % 4 === 0 ? "PALLET" : "BOX",
            quantity: 15 + (idx * 8) % 60,
            bin: `BIN-00${(idx % 4) + 1}`,
            createdAt: date,
            updatedAt: new Date(new Date(date).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
        setProducts(mappedProducts);

        // Map inventory with 6-month historical timestamps (25 items)
        if (invRes) {
          const mappedInventory = invRes.map((item, idx) => {
            const sku = item.productId;
            
            // Cross-reference with our mapped products to retrieve beautiful spec labels
            const matchedProd = mappedProducts.find(p => p.sku === sku || p.productId === sku);
            const name = matchedProd ? matchedProd.name : `Product ${sku}`;
            const category = matchedProd ? matchedProd.category : "Industrial Tools";
            const weight = matchedProd ? matchedProd.weight : "2.0 kg";
            const dimensions = matchedProd ? matchedProd.dimensions : "25 x 25 x 25 cm";

            const binId = item.binId;
            let zoneName = "Zone A";
            if (binId) {
              if (binId.startsWith('Z2')) zoneName = "Zone B";
              else if (binId.startsWith('Z3')) zoneName = "Zone C";
              else if (binId.startsWith('Z4')) zoneName = "Zone D";
              else if (binId.startsWith('Z5')) zoneName = "Zone E";
            }

            const pDate = matchedProd ? matchedProd.createdAt : getDateForIdx(idx);

            return {
              sku: matchedProd ? matchedProd.sku : sku,
              name,
              category,
              quantity: item.quantity || 0,
              reserved: item.reservedQuantity || 0,
              damaged: 0,
              availableQuantity: item.availableQuantity || 0,
              reorderLevel: matchedProd ? matchedProd.reorderLevel : 10,
              status: item.status === "AVAILABLE" ? "In Stock" : item.status || "In Stock",
              warehouse: "Central Fulfillment A",
              zone: zoneName,
              rack: binId ? `RACK-${binId.split('-')[1] || '001'}` : "RACK-001",
              shelf: binId ? binId.split('-')[2] || "S-01" : "S-01",
              bin: binId || "BIN-001",
              weight,
              dimensions,
              createdAt: pDate,
              lastUpdated: new Date(pDate).toLocaleDateString()
            };
          });

          // Sync any missing mapped products to make sure inventory catalog matches
          mappedProducts.forEach((prod, idx) => {
            if (!mappedInventory.some(item => item.sku === prod.sku)) {
              mappedInventory.push({
                sku: prod.sku,
                name: prod.name,
                category: prod.category,
                quantity: prod.quantity,
                reserved: 0,
                damaged: 0,
                availableQuantity: prod.quantity,
                reorderLevel: prod.reorderLevel,
                status: "In Stock",
                warehouse: "Central Fulfillment A",
                zone: "Zone A",
                rack: "RACK-001",
                shelf: "S-01",
                bin: prod.bin,
                weight: prod.weight,
                dimensions: prod.dimensions,
                createdAt: prod.createdAt,
                lastUpdated: new Date(prod.updatedAt).toLocaleDateString()
              });
            }
          });

          setInventory(mappedInventory);
        }

        // Map workers
        if (workersRes) {
          const mappedWorkers = workersRes.map(w => {
            let role = "STAFF";
            if (w.role.toUpperCase() === 'SUPERVISOR') role = "MANAGER";
            else if (w.role.toUpperCase() === 'CLERK') role = "INVENTORY_CLERK";

            return {
              id: w.workerId,
              name: w.name,
              email: `${w.workerId.toLowerCase()}@warehouseai.com`,
              role,
              warehouse: "Central Fulfillment A",
              status: "Active",
              lastLogin: "Just now",
              createdAt: "2026-01-10",
              efficiency: `${w.efficiencyScore || 90}%`,
              zone: w.zoneAssigned ? `Zone ${w.zoneAssigned === 'Z1' ? 'A' : w.zoneAssigned === 'Z2' ? 'B' : w.zoneAssigned === 'Z3' ? 'C' : w.zoneAssigned === 'Z4' ? 'D' : 'E'}` : "Zone A"
            };
          });
          setWorkers(mappedWorkers);
        }

        // Map routes
        if (routesRes) {
          const mappedRoutes = routesRes.map(r => ({
            id: r.routeId,
            from: r.stops && r.stops[0] ? r.stops[0] : "Receiving Dock",
            to: r.stops && r.stops.length > 0 ? r.stops[r.stops.length - 1] : "BIN-001",
            distance: `${r.distanceMeters || 100}m`,
            time: `${Math.round((r.estimatedTimeSec || 300) / 60)} mins`,
            operator: r.workerId || "Unassigned",
            status: "Active"
          }));
          setRoutes(mappedRoutes);
        }

        // Map orders with proper 6-month dates (24 items)
        let mappedOrders = [];
        if (ordersRes) {
          mappedOrders = ordersRes.map((o, idx) => {
            const date = getDateForIdx(idx);
            const status = o.status === "CREATED" ? "Pending" : o.status === "PICKING" ? "In Progress" : o.status === "PACKED" ? "Packed" : "Dispatched";
            return {
              id: o.orderId,
              customer: o.customerName,
              dispatchTime: "Today, 20:00",
              productCount: o.quantity || 1,
              status,
              progress: o.status === "CREATED" ? 10 : o.status === "PICKING" ? 40 : o.status === "PACKED" ? 80 : 100,
              orderDate: date.split('T')[0],
              createdAt: date,
              completedAt: status === "Dispatched" ? new Date(new Date(date).getTime() + 6 * 60 * 60 * 1000).toISOString() : null
            };
          });
        }

        const customerList = ["Alpha Logistics", "Beta Corp", "Delta Distribution", "Omega Retail", "Prime Supply", "Global Traders", "Zenith Inc", "Apex Partners"];
        while (mappedOrders.length < 24) {
          const idx = mappedOrders.length;
          const date = getDateForIdx(idx);
          const prdNum = idx + 1;
          const status = idx % 4 === 0 ? "Pending" : idx % 4 === 1 ? "In Progress" : idx % 4 === 2 ? "Packed" : "Dispatched";
          mappedOrders.push({
            id: `ORD-00${prdNum}`,
            customer: customerList[idx % customerList.length],
            dispatchTime: idx % 2 === 0 ? "Today, 18:00" : "Tomorrow, 10:00",
            productCount: 2 + (idx % 5),
            status,
            progress: status === "Pending" ? 10 : status === "In Progress" ? 40 : status === "Packed" ? 80 : 100,
            orderDate: date.split('T')[0],
            createdAt: date,
            completedAt: status === "Dispatched" ? new Date(new Date(date).getTime() + 5 * 60 * 60 * 1000).toISOString() : null
          });
        }
        setOrders(mappedOrders);

        // Map movements with proper 6-month dates (26 items)
        let mappedMovements = [];
        if (movementsRes) {
          mappedMovements = movementsRes.slice(0, 50).map((m, idx) => {
            const date = getDateForIdx(idx);
            return {
              id: m.movementId,
              item: `Product ${m.productId}`,
              sku: m.productId,
              from: m.fromBin,
              to: m.toBin,
              user: m.workerId || "Warehouse Staff",
              time: new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: m.type || "Putaway",
              status: "Completed",
              qty: m.quantity || 1,
              movementDate: date.split('T')[0],
              timestamp: date
            };
          });
        }

        while (mappedMovements.length < 26) {
          const idx = mappedMovements.length;
          const date = getDateForIdx(idx);
          const prdNum = idx + 1;
          mappedMovements.push({
            id: `MOV-00${prdNum}`,
            item: idx % 2 === 0 ? "Lenovo ThinkPad" : "Mechanical Keyboard",
            sku: idx % 2 === 0 ? "SKU-1011" : "SKU-1015",
            from: `BIN-00${(idx % 4) + 1}`,
            to: `BIN-00${((idx + 2) % 4) + 1}`,
            user: "Warehouse Staff",
            time: new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: idx % 3 === 0 ? "Putaway" : idx % 3 === 1 ? "Relocation" : "Replenish",
            status: "Completed",
            qty: 5 + (idx % 10),
            movementDate: date.split('T')[0],
            timestamp: date
          });
        }
        setMovements(mappedMovements);

        // Map scans
        if (scansRes) {
          const mappedScans = scansRes.slice(0, 20).map(s => {
            const sku = `PRD-${s.barcode ? s.barcode.substring(s.barcode.length - 3) : '001'}`;
            return {
              id: s.scanId,
              sku,
              name: `Product ${sku}`,
              category: "Electronics",
              time: s.timestamp ? new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
              operator: s.workerId || "Warehouse Staff",
              suggested: s.binId || "BIN-001",
              status: s.scanType || "Scanned"
            };
          });
          setRecentScans(mappedScans);
        }

        // Map AI recommendations with proper 6-month dates (20 items)
        let mappedRecs = [];
        if (recsRes) {
          mappedRecs = recsRes.map((r, idx) => {
            const date = getDateForIdx(idx);
            return {
              id: r.recommendationId || `REC-00${idx + 1}`,
              title: r.title,
              confidence: r.confidencePercent || 92,
              reason: r.reason,
              impact: r.estimatedSavings || "10% efficiency increase",
              priority: r.priority === "HIGH" ? "High" : r.priority === "MEDIUM" ? "Medium" : "Low",
              status: r.status === "ACTIVE" ? "Active" : "Active",
              createdAt: date,
              updatedAt: new Date(new Date(date).getTime() + 12 * 60 * 60 * 1000).toISOString()
            };
          });
        }

        const recTitles = [
          "Dynamic Slotting Rebalancing", "Fast-Moving Electronics Reallocation",
          "Bulk Storage Rack Density Optimization", "Safety Aisle Clearance & Re-routing",
          "Reorder Level Threshold Adjustments", "Cold Zone Aisle Expansion",
          "AGV Cross-Docking Coordination", "Peak Hour Outbound Pre-Packing",
          "Hazardous Materials Isolation", "Gravity Flow Rack Utilization",
          "Supplier Lead Time Buffer Optimization", "Shelf-Level Consolidation Planning"
        ];
        const rationales = [
          "Transfer underutilized packaging items to higher shelving to prioritize fast-moving electronic accessories on ground zones.",
          "High-turnover laptop SKUs are experiencing elevated dwell times. Relocating them closest to picking docks will reduce transit time by 15%.",
          "Optimize bulk industrial items' layout by height-balancing bins. Heavy boxes should reside on racks 1-3 to alleviate forklift strain.",
          "Route telemetry suggests foot bottlenecks in Zone A. Re-routing low-priority putaways preserves clear access lanes.",
          "Stock levels for popular adapters are depleting faster than replenish runs. Increase standard buffers to secure stock consistency.",
          "Cold storage placement suggestions: consolidate organic/perishable stocks to Zone C-02 to prevent temperature leaks.",
          "Sync raw inbound shipments direct to the packaging dock slots to bypass intermediate shelf storage entirely.",
          "Analyze orders pipeline to pre-assemble components during low-traffic afternoon periods.",
          "Flammable supplies detected in mixed-use containers. Recommend immediate transfer to designated safety cages in Zone E.",
          "Optimize gravity-fed flow racks with low-friction roller tracks to expedite small picking orders.",
          "Current supply delays from Dell require increasing lead-time adjustments from 3 days to 5 days.",
          "Consolidate fragmented partial pallets in Bin S-02 and Bin S-03 to recover 2 unused bays."
        ];
        const impactsList = [
          "Saves 18 mins per picker loop", "15% quicker shipping turnarounds",
          "Secures 22% more space capacity", "Reduces pathway delays by 9%",
          "Reduces out-of-stock events by 35%", "Decreases cooling leaks by 5%",
          "Cuts handling time by 10 mins", "Improves peak-hour throughput by 14%",
          "Secures OSHA compliance standard", "Speeds up small pickings by 20%",
          "Prevents bottleneck delays", "Recovers 2 complete bulk storage bays"
        ];

        while (mappedRecs.length < 20) {
          const idx = mappedRecs.length;
          const prdNum = idx + 1;
          const date = getDateForIdx(idx);
          mappedRecs.push({
            id: `REC-00${prdNum}`,
            title: recTitles[idx % recTitles.length],
            confidence: 88 + (idx * 3) % 11,
            reason: rationales[idx % rationales.length],
            impact: impactsList[idx % impactsList.length],
            priority: idx % 3 === 0 ? "High" : idx % 3 === 1 ? "Medium" : "Low",
            status: "Active",
            createdAt: date,
            updatedAt: new Date(new Date(date).getTime() + 12 * 60 * 60 * 1000).toISOString()
          });
        }
        setAiRecommendations(mappedRecs);

        // Map inbound tasks with proper 6-month dates (22 items)
        let mappedInbounds = [];
        if (inboundsRes) {
          mappedInbounds = inboundsRes.map((i, idx) => {
            const date = getDateForIdx(idx);
            const status = i.status === "PENDING" ? "Pending" : i.status === "IN_TRANSIT" ? "In Transit" : "Completed";
            return {
              id: i.shipmentId || `INB-000${idx + 1}`,
              supplier: i.supplierName || "Global Sourcing",
              supplierId: i.supplierId || `SUP-00${idx + 1}`,
              expectedArrival: new Date(date).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
              product: i.sku === "SKU-1001" ? "Dell Laptop" : i.sku === "SKU-1002" ? "HP EliteBook" : `Product ${i.sku}`,
              sku: i.sku || `PRD-00${idx + 1}`,
              quantity: i.quantity || 40,
              priority: i.priority === "HIGH" ? "High" : i.priority === "MEDIUM" ? "Medium" : "Low",
              status,
              assignedStaff: "Unassigned",
              createdAt: new Date(new Date(date).getTime() - 24 * 60 * 60 * 1000).toISOString(),
              completedAt: status === "Completed" ? date : null
            };
          });
        }

        const suppliersList = [
          "Dell Logistics", "HP Supply Chain", "Logitech Sourcing", "Industrial Tools Corp", 
          "Safety First Gear", "Packaging World Co", "Global Tech Imports", "Summit Parts Supplier"
        ];
        const skusList = ["SKU-1001", "SKU-1002", "SKU-1011", "SKU-1012", "SKU-1013", "SKU-1014", "SKU-1015"];
        const productsList = [
          "Dell Laptop", "HP EliteBook", "Lenovo ThinkPad", "Apple MacBook Air", 
          "Logitech MX Master", "Mechanical Keyboard", "Pro Heavy Drill", "Handheld Circular Saw"
        ];

        while (mappedInbounds.length < 22) {
          const idx = mappedInbounds.length;
          const prdNum = idx + 1;
          const sup = suppliersList[idx % suppliersList.length];
          const skuCode = skusList[idx % skusList.length];
          const prodName = productsList[idx % productsList.length];
          const date = getDateForIdx(idx);
          const status = idx % 4 === 0 ? "Pending" : idx % 4 === 1 ? "In Transit" : "Completed";
          mappedInbounds.push({
            id: `INB-000${prdNum}`,
            supplier: sup,
            supplierId: `SUP-00${idx + 1}`,
            expectedArrival: new Date(date).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
            product: prodName,
            sku: skuCode,
            quantity: 20 + (idx * 15) % 150,
            priority: idx % 3 === 0 ? "High" : idx % 3 === 1 ? "Medium" : "Low",
            status,
            assignedStaff: idx % 2 === 0 ? "System Admin" : "Unassigned",
            createdAt: new Date(new Date(date).getTime() - 24 * 60 * 60 * 1000).toISOString(),
            completedAt: status === "Completed" ? date : null
          });
        }
        setInboundTasks(mappedInbounds);

      } catch (err) {
        console.error("Error fetching WireMock APIs", err);
        setError("Failed to synchronize layout and real-time inventory from central cloud API.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);


  const [aiRecommendations, setAiRecommendations] = useState([
    {
      id: "REC-001",
      title: "Slotting Optimization in Zone B",
      priority: "High",
      confidence: 96,
      reason: "Move fast-moving electronics to lower shelves.",
      impact: "Saves 12 mins per pick cycle.",
      status: "Active",
    },
  ]);

  const [auditLogs, setAuditLogs] = useState([
    {
      id: "LOG-001",
      timestamp: new Date().toISOString(),
      user: "system",
      role: "SYSTEM",
      action: "INIT",
      module: "System",
      details: "WarehouseAI initialized.",
      status: "Success",
    },
  ]);

  const [kpis, setKpis] = useState({
    scannedToday: 3,
    pendingPutaway: 2,
    activeInbound: 2,
    assignedMovements: 1,
    completedToday: 2,
    aiAccepted: 2,
    avgPutawayTime: "7.8 mins",
    operationalStatus: "green",
  });

  const logAudit = (userEmail, role, action, module, details) => {
    setAuditLogs((prev) => [
      {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: userEmail,
        role,
        action,
        module,
        details,
        status: "Success",
      },
      ...prev,
    ]);
  };

  const updateInventoryItem = (sku, updater) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.sku !== sku) return item;

        const updated = updater(item);

        const availableQuantity = Math.max(
          0,
          updated.quantity - (updated.reserved || 0) - (updated.damaged || 0)
        );

        let status = "In Stock";

        if (availableQuantity === 0) {
          status = "Out of Stock";
        } else if (availableQuantity <= updated.reorderLevel) {
          status = "Low Stock";
        } else if ((updated.damaged || 0) > 0) {
          status = "Damaged";
        }

        return {
          ...updated,
          availableQuantity,
          status,
          lastUpdated: "Just now",
        };
      })
    );
  };

  const addWarehouse = (wh) => {
    const newWarehouse = {
      id: `WH-${Date.now()}`,
      name: wh.name,
      location: wh.location,
      status: "operational",
      totalZones: wh.totalZones || 0,
      capacity: wh.capacity || 0,
      activeStaff: wh.activeStaff || 0,
      area: wh.area || "10,000 sq ft",
    };

    setWarehouses((prev) => [...prev, newWarehouse]);
    logAudit("manager@warehouseai.com", "MANAGER", "ADD_WAREHOUSE", "Warehouse", `Added warehouse ${wh.name}.`);
  };

  const addZone = (zone) => {
    // Generate Zone name and Zone ID automatically if not provided or to ensure sequence
    const nextZoneName = generateNextId('Zone ', zones.map(z => z.name));
    const nextZoneId = generateNextId('ZONE-', zones.map(z => z.id));
    const newZone = {
      id: zone.id || nextZoneId,
      name: zone.name || nextZoneName,
      type: zone.type,
      warehouse: zone.warehouse || "Central Fulfillment A",
      x: Number(zone.x) || 0,
      y: Number(zone.y) || 0,
      z: Number(zone.z) || 0,
      width: Number(zone.width) || 10,
      height: Number(zone.height) || 8,
      depth: Number(zone.depth) || 10,
      capacityPercent: Number(zone.capacityPercent) || 0,
      status: zone.status || "Active",
    };

    setZones((prev) => [...prev, newZone]);
    logAudit("manager@warehouseai.com", "MANAGER", "ADD_ZONE", "Zones & Bins", `Created zone ${newZone.name}.`);
  };

  const editZone = (updatedZone) => {
    setZones((prev) =>
      prev.map((zone) =>
        zone.id === updatedZone.id ? { ...zone, ...updatedZone } : zone
      )
    );

    logAudit("manager@warehouseai.com", "MANAGER", "EDIT_ZONE", "Zones & Bins", `Updated zone ${updatedZone.name}.`);
  };

  const deleteZone = (zoneId) => {
    setZones((prev) => prev.filter((zone) => zone.id !== zoneId));
    logAudit("manager@warehouseai.com", "MANAGER", "DELETE_ZONE", "Zones & Bins", `Deleted zone ${zoneId}.`);
  };

  const addBin = (bin) => {
    const nextBinCode = generateNextId('BIN-', bins.map(b => b.code));
    const newBin = {
      code: bin.code || nextBinCode,
      zone: bin.zone,
      shelf: bin.shelf,
      maxCapacity: Number(bin.maxCapacity) || 100,
      currentCapacity: 0,
      status: bin.status || "Active",
      x: Number(bin.x) || 0,
      y: Number(bin.y) || 0,
      z: Number(bin.z) || 0,
    };

    setBins((prev) => [...prev, newBin]);
    logAudit("manager@warehouseai.com", "MANAGER", "ADD_BIN", "Zones & Bins", `Created bin ${newBin.code}.`);
  };

  const editBin = (updatedBin) => {
    setBins((prev) =>
      prev.map((bin) =>
        bin.code === updatedBin.code ? { ...bin, ...updatedBin } : bin
      )
    );

    logAudit("manager@warehouseai.com", "MANAGER", "EDIT_BIN", "Zones & Bins", `Updated bin ${updatedBin.code}.`);
  };

  const deleteBin = (binCode) => {
    setBins((prev) => prev.filter((bin) => bin.code !== binCode));
    logAudit("manager@warehouseai.com", "MANAGER", "DELETE_BIN", "Zones & Bins", `Deleted bin ${binCode}.`);
  };

  const adjustStock = (sku, qtyDelta, user, reason = "Manual stock adjustment") => {
    const item = inventory.find((inv) => inv.sku === sku);
    if (!item) return false;

    const previousQuantity = item.quantity;
    const newQuantity = Math.max(0, previousQuantity + Number(qtyDelta));

    updateInventoryItem(sku, (old) => ({
      ...old,
      quantity: newQuantity,
    }));

    const nextAdjId = generateNextId('ADJ-', stockAdjustments.map(a => a.id));
    const nextMovId = generateNextId('MOV-', movements.map(m => m.id));

    setStockAdjustments((prev) => [
      {
        id: nextAdjId,
        sku,
        product: item.name,
        previousQuantity,
        newQuantity,
        adjustmentType: qtyDelta > 0 ? "Increase Stock" : "Decrease Stock",
        reason,
        clerk: user.email,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);

    setMovements((prev) => [
      {
        id: nextMovId,
        item: item.name,
        sku,
        from: "Inventory",
        to: "Inventory",
        user: user.email,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "CYCLE_COUNT_ADJUSTMENT",
        status: "Completed",
        qty: qtyDelta,
      },
      ...prev,
    ]);

    logAudit(user.email, user.role, "ADJUST_STOCK", "Inventory", `Adjusted ${sku} by ${qtyDelta}. Reason: ${reason}`);
    return true;
  };

  const reserveStock = (sku, qty, user) => {
    const item = inventory.find((inv) => inv.sku === sku);
    if (!item) return false;

    const available = item.quantity - (item.reserved || 0) - (item.damaged || 0);

    if (Number(qty) > available) return false;

    updateInventoryItem(sku, (old) => ({
      ...old,
      reserved: (old.reserved || 0) + Number(qty),
    }));

    const nextResId = generateNextId('RES-', reservations.map(r => r.id));
    const nextMovId = generateNextId('MOV-', movements.map(m => m.id));

    const reservation = {
      id: nextResId,
      sku,
      product: item.name,
      qty: Number(qty),
      user: user.email,
      timestamp: new Date().toISOString(),
      status: "Active",
    };

    setReservations((prev) => [reservation, ...prev]);

    setMovements((prev) => [
      {
        id: nextMovId,
        item: item.name,
        sku,
        from: "Inventory",
        to: "Reservation",
        user: user.email,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "RESERVATION_CREATED",
        status: "Completed",
        qty,
      },
      ...prev,
    ]);

    logAudit(user.email, user.role, "RESERVE_STOCK", "Inventory", `Reserved ${qty} units of ${sku}.`);
    return true;
  };

  const releaseReservation = (reservationId, user) => {
    const reservation = reservations.find((res) => res.id === reservationId);
    if (!reservation) return false;

    const { sku, qty } = reservation;

    const item = inventory.find((inv) => inv.sku === sku);

    updateInventoryItem(sku, (old) => ({
      ...old,
      reserved: Math.max(0, (old.reserved || 0) - Number(qty)),
    }));

    setReservations((prev) => prev.filter((res) => res.id !== reservationId));

    const nextMovId = generateNextId('MOV-', movements.map(m => m.id));

    setMovements((prev) => [
      {
        id: nextMovId,
        item: item ? item.name : "Unknown",
        sku,
        from: "Reservation",
        to: "Inventory",
        user: user.email,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "RESERVATION_RELEASE",
        status: "Completed",
        qty,
      },
      ...prev,
    ]);

    logAudit(user.email, user.role, "RELEASE_RESERVATION", "Inventory", `Released reservation ${reservationId}.`);
    return true;
  };

  const reportDamage = (sku, quantity, reason, bin, notes, user) => {
    const item = inventory.find((inv) => inv.sku === sku);
    if (!item) return false;

    const available = item.quantity - (item.reserved || 0) - (item.damaged || 0);

    if (Number(quantity) > available) return false;

    updateInventoryItem(sku, (old) => ({
      ...old,
      damaged: (old.damaged || 0) + Number(quantity),
    }));

    const nextDmgId = generateNextId('DMG-', damagedRecords.map(d => d.id));
    const nextMovId = generateNextId('MOV-', movements.map(m => m.id));

    setDamagedRecords((prev) => [
      {
        id: nextDmgId,
        sku,
        product: item.name,
        quantity: Number(quantity),
        reason,
        bin,
        notes,
        reportedBy: user.email,
        reportedDate: new Date().toISOString(),
        status: "Reported",
      },
      ...prev,
    ]);

    setMovements((prev) => [
      {
        id: nextMovId,
        item: item.name,
        sku,
        from: bin || item.bin,
        to: "Damaged Stock",
        user: user.email,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "DAMAGE_ADJUSTMENT",
        status: "Completed",
        qty: quantity,
      },
      ...prev,
    ]);

    logAudit(user.email, user.role, "REPORT_DAMAGE", "Inventory", `Reported ${quantity} damaged units for ${sku}.`);
    return true;
  };

  const markDamaged = reportDamage;

  const updateDamageStatus = (id, newStatus, user) => {
    setDamagedRecords((prev) =>
      prev.map((record) =>
        record.id === id ? { ...record, status: newStatus } : record
      )
    );

    logAudit(user.email, user.role, "UPDATE_DAMAGE_STATUS", "Damaged Stock", `Updated damage record ${id} to ${newStatus}.`);
  };

  const addRecentScan = (scan) => {
    const nextScanId = generateNextId('SCN-', recentScans.map(s => s.id));
    setRecentScans((prev) => [
      {
        id: nextScanId,
        sku: scan.sku,
        name: scan.name,
        category: scan.category,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        operator: scan.operator || "Warehouse Staff",
        suggested: scan.suggested || scan.bin || "Pending",
        status: scan.status || "Scanned",
      },
      ...prev,
    ]);

    setKpis((prev) => ({
      ...prev,
      scannedToday: prev.scannedToday + 1,
    }));
  };

  const acceptRecommendation = (recommendation, productData, user) => {
    const nextPtwId = generateNextId('PTW-', putawayTasks.map(t => t.id));
    const newTask = {
      id: nextPtwId,
      product: productData.name,
      sku: productData.sku,
      quantity: productData.quantity,
      zone: recommendation.zone,
      aisle: recommendation.aisle,
      rack: recommendation.rack,
      shelf: recommendation.shelf,
      bin: recommendation.bin,
      priority: "High",
      estTime: recommendation.estTime || "8 mins",
      distance: recommendation.distance || "65m",
      status: "Pending",
    };

    setPutawayTasks((prev) => [newTask, ...prev]);

    addRecentScan({
      ...productData,
      suggested: recommendation.bin,
      status: "AI Suggested",
    });

    const nextMovId = generateNextId('MOV-', movements.map(m => m.id));

    setMovements((prev) => [
      {
        id: nextMovId,
        item: productData.name,
        sku: productData.sku,
        from: "INBOUND-ZONE",
        to: recommendation.bin,
        user: user.email,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "Putaway",
        status: "Assigned",
        qty: productData.quantity,
      },
      ...prev,
    ]);

    setKpis((prev) => ({
      ...prev,
      pendingPutaway: prev.pendingPutaway + 1,
      aiAccepted: prev.aiAccepted + 1,
      assignedMovements: prev.assignedMovements + 1,
    }));

    logAudit(user.email, user.role, "ACCEPT_AI_REC", "Scanner", `Accepted AI recommendation for ${productData.sku}.`);
  };

  const startInboundTask = (taskId) => {
    setInboundTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "In Progress",
              assignedStaff: "Warehouse Staff",
            }
          : task
      )
    );

    logAudit("staff@warehouseai.com", "STAFF", "START_RECEIVING", "Inbound", `Started inbound shipment ${taskId}.`);
  };

  const completeInboundTask = (taskId, user) => {
    setInboundTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: "Completed" } : task
      )
    );

    setKpis((prev) => ({
      ...prev,
      completedToday: prev.completedToday + 1,
    }));

    logAudit(user.email, user.role, "COMPLETE_RECEIVING", "Inbound", `Completed inbound shipment ${taskId}.`);
  };

  const startPutawayTask = (taskId) => {
    setPutawayTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: "IN_PROGRESS", startedAt: new Date().toISOString() } : task
      )
    );

    const task = putawayTasks.find(t => t.id === taskId);
    if (task) {
      if (task.inboundId) {
        setInboundReceipts(prev => prev.map(rec => rec.id === task.inboundId ? { ...rec, status: 'IN_PROGRESS' } : rec));
      }
      
      const nextMovId = generateNextId('MOV-', movements.map(m => m.id));
      setMovements(prev => [
        {
          id: nextMovId,
          taskId: taskId,
          item: task.product,
          sku: task.sku,
          from: task.pickupLocation || "Receiving Dock",
          to: task.destinationBin || task.bin || "BIN-002",
          user: task.assignedStaffName || "Warehouse Staff",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "PUTAWAY_STARTED",
          status: "In Progress",
          qty: task.quantity,
          timestamp: new Date().toISOString()
        },
        ...prev
      ]);
    }

    logAudit("staff@warehouseai.com", "STAFF", "START_PUTAWAY", "Putaway", `Started putaway task ${taskId}.`);
  };

  const confirmPickedFromReceiving = (taskId) => {
    setPutawayTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: "PICKED_FROM_RECEIVING" } : task
      )
    );

    const task = putawayTasks.find(t => t.id === taskId);
    if (task) {
      const nextMovId = generateNextId('MOV-', movements.map(m => m.id));
      setMovements(prev => [
        {
          id: nextMovId,
          taskId: taskId,
          item: task.product,
          sku: task.sku,
          from: task.pickupLocation || "Receiving Dock",
          to: task.destinationBin || task.bin || "BIN-002",
          user: task.assignedStaffName || "Warehouse Staff",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "PICKED_FROM_RECEIVING",
          status: "Picked",
          qty: task.quantity,
          timestamp: new Date().toISOString()
        },
        ...prev
      ]);
    }
  };

  const confirmReachedBin = (taskId) => {
    setPutawayTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: "REACHED_BIN" } : task
      )
    );

    const task = putawayTasks.find(t => t.id === taskId);
    if (task) {
      const nextMovId = generateNextId('MOV-', movements.map(m => m.id));
      setMovements(prev => [
        {
          id: nextMovId,
          taskId: taskId,
          item: task.product,
          sku: task.sku,
          from: task.pickupLocation || "Receiving Dock",
          to: task.destinationBin || task.bin || "BIN-002",
          user: task.assignedStaffName || "Warehouse Staff",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "REACHED_BIN",
          status: "Reached Bin",
          qty: task.quantity,
          timestamp: new Date().toISOString()
        },
        ...prev
      ]);
    }
  };

  const reportPutawayIssue = (taskId, issueType, description, user) => {
    setPutawayTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { 
          ...task, 
          status: "DELAYED", 
          issue: {
            issueType,
            description,
            reportedBy: user?.email || "staff@warehouseai.com",
            reportedAt: new Date().toISOString(),
            status: "Reported"
          } 
        } : task
      )
    );

    const task = putawayTasks.find(t => t.id === taskId);
    if (task) {
      const nextMovId = generateNextId('MOV-', movements.map(m => m.id));
      setMovements(prev => [
        {
          id: nextMovId,
          taskId: taskId,
          item: task.product,
          sku: task.sku,
          from: task.pickupLocation || "Receiving Dock",
          to: task.destinationBin || task.bin || "BIN-002",
          user: user?.name || user?.email || "Warehouse Staff",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "ISSUE_REPORTED",
          status: "Delayed",
          qty: task.quantity,
          timestamp: new Date().toISOString(),
          reason: `${issueType}: ${description}`
        },
        ...prev
      ]);
      logAudit(user?.email || "staff@warehouseai.com", "STAFF", "REPORT_ISSUE", "Putaway", `Reported issue on task ${taskId}: ${issueType}`);
    }
  };

  const completePutawayTask = (taskId, user) => {
    const task = putawayTasks.find((putaway) => putaway.id === taskId);

    if (!task) return false;

    // 1. Mark task status as COMPLETED
    setPutawayTasks((prev) => prev.map((t) => t.id === taskId ? { 
      ...t, 
      status: "COMPLETED", 
      completedAt: new Date().toISOString() 
    } : t));

    // 2. Add product to inventory and update location
    updateInventoryItem(task.sku, (old) => ({
      ...old,
      quantity: old.quantity + Number(task.quantity),
      status: "AVAILABLE",
      bin: task.destinationBin || task.bin || old.bin
    }));

    // 3. Update inbound receipt to STORED
    if (task.inboundId) {
      setInboundReceipts(prev => prev.map(rec => rec.id === task.inboundId ? { ...rec, status: 'STORED' } : rec));
    }

    // 4. Update bin capacity occupancy
    const targetBinCode = task.destinationBin || task.bin;
    setBins(prev => prev.map(b => b.code === targetBinCode ? {
      ...b,
      currentCapacity: Math.min(b.maxCapacity, b.currentCapacity + Number(task.quantity)),
      status: (b.currentCapacity + Number(task.quantity)) >= b.maxCapacity ? 'FULL' : 'PARTIAL'
    } : b));

    // 5. Log PUTAWAY_COMPLETED in movements log
    const nextMovId = generateNextId('MOV-', movements.map(m => m.id));
    setMovements((prev) => [
      {
        id: nextMovId,
        taskId: taskId,
        item: task.product,
        sku: task.sku,
        from: task.pickupLocation || "Receiving Dock",
        to: targetBinCode || "BIN-002",
        user: user?.name || user?.email || "Warehouse Staff",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "PUTAWAY_COMPLETED",
        status: "Completed",
        qty: task.quantity,
        timestamp: new Date().toISOString()
      },
      ...prev,
    ]);

    // 6. Update KPIs
    setKpis((prev) => ({
      ...prev,
      pendingPutaway: Math.max(0, prev.pendingPutaway - 1),
      completedToday: prev.completedToday + 1,
      assignedMovements: Math.max(0, prev.assignedMovements - 1),
    }));

    logAudit(user?.email || "staff@warehouseai.com", "STAFF", "COMPLETE_PUTAWAY", "Putaway", `Completed putaway task ${taskId}.`);
    return true;
  };

  const createOrder = (order) => {
    const nextOrderId = generateNextId('ORD-', orders.map(o => o.id));
    const newOrder = {
      id: nextOrderId,
      customer: order.customer,
      dispatchTime: order.dispatchTime || "Today, 20:00",
      productCount: order.productCount || 1,
      status: "Pending",
      progress: 0,
    };

    setOrders((prev) => [newOrder, ...prev]);
    logAudit("manager@warehouseai.com", "MANAGER", "CREATE_ORDER", "Orders", `Created order ${newOrder.id} for ${order.customer}.`);
  };

  const createInboundShipment = (shipment) => {
    const nextInboundId = generateNextId('INB-', inboundTasks.map(t => t.id));
    const nextSupplierId = generateNextId('SUP-', inboundTasks.map(t => t.supplierId).filter(Boolean));
    const newShipment = {
      id: nextInboundId,
      supplier: shipment.supplier,
      supplierId: shipment.supplierId || nextSupplierId,
      expectedArrival: shipment.expectedArrival || "Tomorrow, 12:00",
      product: shipment.product,
      sku: shipment.sku || generateNextId('PRD-', inventory.map(item => item.sku)),
      quantity: shipment.quantity || 10,
      priority: shipment.priority || "Medium",
      status: "Pending",
      assignedStaff: "Unassigned",
    };

    setInboundTasks((prev) => [newShipment, ...prev]);
    logAudit("manager@warehouseai.com", "MANAGER", "CREATE_INBOUND", "Inbound", `Created inbound shipment ${newShipment.id} from ${shipment.supplier}.`);
  };

  const assignInboundStaff = (id, staffName) => {
    setInboundTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, assignedStaff: staffName } : task
      )
    );

    logAudit("manager@warehouseai.com", "MANAGER", "ASSIGN_STAFF", "Inbound", `Assigned ${staffName} to ${id}.`);
  };

  const dispatchOrder = (orderId) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "Dispatched",
              progress: 100,
            }
          : order
      )
    );

    logAudit("manager@warehouseai.com", "MANAGER", "DISPATCH_ORDER", "Orders", `Dispatched order ${orderId}.`);
  };

  const acceptAiRecommendation = (recId) => {
    setAiRecommendations((prev) =>
      prev.map((rec) =>
        rec.id === recId ? { ...rec, status: "RECOMMENDATION_APPROVED" } : rec
      )
    );

    // Find the recommendation to extract its details
    const recommendation = aiRecommendations.find(r => r.id === recId);
    if (recommendation && recommendation.inboundId) {
      setInboundReceipts(prev => prev.map(rec => rec.id === recommendation.inboundId ? {
        ...rec,
        status: 'RECOMMENDATION_APPROVED',
        binRecommendationStatus: 'RECOMMENDATION_APPROVED'
      } : rec));
    }

    logAudit("manager@warehouseai.com", "MANAGER", "ACCEPT_AI_RECOMMENDATION", "AI Recommendations", `Approved AI recommendation ${recId}.`);
  };

  const rejectAiRecommendation = (recId) => {
    setAiRecommendations((prev) =>
      prev.map((rec) =>
        rec.id === recId ? { ...rec, status: "REJECTED" } : rec
      )
    );

    const recommendation = aiRecommendations.find(r => r.id === recId);
    if (recommendation && recommendation.inboundId) {
      setInboundReceipts(prev => prev.map(rec => rec.id === recommendation.inboundId ? {
        ...rec,
        status: 'WAITING_FOR_BIN_ASSIGNMENT',
        binRecommendationStatus: 'WAITING_FOR_BIN_ASSIGNMENT'
      } : rec));
    }

    logAudit("manager@warehouseai.com", "MANAGER", "REJECT_AI_RECOMMENDATION", "AI Recommendations", `Rejected recommendation ${recId}.`);
  };

  const generateBinRecommendation = (inboundId) => {
    const receipt = inboundReceipts.find(r => r.id === inboundId);
    if (!receipt) return;

    // Transition status to BIN_SUGGESTED
    setInboundReceipts(prev => prev.map(rec => rec.id === inboundId ? {
      ...rec,
      status: 'BIN_SUGGESTED',
      binRecommendationStatus: 'BIN_SUGGESTED'
    } : rec));

    // Create a mock recommendation
    const nextRecId = generateNextId('REC-', aiRecommendations.map(r => r.id));
    // Pick a mock shelf bin
    const targetBin = bins[Math.floor(Math.random() * bins.length)] || { code: "BIN-002", zone: "Zone B", shelf: "S-10" };
    
    const newRec = {
      id: nextRecId,
      inboundId: inboundId,
      title: `Slotting Suggestion for ${receipt.productName}`,
      sku: receipt.sku,
      productName: receipt.productName,
      quantity: receipt.verifiedQuantity || receipt.quantityReceived,
      zone: targetBin.zone || 'Zone B',
      aisle: 'A1',
      rack: 'Rack 2',
      shelf: targetBin.shelf || 'S-10',
      bin: targetBin.code || 'BIN-002',
      fitScore: 94,
      capacityScore: 92,
      weightSafetyScore: 95,
      routeEfficiencyScore: 88,
      zoneSuitabilityScore: 96,
      confidence: 94,
      priority: receipt.priority || "Medium",
      estTime: "5 mins",
      distance: "40m",
      reason: `Layout balancing optimization: placed ${receipt.productName} in ${targetBin.zone} at ${targetBin.code} based on load balancing, category segregation, and proximity efficiency.`,
      status: "PENDING_REVIEW",
      createdAt: new Date().toISOString()
    };

    setAiRecommendations(prev => [newRec, ...prev]);
    logAudit("manager@warehouseai.com", "MANAGER", "GENERATE_AI_RECOMMENDATION", "AI Recommendations", `Generated AI bin recommendation for inbound item ${receipt.productName}.`);
  };

  const assignPutawayTask = (inboundId, staffId, staffName, priority) => {
    const receipt = inboundReceipts.find(r => r.id === inboundId);
    if (!receipt) return;

    const recommendation = aiRecommendations.find(r => r.inboundId === inboundId) || {};

    const nextPtwId = generateNextId('PTW-', putawayTasks.map(t => t.id));
    const newTask = {
      id: nextPtwId,
      inboundId: inboundId,
      product: receipt.productName,
      sku: receipt.sku,
      quantity: receipt.verifiedQuantity || receipt.quantityReceived,
      pickupLocation: "Receiving Dock",
      destinationZone: recommendation.zone || 'Zone B',
      destinationRack: recommendation.rack || 'Rack 2',
      destinationShelf: recommendation.shelf || 'Level 1',
      destinationBin: recommendation.bin || 'BIN-002',
      assignedStaffId: staffId || 'WRK-003',
      assignedStaffName: staffName || 'Warehouse Staff',
      priority: priority || receipt.priority || "Medium",
      dueTime: "Today, 18:00",
      routePath: `Receiving Dock -> Aisle 1 -> ${recommendation.zone || 'Zone B'} -> ${recommendation.rack || 'Rack 2'} -> ${recommendation.shelf || 'Level 1'} -> ${recommendation.bin || 'BIN-002'}`,
      status: "ASSIGNED",
      createdAt: new Date().toISOString(),
    };

    setPutawayTasks(prev => [newTask, ...prev]);

    // Transition inbound status to ASSIGNED_TO_STAFF
    setInboundReceipts(prev => prev.map(r => r.id === inboundId ? { ...r, status: 'ASSIGNED_TO_STAFF' } : r));

    // Log movement task dispatch
    const nextMovId = generateNextId('MOV-', movements.map(m => m.id));
    setMovements(prev => [
      {
        id: nextMovId,
        taskId: nextPtwId,
        item: receipt.productName,
        sku: receipt.sku,
        from: "Receiving Dock",
        to: recommendation.bin || 'BIN-002',
        user: staffName,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "PUTAWAY_ASSIGNED",
        status: "Assigned",
        qty: receipt.verifiedQuantity,
      },
      ...prev
    ]);

    logAudit("manager@warehouseai.com", "MANAGER", "TASK_ASSIGNED", "Putaway", `Assigned putaway task for ${receipt.productName} to ${staffName}.`);
  };

  const addRack = (rack) => {
    const nextRackId = generateNextId('RACK-', racks.map(r => r.id));
    const newRack = {
      id: rack.id || nextRackId,
      zoneId: rack.zoneId || "ZONE-Z1",
      name: rack.name || `Rack ${racks.length + 1}`,
      maxWeight: Number(rack.maxWeight) || 1000,
      currentWeight: Number(rack.currentWeight) || 0,
      status: rack.status || "Active"
    };
    setRacks((prev) => [...prev, newRack]);
    logAudit("manager@warehouseai.com", "MANAGER", "ADD_RACK", "Zones & Bins", `Created rack ${newRack.name}.`);
  };

  const editRack = (updatedRack) => {
    setRacks((prev) => prev.map((r) => r.id === updatedRack.id ? { ...r, ...updatedRack } : r));
    logAudit("manager@warehouseai.com", "MANAGER", "EDIT_RACK", "Zones & Bins", `Updated rack ${updatedRack.name}.`);
  };

  const deleteRack = (rackId) => {
    setRacks((prev) => prev.filter((r) => r.id !== rackId));
    logAudit("manager@warehouseai.com", "MANAGER", "DELETE_RACK", "Zones & Bins", `Deleted rack ${rackId}.`);
  };

  const addShelf = (shelf) => {
    const nextShelfId = generateNextId('SHELF-', shelves.map(s => s.id));
    const newShelf = {
      id: shelf.id || nextShelfId,
      rackId: shelf.rackId || "RACK-001",
      shelfLevel: shelf.shelfLevel || `Level ${shelves.length + 1}`,
      maxWeight: Number(shelf.maxWeight) || 300,
      currentWeight: Number(shelf.currentWeight) || 0,
      status: shelf.status || "Active"
    };
    setShelves((prev) => [...prev, newShelf]);
    logAudit("manager@warehouseai.com", "MANAGER", "ADD_SHELF", "Zones & Bins", `Created shelf ${newShelf.shelfLevel}.`);
  };

  const editShelf = (updatedShelf) => {
    setShelves((prev) => prev.map((s) => s.id === updatedShelf.id ? { ...s, ...updatedShelf } : s));
    logAudit("manager@warehouseai.com", "MANAGER", "EDIT_SHELF", "Zones & Bins", `Updated shelf ${updatedShelf.id}.`);
  };

  const deleteShelf = (shelfId) => {
    setShelves((prev) => prev.filter((s) => s.id !== shelfId));
    logAudit("manager@warehouseai.com", "MANAGER", "DELETE_SHELF", "Zones & Bins", `Deleted shelf ${shelfId}.`);
  };

  return (
    <WarehouseContext.Provider
      value={{
        isLoading,
        error,
        products,
        setProducts,
        warehouses,
        zones,
        bins,
        inventory,
        recentScans,
        putawayTasks,
        inboundTasks,
        orders,
        movements,
        aiRecommendations,
        routes,
        auditLogs,
        kpis,
        reservations,
        stockAdjustments,
        damagedRecords,
        workers,
        setWorkers,
        generateNextId,
        validateId,
        addWarehouse,
        addZone,
        editZone,
        deleteZone,
        addBin,
        editBin,
        deleteBin,
        adjustStock,
        markDamaged,
        reportDamage,
        updateDamageStatus,
        reserveStock,
        releaseReservation,
        acceptAiRecommendation,
        rejectAiRecommendation,
        generateBinRecommendation,
        assignPutawayTask,
        racks,
        setRacks,
        addRack,
        editRack,
        deleteRack,
        shelves,
        setShelves,
        addShelf,
        editShelf,
        deleteShelf,
        addRecentScan,
        acceptRecommendation,
        startInboundTask,
        completeInboundTask,
        startPutawayTask,
        completePutawayTask,
        confirmPickedFromReceiving,
        confirmReachedBin,
        reportPutawayIssue,
        createOrder,
        createInboundShipment,
        assignInboundStaff,
        dispatchOrder,
        ocrDocuments,
        setOcrDocuments,
        inboundReceipts,
        setInboundReceipts,
        addOcrDocument,
        verifyOcrDocument,
        rejectOcrDocument,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
}
export function useWarehouse() {
  return useContext(WarehouseContext);
}