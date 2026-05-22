import React from 'react';
import StatCard from '../components/dashboard/StatCard';
import InventoryTable from '../components/inventory/InventoryTable';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Package, RefreshCw, AlertTriangle, TrendingUp, Plus } from 'lucide-react';

export default function Dashboard() {
  const recentInventory = [
    { sku: 'ITM-001', name: 'Industrial Safety Helmet', category: 'Safety', location: 'Aisle A1', quantity: 150, status: 'In Stock' },
    { sku: 'ITM-002', name: 'Reflective Vest', category: 'Safety', location: 'Aisle A2', quantity: 12, status: 'Low Stock' },
    { sku: 'ITM-003', name: 'Heavy Duty Gloves', category: 'Safety', location: 'Aisle A3', quantity: 0, status: 'Out of Stock' },
    { sku: 'ITM-004', name: 'Steel Toe Boots', category: 'Footwear', location: 'Aisle B1', quantity: 85, status: 'In Stock' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back. Here is your warehouse overview.</p>
        </div>
        <Button icon={Plus}>New Shipment</Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Products" 
          value="24,592" 
          icon={Package} 
          trend={12.5} 
          trendLabel="vs last month"
        />
        <StatCard 
          title="Inbound Shipments" 
          value="14" 
          icon={RefreshCw} 
        />
        <StatCard 
          title="Low Stock Alerts" 
          value="8" 
          icon={AlertTriangle} 
          trend={-2} 
          trendLabel="vs yesterday"
        />
        <StatCard 
          title="Fulfillment Rate" 
          value="98.2%" 
          icon={TrendingUp} 
          trend={0.4}
        />
      </div>

      {/* Recent Activity / Inventory Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Inventory Updates</CardTitle>
              <Button variant="ghost" size="sm" className="text-[#0071C1]">View All</Button>
            </CardHeader>
            <CardContent className="p-0">
              <InventoryTable data={recentInventory} />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="h-full bg-gradient-to-br from-[#0071C1] to-[#2672bb] text-white border-none">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Quick Action Required</h3>
              <p className="text-blue-100 text-sm mb-6">You have 8 items critically low on stock. Would you like to generate purchase orders?</p>
              <Button className="w-full bg-white text-[#0071C1] hover:bg-gray-50 border-none">
                Review Low Stock Items
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
