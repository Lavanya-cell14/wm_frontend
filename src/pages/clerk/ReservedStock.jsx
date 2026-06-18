import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import { AlertBanner, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Pagination } from 'shared-ui';
import { Package, Lock, Unlock, Clock, FileText } from 'lucide-react';

export default function ReservedStock() {
  const location = useLocation();
  const { user } = useAuth();
  const { 
    inventory, 
    reservations, 
    reserveStock, 
    releaseReservation 
  } = useWarehouse();

  // Form states
  const [selectedSku, setSelectedSku] = useState('');
  const [quantity, setQuantity] = useState('');
  const [orderRef, setOrderRef] = useState('');

  // Search and Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Notification states
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    if (location.state?.sku) {
      setSelectedSku(location.state.sku);
    } else if (inventory.length > 0) {
      setSelectedSku(inventory[0].sku);
    }
  }, [location.state, inventory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const selectedItem = inventory.find(i => i.sku === selectedSku);

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleReserveSubmit = (e) => {
    e.preventDefault();
    if (!selectedSku || !quantity) {
      showToast('Please specify a SKU and a reservation quantity.', 'error');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      showToast('Reservation quantity must be a positive integer.', 'error');
      return;
    }

    const available = (selectedItem?.quantity || 0) - (selectedItem?.reserved || 0) - (selectedItem?.damaged || 0);
    if (qty > available) {
      showToast(`Cannot reserve ${qty} units. Only ${available} available units remain in stock.`, 'error');
      return;
    }

    const success = reserveStock(selectedSku, qty, { ...user, orderRef: orderRef || 'N/A' });

    if (success) {
      showToast(`Successfully created hold of ${qty} units for SKU ${selectedSku}.`, 'success');
      setQuantity('');
      setOrderRef('');
    } else {
      showToast('Failed to create reservation. Review available stock numbers.', 'error');
    }
  };

  const handleRelease = (resId) => {
    const success = releaseReservation(resId, user);
    if (success) {
      showToast(`Released reservation hold ${resId} successfully! Units restored.`, 'success');
    } else {
      showToast('Failed to release reservation.', 'error');
    }
  };

  // Filtered reservations
  const filteredReservations = reservations.filter(res => {
    const query = searchQuery.toLowerCase();
    const ref = res.orderRef || res.orderReference || 'N/A';
    return (
      res.id.toLowerCase().includes(query) ||
      res.sku.toLowerCase().includes(query) ||
      res.product.toLowerCase().includes(query) ||
      ref.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type={toastType} message={toastMessage} />
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Package className="w-7 h-7 text-purple-600" />
          Inventory Reservation Holds
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Lock items to prevent picking conflicts for premium customers, express shipments, and scheduled outbound batches.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Place Hold Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-600" />
                Place Reservation Hold
              </CardTitle>
              <CardDescription>Select an in-stock SKU and lock a specified amount for processing.</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleReserveSubmit} className="space-y-4 text-xs font-semibold text-gray-700">
                
                {/* SKU Selector */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase block text-[10px]">Product SKU</label>
                  <select 
                    value={selectedSku} 
                    onChange={(e) => setSelectedSku(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                  >
                    {inventory.map(item => {
                      const avail = item.quantity - (item.reserved || 0) - (item.damaged || 0);
                      return (
                        <option key={item.sku} value={item.sku} disabled={avail <= 0}>
                          {item.sku} - {item.name} ({avail} available)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Display Current Specs */}
                {selectedItem && (
                  <div className="p-3 bg-purple-50/15 rounded-xl border border-purple-100 space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">Product Name:</span>
                      <span className="font-bold text-gray-900 text-right">{selectedItem.name}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">Total Stocked:</span>
                      <span className="font-bold text-gray-800">{selectedItem.quantity} units</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">Currently Reserved:</span>
                      <span className="font-bold text-purple-600 font-mono">{selectedItem.reserved || 0} units</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">Net Unlocked Available:</span>
                      <span className="font-bold text-emerald-700 font-mono">
                        {selectedItem.quantity - (selectedItem.reserved || 0) - (selectedItem.damaged || 0)} units
                      </span>
                    </div>
                  </div>
                )}

                {/* Reservation Quantity */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase block text-[10px]">Reservation Quantity</label>
                  <Input 
                    type="number"
                    placeholder="e.g. 10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                    required
                    min="1"
                  />
                </div>

                {/* Order Reference */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase block text-[10px]">Order Reference / Client</label>
                  <Input 
                    type="text"
                    placeholder="e.g. ORD-98102 or Client A"
                    value={orderRef}
                    onChange={(e) => setOrderRef(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                  />
                  <p className="text-[10px] text-gray-400 font-normal italic mt-1">
                    Hold will lock this stock immediately, decrementing allocatable pools.
                  </p>
                </div>

                <Button type="submit" className="w-full bg-[#0071C1] hover:bg-blue-700 text-white justify-center mt-2">
                  Create Reservation Hold
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Active Reservations List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col justify-between">
            <div>
              <CardHeader className="border-b border-gray-100 bg-slate-50/50 flex flex-row justify-between items-center pb-4">
                <div>
                  <CardTitle className="text-base font-bold text-gray-900">Active Reservation Registry</CardTitle>
                  <CardDescription>Release allocations once outbound picking orders are finalized or shipped.</CardDescription>
                </div>
                <Badge variant="primary">{filteredReservations.length} Active holds</Badge>
              </CardHeader>
              <div className="p-4 border-b border-gray-100 bg-slate-50/10">
                <SearchFilterBar 
                  searchPlaceholder="Search active holds by ID, SKU, product, order reference..."
                  searchValue={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reservation ID</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product Title</TableHead>
                      <TableHead>Reserved Quantity</TableHead>
                      <TableHead>Order Reference</TableHead>
                      <TableHead>Reserved Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedReservations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-gray-500 text-sm font-medium">
                          No active inventory holds are recorded at this time.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedReservations.map((res) => (
                        <TableRow key={res.id} className="hover:bg-slate-50/20">
                          {/* Reservation ID */}
                          <TableCell className="font-bold text-gray-900 text-xs font-mono">
                            {res.id}
                          </TableCell>
                          
                          {/* SKU */}
                          <TableCell className="font-mono text-[11px] text-gray-500">
                            {res.sku}
                          </TableCell>

                          {/* Product Title */}
                          <TableCell className="font-semibold text-gray-900 text-xs">
                            {res.product}
                          </TableCell>
                          
                          {/* Reserved Quantity */}
                          <TableCell className="font-bold text-purple-600 text-xs font-mono text-center">
                            {res.qty}
                          </TableCell>
                          
                          {/* Order Reference */}
                          <TableCell className="text-xs text-gray-700 font-medium">
                            <span className="flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5 text-gray-400" />
                              {res.orderRef || res.orderReference || 'N/A'}
                            </span>
                          </TableCell>
                          
                          {/* Reserved Date */}
                          <TableCell className="text-xs text-gray-400 font-mono whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {new Date(res.timestamp).toISOString().split('T')[0]}
                            </span>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border border-purple-200 bg-purple-50 text-purple-700 uppercase">
                              {res.status || 'Active'}
                            </span>
                          </TableCell>

                          {/* Action */}
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-[11px] h-7 px-2 font-medium border-purple-200 hover:bg-purple-50 text-purple-700"
                              onClick={() => handleRelease(res.id)}
                            >
                              <Unlock className="w-3.5 h-3.5 mr-1" />
                              Release
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </div>
            
            {/* Pagination Placement */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredReservations.length}
                  pageSize={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
