import { LayoutDashboard, Package, BarChart3, Box, FileText, Settings } from 'lucide-react';

export const sidebarItems = [
  {
    name: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Product Tracking',
    path: '/product-tracking',
    icon: Package,
  },
  {
    name: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Inventory',
    path: '/inventory',
    icon: Box,
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: FileText,
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
  },
];
