import React, { useState } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import StatCard from '../components/dashboard/StatCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import { BarChart3, TrendingUp, Cpu, Sparkles, Download, Layers } from 'lucide-react';

export default function Analytics() {
  const [dateRange, setDateRange] = useState('Last 7 Days');

  // Hardcode static representations of data distributions
  const trends = [
    { label: 'Mon', value: 40 },
    { label: 'Tue', value: 55 },
    { label: 'Wed', value: 85 },
    { label: 'Thu', value: 60 },
    { label: 'Fri', value: 95 },
    { label: 'Sat', value: 30 },
    { label: 'Sun', value: 45 }
  ];

  const zoneUtil = [
    { name: 'Zone A (Fast Moving)', cap: 65, color: 'bg-blue-600' },
    { name: 'Zone B (Electronics)', cap: 72, color: 'bg-emerald-600' },
    { name: 'Zone C (Bulk Storage)', cap: 88, color: 'bg-red-500' },
    { name: 'Zone D (Cold Storage)', cap: 40, color: 'bg-amber-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#0071C1]" />
            Operations Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">Audit complete stock movements metrics, facility space capacities, and staff velocities index.</p>
        </div>
        <Button className="gap-1.5 font-bold" onClick={() => alert('Operational analytics exported successfully!')}>
          <Download className="w-4 h-4" /> Export Report
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Inventory Accuracy" value="99.92%" icon={Cpu} trend={0.05} />
        <StatCard title="Fulfillment Rate" value="98.7%" icon={TrendingUp} trend={0.4} />
        <StatCard title="Picking Speed Rate" value="1.8m/s" icon={Sparkles} trend={12} />
        <StatCard title="Storage Utilization" value="84.2%" icon={Layers} />
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Transit Speed bar chart */}
        <Card className="border border-gray-100 shadow-xs">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-sm font-bold uppercase">Transit Activity Index</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64 flex items-end justify-between gap-4 pt-6">
              {trends.map((item) => (
                <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-slate-100 rounded-t-lg relative h-48 flex items-end overflow-hidden">
                    <div 
                      className="w-full bg-[#0071C1] rounded-t-lg transition-all duration-500 hover:bg-[#005c9e]"
                      style={{ height: `${item.value}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 font-semibold">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Zone Utilization Card */}
        <Card className="border border-gray-100 shadow-xs">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-sm font-bold uppercase">Space Utilization Index</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {zoneUtil.map((zone) => (
              <div key={zone.name} className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-900">{zone.name}</span>
                  <span className="text-gray-600">{zone.cap}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div 
                    className={`h-4 rounded-full ${zone.color}`} 
                    style={{ width: `${zone.cap}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
