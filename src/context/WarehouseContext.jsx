import React, { createContext, useContext, useState } from "react";

const WarehouseContext = createContext();

export function WarehouseProvider({ children }) {
  const [warehouses, setWarehouses] = useState([
    {
      id: "WH-001",
      name: "Central Fulfillment A",
      location: "Chicago, IL",
      status: "operational",
      totalZones: 12,
      capacity: 85,
      activeStaff: 45,
      area: "50,000 sq ft",
    },
  ]);

  const [zones, setZones] = useState([
    {
      id: "ZONE-A",
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
      id: "ZONE-B",
      name: "Zone B",
      type: "Electronics",
      warehouse: "Central Fulfillment A",
      x: 30,
      y: 5,
      z: 0,
      width: 25,
      height: 10,
      depth: 15,
      capacityPercent: 72,
      status: "Active",
    },
    {
      id: "ZONE-C",
      name: "Zone C",
      type: "Bulk Storage",
      warehouse: "Central Fulfillment A",
      x: 55,
      y: 5,
      z: 0,
      width: 30,
      height: 12,
      depth: 20,
      capacityPercent: 88,
      status: "Active",
    },
  ]);

  const [bins, setBins] = useState([
    {
      code: "BIN-A-01-05",
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
      code: "BIN-B-10-01",
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
      code: "BIN-B-12-03",
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
      code: "BIN-C-04-12",
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
      sku: "SKU-1001",
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
      rack: "R-12",
      shelf: "S-03",
      bin: "BIN-B-12-03",
      weight: "2.4 kg",
      dimensions: "35 x 24 x 3 cm",
      lastUpdated: "Just scanned",
    },
    {
      sku: "SKU-1002",
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
      rack: "R-10",
      shelf: "S-01",
      bin: "BIN-B-10-01",
      weight: "1.4 kg",
      dimensions: "30 x 21 x 2 cm",
      lastUpdated: "10 mins ago",
    },
    {
      sku: "SKU-1003",
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
      rack: "R-01",
      shelf: "S-01",
      bin: "BIN-A-01-05",
      weight: "0.1 kg",
      dimensions: "10 x 6 x 4 cm",
      lastUpdated: "30 mins ago",
    },
    {
      sku: "SKU-2001",
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
      rack: "R-04",
      shelf: "S-04",
      bin: "BIN-C-04-12",
      weight: "5.5 kg",
      dimensions: "26 x 22 x 32 cm",
      lastUpdated: "1 hr ago",
    },
  ]);

  const [recentScans, setRecentScans] = useState([
    {
      sku: "SKU-1002",
      name: "MacBook Pro",
      category: "Electronics",
      time: "10:15 AM",
      operator: "Warehouse Staff",
      suggested: "BIN-B-10-01",
      status: "Stored",
    },
  ]);

  const [putawayTasks, setPutawayTasks] = useState([]);
  const [stockAdjustments, setStockAdjustments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [damagedRecords, setDamagedRecords] = useState([]);

  const [inboundTasks, setInboundTasks] = useState([
    {
      id: "INB-101",
      supplier: "Dell Logistics",
      expectedArrival: "Today, 14:00",
      product: "Dell Laptop",
      sku: "SKU-1001",
      quantity: 50,
      priority: "High",
      status: "Pending",
      assignedStaff: "Unassigned",
    },
  ]);

  const [orders, setOrders] = useState([]);
  const [movements, setMovements] = useState([]);
  const [routes] = useState([
    {
      id: "RTE-101",
      from: "Receiving Dock A",
      to: "BIN-B-12-03",
      distance: "65m",
      time: "4 mins",
      operator: "Warehouse Staff",
      status: "Active",
    },
  ]);

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
    const newZone = {
      id: `ZONE-${Date.now()}`,
      name: zone.name,
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
    logAudit("manager@warehouseai.com", "MANAGER", "ADD_ZONE", "Zones & Bins", `Created zone ${zone.name}.`);
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
    const newBin = {
      code: bin.code,
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
    logAudit("manager@warehouseai.com", "MANAGER", "ADD_BIN", "Zones & Bins", `Created bin ${bin.code}.`);
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

    setStockAdjustments((prev) => [
      {
        id: `ADJ-${Date.now()}`,
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
        id: `MOV-${Date.now()}`,
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

    const reservation = {
      id: `RES-${Date.now()}`,
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
        id: `MOV-${Date.now()}`,
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

    setMovements((prev) => [
      {
        id: `MOV-${Date.now()}`,
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

    setDamagedRecords((prev) => [
      {
        id: `DMG-${Date.now()}`,
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
        id: `MOV-${Date.now()}`,
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
    setRecentScans((prev) => [
      {
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
    const newTask = {
      id: `PTW-${Date.now()}`,
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

    setMovements((prev) => [
      {
        id: `MOV-${Date.now()}`,
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
        task.id === taskId ? { ...task, status: "In Progress" } : task
      )
    );

    logAudit("staff@warehouseai.com", "STAFF", "START_PUTAWAY", "Putaway", `Started putaway task ${taskId}.`);
  };

  const completePutawayTask = (taskId, user) => {
    const task = putawayTasks.find((putaway) => putaway.id === taskId);

    if (!task) return false;

    setPutawayTasks((prev) => prev.filter((putaway) => putaway.id !== taskId));

    updateInventoryItem(task.sku, (old) => ({
      ...old,
      quantity: old.quantity + Number(task.quantity),
    }));

    setMovements((prev) => [
      {
        id: `MOV-${Date.now()}`,
        item: task.product,
        sku: task.sku,
        from: "INBOUND-ZONE",
        to: task.bin,
        user: user.email,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "Putaway",
        status: "Completed",
        qty: task.quantity,
      },
      ...prev,
    ]);

    setKpis((prev) => ({
      ...prev,
      pendingPutaway: Math.max(0, prev.pendingPutaway - 1),
      completedToday: prev.completedToday + 1,
      assignedMovements: Math.max(0, prev.assignedMovements - 1),
    }));

    logAudit(user.email, user.role, "COMPLETE_PUTAWAY", "Putaway", `Completed putaway task ${taskId}.`);
    return true;
  };

  const createOrder = (order) => {
    const newOrder = {
      id: `ORD-${Date.now()}`,
      customer: order.customer,
      dispatchTime: order.dispatchTime || "Today, 20:00",
      productCount: order.productCount || 1,
      status: "Pending",
      progress: 0,
    };

    setOrders((prev) => [newOrder, ...prev]);
    logAudit("manager@warehouseai.com", "MANAGER", "CREATE_ORDER", "Orders", `Created order for ${order.customer}.`);
  };

  const createInboundShipment = (shipment) => {
    const newShipment = {
      id: `INB-${Date.now()}`,
      supplier: shipment.supplier,
      expectedArrival: shipment.expectedArrival || "Tomorrow, 12:00",
      product: shipment.product,
      sku: shipment.sku || "SKU-9999",
      quantity: shipment.quantity || 10,
      priority: shipment.priority || "Medium",
      status: "Pending",
      assignedStaff: "Unassigned",
    };

    setInboundTasks((prev) => [newShipment, ...prev]);
    logAudit("manager@warehouseai.com", "MANAGER", "CREATE_INBOUND", "Inbound", `Created inbound shipment from ${shipment.supplier}.`);
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
        rec.id === recId ? { ...rec, status: "Accepted" } : rec
      )
    );

    logAudit("manager@warehouseai.com", "MANAGER", "ACCEPT_AI_RECOMMENDATION", "AI Recommendations", `Accepted recommendation ${recId}.`);
  };

  const rejectAiRecommendation = (recId) => {
    setAiRecommendations((prev) => prev.filter((rec) => rec.id !== recId));

    logAudit("manager@warehouseai.com", "MANAGER", "REJECT_AI_RECOMMENDATION", "AI Recommendations", `Rejected recommendation ${recId}.`);
  };

  return (
    <WarehouseContext.Provider
      value={{
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
        addRecentScan,
        acceptRecommendation,
        startInboundTask,
        completeInboundTask,
        startPutawayTask,
        completePutawayTask,
        createOrder,
        createInboundShipment,
        assignInboundStaff,
        dispatchOrder,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
}

export function useWarehouse() {
  return useContext(WarehouseContext);
}