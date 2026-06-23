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
  StatCard,
  SearchFilterBar,
  Pagination
} from 'shared-ui';
import { Network, ChevronRight, Eye, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AllocationsPage() {
  const navigate = useNavigate();
  const { 
    inboundReceipts = [], 
    aiRecommendations = [], 
    workers = [], 
    assignPutawayTask 
  } = useWarehouse();
  
  console.log('[Dispatch] users/workers count', workers.length);
  console.log('[Dispatch] sample user/worker', workers[0]);

  const mapRoleLabel = (role) => {
    if (!role) return 'Warehouse Operator';
    const r = role.toUpperCase();
    if (r === 'ADMIN') return 'Administrator';
    if (r === 'MANAGER' || r === 'WAREHOUSE_MANAGER') return 'Warehouse Manager';
    if (r === 'STAFF' || r === 'OPERATOR' || r === 'WAREHOUSE_OPERATOR') return 'Warehouse Operator';
    return role;
  };

  const getOperatorDisplayLabel = (w, idx) => {
    const mappedRole = mapRoleLabel(w.role);
    const firstName = (w.first_name || '').trim();
    const lastName = (w.last_name || '').trim();
    if (firstName && lastName) {
      return `${firstName} ${lastName} — ${mappedRole}`;
    } else if (firstName) {
      return `${firstName} — ${mappedRole}`;
    } else if (lastName) {
      return `${lastName} — ${mappedRole}`;
    }
    return `Operator ${idx + 1} — Warehouse Operator`;
  };

  // Robust operator list selection
  const getFilteredOperators = () => {
    // 1. First priority: users with role WAREHOUSE_OPERATOR or OPERATOR
    let ops = workers.filter(w => w.role === 'WAREHOUSE_OPERATOR' || w.role === 'OPERATOR');
    
    // 2. Second priority: include users with role STAFF / staff if no operator role exists
    if (ops.length === 0) {
      ops = workers.filter(w => w.role === 'STAFF' || w.role === 'staff');
    }
    
    // 3. Third priority: include any available worker/user as final fallback for demo
    if (ops.length === 0) {
      ops = workers;
    }
    
    // Hide users whose username contains "admin" unless explicitly an operator
    let filteredOps = ops.filter(w => {
      const username = (w.username || w.name || '').toLowerCase();
      const isExplicitOp = w.role === 'WAREHOUSE_OPERATOR' || w.role === 'OPERATOR';
      if (username.includes('admin') && !isExplicitOp) {
        return false;
      }
      return true;
    });

    if (filteredOps.length === 0 && ops.length > 0) {
      return ops;
    }
    return filteredOps;
  };

  const filteredOperators = getFilteredOperators();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal / Dispatch Form state
  const [dispatchItem, setDispatchItem] = useState(null);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('Medium');

  // Filter items that have bin allocations
  const allocatedItems = inboundReceipts.filter(receipt => {
    const rec = aiRecommendations.find(a => a.inboundId === receipt.id) || {};
    const hasBin = receipt.bin || rec.bin;
    
    const matchesSearch = 
      receipt.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      receipt.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (receipt.bin && receipt.bin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.bin && rec.bin.toLowerCase().includes(searchQuery.toLowerCase()));

    return hasBin && matchesSearch;
  });

  const allocations = allocatedItems;
  console.log('[Allocations] active allocations count', allocations.length);

  const totalPages = Math.max(1, Math.ceil(allocations.length / pageSize));
  const paginatedAllocated = allocations.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStorageStatusInfo = (status) => {
    switch (status) {
      case 'STORED':
        return { label: 'Stored', variant: 'success' };
      case 'IN_PROGRESS':
      case 'ASSIGNED_TO_STAFF':
        return { label: 'In Progress', variant: 'warning' };
      default:
        return { label: 'Allocated', variant: 'primary' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section with breadcrumb trail */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <span>Receiving & Inventory Officer</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#0071C1]">Allocations</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Network className="w-7 h-7 text-[#0071C1]" />
            Bin Allocation Monitor
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor real-time coordinates, shelf levels, and physical storage transit statuses of active allocations.
          </p>
        </div>
      </div>

      {/* Info banner explaining status stages */}
      <Card className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-100/30">
        <CardContent className="p-4 flex gap-3 items-start">
          <div className="p-2 bg-blue-100/60 rounded-lg text-blue-700">
            <Info className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">Allocation Life Cycle: </span>
            <span className="font-semibold text-slate-800">Allocated</span> (Slot assigned and awaiting staff pick) &rarr; <span className="font-semibold text-slate-800">In Progress</span> (Staff operator walking to destination) &rarr; <span className="font-semibold text-slate-800">Stored</span> (Barcode scanned at bin and committed to stock balance).
          </div>
        </CardContent>
      </Card>

      {/* Search Toolbar */}
      <div className="space-y-3">
        <SearchFilterBar 
          searchPlaceholder="Search active allocations by SKU, name, or bin..." 
          searchValue={searchQuery}
          onSearchChange={setSearchQuery} 
        />
      </div>

      {/* Allocations Table */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Zone Group</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Aisle</TableHead>
                <TableHead>Rack</TableHead>
                <TableHead>Shelf</TableHead>
                <TableHead>Bin</TableHead>
                <TableHead>Storage Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAllocated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-gray-500 font-semibold text-xs">
                    No active bin allocations recorded.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAllocated.map((receipt) => {
                  const rec = aiRecommendations.find(a => a.inboundId === receipt.id) || {};
                  const bin = receipt.bin || rec.bin || 'Unassigned';
                  const zone = receipt.zone || rec.zone || 'Unassigned';
                  const rack = receipt.rack || rec.rack || 'Unassigned';
                  const shelf = receipt.shelf || rec.shelf || 'Unassigned';
                  
                  // Derivations for layout parts
                  const zoneGroup = zone === 'Zone D' ? 'Cold Storage ZG' : 'Ambient Storage ZG';
                  const aisle = zone === 'Zone C' ? 'Aisle 3' : 'Aisle 1';

                  const statusInfo = getStorageStatusInfo(receipt.status);

                  return (
                    <TableRow key={receipt.id} className="hover:bg-slate-50/20 transition-colors">
                      <TableCell>
                        <div className="font-bold text-gray-900 text-xs">{receipt.productName}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">SKU: {receipt.sku} | Qty: {receipt.verifiedQuantity || receipt.quantityReceived}</div>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-700">{zoneGroup}</TableCell>
                      <TableCell className="text-xs text-slate-700 font-semibold">{zone}</TableCell>
                      <TableCell className="text-xs text-slate-700 font-semibold font-mono">{aisle}</TableCell>
                      <TableCell className="text-xs text-slate-700 font-semibold font-mono">{rack}</TableCell>
                      <TableCell className="text-xs text-slate-700 font-semibold">{shelf}</TableCell>
                      <TableCell className="font-mono text-xs text-blue-700 font-bold bg-blue-50/40 px-2 py-0.5 rounded border border-blue-100/40 w-fit">
                        {bin}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="text-[9px] uppercase font-bold">
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          {!['ASSIGNED_TO_STAFF', 'IN_PROGRESS', 'PICKED_FROM_RECEIVING', 'REACHED_BIN', 'STORED', 'COMPLETED'].includes(receipt.status) && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="text-[11px] h-7 px-2 font-bold bg-[#0071C1] hover:bg-[#005c9e] text-white flex items-center gap-1"
                              onClick={() => {
                                setDispatchItem(receipt);
                                if (filteredOperators.length > 0) {
                                  setSelectedOperator(`${filteredOperators[0].id}|${filteredOperators[0].name}`);
                                }
                              }}
                            >
                              Dispatch Operator
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[11px] h-7 px-2 font-semibold"
                            onClick={() => navigate(`/inventory/inbound`)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Inspect Inbound
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <div className="p-4 border-t border-gray-100">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={allocations.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dispatch Modal overlay */}
      {dispatchItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-100 overflow-hidden transform scale-in">
            <div className="p-5 bg-[#0071C1] text-white">
              <h3 className="text-sm font-bold uppercase tracking-wider">Dispatch Putaway Instructions</h3>
              <p className="text-[11px] text-white/80 mt-1">Assign an operator to pick items from Receiving Dock and execute the putaway task.</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-1.5 text-xs text-slate-700 font-semibold">
                <div>Receipt Ref: <span className="font-mono text-slate-900">{dispatchItem.id}</span></div>
                <div>Product: <span className="text-slate-900">{dispatchItem.productName}</span></div>
                <div>SKU: <span className="font-mono text-slate-900">{dispatchItem.sku}</span></div>
                <div>Quantity: <span className="text-slate-900">{dispatchItem.verifiedQuantity || dispatchItem.quantityReceived}</span></div>
                <div>Allocated Bin: <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50">{dispatchItem.bin || dispatchItem.allocatedBin}</span></div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1.5 uppercase">Assign Operator *</label>
                <select 
                  value={selectedOperator}
                  onChange={(e) => setSelectedOperator(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0071C1]"
                >
                  {filteredOperators.length === 0 ? (
                    <option value="" disabled>No operators loaded. Check /api/users/ or create operator user.</option>
                  ) : (
                    <>
                      <option value="" disabled>Select Operator...</option>
                      {filteredOperators.map((w, idx) => (
                        <option key={w.id} value={`${w.id}|${w.name}`}>{getOperatorDisplayLabel(w, idx)}</option>
                      ))}
                    </>
                  )}
                </select>
                {filteredOperators.length === 0 && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">
                    No operators loaded. Check /api/users/ or create operator user.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1.5 uppercase">Priority Level</label>
                <select 
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0071C1]"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 font-semibold"
                onClick={() => {
                  setDispatchItem(null);
                  setSelectedOperator('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-xs h-9 bg-[#0071C1] hover:bg-[#005c9e] text-white font-bold"
                onClick={() => {
                  if (!selectedOperator) return;
                  const [opId, opName] = selectedOperator.split('|');
                  const rec = aiRecommendations.find(a => a.inboundId === dispatchItem.id) || {};
                  
                  // Dispatches the putaway task and moves receipt status to ASSIGNED_TO_STAFF
                  assignPutawayTask(dispatchItem.id, opId, opName, selectedPriority, rec);
                  
                  setDispatchItem(null);
                  setSelectedOperator('');
                }}
                disabled={!selectedOperator}
              >
                Dispatch Directives
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
