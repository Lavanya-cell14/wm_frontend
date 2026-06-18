import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  StatusBadge, 
  AlertBanner,
  Pagination,
  Modal,
  SearchFilterBar
} from 'shared-ui';
import { Box, Wrench, AlertTriangle, Package, ShieldCheck, Eye, Search, Clock } from 'lucide-react';

export default function InventoryList() {
  const navigate = useNavigate();
  const { inventory, zones } = useWarehouse();
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);

  const categories = ['All', ...new Set(inventory.map(item => item.category))];
  const activeZones = ['All', ...new Set(zones.map(z => z.name))];

  // Reset pagination to page 1 when search/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedZone, selectedStatus]);

  // Status mapping helper
  const getItemStatus = (item) => {
    const available = Math.max(0, item.quantity - (item.reserved || 0) - (item.damaged || 0));
    
    if (item.status === 'PENDING_PUTAWAY') {
      return 'PENDING_PUTAWAY';
    }
    if (item.status === 'WAITING_FOR_BIN_ASSIGNMENT' || item.bin === 'Pending Bin') {
      return 'WAITING_FOR_BIN_ASSIGNMENT';
    }
    if (available === 0 && item.quantity > 0) {
      if (item.damaged > 0 && item.damaged === item.quantity) return 'DAMAGED';
      if (item.reserved > 0 && item.reserved === item.quantity) return 'RESERVED';
    }
    if (item.quantity === 0) {
      return 'OUT_OF_STOCK';
    }
    if (item.quantity <= item.reorderLevel) {
      return 'LOW_STOCK';
    }
    return 'AVAILABLE';
  };

  // Filtering Logic
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesZone = selectedZone === 'All' || item.zone === selectedZone;
    
    const status = getItemStatus(item);
    const matchesStatus = selectedStatus === 'All' || status === selectedStatus;

    return matchesSearch && matchesCategory && matchesZone && matchesStatus;
  });

  // Pagination parameters
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-50 text-green-700 border-green-200';
      case 'LOW_STOCK': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'OUT_OF_STOCK': return 'bg-red-50 text-red-700 border-red-200';
      case 'RESERVED': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DAMAGED': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'WAITING_FOR_BIN_ASSIGNMENT': return 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse';
      case 'PENDING_PUTAWAY': return 'bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'Available';
      case 'LOW_STOCK': return 'Low Stock';
      case 'OUT_OF_STOCK': return 'Out of Stock';
      case 'RESERVED': return 'Reserved';
      case 'DAMAGED': return 'Quarantined';
      case 'WAITING_FOR_BIN_ASSIGNMENT': return 'Waiting for Bin Assignment';
      case 'PENDING_PUTAWAY': return 'Pending Putaway';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Box className="w-7 h-7 text-[#0071C1]" />
          Master Inventory List
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Perform digital cycle counts, view bin storage allocations, and analyze physical inventory reserves.
        </p>
      </div>

      {/* Dynamic Search & Filtering Panel */}
      <div className="space-y-3">
        <SearchFilterBar 
          searchPlaceholder="Search stock by SKU, product name, or barcode..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <Card className="border border-gray-100 shadow-xs">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wider block text-[10px]">Category</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)} 
                  className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wider block text-[10px]">Warehouse Zone</label>
                <select 
                  value={selectedZone} 
                  onChange={(e) => setSelectedZone(e.target.value)} 
                  className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                >
                  {activeZones.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wider block text-[10px]">Stock Status</label>
                <select 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value)} 
                  className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                >
                  <option value="All">All Statuses</option>
                  <option value="AVAILABLE">AVAILABLE (Healthy)</option>
                  <option value="LOW_STOCK">LOW STOCK</option>
                  <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                  <option value="RESERVED">RESERVED</option>
                  <option value="DAMAGED">DAMAGED (Quarantined)</option>
                  <option value="WAITING_FOR_BIN_ASSIGNMENT">WAITING BIN ALLOCATION</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Inventory Tabular Ledger */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-gray-100 flex flex-row justify-between items-center bg-slate-50/50">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">Inventory Registry Ledger</CardTitle>
            <CardDescription>Live database counts showing physical vs. allocatable units.</CardDescription>
          </div>
          <Badge variant="primary">{filteredInventory.length} SKUs Found</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Available Qty</TableHead>
                <TableHead>Current Location/Bin</TableHead>
                <TableHead>Stock Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500 text-sm font-medium">
                    No items match the current search or filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInventory.map((item) => {
                  const available = Math.max(0, item.quantity - (item.reserved || 0) - (item.damaged || 0));
                  const status = getItemStatus(item);

                  return (
                    <TableRow key={item.sku} className="hover:bg-gray-50/50 transition-colors">
                      {/* SKU */}
                      <TableCell className="font-mono text-[11px] font-bold text-slate-800">
                        {item.sku}
                      </TableCell>

                      {/* Product Name */}
                      <TableCell className="font-semibold text-gray-900 text-xs">
                        {item.name}
                      </TableCell>
                      
                      {/* Category */}
                      <TableCell className="text-xs text-gray-600 font-medium">
                        {item.category}
                      </TableCell>

                      {/* Available Qty */}
                      <TableCell className="font-bold text-emerald-700 text-xs">
                        {available} Units
                      </TableCell>
                      
                      {/* Location/Bin */}
                      <TableCell>
                        <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                          item.bin === 'Pending Bin' 
                            ? 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                          {item.bin}
                        </span>
                      </TableCell>
                      
                      {/* Stock Status */}
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusColor(status)}`}>
                          {getStatusLabel(status)}
                        </span>
                      </TableCell>
                      
                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex gap-1.5 justify-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[11px] h-7 px-2 font-medium bg-[#F4FCFF] border-blue-100 text-blue-700 hover:bg-blue-50"
                            onClick={() => setSelectedItemForModal(item)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-blue-500" />
                            View Details
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[11px] h-7 px-2 font-medium"
                            onClick={() => navigate('/inventory/adjust', { state: { sku: item.sku } })}
                          >
                            <Wrench className="w-3.5 h-3.5 text-gray-400 mr-1" />
                            Adjust
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[11px] h-7 px-2 font-medium text-red-600 border-red-100 hover:bg-red-50"
                            onClick={() => navigate('/inventory/damaged', { state: { sku: item.sku } })}
                          >
                            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                            Damage
                          </Button>
                        </div>
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
            totalItems={filteredInventory.length}
            pageSize={itemsPerPage}
          />
        </CardContent>
      </Card>

      {/* VIEW DETAILS MODAL */}
      {selectedItemForModal && (
        <Modal
          isOpen={!!selectedItemForModal}
          onClose={() => setSelectedItemForModal(null)}
          title={`Digital Passport: ${selectedItemForModal.name}`}
          maxWidth="max-w-xl"
          footer={
            <Button onClick={() => setSelectedItemForModal(null)}>Close Passport</Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">SKU Barcode</span>
                <div className="text-base font-bold font-mono mt-0.5">{selectedItemForModal.sku}</div>
              </div>
              <Badge variant="success" className="text-[10px] uppercase font-bold">
                {getStatusLabel(getItemStatus(selectedItemForModal))}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider block">Physical Dimensions</span>
                <span className="text-slate-800 font-semibold text-xs mt-1 block">{selectedItemForModal.dimensions || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider block">Unit Net Weight</span>
                <span className="text-slate-800 font-semibold text-xs mt-1 block">{selectedItemForModal.weight || 'N/A'}</span>
              </div>
            </div>

            <div className="p-4 border border-gray-100 rounded-2xl space-y-3 bg-white">
              <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-1.5 uppercase text-[10px] tracking-wider text-[#0071C1]">Quantity Allocations</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-50/50 rounded-lg">
                  <div className="font-bold text-slate-800 text-sm">{selectedItemForModal.quantity}</div>
                  <div className="text-[9px] text-gray-400 uppercase font-semibold mt-0.5">Total Qty</div>
                </div>
                <div className="p-2 bg-purple-50/40 rounded-lg">
                  <div className="font-bold text-purple-700 text-sm">{selectedItemForModal.reserved || 0}</div>
                  <div className="text-[9px] text-purple-400 uppercase font-semibold mt-0.5">Reserved</div>
                </div>
                <div className="p-2 bg-rose-50/40 rounded-lg">
                  <div className="font-bold text-rose-700 text-sm">{selectedItemForModal.damaged || 0}</div>
                  <div className="text-[9px] text-rose-400 uppercase font-semibold mt-0.5">Damaged</div>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-100 rounded-2xl bg-white space-y-2">
              <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-1.5 uppercase text-[10px] tracking-wider text-indigo-600">Location Mapping</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>Zone Location: <span className="font-bold text-slate-900">{selectedItemForModal.zone || 'Zone A'}</span></div>
                <div>Storage Bin: <span className="font-bold font-mono text-blue-700">{selectedItemForModal.bin}</span></div>
                <div>Rack Identifier: <span className="font-bold text-slate-900">{selectedItemForModal.rack || 'RACK-001'}</span></div>
                <div>Shelf Level: <span className="font-bold text-slate-900">{selectedItemForModal.shelf || 'S-01'}</span></div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 justify-center text-[10px] text-gray-400 font-mono mt-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Last updated: {selectedItemForModal.lastUpdated || 'Just checked'}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
