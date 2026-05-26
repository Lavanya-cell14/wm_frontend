import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/dashboard/StatCard';
import InventoryTable from '../components/inventory/InventoryTable';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import AlertBanner from '../components/ui/AlertBanner';
import { 
  Package, Box, Building2, LayoutGrid, CheckCircle2, TrendingUp, AlertTriangle, 
  ArrowDownToLine, ArrowUpFromLine, Activity, Lightbulb, Clock, Plus, Layers, 
  Map, UserCheck, ShieldAlert 
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { inventory, warehouses, zones, bins, inboundTasks, orders, movements, aiRecommendations, auditLogs } = useWarehouse();
  
  // Quick Actions Navigation
  const handleQuickAction = (path) => {
    navigate(path);
  };

  // Derive counts
  const totalProducts = inventory.length;
  const totalInventoryQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const activeWarehousesCount = warehouses.length;
  const totalZonesCount = zones.length;
  const totalBinsCount = bins.length;
  const lowStockCount = inventory.filter(item => item.quantity <= 20).length;
  const pendingInbounds = inboundTasks.filter(t => t.status !== 'Completed').length;
  const pendingOutbounds = orders.filter(t => t.status !== 'Dispatched').length;

  const recentInventory = inventory.slice(0, 5).map(item => ({
    sku: item.sku,
    name: item.name,
    category: item.category,
    location: item.bin,
    quantity: item.quantity,
    status: item.quantity > 20 ? 'In Stock' : item.quantity > 0 ? 'Low Stock' : 'Out of Stock'
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manager Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Operational Control Center. Monitor live activity, track personnel, and review AI placement recommendations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button icon={Plus} onClick={() => navigate('/zones-bins')}>New Layout Entity</Button>
        </div>
      </div>

      {/* KPI Cards: 12 Metrics Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={totalProducts} icon={Package} trend={8.4} trendLabel="vs last week" />
        <StatCard title="Total Stock" value={totalInventoryQuantity} icon={Box} trend={12.5} trendLabel="vs last month" />
        <StatCard title="Active Facilities" value={activeWarehousesCount} icon={Building2} />
        <StatCard title="Total Zones" value={totalZonesCount} icon={LayoutGrid} />
        <StatCard title="Total Bins" value={totalBinsCount} icon={Layers} />
        <StatCard title="Bin Utilization" value="78%" icon={TrendingUp} trend={2.1} trendLabel="vs yesterday" />
        <StatCard title="Space Utilization" value="84.2%" icon={Layers} trend={-0.5} trendLabel="vs last week" />
        <StatCard title="Low Stock Items" value={lowStockCount} icon={AlertTriangle} trend={lowStockCount > 3 ? 15 : -5} trendLabel="low items" />
        <StatCard title="Pending Inbounds" value={pendingInbounds} icon={ArrowDownToLine} />
        <StatCard title="Pending Orders" value={pendingOutbounds} icon={ArrowUpFromLine} />
        <StatCard title="Active Movements" value={movements.length} icon={Activity} />
        <StatCard title="Fulfillment Rate" value="98.7%" icon={CheckCircle2} trend={0.5} />
      </div>

      {/* Quick Action Control Bar */}
      <Card className="bg-[#0071C1] text-white border-none shadow-sm">
        <CardContent className="p-6">
          <h2 className="font-semibold text-lg mb-3 flex items-center gap-2 text-white">
            <ShieldAlert className="w-5 h-5 text-blue-200" />
            Quick Management Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <Button className="bg-white/10 hover:bg-white/20 border-white/10 text-white text-xs font-semibold justify-center py-2.5" onClick={() => handleQuickAction('/warehouse')}>
              Add Warehouse
            </Button>
            <Button className="bg-white/10 hover:bg-white/20 border-white/10 text-white text-xs font-semibold justify-center py-2.5" onClick={() => handleQuickAction('/zones-bins')}>
              Add Zone
            </Button>
            <Button className="bg-white/10 hover:bg-white/20 border-white/10 text-white text-xs font-semibold justify-center py-2.5" onClick={() => handleQuickAction('/zones-bins')}>
              Add Bin
            </Button>
            <Button className="bg-white/10 hover:bg-white/20 border-white/10 text-white text-xs font-semibold justify-center py-2.5" onClick={() => handleQuickAction('/inventory')}>
              View Inventory
            </Button>
            <Button className="bg-white/10 hover:bg-white/20 border-white/10 text-white text-xs font-semibold justify-center py-2.5" onClick={() => handleQuickAction('/digital-twin')}>
              Open Digital Twin
            </Button>
            <Button className="bg-white text-[#0071C1] hover:bg-gray-100 border-none text-xs font-bold justify-center py-2.5" onClick={() => handleQuickAction('/ai-recommendations')}>
              Review AI Suggests
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Data listings & Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Inventory updates & staff activities */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Inventory */}
          <Card className="h-fit">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
              <CardTitle>Recent Inventory Updates</CardTitle>
              <Button variant="ghost" size="sm" className="text-[#0071C1]" onClick={() => handleQuickAction('/inventory')}>
                View All Inventory
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <InventoryTable data={recentInventory} />
            </CardContent>
          </Card>

          {/* Recent staff activities feed */}
          <Card>
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                Recent Staff Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {movements.slice(0, 3).map((mov, i) => (
                  <div key={i} className="flex justify-between items-start border-b border-gray-50 pb-3 last:border-0 last:pb-0 text-sm">
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900">{mov.user}</div>
                      <div className="text-gray-500 text-xs">
                        Completed {mov.type} of {mov.item} ({mov.sku}) to <span className="font-mono text-blue-700 bg-blue-50 px-1 rounded">{mov.to}</span>.
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold">{mov.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Inbound vs Outbound visual chart */}
          <Card>
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle>Inbound vs Outbound Receiving Ratio</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between text-xs text-gray-500 font-semibold">
                <span>Inbound Receiving Tasks: {pendingInbounds} Active</span>
                <span>Customer Orders: {pendingOutbounds} Active</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden flex">
                <div className="bg-[#0071C1] h-4" style={{ width: `${(pendingInbounds / (pendingInbounds + pendingOutbounds || 1)) * 100}%` }}></div>
                <div className="bg-amber-500 h-4" style={{ width: `${(pendingOutbounds / (pendingInbounds + pendingOutbounds || 1)) * 100}%` }}></div>
              </div>
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-[#0071C1]">● Inbound Receiving ({Math.round((pendingInbounds / (pendingInbounds + pendingOutbounds || 1)) * 100)}%)</span>
                <span className="text-amber-500">● Customer Orders ({Math.round((pendingOutbounds / (pendingInbounds + pendingOutbounds || 1)) * 100)}%)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI recommendations, low stock widgets, and digital twin widgets */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* AI Recommendations Preview */}
          <Card className="border-t-4 border-t-[#0071C1]">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                AI Optimization Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {aiRecommendations.slice(0, 2).map((rec) => (
                <div key={rec.id} className="p-3 bg-blue-50/20 border border-blue-100 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-900">{rec.title}</span>
                    <Badge variant={rec.priority === 'High' ? 'error' : 'warning'}>{rec.confidence}% confidence</Badge>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-normal">{rec.reason}</p>
                  <Button variant="ghost" className="text-blue-600 text-[10px] font-bold p-0 justify-start hover:bg-transparent" onClick={() => handleQuickAction('/ai-recommendations')}>
                    Review Suggestion →
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Zone Utilization */}
          <Card>
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle>Zone Space Utilization</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {zones.map((zone) => (
                <div key={zone.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-900">{zone.name} ({zone.type})</span>
                    <span className={zone.capacityPercent > 80 ? 'text-red-600' : 'text-gray-500'}>
                      {zone.capacityPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${zone.capacityPercent > 80 ? 'bg-red-500' : zone.capacityPercent > 60 ? 'bg-amber-500' : 'bg-green-500'}`}
                      style={{ width: `${zone.capacityPercent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Mini 3D layout map preview */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Map className="w-5 h-5 text-blue-600" />
                Digital Twin Map
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="w-full h-32 bg-slate-950 rounded-xl relative flex items-center justify-center border border-slate-800">
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                <div className="z-10 text-center text-xs space-y-2">
                  <div className="font-bold text-slate-300">Layout: Central Fulfillment A</div>
                  <div className="flex gap-2 justify-center text-[10px]">
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">Zone A</span>
                    <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">Zone B</span>
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">Zone C</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full text-xs justify-center gap-1.5" onClick={() => handleQuickAction('/digital-twin')}>
                View Live digital twin layout
              </Button>
            </CardContent>
          </Card>

          {/* Recent Audit Logs */}
          <Card>
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle>Recent Audit Trail</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50 text-xs">
                {auditLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="p-3 space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900">{log.action}</span>
                      <span className="text-gray-400">{log.timestamp.slice(11, 16)}</span>
                    </div>
                    <p className="text-gray-500 leading-normal">{log.details}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
