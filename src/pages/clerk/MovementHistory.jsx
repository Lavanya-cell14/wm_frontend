import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  Badge, 
  Button, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  SearchFilterBar 
} from 'shared-ui';
import Pagination from '../../components/ui/Pagination';
import { Activity, FileDown, Clock, MessageSquare } from 'lucide-react';

export default function MovementHistory() {
  const { movements } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Standardized types list
  const normalizedTypes = [
    'All',
    'OCR_CREATED',
    'INBOUND_RECEIVED',
    'STOCK_ADJUSTED',
    'DAMAGED_REPORTED',
    'RESERVED',
    'PUTAWAY_COMPLETED',
    'MANUAL_CORRECTION'
  ];

  // Helper to map dynamic context types to standard movement types
  const getNormalizedType = (type) => {
    const t = String(type).toUpperCase();
    if (t === 'OCR_CREATED') return 'OCR_CREATED';
    if (t === 'INBOUND_RECEIVED') return 'INBOUND_RECEIVED';
    if (t.includes('CYCLE') || t.includes('ADJUST') || t === 'STOCK_ADJUSTED') return 'STOCK_ADJUSTED';
    if (t.includes('DAMAGE') || t.includes('QUARANTINE')) return 'DAMAGED_REPORTED';
    if (t.includes('RESERV') || t.includes('HOLD')) return 'RESERVED';
    if (t.includes('PUTAWAY')) return 'PUTAWAY_COMPLETED';
    return 'MANUAL_CORRECTION';
  };

  // Reset pagination to page 1 when search/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType]);

  // Filtering Logic
  const filteredMovements = movements.filter(mov => {
    const normType = getNormalizedType(mov.type);
    
    const matchesSearch = 
      mov.item.toLowerCase().includes(searchQuery.toLowerCase()) || 
      mov.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mov.user && mov.user.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (mov.reason && mov.reason.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === 'All' || normType === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Pagination parameters
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
  const paginatedMovements = filteredMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-[#0071C1]" />
            Stock Movement & Transaction Ledger
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time audit telemetry tracking all physical inventory relocations and virtual pool balance updates.
          </p>
        </div>
        <Button variant="outline" className="gap-2 text-xs font-semibold" onClick={() => {}}>
          <FileDown className="w-3.5 h-3.5" />
          Export Ledger (CSV)
        </Button>
      </div>

      {/* Filter and Search controls */}
      <div className="space-y-3">
        <SearchFilterBar 
          searchPlaceholder="Search movements by SKU, product name, staff, or reason..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <Card className="border border-gray-100 shadow-xs">
          <CardContent className="p-4 flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-gray-500 uppercase tracking-wider block text-[10px]">Filter by Movement Type:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {normalizedTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedType === type 
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {type === 'All' ? 'All Transactions' : type.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Movements Table Ledger */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-slate-50/50 flex flex-row justify-between items-center pb-4">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">Historical Movement Registry</CardTitle>
            <CardDescription>Secure, immutable logs mapping internal stock telemetry.</CardDescription>
          </div>
          <Badge variant="outline">{filteredMovements.length} Records</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Movement ID</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Product Title</TableHead>
                <TableHead>Movement Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>From Location</TableHead>
                <TableHead>To Location</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Date/Time</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-12 text-gray-500 text-sm font-medium">
                    No movements logged matching the filter specifications.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMovements.map((mov) => {
                  const isPositive = mov.qty > 0;
                  const normType = getNormalizedType(mov.type);
                  
                  let badgeVariant = 'success';
                  if (mov.status === 'Assigned' || mov.status === 'In Progress') badgeVariant = 'warning';
                  else if (mov.status === 'Failed') badgeVariant = 'error';

                  return (
                    <TableRow key={mov.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Movement ID */}
                      <TableCell className="font-bold text-gray-900 text-xs font-mono">
                        {mov.id}
                      </TableCell>

                      {/* SKU */}
                      <TableCell className="font-mono text-[11px] text-gray-500">
                        {mov.sku}
                      </TableCell>

                      {/* Product Title */}
                      <TableCell className="font-semibold text-gray-900 text-xs">
                        {mov.item}
                      </TableCell>

                      {/* Movement Type */}
                      <TableCell>
                        <span className="text-[9px] font-bold text-slate-500 tracking-wide bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono">
                          {normType}
                        </span>
                      </TableCell>
                      
                      {/* Quantity */}
                      <TableCell className="text-xs font-bold font-mono text-center">
                        <span className={isPositive ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded' : 'text-red-700 bg-red-50 px-1.5 py-0.5 rounded'}>
                          {isPositive ? `+${mov.qty}` : mov.qty}
                        </span>
                      </TableCell>
                      
                      {/* From Location */}
                      <TableCell className="font-mono text-xs text-gray-600">
                        {mov.from}
                      </TableCell>
                      
                      {/* To Location */}
                      <TableCell>
                        <span className="font-mono text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 font-semibold">
                          {mov.to}
                        </span>
                      </TableCell>
                      
                      {/* Performed By */}
                      <TableCell className="text-xs text-gray-600 font-mono truncate max-w-[100px]" title={mov.user}>
                        {mov.user || 'system'}
                      </TableCell>
                      
                      {/* Date/Time */}
                      <TableCell className="text-xs text-gray-400 font-mono whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {mov.time || 'Today'}
                        </span>
                      </TableCell>

                      {/* Reason */}
                      <TableCell className="max-w-[150px] truncate text-xs text-gray-600" title={mov.reason}>
                        <span className="flex items-center gap-1 text-[11px]">
                          <MessageSquare className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          {mov.reason || 'Inventory correction'}
                        </span>
                      </TableCell>
                      
                      {/* Status */}
                      <TableCell>
                        <Badge variant={badgeVariant} className="text-[10px] font-semibold">
                          {mov.status || 'Completed'}
                        </Badge>
                      </TableCell>

                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredMovements.length}
            pageSize={itemsPerPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
