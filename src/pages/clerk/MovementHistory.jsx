import React, { useState } from 'react';
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
import { Activity, ArrowRightLeft, FileDown, Eye, Filter } from 'lucide-react';

export default function MovementHistory() {
  const { movements } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  // Types list
  const movementTypes = ['All', ...new Set(movements.map(m => m.type))];

  // Filtering Logic
  const filteredMovements = movements.filter(mov => {
    const matchesSearch = mov.item.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          mov.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          mov.user.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'All' || mov.type === selectedType;
    
    return matchesSearch && matchesType;
  });

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
          searchPlaceholder="Search movements by SKU, product name, or operator..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <Card className="border border-gray-100 shadow-xs">
          <CardContent className="p-4 flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500 uppercase tracking-wider block text-[10px]">Filter by Movement Type:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {movementTypes.map(type => (
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
                <TableHead>Timestamp / Time</TableHead>
                <TableHead>Product / SKU</TableHead>
                <TableHead>Source Location</TableHead>
                <TableHead>Destination Location</TableHead>
                <TableHead>Operator / Clerk</TableHead>
                <TableHead>Change Qty</TableHead>
                <TableHead>Workflow Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-gray-500 text-sm font-medium">
                    No movements logged matching the filter specifications.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMovements.map((mov) => {
                  const isPositive = mov.qty > 0;
                  let badgeVariant = 'success';
                  if (mov.status === 'Assigned' || mov.status === 'In Progress') badgeVariant = 'warning';
                  else if (mov.status === 'Failed') badgeVariant = 'error';

                  return (
                    <TableRow key={mov.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Movement ID */}
                      <TableCell className="font-bold text-gray-900 text-xs font-mono">
                        {mov.id}
                      </TableCell>
                      
                      {/* Timestamp */}
                      <TableCell className="text-xs text-gray-500 font-medium">
                        {mov.time || 'Today'}
                      </TableCell>
                      
                      {/* Product Name / SKU */}
                      <TableCell>
                        <div className="font-semibold text-gray-900 text-xs">{mov.item}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{mov.sku}</div>
                      </TableCell>
                      
                      {/* Source */}
                      <TableCell className="font-mono text-xs text-gray-600">
                        {mov.from}
                      </TableCell>
                      
                      {/* Destination */}
                      <TableCell>
                        <span className="font-mono text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 font-semibold">
                          {mov.to}
                        </span>
                      </TableCell>
                      
                      {/* Operator */}
                      <TableCell className="text-xs text-gray-600 font-medium max-w-[120px] truncate" title={mov.user}>
                        {mov.user}
                      </TableCell>
                      
                      {/* Change Qty */}
                      <TableCell className="text-xs font-bold font-mono">
                        <span className={isPositive ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded' : 'text-red-700 bg-red-50 px-1.5 py-0.5 rounded'}>
                          {isPositive ? `+${mov.qty}` : mov.qty}
                        </span>
                      </TableCell>
                      
                      {/* Workflow Type */}
                      <TableCell className="text-xs text-slate-500 font-semibold tracking-wide uppercase text-[9px]">
                        {mov.type?.replace(/_/g, ' ')}
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
        </CardContent>
      </Card>
    </div>
  );
}
