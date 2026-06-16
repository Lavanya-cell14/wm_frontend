import React, { useState } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge, DashboardStatCard } from 'shared-ui';
import { 
  BarChart3, TrendingUp, Cpu, Sparkles, Download, Layers, Box, LayoutGrid, 
  ArrowDownToLine, CheckCircle2, Bot, PieChart, Activity
} from 'lucide-react';

export default function Analytics() {
  const { inventory = [], bins = [], putawayTasks = [], ocrDocuments = [] } = useWarehouse();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'occupancy', 'operational'

  // Dynamic calculations
  const totalStock = inventory.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const totalBins = bins.length || 30;
  const occupiedBins = bins.filter(b => b.status === 'Occupied' || b.status === 'Partial').length || 18;
  const occupancyRate = totalBins > 0 ? ((occupiedBins / totalBins) * 100).toFixed(1) : '60.0';

  const inventoryCategoryData = [
    { category: 'Electronics', count: 420, percent: 35 },
    { category: 'Automotive', count: 320, percent: 27 },
    { category: 'Accessories', count: 280, percent: 23 },
    { category: 'Cold Storage', count: 180, percent: 15 }
  ];

  const occupancyZoneData = [
    { zone: 'Zone A (Fast Moving)', occupied: 12, total: 15, pct: 80, color: 'bg-blue-600' },
    { zone: 'Zone B (Electronics)', occupied: 10, total: 12, pct: 83, color: 'bg-emerald-600' },
    { zone: 'Zone C (Bulk Storage)', occupied: 6, total: 8, pct: 75, color: 'bg-red-500' },
    { zone: 'Zone D (Cold Storage)', occupied: 2, total: 5, pct: 40, color: 'bg-amber-500' }
  ];

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#0071C1]" />
            Operations & Telemetry Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review detailed inventory classifications, spatial grid utilization metrics, and daily operational efficiency trends.
          </p>
        </div>
        <Button 
          className="gap-1.5 font-bold bg-[#0071C1] text-white hover:bg-[#005c9e] text-xs py-2 px-4 shadow-sm" 
          onClick={() => alert('Operational analytics exported successfully!')}
        >
          <Download className="w-4 h-4" /> Export Analytics Bundle
        </Button>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'inventory' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Box className="w-4 h-4" />
          Inventory Analytics
        </button>
        <button
          onClick={() => setActiveTab('occupancy')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'occupancy' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          Occupancy Analytics
        </button>
        <button
          onClick={() => setActiveTab('operational')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'operational' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Operational Analytics
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Inventory Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DashboardStatCard title="Total Inventory Stocked" value={`${totalStock} Units`} icon={Box} />
            <DashboardStatCard title="Inventory Accuracy Rate" value="99.94%" icon={Cpu} trend={0.02} />
            <DashboardStatCard title="Product Classifications" value="3 Active Profiles" icon={PieChart} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Inventory by Category */}
            <Card className="border border-gray-150 shadow-xs">
              <CardHeader className="bg-slate-50/40 border-b border-gray-100 pb-3">
                <CardTitle className="text-sm font-bold uppercase text-gray-700">Inventory by Category</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {inventoryCategoryData.map((item) => (
                  <div key={item.category} className="space-y-1.5 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span className="text-gray-900">{item.category}</span>
                      <span className="text-slate-500">{item.count} Units ({item.percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${item.percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Product Classification (ABC Analysis) */}
            <Card className="border border-gray-150 shadow-xs">
              <CardHeader className="bg-slate-50/40 border-b border-gray-100 pb-3">
                <CardTitle className="text-sm font-bold uppercase text-gray-700">Product Classification Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  
                  <div className="flex justify-between items-center p-3.5 bg-green-50/50 border border-green-100 rounded-xl text-xs font-semibold">
                    <div>
                      <span className="font-extrabold text-green-950 block">Class A (Fast Moving)</span>
                      <span className="text-slate-500 font-medium text-[11px] block mt-0.5">High frequency access. Accounts for 70% of traffic.</span>
                    </div>
                    <Badge variant="success" className="text-[10px]">72% Stock</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs font-semibold">
                    <div>
                      <span className="font-extrabold text-blue-950 block">Class B (Medium velocity)</span>
                      <span className="text-slate-500 font-medium text-[11px] block mt-0.5">Moderate slot usage. Accounts for 20% of traffic.</span>
                    </div>
                    <Badge variant="primary" className="text-[10px]">18% Stock</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3.5 bg-amber-50/50 border border-amber-100 rounded-xl text-xs font-semibold">
                    <div>
                      <span className="font-extrabold text-amber-950 block">Class C (Slow Moving)</span>
                      <span className="text-slate-500 font-medium text-[11px] block mt-0.5">Long-term storage slotting. Accounts for 10% of traffic.</span>
                    </div>
                    <Badge variant="warning" className="text-[10px]">10% Stock</Badge>
                  </div>

                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      )}

      {activeTab === 'occupancy' && (
        <div className="space-y-6">
          {/* Occupancy Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DashboardStatCard title="Overall Occupancy Rate" value={`${occupancyRate}%`} icon={Layers} />
            <DashboardStatCard title="Total Configured Bins" value={`${totalBins} Bins`} icon={LayoutGrid} />
            <DashboardStatCard title="Available Storage Slots" value={`${availableBinsCount} Slots`} icon={CheckCircle2} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Occupancy by Zone */}
            <Card className="border border-gray-150 shadow-xs">
              <CardHeader className="bg-slate-50/40 border-b border-gray-100 pb-3">
                <CardTitle className="text-sm font-bold uppercase text-gray-700">Occupancy by Zone</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {occupancyZoneData.map((item) => (
                  <div key={item.zone} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-900">{item.zone}</span>
                      <span className="text-gray-600">{item.occupied} / {item.total} Bins ({item.pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Occupancy by Aisle & Rack */}
            <Card className="border border-gray-150 shadow-xs">
              <CardHeader className="bg-slate-50/40 border-b border-gray-100 pb-3">
                <CardTitle className="text-sm font-bold uppercase text-gray-700">Occupancy by Aisle & Rack</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5 text-xs font-semibold text-gray-700">
                <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider mb-2.5">Aisle Metrics</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div>Aisle A1: <span className="font-bold text-gray-950">85% Occupied</span></div>
                    <div>Aisle A2: <span className="font-bold text-gray-950">72% Occupied</span></div>
                    <div>Aisle B1: <span className="font-bold text-gray-950">40% Occupied</span></div>
                    <div>Aisle B2: <span className="font-bold text-gray-955">60% Occupied</span></div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider mb-2.5">Rack Metrics</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div>Rack R1: <span className="font-bold text-gray-950">78% capacity</span></div>
                    <div>Rack R2: <span className="font-bold text-gray-955">88% capacity</span></div>
                    <div>Rack R3: <span className="font-bold text-gray-950">62% capacity</span></div>
                    <div>Rack R4: <span className="font-bold text-gray-950">35% capacity</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      )}

      {activeTab === 'operational' && (
        <div className="space-y-6">
          
          {/* Operational metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Storage Completion Trend */}
            <Card className="border border-gray-150 shadow-xs">
              <CardHeader className="bg-slate-50/40 border-b border-gray-100 pb-3">
                <CardTitle className="text-sm font-bold uppercase text-gray-700">Storage Task Completion Trend</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-48 flex items-end justify-between gap-4 pt-6">
                  {[
                    { label: 'Jan', val: 40 },
                    { label: 'Feb', val: 55 },
                    { label: 'Mar', val: 80 },
                    { label: 'Apr', val: 68 },
                    { label: 'May', val: 92 },
                    { label: 'Jun', val: 78 }
                  ].map((d) => (
                    <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-slate-100 rounded-t-lg h-32 flex items-end overflow-hidden border border-slate-150">
                        <div className="w-full bg-[#0071C1] rounded-t-lg transition-all duration-300" style={{ height: `${d.val}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 font-mono">{d.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* OCR Document Counts & Precision */}
            <Card className="border border-gray-150 shadow-xs">
              <CardHeader className="bg-slate-50/40 border-b border-gray-100 pb-3">
                <CardTitle className="text-sm font-bold uppercase text-gray-700">OCR Processing Trend</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-48 flex items-end justify-between gap-4 pt-6">
                  {[
                    { label: 'Mon', val: 92 },
                    { label: 'Tue', val: 96 },
                    { label: 'Wed', val: 94 },
                    { label: 'Thu', val: 97 },
                    { label: 'Fri', val: 98 }
                  ].map((d) => (
                    <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-slate-100 rounded-t-lg h-32 flex items-end overflow-hidden border border-slate-150">
                        <div className="w-full bg-indigo-600 rounded-t-lg transition-all duration-300" style={{ height: `${d.val}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 font-mono">{d.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      )}

    </div>
  );
}
