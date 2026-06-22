import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getWarehouses, getZones, getBins } from '../services/warehouseStructureService';
import { getInventory } from '../services/inventoryService';
import { getProducts } from '../services/productService';
import { getOrders } from '../services/orderService';
import { getRoutesApi } from '../services/routeService';
import { getInboundShipments } from '../services/inboundService';
import { getAiRecommendationsApi } from '../services/recommendationService';
import { getMovementsApi } from '../services/movementService';
import { getUsersApi } from '../services/usersService';

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
  const [warehouses, setWarehouses] = useState([]);
  const [zones, setZones] = useState([]);
  const [racks, setRacks] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [bins, setBins] = useState([]);

  const [inventory, setInventory] = useState(() => {
    const localData = localStorage.getItem('inventory');
    if (localData) {
      try {
        return JSON.parse(localData);
      } catch (e) {
        console.error('Failed parsing inventory from localStorage', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  const [recentScans, setRecentScans] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [putawayTasks, setPutawayTasks] = useState([]);
  const [stockAdjustments, setStockAdjustments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [damagedRecords, setDamagedRecords] = useState([]);

  const [ocrDocuments, setOcrDocuments] = useState(() => {
    const localData = localStorage.getItem('ocrDocuments');
    if (localData) {
      try {
        return JSON.parse(localData);
      } catch (e) {
        console.error('Failed parsing ocrDocuments from localStorage', e);
      }
    }
    return [];
  });

  useEffect(() => {
    const docsToSave = ocrDocuments.map(({ fileObject, ...rest }) => rest);
    localStorage.setItem('ocrDocuments', JSON.stringify(docsToSave));
  }, [ocrDocuments]);

  const [inboundReceipts, setInboundReceipts] = useState(() => {
    const localData = localStorage.getItem('inboundReceipts');
    if (localData) {
      try {
        return JSON.parse(localData);
      } catch (e) {
        console.error('Failed parsing inboundReceipts from localStorage', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('inboundReceipts', JSON.stringify(inboundReceipts));
  }, [inboundReceipts]);

  const addOcrDocument = (doc) => {
    setOcrDocuments(prev => [doc, ...prev]);
  };

  const verifyOcrDocument = (docId, updatedItems, docDetails) => {
    setOcrDocuments(prev => prev.map(d => d.id === docId ? { 
      ...d, 
      id: docDetails.document_number || d.id,
      status: 'VERIFIED', 
      extractedItems: updatedItems,
      supplierName: docDetails.supplier || d.supplierName,
      totalAmount: docDetails.total_amount || d.totalAmount,
      taxAmount: docDetails.tax_amount || d.taxAmount
    } : d));
    
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

  const [inboundTasks, setInboundTasks] = useState([]);

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [movements, setMovements] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [
          whsRes,
          zonesRes,
          binsRes,
          productsRes,
          invRes,
          ordersRes,
          routesRes,
          inboundRes,
          aiRecsRes,
          movementsRes,
          usersRes
        ] = await Promise.all([
          getWarehouses().catch(e => { console.warn("Failed fetching warehouses:", e); return { results: [] }; }),
          getZones().catch(e => { console.warn("Failed fetching zones:", e); return { results: [] }; }),
          getBins().catch(e => { console.warn("Failed fetching bins:", e); return { results: [] }; }),
          getProducts().catch(e => { console.warn("Failed fetching products:", e); return { results: [] }; }),
          getInventory().catch(e => { console.warn("Failed fetching inventory:", e); return { results: [] }; }),
          getOrders().catch(e => { console.warn("Failed fetching orders:", e); return { results: [] }; }),
          getRoutesApi().catch(e => { console.warn("Failed fetching routes:", e); return { results: [] }; }),
          getInboundShipments().catch(e => { console.warn("Failed fetching inbound shipments:", e); return { results: [] }; }),
          getAiRecommendationsApi().catch(e => { console.warn("Failed fetching AI recommendations:", e); return { results: [] }; }),
          getMovementsApi().catch(e => { console.warn("Failed fetching movements:", e); return { results: [] }; }),
          getUsersApi().catch(e => { console.warn("Failed fetching users:", e); return { results: [] }; })
        ]);

        if (whsRes?.results?.length > 0) {
          setWarehouses(whsRes.results);
        } else {
          setWarehouses([]);
        }

        if (zonesRes?.results?.length > 0) {
          setZones(zonesRes.results);
        } else {
          setZones([]);
        }

        if (binsRes?.results?.length > 0) {
          setBins(binsRes.results);
        } else {
          setBins([]);
        }

        if (productsRes?.results) {
          const mappedProducts = productsRes.results.map((p, idx) => {
            return {
              sku: p.sku || `SKU-100${idx + 1}`,
              productId: p.productId || p.id || `PRD-000${idx + 1}`,
              name: p.name,
              category: p.category || "Electronics",
              weight: p.weight || `${p.weightKg || 2.0} kg`,
              dimensions: p.dimensions || "25x25x25 cm",
              reorderLevel: p.reorderLevel || p.reorderPoint || 10,
              unitOfMeasure: p.unitOfMeasure || p.uom || "BOX",
              quantity: p.quantity || 0,
              bin: p.bin || `BIN-00${(idx % 4) + 1}`,
              createdAt: p.createdAt || new Date().toISOString(),
              updatedAt: p.updatedAt || new Date().toISOString()
            };
          });
          setProducts(mappedProducts);
        } else {
          setProducts([]);
        }

        if (invRes?.results) {
          const mappedInventory = invRes.results.map((item, idx) => {
            const sku = item.productId || item.sku;
            const matchedProd = (productsRes?.results || []).find(p => p.sku === sku || p.productId === sku);
            const name = item.productName || item.name || (matchedProd ? matchedProd.name : `Product ${sku}`);
            const category = item.category || (matchedProd ? matchedProd.category : "Electronics");
            const binId = item.binId || item.bin;
            
            return {
              sku: sku,
              name: name,
              category: category,
              quantity: item.quantity || 0,
              reserved: item.reservedQuantity || item.reserved || 0,
              damaged: item.damagedQuantity || item.damaged || 0,
              availableQuantity: item.availableQuantity || (item.quantity - (item.reservedQuantity || 0)) || 0,
              reorderLevel: item.reorderLevel || (matchedProd ? matchedProd.reorderLevel : 10),
              status: item.status || "In Stock",
              warehouse: item.warehouse || "Central Fulfillment A",
              zone: item.zone || "Zone A",
              rack: item.rack || "RACK-001",
              shelf: item.shelf || "S-01",
              bin: binId || "BIN-001",
              weight: item.weight || (matchedProd ? matchedProd.weight : "N/A"),
              dimensions: item.dimensions || (matchedProd ? matchedProd.dimensions : "N/A"),
              lastUpdated: item.lastUpdated || new Date().toLocaleDateString()
            };
          });
          setInventory(mappedInventory);
        } else {
          setInventory([]);
        }

        if (usersRes?.results) {
          const mappedWorkers = usersRes.results.map(w => ({
            id: w.workerId || w.id,
            name: w.name || w.username,
            email: w.email || `${w.id || w.username}@warehouseai.com`,
            role: w.role || "WAREHOUSE_OPERATOR",
            warehouse: w.warehouse || "Central Fulfillment A",
            status: w.status || "Active",
            lastLogin: w.lastLogin || "Just now",
            createdAt: w.createdAt || "2026-01-10",
            efficiency: w.efficiency || `${w.efficiencyScore || 90}%`,
            zone: w.zoneAssigned || w.zone || "Zone A"
          }));
          setWorkers(mappedWorkers);
        } else {
          setWorkers([]);
        }

        if (routesRes?.results) {
          const mappedRoutes = routesRes.results.map(r => ({
            id: r.routeId || r.id,
            from: r.stops && r.stops[0] ? r.stops[0] : (r.from || "Receiving Dock"),
            to: r.stops && r.stops.length > 0 ? r.stops[r.stops.length - 1] : (r.to || "BIN-001"),
            distance: r.distance || `${r.distanceMeters || 100}m`,
            time: r.time || `${Math.round((r.estimatedTimeSec || 300) / 60)} mins`,
            operator: r.workerId || r.operator || "Unassigned",
            status: r.status || "Active"
          }));
          setRoutes(mappedRoutes);
        } else {
          setRoutes([]);
        }

        if (ordersRes?.results) {
          const mappedOrders = ordersRes.results.map((o, idx) => {
            const status = o.status === "CREATED" ? "Pending" : o.status === "PICKING" ? "In Progress" : o.status === "PACKED" ? "Packed" : o.status || "Pending";
            return {
              id: o.orderId || o.id,
              customer: o.customerName || o.customer || "Unknown Customer",
              dispatchTime: o.dispatchTime || "Today, 20:00",
              productCount: o.quantity || o.productCount || 1,
              status,
              progress: o.progress || (status === "Pending" ? 10 : status === "In Progress" ? 40 : status === "Packed" ? 80 : 100),
              orderDate: o.orderDate || new Date().toISOString().split('T')[0],
              createdAt: o.createdAt || new Date().toISOString(),
              completedAt: o.completedAt || null
            };
          });
          setOrders(mappedOrders);
        } else {
          setOrders([]);
        }

        if (movementsRes?.results) {
          const mappedMovements = movementsRes.results.map((m, idx) => {
            return {
              id: m.movementId || m.id,
              item: m.productName || m.itemName || `Product ${m.productId || m.sku}`,
              sku: m.productId || m.sku,
              from: m.fromBin || m.from,
              to: m.toBin || m.to,
              user: m.workerId || m.user || "Warehouse Staff",
              time: m.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: m.type || "Putaway",
              status: m.status || "Completed",
              qty: m.quantity || m.qty || 1,
              movementDate: m.movementDate || new Date().toISOString().split('T')[0],
              timestamp: m.timestamp || new Date().toISOString()
            };
          });
          setMovements(mappedMovements);
        } else {
          setMovements([]);
        }

        if (inboundRes?.results) {
          const mappedInbounds = inboundRes.results.map((i, idx) => {
            const status = i.status === "PENDING" ? "Pending" : i.status === "IN_TRANSIT" ? "In Transit" : "Completed";
            return {
              id: i.shipmentId || i.id || `INB-000${idx + 1}`,
              supplier: i.supplierName || i.supplier || "Global Sourcing",
              supplierId: i.supplierId || `SUP-00${idx + 1}`,
              expectedArrival: i.expectedArrival || new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
              product: i.productName || i.product || `Product ${i.sku}`,
              sku: i.sku || `PRD-00${idx + 1}`,
              quantity: i.quantity || 40,
              priority: i.priority || "Medium",
              status,
              assignedStaff: i.assignedStaff || "Unassigned",
              createdAt: i.createdAt || new Date().toISOString(),
              completedAt: i.completedAt || null
            };
          });
          setInboundTasks(mappedInbounds);

          // Sync backend shipments to inboundReceipts for Recommendations page live queue
          const mappedReceipts = inboundRes.results.map((ship, idx) => {
            let mappedStatus = 'WAITING_FOR_BIN_ASSIGNMENT';
            if (ship.status === 'COMPLETED' || ship.status === 'STORED') {
              mappedStatus = 'STORED';
            } else if (ship.status === 'IN_PROGRESS' || ship.status === 'IN_TRANSIT') {
              mappedStatus = 'BIN_SUGGESTED';
            } else if (ship.status === 'PENDING' || ship.status === 'WAITING_FOR_BIN_ASSIGNMENT') {
              mappedStatus = 'WAITING_FOR_BIN_ASSIGNMENT';
            }

            return {
              id: ship.shipment_code || ship.id || `IR-GEN-${idx}`,
              documentId: 'OCR-N/A',
              documentReference: ship.shipment_code || 'REF-GEN',
              sku: ship.sku || 'SKU-GENERIC',
              productName: ship.product_name || ship.product || `Shipment from ${ship.supplier_name || 'Supplier'}`,
              category: ship.category || 'General',
              quantityReceived: Number(ship.quantity || 50),
              verifiedQuantity: Number(ship.quantity || 50),
              supplier: ship.supplier_name || ship.supplier || 'Unknown Supplier',
              receivedDate: ship.expected_arrival ? ship.expected_arrival.split('T')[0] : new Date().toISOString().split('T')[0],
              dimensions: ship.dimensions || 'N/A',
              weight: ship.weight || 'N/A',
              status: mappedStatus,
              binRecommendationStatus: mappedStatus === 'WAITING_FOR_BIN_ASSIGNMENT' ? 'WAITING_FOR_BIN_ASSIGNMENT' : 'RECOMMENDATION_APPROVED',
              bin: ship.bin || 'BIN-001',
              _rawBackendId: ship.id
            };
          });
          setInboundReceipts(mappedReceipts);
        } else {
          setInboundTasks([]);
        }

        if (aiRecsRes?.results) {
          const mappedRecs = aiRecsRes.results.map((r, idx) => {
            return {
              id: r.recommendationId || r.id || `REC-00${idx + 1}`,
              title: r.title || "Slotting Optimization",
              confidence: r.confidencePercent || r.confidence || 92,
              reason: r.reason || "Underutilized racks re-routing",
              impact: r.estimatedSavings || r.impact || "10% efficiency increase",
              priority: r.priority || "Medium",
              status: r.status || "Active",
              createdAt: r.createdAt || new Date().toISOString(),
              updatedAt: r.updatedAt || new Date().toISOString()
            };
          });
          setAiRecommendations(mappedRecs);
        } else {
          setAiRecommendations([]);
        }

      } catch (err) {
        console.error("Error fetching APIs", err);
        setError("Failed to synchronize layout and real-time inventory from central backend API.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);


  const [aiRecommendations, setAiRecommendations] = useState([]);

  const [auditLogs, setAuditLogs] = useState([]);

  const [kpis, setKpis] = useState({
    scannedToday: 0,
    pendingPutaway: 0,
    activeInbound: 0,
    assignedMovements: 0,
    completedToday: 0,
    aiAccepted: 0,
    avgPutawayTime: "0 mins",
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
    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "ADD_WAREHOUSE", "Warehouse", `Added warehouse ${wh.name}.`);
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
    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "ADD_ZONE", "Zones & Bins", `Created zone ${newZone.name}.`);
  };

  const editZone = (updatedZone) => {
    setZones((prev) =>
      prev.map((zone) =>
        zone.id === updatedZone.id ? { ...zone, ...updatedZone } : zone
      )
    );

    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "EDIT_ZONE", "Zones & Bins", `Updated zone ${updatedZone.name}.`);
  };

  const deleteZone = (zoneId) => {
    setZones((prev) => prev.filter((zone) => zone.id !== zoneId));
    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "DELETE_ZONE", "Zones & Bins", `Deleted zone ${zoneId}.`);
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
    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "ADD_BIN", "Zones & Bins", `Created bin ${newBin.code}.`);
  };

  const editBin = (updatedBin) => {
    setBins((prev) =>
      prev.map((bin) =>
        bin.code === updatedBin.code ? { ...bin, ...updatedBin } : bin
      )
    );

    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "EDIT_BIN", "Zones & Bins", `Updated bin ${updatedBin.code}.`);
  };

  const deleteBin = (binCode) => {
    setBins((prev) => prev.filter((bin) => bin.code !== binCode));
    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "DELETE_BIN", "Zones & Bins", `Deleted bin ${binCode}.`);
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
              assignedStaff: "Warehouse Operator",
            }
          : task
      )
    );

    logAudit("staff@warehouseai.com", "WAREHOUSE_OPERATOR", "START_RECEIVING", "Inbound", `Started inbound shipment ${taskId}.`);
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
          user: task.assignedStaffName || "Warehouse Operator",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "PUTAWAY_STARTED",
          status: "In Progress",
          qty: task.quantity,
          timestamp: new Date().toISOString()
        },
        ...prev
      ]);
    }

    logAudit("staff@warehouseai.com", "WAREHOUSE_OPERATOR", "START_PUTAWAY", "Putaway", `Started putaway task ${taskId}.`);
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
          user: task.assignedStaffName || "Warehouse Operator",
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
          user: task.assignedStaffName || "Warehouse Operator",
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
          user: user?.name || user?.email || "Warehouse Operator",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "ISSUE_REPORTED",
          status: "Delayed",
          qty: task.quantity,
          timestamp: new Date().toISOString(),
          reason: `${issueType}: ${description}`
        },
        ...prev
      ]);
      logAudit(user?.email || "staff@warehouseai.com", "WAREHOUSE_OPERATOR", "REPORT_ISSUE", "Putaway", `Reported issue on task ${taskId}: ${issueType}`);
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
        user: user?.name || user?.email || "Warehouse Operator",
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

    logAudit(user?.email || "staff@warehouseai.com", "WAREHOUSE_OPERATOR", "COMPLETE_PUTAWAY", "Putaway", `Completed putaway task ${taskId}.`);
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
    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "CREATE_ORDER", "Orders", `Created order ${newOrder.id} for ${order.customer}.`);
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
    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "CREATE_INBOUND", "Inbound", `Created inbound shipment ${newShipment.id} from ${shipment.supplier}.`);
  };

  const assignInboundStaff = (id, staffName) => {
    setInboundTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, assignedStaff: staffName } : task
      )
    );

    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "ASSIGN_STAFF", "Inbound", `Assigned ${staffName} to ${id}.`);
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

    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "DISPATCH_ORDER", "Orders", `Dispatched order ${orderId}.`);
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

    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "ACCEPT_AI_RECOMMENDATION", "AI Recommendations", `Approved AI recommendation ${recId}.`);
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

    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "REJECT_AI_RECOMMENDATION", "AI Recommendations", `Rejected recommendation ${recId}.`);
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
    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "GENERATE_AI_RECOMMENDATION", "AI Recommendations", `Generated AI bin recommendation for inbound item ${receipt.productName}.`);
  };

  const assignPutawayTask = (inboundId, staffId, staffName, priority, customRecommendation) => {
    const receipt = inboundReceipts.find(r => r.id === inboundId);
    if (!receipt) return;

    const recommendation = customRecommendation || aiRecommendations.find(r => r.inboundId === inboundId) || {};

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

    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "TASK_ASSIGNED", "Putaway", `Assigned putaway task for ${receipt.productName} to ${staffName}.`);
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
    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "ADD_RACK", "Zones & Bins", `Created rack ${newRack.name}.`);
  };

  const editRack = (updatedRack) => {
    setRacks((prev) => prev.map((r) => r.id === updatedRack.id ? { ...r, ...updatedRack } : r));
    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "EDIT_RACK", "Zones & Bins", `Updated rack ${updatedRack.name}.`);
  };

  const deleteRack = (rackId) => {
    setRacks((prev) => prev.filter((r) => r.id !== rackId));
    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "DELETE_RACK", "Zones & Bins", `Deleted rack ${rackId}.`);
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
    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "ADD_SHELF", "Zones & Bins", `Created shelf ${newShelf.shelfLevel}.`);
  };

  const editShelf = (updatedShelf) => {
    setShelves((prev) => prev.map((s) => s.id === updatedShelf.id ? { ...s, ...updatedShelf } : s));
    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "EDIT_SHELF", "Zones & Bins", `Updated shelf ${updatedShelf.id}.`);
  };

  const deleteShelf = (shelfId) => {
    setShelves((prev) => prev.filter((s) => s.id !== shelfId));
    logAudit("manager@warehouseai.com", "WAREHOUSE_MANAGER", "DELETE_SHELF", "Zones & Bins", `Deleted shelf ${shelfId}.`);
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
        setAiRecommendations,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
}
export function useWarehouse() {
  return useContext(WarehouseContext);
}