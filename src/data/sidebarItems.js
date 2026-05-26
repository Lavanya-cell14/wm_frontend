import { 
  LayoutDashboard, Building2, LayoutGrid, Box, Package, 
  ArrowDownToLine, ArrowUpFromLine, Activity, MonitorPlay, Map, 
  Lightbulb, BarChart3, ListChecks, Users, Bot,
  ScanBarcode, ClipboardList, CheckSquare, Wrench, AlertTriangle, Search, Shield, Navigation
} from 'lucide-react';

export const sidebarItems = [
  // MANAGER ITEMS
  { name: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard, allowedRoles: ['MANAGER'] },
  { name: 'Warehouse', path: '/warehouse', icon: Building2, allowedRoles: ['MANAGER'] },
  { name: 'Zones & Bins', path: '/zones-bins', icon: LayoutGrid, allowedRoles: ['MANAGER'] },
  { name: 'Inventory', path: '/inventory', icon: Box, allowedRoles: ['MANAGER'] },
  { name: 'Product Intelligence', path: '/product-intelligence', icon: Package, allowedRoles: ['MANAGER'] },
  { name: 'Inbound', path: '/inbound', icon: ArrowDownToLine, allowedRoles: ['MANAGER'] },
  { name: 'Orders', path: '/orders', icon: ArrowUpFromLine, allowedRoles: ['MANAGER'] },
  { name: 'Movements', path: '/movements', icon: Activity, allowedRoles: ['MANAGER'] },
  { name: 'Digital Twin', path: '/digital-twin', icon: MonitorPlay, allowedRoles: ['MANAGER'] },
  { name: 'Routes', path: '/routes', icon: Map, allowedRoles: ['MANAGER'] },
  { name: 'AI Recommendations', path: '/ai-recommendations', icon: Lightbulb, allowedRoles: ['MANAGER'] },
  { name: 'Analytics', path: '/analytics', icon: BarChart3, allowedRoles: ['MANAGER'] },
  { name: 'Audit Logs', path: '/audit-logs', icon: ListChecks, allowedRoles: ['MANAGER'] },
  
  // STAFF ITEMS
  { name: 'Staff Dashboard', path: '/staff/dashboard', icon: LayoutDashboard, allowedRoles: ['STAFF'] },
  { name: 'Product Scanner', path: '/staff/scanner', icon: ScanBarcode, allowedRoles: ['STAFF'] },
  { name: 'Inbound Tasks', path: '/staff/inbound', icon: ArrowDownToLine, allowedRoles: ['STAFF'] },
  { name: 'Putaway Tasks', path: '/staff/putaway', icon: ClipboardList, allowedRoles: ['STAFF'] },
  { name: 'Movement Tracking', path: '/staff/movements', icon: Activity, allowedRoles: ['STAFF'] },

  // INVENTORY CLERK ITEMS
  { name: 'Inventory Dashboard', path: '/inventory/dashboard', icon: LayoutDashboard, allowedRoles: ['INVENTORY_CLERK'] },
  { name: 'Inventory List', path: '/inventory/list', icon: Box, allowedRoles: ['INVENTORY_CLERK'] },
  { name: 'Stock Adjustment', path: '/inventory/adjust', icon: Wrench, allowedRoles: ['INVENTORY_CLERK'] },
  { name: 'Damaged Stock', path: '/inventory/damaged', icon: AlertTriangle, allowedRoles: ['INVENTORY_CLERK'] },
  { name: 'Reserved Stock', path: '/inventory/reserved', icon: Package, allowedRoles: ['INVENTORY_CLERK'] },
  { name: 'Product Lookup', path: '/inventory/lookup', icon: Search, allowedRoles: ['INVENTORY_CLERK'] },
  { name: 'Movement History', path: '/inventory/movements', icon: Activity, allowedRoles: ['INVENTORY_CLERK'] },

  // ADMIN ITEMS
  { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, allowedRoles: ['ADMIN'] },
  { name: 'User Management', path: '/admin/users', icon: Users, allowedRoles: ['ADMIN'] },
  { name: 'Role Management', path: '/admin/roles', icon: Shield, allowedRoles: ['ADMIN'] }, // Note: Shield needs import, wait, added below
  { name: 'Warehouse Settings', path: '/admin/settings', icon: Building2, allowedRoles: ['ADMIN'] },
  { name: 'Audit Logs', path: '/admin/audit', icon: ListChecks, allowedRoles: ['ADMIN'] },
  { name: 'System Health', path: '/admin/health', icon: Activity, allowedRoles: ['ADMIN'] },

  // OPERATOR ITEMS
  { name: 'Route Dashboard', path: '/operator/dashboard', icon: LayoutDashboard, allowedRoles: ['OPERATOR'] },
  { name: 'Assigned Routes', path: '/operator/routes', icon: Map, allowedRoles: ['OPERATOR'] },
  { name: 'Movement Tasks', path: '/operator/movements', icon: Activity, allowedRoles: ['OPERATOR'] },
  { name: 'Twin Route View', path: '/operator/twin', icon: MonitorPlay, allowedRoles: ['OPERATOR'] },
  { name: 'AGV Tracking', path: '/operator/tracking', icon: Navigation, allowedRoles: ['OPERATOR'] },
];
