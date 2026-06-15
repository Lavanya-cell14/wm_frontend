import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import StatCard from '../components/dashboard/StatCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import StatusBadge from '../components/ui/StatusBadge';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import Pagination from '../components/ui/Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Navigation, Clock, Activity, ShieldAlert, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';

export default function RoutesOptimization() {
  const { routes } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Congestion metrics
  const congestions = [
    { aisle: 'Aisle A2', level: 'High', load: '85%', color: 'red' },
    { aisle: 'Bisle B1', level: 'Medium', load: '55%', color: 'amber' },
    { aisle: 'Cisle C4', level: 'Low', load: '20%', color: 'green' }
  ];

  // Reset pagination to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredRoutes = routes.filter(r => 
    r.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.operator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination parameters
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  const paginatedRoutes = filteredRoutes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Navigation className="w-7 h-7 text-[#0071C1]" />
          Route Pathfinding Optimization
        </h1>
        <p className="text-gray-500 text-sm mt-1">Review active staff transit lanes, optimize dispatch paths, and monitor aisle congestion levels.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Routes" value={routes.filter(r => r.status === 'Active').length} icon={Navigation} />
        <StatCard title="Completed Today" value={routes.filter(r => r.status === 'Completed').length} icon={UserCheck} />
        <StatCard title="Avg Travel Time" value="5.6 mins" icon={Clock} />
        <StatCard title="Congested Lanes" value="1 Lane" icon={ShieldAlert} />
      </div>

      {/* Aisle congestion widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table list */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-gray-100 shadow-xs">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-sm font-bold uppercase">Active Pathfinding Transits</CardTitle>
            </CardHeader>
            <div className="p-4 border-b border-gray-100">
              <SearchFilterBar 
                placeholder="Search active routes by ID or assigned staff..." 
                onSearch={(val) => setSearchQuery(val)} 
              />
            </div>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route ID</TableHead>
                    <TableHead>Origin / Destination</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Est. Duration</TableHead>
                    <TableHead>Assigned Staff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRoutes.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-bold text-gray-900 font-mono text-sm">{r.id}</TableCell>
                      <TableCell className="text-gray-600 text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-gray-700">{r.from}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-mono text-blue-700 font-bold bg-blue-50 px-1 rounded">{r.to}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-gray-900 text-xs">{r.distance}</TableCell>
                      <TableCell className="text-gray-500 text-xs font-semibold">{r.time}</TableCell>
                      <TableCell className="text-gray-600 text-sm font-semibold">{r.operator}</TableCell>
                      <TableCell>
                        <StatusBadge status={r.status === 'Active' ? 'warning' : 'success'} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="text-xs text-gray-600" onClick={() => setSelectedRoute(r)}>
                          Path Map
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredRoutes.length}
                pageSize={itemsPerPage}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right side: Traffic congestions */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Aisle Traffic Index
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {congestions.map((c) => (
                <div key={c.aisle} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900">{c.aisle}</span>
                    <span className={c.color === 'red' ? 'text-red-600' : c.color === 'amber' ? 'text-amber-600' : 'text-green-600'}>
                      {c.level} ({c.load})
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full ${c.color === 'red' ? 'bg-red-500' : c.color === 'amber' ? 'bg-amber-500' : 'bg-green-500'}`} 
                      style={{ width: `${c.load}` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Route mapping modal */}
      {selectedRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Pathfinding route: {selectedRoute.id}</h3>
              </div>
              <button type="button" className="text-slate-400 hover:text-white font-semibold text-lg" onClick={() => setSelectedRoute(null)}>×</button>
            </div>
            
            <div className="p-6 space-y-6 text-xs">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedRoute.from}</h4>
                    <p className="text-[10px] text-gray-400">Origin dispatch point</p>
                  </div>
                </div>
                <div className="border-l-2 border-dashed border-blue-400 h-6 ml-3"></div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedRoute.to}</h4>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Final target bin destination</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2.5">
                <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">Step-by-Step Route Instructions</h4>
                <div className="space-y-2 pl-1">
                  {[
                    `Initialize transit pathing from origin ${selectedRoute.from}. Check AGV status.`,
                    `Proceed straight along Main Transit Lane Alpha for 15 meters. Watch collision margins.`,
                    `Turn right toward Zone ${selectedRoute.to.includes('A') ? 'A' : selectedRoute.to.includes('B') ? 'B' : 'C'}.`,
                    `Enter target aisle coordinates and approach shelf rack level.`,
                    `Halt at destination and execute task at target bin location ${selectedRoute.to}.`
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-2 items-start text-gray-600">
                      <span className="font-bold text-gray-800 text-[10px] mt-0.5">{idx + 1}.</span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-xl space-y-1 text-blue-900 font-semibold">
                <div className="flex justify-between"><span>Transit Distance:</span> <span>{selectedRoute.distance}</span></div>
                <div className="flex justify-between"><span>Est. Duration:</span> <span>{selectedRoute.time}</span></div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2 justify-end">
              <Button onClick={() => setSelectedRoute(null)}>Close Path</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
