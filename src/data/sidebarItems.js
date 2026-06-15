import {
  LayoutDashboard, Building2, LayoutGrid, Box,
  ArrowDownToLine, Activity, MonitorPlay, Map,
  Lightbulb, BarChart3, ListChecks, Users, Shield,
  ClipboardList, CheckSquare, Wrench, AlertTriangle,
  Search, Navigation, Package, UploadCloud, Settings
} from 'lucide-react';

export const sidebarItems = [
  // ─── MANAGER ──────────────────────────────────────────────────────────────
  {
    name: 'Dashboard',
    path: '/manager/dashboard',
    icon: LayoutDashboard,
    allowedRoles: ['MANAGER'],
  },
  {
    name: 'Inbound Monitoring',
    path: '/inbound',
    icon: ArrowDownToLine,
    allowedRoles: ['MANAGER'],
  },
  {
    name: 'AI Recommendations',
    path: '/ai-recommendations',
    icon: Lightbulb,
    allowedRoles: ['MANAGER'],
  },
  {
    name: 'Warehouse Layout',
    path: '/warehouse',
    icon: Building2,
    allowedRoles: ['MANAGER'],
  },
  {
    name: 'Zones & Bins',
    path: '/zones-bins',
    icon: LayoutGrid,
    allowedRoles: ['MANAGER'],
  },
  {
    name: 'Digital Twin',
    path: '/digital-twin',
    icon: MonitorPlay,
    allowedRoles: ['MANAGER'],
  },
  {
    name: 'Inventory Overview',
    path: '/inventory',
    icon: Box,
    allowedRoles: ['MANAGER'],
  },
  {
    name: 'Movements Log',
    path: '/movements',
    icon: Activity,
    allowedRoles: ['MANAGER'],
  },
  {
    name: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
    allowedRoles: ['MANAGER'],
  },
  {
    name: 'Routes Overview',
    path: '/routes',
    icon: Map,
    allowedRoles: ['MANAGER'],
  },

  // ─── INVENTORY CLERK ──────────────────────────────────────────────────────
  {
    name: 'Dashboard',
    path: '/inventory/dashboard',
    icon: LayoutDashboard,
    allowedRoles: ['INVENTORY_CLERK'],
  },
  {
    name: 'OCR Upload',
    path: '/ocr-upload',
    icon: UploadCloud,
    allowedRoles: ['INVENTORY_CLERK'],
  },
  {
    name: 'OCR Verification',
    path: '/ocr-verification',
    icon: CheckSquare,
    allowedRoles: ['INVENTORY_CLERK'],
  },
  {
    name: 'Inbound Products',
    path: '/inventory/inbound',
    icon: ArrowDownToLine,
    allowedRoles: ['INVENTORY_CLERK'],
  },
  {
    name: 'Inventory List',
    path: '/inventory/list',
    icon: Box,
    allowedRoles: ['INVENTORY_CLERK'],
  },
  {
    name: 'Stock Adjustment',
    path: '/inventory/adjust',
    icon: Wrench,
    allowedRoles: ['INVENTORY_CLERK'],
  },
  {
    name: 'Damaged Stock',
    path: '/inventory/damaged',
    icon: AlertTriangle,
    allowedRoles: ['INVENTORY_CLERK'],
  },
  {
    name: 'Reserved Stock',
    path: '/inventory/reserved',
    icon: Package,
    allowedRoles: ['INVENTORY_CLERK'],
  },
  {
    name: 'Product Lookup',
    path: '/inventory/lookup',
    icon: Search,
    allowedRoles: ['INVENTORY_CLERK'],
  },
  {
    name: 'Inventory Movements',
    path: '/inventory/movements',
    icon: Activity,
    allowedRoles: ['INVENTORY_CLERK'],
  },

  // ─── STAFF ────────────────────────────────────────────────────────────────
  {
    name: 'Dashboard',
    path: '/staff/dashboard',
    icon: LayoutDashboard,
    allowedRoles: ['STAFF'],
  },
  {
    name: 'Putaway Tasks',
    path: '/staff/putaway',
    icon: ClipboardList,
    allowedRoles: ['STAFF'],
  },
  {
    name: 'Active Task',
    path: '/staff/active',
    icon: Activity,
    allowedRoles: ['STAFF'],
  },
  {
    name: 'Route Guidance',
    path: '/staff/route-guidance',
    icon: Navigation,
    allowedRoles: ['STAFF'],
  },
  {
    name: 'Completed Tasks',
    path: '/staff/completed',
    icon: CheckSquare,
    allowedRoles: ['STAFF'],
  },

  // ─── ADMIN ────────────────────────────────────────────────────────────────
  {
    name: 'Dashboard',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
    allowedRoles: ['ADMIN'],
  },
  {
    name: 'User Management',
    path: '/admin/users',
    icon: Users,
    allowedRoles: ['ADMIN'],
  },
  {
    name: 'Role Management',
    path: '/admin/roles',
    icon: Shield,
    allowedRoles: ['ADMIN'],
  },
  {
    name: 'Audit Logs',
    path: '/admin/audit',
    icon: ListChecks,
    allowedRoles: ['ADMIN'],
  },
  {
    name: 'System Health',
    path: '/admin/health',
    icon: Activity,
    allowedRoles: ['ADMIN'],
  },
  {
    name: 'Settings',
    path: '/admin/settings',
    icon: Settings,
    allowedRoles: ['ADMIN'],
  },
];
