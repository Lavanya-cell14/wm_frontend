export const productsData = [
  {
    id: 'PRD-001',
    sku: 'SKU-8921',
    name: 'Industrial Pallet Jack',
    category: 'Equipment',
    zone: 'Zone A2',
    quantity: 45,
    status: 'In Stock',
    lastMovement: '2 hours ago',
    updatedTime: '2026-05-22 10:30 AM',
    history: [
      { stage: 'Received at Dock 1', date: '2026-05-20 08:00 AM', status: 'completed' },
      { stage: 'Quality Check', date: '2026-05-20 10:15 AM', status: 'completed' },
      { stage: 'Stored in Zone A2', date: '2026-05-20 11:30 AM', status: 'completed' },
      { stage: 'Pending Redistribution', status: 'pending' }
    ]
  },
  {
    id: 'PRD-002',
    sku: 'SKU-7734',
    name: 'Heavy Duty Racking Units',
    category: 'Storage',
    zone: 'Zone B1',
    quantity: 12,
    status: 'Low Stock',
    lastMovement: '1 day ago',
    updatedTime: '2026-05-21 02:15 PM',
    history: [
      { stage: 'Received at Dock 2', date: '2026-05-15 09:00 AM', status: 'completed' },
      { stage: 'Stored in Zone B1', date: '2026-05-15 01:00 PM', status: 'completed' },
      { stage: 'Picked for Order #1024', date: '2026-05-21 02:00 PM', status: 'completed' },
      { stage: 'Shipped', status: 'pending' }
    ]
  },
  {
    id: 'PRD-003',
    sku: 'SKU-1198',
    name: 'Forklift Batteries 48V',
    category: 'Parts',
    zone: 'Transit',
    quantity: 8,
    status: 'In Transit',
    lastMovement: '30 mins ago',
    updatedTime: '2026-05-22 02:00 PM',
    history: [
      { stage: 'Picked from Zone C3', date: '2026-05-22 01:30 PM', status: 'completed' },
      { stage: 'Moving to Loading Bay', date: '2026-05-22 02:00 PM', status: 'completed' },
      { stage: 'Loading to Truck', status: 'pending' }
    ]
  },
  {
    id: 'PRD-004',
    sku: 'SKU-5520',
    name: 'Safety Harness Kits',
    category: 'Safety',
    zone: 'Zone D4',
    quantity: 0,
    status: 'Out of Stock',
    lastMovement: '5 days ago',
    updatedTime: '2026-05-17 11:45 AM',
    history: [
      { stage: 'Received at Dock 1', date: '2026-05-01 09:00 AM', status: 'completed' },
      { stage: 'Stored in Zone D4', date: '2026-05-01 11:00 AM', status: 'completed' },
      { stage: 'All units picked', date: '2026-05-17 11:30 AM', status: 'completed' },
      { stage: 'Awaiting Restock', status: 'pending' }
    ]
  },
  {
    id: 'PRD-005',
    sku: 'SKU-3312',
    name: 'Conveyor Rollers',
    category: 'Parts',
    zone: 'Zone C1',
    quantity: 120,
    status: 'In Stock',
    lastMovement: '4 hours ago',
    updatedTime: '2026-05-22 08:30 AM',
    history: [
      { stage: 'Received at Dock 3', date: '2026-05-22 07:00 AM', status: 'completed' },
      { stage: 'Quality Check', date: '2026-05-22 08:00 AM', status: 'completed' },
      { stage: 'Stored in Zone C1', date: '2026-05-22 08:30 AM', status: 'completed' }
    ]
  }
];

export const zoneGroupsData = [
  {
    id: 'ZG-A',
    name: 'Bulk Storage Alpha',
    totalZones: 8,
    occupiedPercent: 92,
    availableCapacity: 450,
    status: 'Warning',
    zones: [
      { id: 'Z-A1', name: 'Zone A1', capacityPercent: 95, availableSlots: 12, productCount: 450, temperature: 'Ambient', status: 'Warning' },
      { id: 'Z-A2', name: 'Zone A2', capacityPercent: 100, availableSlots: 0, productCount: 520, temperature: 'Ambient', status: 'Full' },
      { id: 'Z-A3', name: 'Zone A3', capacityPercent: 88, availableSlots: 35, productCount: 380, temperature: 'Ambient', status: 'Available' }
    ]
  },
  {
    id: 'ZG-B',
    name: 'Cold Storage Beta',
    totalZones: 4,
    occupiedPercent: 65,
    availableCapacity: 1200,
    status: 'Available',
    zones: [
      { id: 'Z-B1', name: 'Zone B1', capacityPercent: 70, availableSlots: 85, productCount: 210, temperature: '-18°C', status: 'Available' },
      { id: 'Z-B2', name: 'Zone B2', capacityPercent: 60, availableSlots: 110, productCount: 180, temperature: '-18°C', status: 'Available' }
    ]
  },
  {
    id: 'ZG-C',
    name: 'High Velocity Charlie',
    totalZones: 12,
    occupiedPercent: 85,
    availableCapacity: 800,
    status: 'Available',
    zones: [
      { id: 'Z-C1', name: 'Zone C1', capacityPercent: 85, availableSlots: 45, productCount: 650, temperature: 'Ambient', status: 'Available' },
      { id: 'Z-C2', name: 'Zone C2', capacityPercent: 90, availableSlots: 20, productCount: 720, temperature: 'Ambient', status: 'Warning' }
    ]
  }
];
