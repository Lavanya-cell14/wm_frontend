import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Pagination, SearchFilterBar, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared-ui';
import { Activity, Clock, MapPin, ArrowRightLeft, Eye, Navigation, Filter } from 'lucide-react';

export default function MovementTracking() {
  const { movements } = useWarehouse();
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRouteModal, setActiveRouteModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filters
  const filteredMovements = movements.filter(mov => {
    const typeLower = mov.type ? mov.type.toLowerCase() : '';
    const matchesType = filterType === 'All' || 
      typeLower === filterType.toLowerCase() ||
      (filterType === 'Putaway' && (typeLower.startsWith('putaway_') || typeLower === 'putaway' || typeLower === 'inbound_received')) ||
      (filterType === 'Picking' && (typeLower.startsWith('picking_') || typeLower === 'picking')) ||
      (filterType === 'Issue' && typeLower === 'issue_reported');
      
    const matchesSearch = searchQuery === '' || 
      mov.item.toLowerCase().includes(searchQuery.toLowerCase()) || 
      mov.sku.toLowerCase().includes(searchQuery.toLowerCase()) || 
      mov.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mov.taskId && mov.taskId.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return matchesType && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredMovements.length / pageSize));

  // Reset page when filters/search change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchQuery]);

  const pagedMovements = filteredMovements.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-[#0071C1]" />
            Movement History & Tracking
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time auditable history of all product inventory adjustments, pickings, and putaways.
          </p>
        </div>
      </div>

      {/* Filter Options Panel */}
      <Card className="border border-gray-100 shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <SearchFilterBar 
              placeholder="Search movements by ID, task ID, product, SKU..." 
              onSearch={(val) => setSearchQuery(val)} 
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
            {['All', 'Putaway', 'Picking', 'Reallocation', 'Issue'].map((type) => (
              <Button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  filterType === type 
                    ? 'bg-slate-900 border-slate-900 text-white' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {type}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Movement list & Live Feed timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Movements Table */}
        <div className="xl:col-span-2">
          <Card className="border border-gray-100 shadow-xs">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#0071C1]" />
                Movement Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredMovements.length === 0 ? (
                <div className="p-12 text-center text-gray-500 text-sm">
                  No movements match the active filter criteria.
                </div>
              ) : (
                <><Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Movement ID</TableHead>
                      <TableHead>Task ID</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Movement Type</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>From / To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedMovements.map((mov) => {
                      let typeLabel = mov.type ? mov.type.replace(/_/g, ' ') : 'Movement';
                      let statusLabel = mov.status || 'Completed';
                      let statusVariant = 'default';

                      const tUpper = mov.type ? mov.type.toUpperCase() : '';
                      if (tUpper === 'PUTAWAY_ASSIGNED') {
                        statusLabel = 'Assigned';
                        statusVariant = 'warning';
                      } else if (tUpper === 'PUTAWAY_STARTED') {
                        statusLabel = 'In Progress';
                        statusVariant = 'primary';
                      } else if (tUpper === 'PICKED_FROM_RECEIVING') {
                        statusLabel = 'Picked';
                        statusVariant = 'secondary';
                      } else if (tUpper === 'REACHED_BIN') {
                        statusLabel = 'Reached Bin';
                        statusVariant = 'secondary';
                      } else if (tUpper === 'PUTAWAY_COMPLETED') {
                        statusLabel = 'Completed';
                        statusVariant = 'success';
                      } else if (tUpper === 'ISSUE_REPORTED') {
                        statusLabel = 'Delayed';
                        statusVariant = 'error';
                      } else if (mov.status === 'Completed' || mov.status === 'success') {
                        statusVariant = 'success';
                      }

                      return (
                        <TableRow key={mov.id}>
                          <TableCell className="font-bold text-gray-950 font-mono text-xs">{mov.id}</TableCell>
                          <TableCell className="font-bold text-gray-400 font-mono text-xs">{mov.taskId || 'N/A'}</TableCell>
                          <TableCell className="font-semibold text-gray-700 font-mono text-xs">{mov.sku}</TableCell>
                          <TableCell className="font-bold text-gray-950 text-xs">{mov.item}</TableCell>
                          <TableCell>
                            <Badge variant={tUpper.includes('PUTAWAY') ? 'primary' : tUpper.includes('ISSUE') ? 'error' : 'secondary'} className="text-[10px] uppercase font-bold">
                              {typeLabel}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-gray-950 text-xs">{mov.qty || 1} Units</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              <span className="font-semibold font-mono text-[10px]">{mov.from}</span>
                              <ArrowRightLeft className="w-3 h-3 text-gray-400" />
                              <span className="font-semibold font-mono text-blue-700 bg-blue-50 px-1 rounded border border-blue-100">{mov.to}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant} className="text-[10px] font-bold">
                              {statusLabel}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-500 text-[10px] font-semibold font-mono">
                            {mov.timestamp ? new Date(mov.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : mov.time || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1.5 justify-end">
                              <Button variant="outline" size="sm" className="p-1 px-2 text-[10px] font-bold" onClick={() => setActiveRouteModal(mov)}>
                                <Navigation className="w-3 h-3" /> Route
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <div className="px-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredMovements.length}
                    pageSize={pageSize}
                    onPageChange={(p) => setCurrentPage(Math.max(1, Math.min(totalPages, p)))}
                  />
                </div></>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Timeline Column */}
        <div className="xl:col-span-1">
          <Card className="border border-gray-100 shadow-xs h-full">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Live Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="relative border-l-2 border-slate-100 pl-4 space-y-6">
                {movements.map((mov, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600"></span>
                    <div className="text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-gray-900">{mov.item}</span>
                        <span className="text-gray-400 text-[10px] font-medium">{mov.time}</span>
                      </div>
                      <p className="text-gray-500 text-[11px] mb-1">
                        Dispatched from <span className="font-mono text-gray-700">{mov.from}</span> and stored into <span className="font-mono font-bold text-blue-600">{mov.to}</span>.
                      </p>
                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase">
                        <span>{mov.type}</span>
                        <span className="text-green-600 lowercase bg-green-50 px-1 rounded">completed</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Path preview mapping */}
      {activeRouteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm">Pathfinding route preview</h3>
                  <p className="text-xs text-slate-300">Movement ID: {activeRouteModal.id}</p>
                </div>
              </div>
              <Button className="text-slate-400 hover:text-white font-semibold text-lg" onClick={() => setActiveRouteModal(null)}>×</Button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">1</div>
                  <div>
                    <h4 className="font-semibold text-xs text-gray-900">{activeRouteModal.from}</h4>
                    <p className="text-[10px] text-gray-500">Origin pickup / dock area</p>
                  </div>
                </div>
                <div className="border-l-2 border-dashed border-blue-400 h-6 ml-3"></div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">2</div>
                  <div>
                    <h4 className="font-semibold text-xs text-gray-900">{activeRouteModal.to}</h4>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Final target bin destination</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 justify-center" onClick={() => setActiveRouteModal(null)}>
                  Close Route Map
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
