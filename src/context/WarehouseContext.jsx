import React, { createContext, useContext, useState } from 'react';

const WarehouseContext = createContext();

export function WarehouseProvider({ children }) {
  // 1. Warehouses State
  const [warehouses, setWarehouses] = useState([
    { id: 'WH-001', name: 'Central Fulfillment A', location: 'Chicago, IL', status: 'operational', totalZones: 12, capacity: 85, activeStaff: 45, area: '50,000 sq ft' },
    { id: 'WH-002', name: 'East Coast Distribution', location: 'Newark, NJ', status: 'operational', totalZones: 8, capacity: 92, activeStaff: 32, area: '35,000 sq ft' },
    { id: 'WH-003', name: 'West Coast Hub', location: 'Los Angeles, CA', status: 'maintenance', totalZones: 15, capacity: 45, activeStaff: 12, area: '60,000 sq ft' },
    { id: 'WH-004', name: 'Southern Regional', location: 'Atlanta, GA', status: 'operational', totalZones: 6, capacity: 78, activeStaff: 28, area: '25,000 sq ft' },
  ]);

  // 2. Zones State
  const [zones, setZones] = useState([
    { id: 'ZONE-A', name: 'Zone A', type: 'Fast Moving', warehouse: 'Central Fulfillment A', x: 10, y: 5, z: 0, width: 20, height: 10, depth: 15, capacityPercent: 65, status: 'Active' },
    { id: 'ZONE-B', name: 'Zone B', type: 'Electronics', warehouse: 'Central Fulfillment A', x: 30, y: 5, z: 0, width: 25, height: 10, depth: 15, capacityPercent: 72, status: 'Active' },
    { id: 'ZONE-C', name: 'Zone C', type: 'Bulk Storage', warehouse: 'Central Fulfillment A', x: 55, y: 5, z: 0, width: 30, height: 12, depth: 20, capacityPercent: 88, status: 'Active' },
    { id: 'ZONE-D', name: 'Zone D', type: 'Cold Storage', warehouse: 'Central Fulfillment A', x: 90, y: 5, z: 0, width: 15, height: 8, depth: 10, capacityPercent: 40, status: 'Maintenance' },
  ]);

  // 3. Bins State
  const [bins, setBins] = useState([
    { code: 'BIN-A-01-05', zone: 'Zone A', shelf: 'S-01', maxCapacity: 200, currentCapacity: 120, status: 'Active', x: 12, y: 5, z: 1 },
    { code: 'BIN-B-10-01', zone: 'Zone B', shelf: 'S-10', maxCapacity: 50, currentCapacity: 15, status: 'Active', x: 32, y: 5, z: 1 },
    { code: 'BIN-C-04-12', zone: 'Zone C', shelf: 'S-04', maxCapacity: 100, currentCapacity: 45, status: 'Active', x: 58, y: 6, z: 2 },
    { code: 'BIN-A-02-03', zone: 'Zone A', shelf: 'S-02', maxCapacity: 150, currentCapacity: 80, status: 'Active', x: 15, y: 5, z: 2 },
    { code: 'BIN-D-01-01', zone: 'Zone D', shelf: 'S-01', maxCapacity: 80, currentCapacity: 0, status: 'Empty', x: 92, y: 5, z: 1 },
  ]);

  // 4. Inventory State
  const [inventory, setInventory] = useState([
    { sku: 'SKU-1002', name: 'MacBook Pro', category: 'Electronics', quantity: 15, zone: 'Zone B', bin: 'BIN-B-10-01', warehouse: 'Central Fulfillment A', reserved: 2, damaged: 0, lastUpdated: '10 mins ago' },
    { sku: 'SKU-1003', name: 'Logitech Mouse', category: 'Accessories', quantity: 120, zone: 'Zone A', bin: 'BIN-A-01-05', warehouse: 'Central Fulfillment A', reserved: 10, damaged: 1, lastUpdated: '30 mins ago' },
    { sku: 'SKU-2041', name: 'Industrial Drills', category: 'Industrial Tools', quantity: 45, zone: 'Zone C', bin: 'BIN-C-04-12', warehouse: 'Central Fulfillment A', reserved: 0, damaged: 2, lastUpdated: '1 hr ago' },
    { sku: 'SKU-3092', name: 'Safety Helmets', category: 'Safety Equipment', quantity: 80, zone: 'Zone A', bin: 'BIN-A-02-03', warehouse: 'Central Fulfillment A', reserved: 5, damaged: 0, lastUpdated: '2 hrs ago' },
    { sku: 'SKU-1001', name: 'Dell Laptop', category: 'Electronics', quantity: 50, zone: 'Zone B', bin: 'BIN-B-12-03', warehouse: 'Central Fulfillment A', reserved: 0, damaged: 0, lastUpdated: 'Just scanned' },
  ]);

  // 5. Recent Scans State
  const [recentScans, setRecentScans] = useState([
    { sku: 'SKU-1002', name: 'MacBook Pro', category: 'Electronics', time: '10:15 AM', operator: 'Warehouse Staff', suggested: 'BIN-B-10-01', status: 'Stored' },
    { sku: 'SKU-1003', name: 'Logitech Mouse', category: 'Accessories', time: '11:30 AM', operator: 'Warehouse Staff', suggested: 'BIN-A-01-05', status: 'Stored' },
    { sku: 'SKU-3092', name: 'Safety Helmets', category: 'Safety Equipment', time: '12:05 PM', operator: 'Warehouse Staff', suggested: 'BIN-A-02-03', status: 'AI Suggested' },
  ]);

  // 6. Putaway Tasks Queue State
  const [putawayTasks, setPutawayTasks] = useState([
    { 
      id: 'PTW-204', 
      product: 'Safety Helmets', 
      sku: 'SKU-3092', 
      quantity: 80, 
      zone: 'Zone A', 
      aisle: 'A2', 
      rack: 'R-03', 
      shelf: 'S-02', 
      bin: 'BIN-A-02-03', 
      priority: 'Medium', 
      estTime: '5 mins', 
      distance: '45m', 
      status: 'Pending' 
    },
    { 
      id: 'PTW-205', 
      product: 'Industrial Drills', 
      sku: 'SKU-2041', 
      quantity: 45, 
      zone: 'Zone C', 
      aisle: 'C4', 
      rack: 'R-12', 
      shelf: 'S-04', 
      bin: 'BIN-C-04-12', 
      priority: 'High', 
      estTime: '10 mins', 
      distance: '120m', 
      status: 'In Progress' 
    }
  ]);

  // 7. Inbound Tasks (Shipments) State
  const [inboundTasks, setInboundTasks] = useState([
    { id: 'INB-101', supplier: 'Dell Logistics', expectedArrival: 'Today, 14:00', product: 'Dell Laptop', sku: 'SKU-1001', quantity: 50, priority: 'High', status: 'Pending', assignedStaff: 'Unassigned' },
    { id: 'INB-102', supplier: 'Apex Industrial', expectedArrival: 'Today, 15:30', product: 'Industrial Drills', sku: 'SKU-2041', quantity: 30, priority: 'Medium', status: 'In Progress', assignedStaff: 'Warehouse Staff' },
    { id: 'INB-103', supplier: 'SafetyFirst Co', expectedArrival: 'Tomorrow, 09:00', product: 'Safety Reflective Vests', sku: 'SKU-3095', quantity: 200, priority: 'Low', status: 'Pending', assignedStaff: 'Unassigned' },
    { id: 'INB-104', supplier: 'ElectroParts', expectedArrival: 'Yesterday, 11:00', product: 'Wireless Keyboards', sku: 'SKU-1005', quantity: 80, priority: 'Medium', status: 'Completed', assignedStaff: 'Warehouse Staff' }
  ]);

  // 8. Orders (Outbound Shipments) State
  const [orders, setOrders] = useState([
    { id: 'ORD-5011', customer: 'Global Tech Corp', dispatchTime: 'Today, 17:00', productCount: 4, status: 'Pending', progress: 30 },
    { id: 'ORD-5012', customer: 'NextGen Systems', dispatchTime: 'Today, 18:30', productCount: 12, status: 'In Progress', progress: 65 },
    { id: 'ORD-5013', customer: 'SuperRetailers', dispatchTime: 'Tomorrow, 10:00', productCount: 45, status: 'Pending', progress: 0 },
    { id: 'ORD-5014', customer: 'Fast Logistics Solutions', dispatchTime: 'Yesterday, 15:00', productCount: 8, status: 'Dispatched', progress: 100 }
  ]);

  // 9. Movements State
  const [movements, setMovements] = useState([
    { id: 'MOV-9921', item: 'MacBook Pro', sku: 'SKU-1002', from: 'INBOUND-ZONE', to: 'BIN-B-10-01', user: 'Warehouse Staff', time: '10:24 AM', type: 'Putaway', status: 'Completed', qty: 15 },
    { id: 'MOV-9922', item: 'Logitech Mouse', sku: 'SKU-1003', from: 'INBOUND-ZONE', to: 'BIN-A-01-05', user: 'Warehouse Staff', time: '11:35 AM', type: 'Putaway', status: 'Completed', qty: 120 },
  ]);

  // 10. AI Recommendations State
  const [aiRecommendations, setAiRecommendations] = useState([
    { id: 'REC-001', title: 'Slotting Optimization in Zone B', priority: 'High', confidence: 96, reason: 'High picking activity on Dell Laptops requires moving to lower shelves for fast access.', impact: 'Saves 12 mins per pick cycle.', status: 'Active' },
    { id: 'REC-002', title: 'Low Stock Replenishment: Reflective Vests', priority: 'Medium', confidence: 89, reason: 'Pending outbound orders will exceed current active bin stock in Zone A.', impact: 'Prevents stockout delays.', status: 'Active' },
    { id: 'REC-003', title: 'Rack Expansion Analysis: Zone C', priority: 'Low', confidence: 78, reason: 'Bulk storage is consistently above 85% capacity over the last 30 days.', impact: 'Prepares warehouse for peak seasonal intake.', status: 'Active' }
  ]);

  // 11. Routes State
  const [routes, setRoutes] = useState([
    { id: 'RTE-101', from: 'Receiving Dock A', to: 'BIN-B-12-03', distance: '65m', time: '4 mins', operator: 'Warehouse Staff', status: 'Active' },
    { id: 'RTE-102', from: 'BIN-A-01-05', to: 'Shipping Dock B', distance: '120m', time: '8 mins', operator: 'Route Operator', status: 'Completed' },
  ]);

  // 12. Audit Logs State
  const [auditLogs, setAuditLogs] = useState([
    { id: 'LOG-001', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), user: 'system', role: 'SYSTEM', action: 'INIT', module: 'System', details: 'WarehouseAI layout and digital twin mapped.', status: 'Success' },
    { id: 'LOG-002', timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'manager@warehouseai.com', role: 'MANAGER', action: 'LOGIN', module: 'Auth', details: 'Warehouse Manager signed in.', status: 'Success' },
  ]);

  // 13. Top KPI derived metrics
  const [kpis, setKpis] = useState({
    scannedToday: 3,
    pendingPutaway: 2,
    activeInbound: 2,
    assignedMovements: 1,
    completedToday: 2,
    aiAccepted: 2,
    avgPutawayTime: '7.8 mins',
    operationalStatus: 'green'
  });

  // Action methods
  const addWarehouse = (wh) => {
    const newWh = {
      id: `WH-00${warehouses.length + 1}`,
      name: wh.name,
      location: wh.location,
      status: 'operational',
      totalZones: wh.totalZones || 0,
      capacity: wh.capacity || 0,
      activeStaff: wh.activeStaff || 0,
      area: wh.area || '10,000 sq ft'
    };
    setWarehouses(prev => [...prev, newWh]);
    logAudit('manager@warehouseai.com', 'MANAGER', 'ADD_WAREHOUSE', 'Warehouse', `Added new warehouse facility ${wh.name}.`);
  };

  const addZone = (zone) => {
    const newZone = {
      id: `ZONE-${String.fromCharCode(65 + zones.length)}`,
      name: zone.name,
      type: zone.type,
      warehouse: zone.warehouse || 'Central Fulfillment A',
      x: parseInt(zone.x) || 0,
      y: parseInt(zone.y) || 0,
      z: parseInt(zone.z) || 0,
      width: parseInt(zone.width) || 10,
      height: parseInt(zone.height) || 8,
      depth: parseInt(zone.depth) || 10,
      capacityPercent: zone.capacityPercent || 0,
      status: zone.status || 'Active'
    };
    setZones(prev => [...prev, newZone]);
    logAudit('manager@warehouseai.com', 'MANAGER', 'ADD_ZONE', 'Zones & Bins', `Created warehouse zone ${zone.name}.`);
  };

  const editZone = (updatedZone) => {
    setZones(prev => prev.map(z => z.id === updatedZone.id ? { ...z, ...updatedZone } : z));
    logAudit('manager@warehouseai.com', 'MANAGER', 'EDIT_ZONE', 'Zones & Bins', `Updated metadata for zone ${updatedZone.name}.`);
  };

  const deleteZone = (zoneId) => {
    setZones(prev => prev.filter(z => z.id !== zoneId));
    logAudit('manager@warehouseai.com', 'MANAGER', 'DELETE_ZONE', 'Zones & Bins', `Deleted warehouse zone ${zoneId}.`);
  };

  const addBin = (bin) => {
    const newBin = {
      code: bin.code,
      zone: bin.zone,
      shelf: bin.shelf,
      maxCapacity: parseInt(bin.maxCapacity) || 100,
      currentCapacity: 0,
      status: bin.status || 'Active',
      x: parseInt(bin.x) || 0,
      y: parseInt(bin.y) || 0,
      z: parseInt(bin.z) || 0
    };
    setBins(prev => [...prev, newBin]);
    logAudit('manager@warehouseai.com', 'MANAGER', 'ADD_BIN', 'Zones & Bins', `Created shelf location bin ${bin.code} inside ${bin.zone}.`);
  };

  const editBin = (updatedBin) => {
    setBins(prev => prev.map(b => b.code === updatedBin.code ? { ...b, ...updatedBin } : b));
    logAudit('manager@warehouseai.com', 'MANAGER', 'EDIT_BIN', 'Zones & Bins', `Updated metadata for shelf location bin ${updatedBin.code}.`);
  };

  const deleteBin = (binCode) => {
    setBins(prev => prev.filter(b => b.code !== binCode));
    logAudit('manager@warehouseai.com', 'MANAGER', 'DELETE_BIN', 'Zones & Bins', `Removed shelf location bin ${binCode}.`);
  };

  const adjustStock = (sku, qtyDelta, user) => {
    setInventory(prev => prev.map(item => {
      if (item.sku === sku) {
        return {
          ...item,
          quantity: Math.max(0, item.quantity + qtyDelta),
          lastUpdated: 'Just now'
        };
      }
      return item;
    }));
    logAudit(user.email, user.role, 'ADJUST_STOCK', 'Inventory', `Adjusted quantity of SKU ${sku} by ${qtyDelta} units.`);
  };

  const markDamaged = (sku, qty, user) => {
    setInventory(prev => prev.map(item => {
      if (item.sku === sku) {
        return {
          ...item,
          quantity: Math.max(0, item.quantity - qty),
          damaged: item.damaged + qty,
          lastUpdated: 'Just now'
        };
      }
      return item;
    }));
    logAudit(user.email, user.role, 'MARK_DAMAGED', 'Inventory', `Flagged ${qty} units of SKU ${sku} as damaged.`);
  };

  const acceptAiRecommendation = (recId) => {
    setAiRecommendations(prev => prev.filter(rec => rec.id !== recId));
    logAudit('manager@warehouseai.com', 'MANAGER', 'ACCEPT_AI_RECOMMENDATION', 'AI Recommendations', `Approved and implemented layout suggestion ${recId}.`);
    
    // Increment accepted KPI
    setKpis(prev => ({
      ...prev,
      aiAccepted: prev.aiAccepted + 1
    }));
  };

  const rejectAiRecommendation = (recId) => {
    setAiRecommendations(prev => prev.filter(rec => rec.id !== recId));
    logAudit('manager@warehouseai.com', 'MANAGER', 'REJECT_AI_RECOMMENDATION', 'AI Recommendations', `Rejected suggestion ${recId}.`);
  };

  const addRecentScan = (scan) => {
    setRecentScans(prev => [
      {
        sku: scan.sku,
        name: scan.name,
        category: scan.category,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        operator: scan.operator || 'Warehouse Staff',
        suggested: `${scan.zone}-${scan.aisle}-${scan.rack}`,
        status: scan.status || 'Scanned'
      },
      ...prev
    ]);
    setKpis(prev => ({ ...prev, scannedToday: prev.scannedToday + 1 }));
  };

  const logAudit = (userEmail, role, action, module, details) => {
    setAuditLogs(prev => [
      {
        id: `LOG-${Math.floor(Math.random() * 10000)}`,
        timestamp: new Date().toISOString(),
        user: userEmail,
        role: role,
        action: action,
        module: module,
        details: details,
        status: 'Success'
      },
      ...prev
    ]);
  };

  const acceptRecommendation = (recommendation, productData, user) => {
    const newTaskId = `PTW-${Math.floor(Math.random() * 900) + 100}`;
    const newTask = {
      id: newTaskId,
      product: productData.name,
      sku: productData.sku,
      quantity: productData.quantity,
      zone: recommendation.zone,
      aisle: recommendation.aisle,
      rack: recommendation.rack,
      shelf: recommendation.shelf,
      bin: recommendation.bin,
      priority: 'High',
      estTime: recommendation.estTime || '8 mins',
      distance: recommendation.distance || '65m',
      status: 'Pending'
    };
    setPutawayTasks(prev => [newTask, ...prev]);

    setRecentScans(prev => [
      {
        sku: productData.sku,
        name: productData.name,
        category: productData.category,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        operator: user.name,
        suggested: recommendation.bin,
        status: 'AI Suggested'
      },
      ...prev
    ]);

    setMovements(prev => [
      {
        id: `MOV-${Math.floor(Math.random() * 10000)}`,
        item: productData.name,
        sku: productData.sku,
        from: 'INBOUND-ZONE',
        to: recommendation.bin,
        user: user.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'Putaway',
        status: 'Assigned',
        qty: productData.quantity
      },
      ...prev
    ]);

    logAudit(user.email, user.role, 'ACCEPT_AI_REC', 'Scanner', `Staff accepted AI putaway recommendation for ${productData.sku} to Bin ${recommendation.bin}.`);

    setKpis(prev => ({
      ...prev,
      scannedToday: prev.scannedToday + 1,
      pendingPutaway: prev.pendingPutaway + 1,
      aiAccepted: prev.aiAccepted + 1,
      assignedMovements: prev.assignedMovements + 1
    }));
  };

  const startInboundTask = (taskId) => {
    setInboundTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'In Progress', assignedStaff: 'Warehouse Staff' } : task
    ));
    logAudit('staff@warehouseai.com', 'STAFF', 'START_RECEIVING', 'Inbound', `Started receiving inbound shipment ${taskId}.`);
  };

  const completeInboundTask = (taskId, user) => {
    setInboundTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'Completed' } : task
    ));
    setKpis(prev => ({
      ...prev,
      completedToday: prev.completedToday + 1
    }));
    logAudit(user.email, user.role, 'COMPLETE_RECEIVING', 'Inbound', `Marked inbound shipment ${taskId} as fully received.`);
  };

  const startPutawayTask = (taskId) => {
    setPutawayTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'In Progress' } : task
    ));
    logAudit('staff@warehouseai.com', 'STAFF', 'START_PUTAWAY', 'Putaway', `Started putaway task ${taskId}.`);
  };

  const completePutawayTask = (taskId, user) => {
    let completedTaskData = null;
    
    setPutawayTasks(prev => {
      completedTaskData = prev.find(task => task.id === taskId);
      return prev.filter(task => task.id !== taskId);
    });

    if (completedTaskData) {
      setInventory(prev => {
        const existIdx = prev.findIndex(item => item.sku === completedTaskData.sku);
        if (existIdx >= 0) {
          const updated = [...prev];
          updated[existIdx] = {
            ...updated[existIdx],
            quantity: updated[existIdx].quantity + completedTaskData.quantity
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              sku: completedTaskData.sku,
              name: completedTaskData.product,
              category: completedTaskData.sku === 'SKU-1001' ? 'Electronics' : 'General',
              quantity: completedTaskData.quantity,
              zone: completedTaskData.zone,
              bin: completedTaskData.bin,
              warehouse: 'Central Fulfillment A',
              reserved: 0,
              damaged: 0,
              lastUpdated: 'Just now'
            }
          ];
        }
      });

      setRecentScans(prev => prev.map(scan => 
        scan.sku === completedTaskData.sku ? { ...scan, status: 'Stored' } : scan
      ));

      setMovements(prev => {
        const matchingMovement = prev.find(m => m.sku === completedTaskData.sku && m.status === 'Assigned');
        if (matchingMovement) {
          return prev.map(m => m.id === matchingMovement.id ? { ...m, status: 'Completed', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : m);
        } else {
          return [
            {
              id: `MOV-${Math.floor(Math.random() * 10000)}`,
              item: completedTaskData.product,
              sku: completedTaskData.sku,
              from: 'INBOUND-ZONE',
              to: completedTaskData.bin,
              user: user.name,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'Putaway',
              status: 'Completed',
              qty: completedTaskData.quantity
            },
            ...prev
          ];
        }
      });

      logAudit(user.email, user.role, 'COMPLETE_PUTAWAY', 'Putaway', `Completed putaway task ${taskId} for Bin ${completedTaskData.bin}.`);

      setKpis(prev => ({
        ...prev,
        pendingPutaway: Math.max(0, prev.pendingPutaway - 1),
        completedToday: prev.completedToday + 1,
        assignedMovements: Math.max(0, prev.assignedMovements - 1)
      }));
    }
  };

  const createOrder = (order) => {
    const newOrd = {
      id: `ORD-${Math.floor(Math.random() * 9000) + 1000}`,
      customer: order.customer,
      dispatchTime: 'Today, 20:00',
      productCount: order.productCount || 1,
      status: 'Pending',
      progress: 0
    };
    setOrders(prev => [newOrd, ...prev]);
    logAudit('manager@warehouseai.com', 'MANAGER', 'CREATE_ORDER', 'Orders', `Created outbound customer order for ${order.customer}.`);
  };

  const createInboundShipment = (shipment) => {
    const newShip = {
      id: `INB-${Math.floor(Math.random() * 900) + 100}`,
      supplier: shipment.supplier,
      expectedArrival: 'Tomorrow, 12:00',
      product: shipment.product,
      sku: shipment.sku || 'SKU-9999',
      quantity: shipment.quantity || 10,
      priority: shipment.priority || 'Medium',
      status: 'Pending',
      assignedStaff: 'Unassigned'
    };
    setInboundTasks(prev => [newShip, ...prev]);
    logAudit('manager@warehouseai.com', 'MANAGER', 'CREATE_INBOUND', 'Inbound', `Authorized new inbound shipment from ${shipment.supplier}.`);
  };

  const assignInboundStaff = (id, staffName) => {
    setInboundTasks(prev => prev.map(t => t.id === id ? { ...t, assignedStaff: staffName } : t));
    logAudit('manager@warehouseai.com', 'MANAGER', 'ASSIGN_STAFF', 'Inbound', `Assigned ${staffName} to inbound receiving task ${id}.`);
  };

  const dispatchOrder = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Dispatched', progress: 100 } : o));
    logAudit('manager@warehouseai.com', 'MANAGER', 'DISPATCH_ORDER', 'Orders', `Dispatched and shipped order ${orderId} out of warehouse.`);
  };

  return (
    <WarehouseContext.Provider value={{
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
      addWarehouse,
      addZone,
      editZone,
      deleteZone,
      addBin,
      editBin,
      deleteBin,
      adjustStock,
      markDamaged,
      acceptAiRecommendation,
      rejectAiRecommendation,
      addRecentScan,
      acceptRecommendation,
      startInboundTask,
      completeInboundTask,
      startPutawayTask,
      completePutawayTask,
      createOrder,
      createInboundShipment,
      assignInboundStaff,
      dispatchOrder
    }}>
      {children}
    </WarehouseContext.Provider>
  );
}

export const useWarehouse = () => useContext(WarehouseContext);
