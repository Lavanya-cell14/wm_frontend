import React, { useState } from 'react';
import InventoryTable from '../components/inventory/InventoryTable';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Search, Filter, Download, Plus } from 'lucide-react';

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');

  const inventoryData = [
    { sku: 'ITM-001', name: 'Industrial Safety Helmet', category: 'Safety', location: 'Aisle A1', quantity: 150, status: 'In Stock' },
    { sku: 'ITM-002', name: 'Reflective Vest', category: 'Safety', location: 'Aisle A2', quantity: 12, status: 'Low Stock' },
    { sku: 'ITM-003', name: 'Heavy Duty Gloves', category: 'Safety', location: 'Aisle A3', quantity: 0, status: 'Out of Stock' },
    { sku: 'ITM-004', name: 'Steel Toe Boots', category: 'Footwear', location: 'Aisle B1', quantity: 85, status: 'In Stock' },
    { sku: 'ITM-005', name: 'Warehouse Pallet Jack', category: 'Equipment', location: 'Dock 4', quantity: 4, status: 'In Stock' },
    { sku: 'ITM-006', name: 'Packing Tape (Box)', category: 'Supplies', location: 'Aisle C4', quantity: 450, status: 'In Stock' },
    { sku: 'ITM-007', name: 'Stretch Wrap Roll', category: 'Supplies', location: 'Aisle C4', quantity: 5, status: 'Low Stock' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your warehouse inventory items.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={Download}>Export</Button>
          <Button icon={Plus}>Add Item</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                className="pl-9" 
                placeholder="Search by SKU, name, or category..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" icon={Filter}>Filter</Button>
          </div>
          
          <InventoryTable data={inventoryData} />
        </CardContent>
      </Card>
    </div>
  );
}
