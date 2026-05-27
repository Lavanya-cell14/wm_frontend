import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
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
  AlertBanner 
} from 'shared-ui';
import { Package, Lock, Unlock, ShieldAlert, CheckCircle } from 'lucide-react';

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

    const success = reserveStock(selectedSku, qty, user);

    if (success) {
      showToast(`Successfully created hold of ${qty} units for SKU ${selectedSku}.`, 'success');
      setQuantity('');
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
        
        {/* Left Side: Create Hold Form */}
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
                  <input 
                    type="number"
                    placeholder="e.g. 10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                    required
                    min="1"
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
          <Card className="border border-gray-100 shadow-sm overflow-hidden h-full">
            <CardHeader className="border-b border-gray-100 bg-slate-50/50 flex flex-row justify-between items-center pb-4">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">Active Reservation Registry</CardTitle>
                <CardDescription>Release allocations once outbound picking orders are finalized or shipped.</CardDescription>
              </div>
              <Badge variant="primary">{reservations.length} Active holds</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hold ID</TableHead>
                    <TableHead>Product / SKU</TableHead>
                    <TableHead>Qty Reserved</TableHead>
                    <TableHead>Reserved By</TableHead>
                    <TableHead>Hold Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-gray-500 text-sm font-medium">
                        No active inventory holds are recorded at this time.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reservations.map((res) => (
                      <TableRow key={res.id}>
                        {/* Hold ID */}
                        <TableCell className="font-bold text-gray-900 text-xs font-mono">
                          {res.id}
                        </TableCell>
                        
                        {/* Product SKU */}
                        <TableCell>
                          <div className="font-semibold text-gray-900 text-xs">{res.product}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">{res.sku}</div>
                        </TableCell>
                        
                        {/* Qty */}
                        <TableCell className="font-bold text-purple-600 text-xs font-mono">
                          {res.qty} units
                        </TableCell>
                        
                        {/* Reserved By */}
                        <TableCell className="text-xs text-gray-700 font-medium">
                          {res.user}
                        </TableCell>
                        
                        {/* Timestamp */}
                        <TableCell className="text-xs text-gray-400">
                          {new Date(res.timestamp).toLocaleDateString()} {new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[11px] h-7 px-2 font-medium border-purple-200 hover:bg-purple-50 text-purple-700"
                            onClick={() => handleRelease(res.id)}
                          >
                            <Unlock className="w-3 h-3 mr-1" />
                            Release Stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
