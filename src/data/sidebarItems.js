import {
  LayoutDashboard, Building2, LayoutGrid, Box,
  ArrowDownToLine, ArrowUpFromLine, Activity, MonitorPlay, Map,
  Lightbulb, BarChart3, ListChecks, Users, Shield,
  ClipboardList, CheckSquare, Wrench, AlertTriangle,
  Search, Navigation, Package, UploadCloud, Settings, Layers, Bot, FileText
} from 'lucide-react';

export const sidebarItems = [
  // ─── WAREHOUSE MANAGER ──────────────────────────────────────────────────────
  {
    name: 'Dashboard',
    path: '/manager/dashboard',
    icon: LayoutDashboard,
    allowedRoles: ['WAREHOUSE_MANAGER'],
  },
  {
    name: 'Analytics',
    path: '/manager/analytics',
    icon: BarChart3,
    allowedRoles: ['WAREHOUSE_MANAGER'],
  },
  {
    name: 'Digital Twin',
    path: '/manager/digital-twin',
    icon: MonitorPlay,
    allowedRoles: ['WAREHOUSE_MANAGER'],
  },
  {
    name: 'Inventory Overview',
    path: '/manager/inventory',
    icon: Box,
    allowedRoles: ['WAREHOUSE_MANAGER'],
  },
  {
    name: 'Reports',
    path: '/manager/reports',
    icon: FileText,
    allowedRoles: ['WAREHOUSE_MANAGER'],
  },
  {
    name: 'AI Copilot',
    path: '/manager/ai-assistant',
    icon: Bot,
    allowedRoles: ['WAREHOUSE_MANAGER'],
  },

  // ─── RECEIVING & INVENTORY OFFICER ────────────────────────────────────────
  {
    name: 'Dashboard',
    path: '/inventory/dashboard',
    icon: LayoutDashboard,
    allowedRoles: ['RECEIVING_INVENTORY_OFFICER'],
  },
  {
    name: 'Inbound Queue',
    path: '/inventory/inbound',
    icon: ArrowDownToLine,
    allowedRoles: ['RECEIVING_INVENTORY_OFFICER'],
  },
  {
    name: 'Products',
    path: '/inventory/products',
    icon: Package,
    allowedRoles: ['RECEIVING_INVENTORY_OFFICER'],
  },
  {
    name: 'Inventory',
    path: '/inventory/inventory',
    icon: Box,
    allowedRoles: ['RECEIVING_INVENTORY_OFFICER'],
  },
  {
    name: 'Recommendations',
    path: '/inventory/recommendations',
    icon: Lightbulb,
    allowedRoles: ['RECEIVING_INVENTORY_OFFICER'],
  },
  {
    name: 'Allocations',
    path: '/inventory/allocations',
    icon: CheckSquare,
    allowedRoles: ['RECEIVING_INVENTORY_OFFICER'],
  },

  // ─── WAREHOUSE OPERATOR ───────────────────────────────────────────────────
  {
    name: 'Dashboard',
    path: '/operator/dashboard',
    icon: LayoutDashboard,
    allowedRoles: ['WAREHOUSE_OPERATOR'],
  },
  {
    name: 'Putaway Tasks',
    path: '/operator/storage-tasks',
    icon: ClipboardList,
    allowedRoles: ['WAREHOUSE_OPERATOR'],
  },
  {
    name: 'Route Guidance',
    path: '/operator/navigation',
    icon: Navigation,
    allowedRoles: ['WAREHOUSE_OPERATOR'],
  },
  {
    name: 'Placement Guidance',
    path: '/operator/placement-guidance',
    icon: Layers,
    allowedRoles: ['WAREHOUSE_OPERATOR'],
  },

  // ─── ADMIN ────────────────────────────────────────────────────────────────
  {
    name: 'Dashboard',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
    allowedRoles: ['ADMIN'],
  },
  {
    name: 'Warehouse Setup',
    path: '/admin/warehouse-setup',
    icon: Building2,
    allowedRoles: ['ADMIN'],
  },
  {
    name: 'Navigation Setup',
    path: '/admin/navigation-setup',
    icon: Map,
    allowedRoles: ['ADMIN'],
  },
  {
    name: 'Audit Logs',
    path: '/admin/audit',
    icon: ClipboardList,
    allowedRoles: ['ADMIN'],
  },
  {
    name: 'Settings',
    path: '/admin/settings',
    icon: Settings,
    allowedRoles: ['ADMIN'],
  },
];

