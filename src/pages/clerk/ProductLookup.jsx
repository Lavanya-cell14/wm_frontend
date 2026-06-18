import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Pagination
} from 'shared-ui';
import { Search, MapPin, Scale, Layers, Calendar, RefreshCw, Barcode, HelpCircle, FileText, ArrowDownToLine, Clock } from 'lucide-react';

export default function ProductLookup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { inventory, movements, inboundReceipts = [], bins = [] } = useWarehouse();

  const getFriendlyStatus = (status) => {
    const s = String(status).toUpperCase();
    if (s === 'PENDING_PUTAWAY') return 'Pending Putaway';
    if (s === 'WAITING_FOR_BIN_ASSIGNMENT') return 'Waiting for Bin Assignment';
    if (s === 'AVAILABLE' || s === 'IN STOCK') return 'Available';
    return status.replace(/_/g, ' ');
  };

  // Search SKU selection
  const [searchSku, setSearchSku] = useState('');
  
  // Pagination States
  const [movementPage, setMovementPage] = useState(1);
  const [inboundPage, setInboundPage] = useState(1);

  useEffect(() => {
    if (location.state?.sku) {
      setSearchSku(location.state.sku);
    } else if (inventory.length > 0) {
      setSearchSku(inventory[0].sku);
    }
  }, [location.state, inventory]);

  // Reset pagination when selection changes
  useEffect(() => {
    setMovementPage(1);
    setInboundPage(1);
  }, [searchSku]);

  const selectedProduct = inventory.find(item => item.sku === searchSku);

  // Filter movements for this SKU
  const productMovements = movements.filter(m => m.sku === searchSku);

  // Filter inbound history for this SKU
  const productInbounds = inboundReceipts.filter(r => r.sku === searchSku);

  // Find physical bin details to display spatial coordinates
  const matchingBin = selectedProduct ? bins.find(b => b.code === selectedProduct.bin) : null;

  // Pagination parameters
  const itemsPerPage = 5;
  const totalMovementPages = Math.ceil(productMovements.length / itemsPerPage);
  const paginatedProductMovements = productMovements.slice(
    (movementPage - 1) * itemsPerPage,
    movementPage * itemsPerPage
  );

  const totalInboundPages = Math.ceil(productInbounds.length / itemsPerPage);
  const paginatedProductInbounds = productInbounds.slice(
    (inboundPage - 1) * itemsPerPage,
    inboundPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Search className="w-7 h-7 text-[#0071C1]" />
            Digital Product Passport Lookup
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Simulate barcode scans, inspect physical dimensions, verify source OCR manifest links, and trace log timelines.
          </p>
        </div>
      </div>

      {/* SKU Selector Search Bar */}
      <Card className="border border-gray-100 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Barcode className="h-5 w-5 text-gray-400" />
              </div>
              <select 
                value={searchSku} 
                onChange={(e) => setSearchSku(e.target.value)}
                className="pl-10 w-full border border-gray-200 p-2.5 rounded-xl font-semibold text-sm outline-none focus:border-blue-500 bg-gray-50/50"
              >
                <option value="">-- Choose a Product SKU / Barcode --</option>
                {inventory.map(item => (
                  <option key={item.sku} value={item.sku}>
                    {item.sku} - {item.name}
                  </option>
                ))}
              </select>
            </div>
            <Button className="w-full sm:w-auto px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold" onClick={() => {}}>
              Simulate Barcode Scan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Product Details Section */}
      {!selectedProduct ? (
        <div className="h-[40vh] flex flex-col items-center justify-center text-gray-400 gap-2 border-2 border-dashed border-gray-200 rounded-2xl bg-white p-6">
          <HelpCircle className="w-12 h-12 text-gray-300" />
          <h3 className="font-bold text-base text-gray-900 mt-2">No Product Selected</h3>
          <p className="text-xs text-gray-500 text-center max-w-sm">
            Please choose a product from the registry selector above to view its real-time digital passport.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Column 1 & 2: Main Passport & Location Details */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Passport Card */}
            <Card className="border border-gray-100 shadow-sm bg-gradient-to-br from-slate-900 to-[#103E6D] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Barcode className="w-48 h-48" />
              </div>
              <CardContent className="p-6 md:p-8 space-y-6">
                
                {/* Header Passport Info */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest bg-blue-900/40 px-2 py-0.5 rounded border border-blue-500/20">
                      Product Intelligence Passport
                    </span>
                    <h2 className="text-2xl font-bold mt-2">{selectedProduct.name}</h2>
                    <p className="text-xs text-slate-300 font-mono mt-0.5">{selectedProduct.sku}</p>
                  </div>
                  <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-right">
                    <div className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">Status</div>
                    <div className="text-xs font-bold text-emerald-400 mt-0.5">{getFriendlyStatus(selectedProduct.status)}</div>
                  </div>
                </div>

                {/* Quantity Breakdown Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-300 font-medium">Total Quantity</div>
                    <div className="text-xl font-bold mt-1">{selectedProduct.quantity} units</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-300 font-medium">Available Allocations</div>
                    <div className="text-xl font-bold text-emerald-400 mt-1">
                      {selectedProduct.quantity - (selectedProduct.reserved || 0) - (selectedProduct.damaged || 0)} units
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-300 font-medium">Locked Reserves</div>
                    <div className="text-xl font-bold text-purple-300 mt-1">{selectedProduct.reserved || 0} units</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-300 font-medium">Quarantined Damages</div>
                    <div className="text-xl font-bold text-rose-400 mt-1">{selectedProduct.damaged || 0} units</div>
                  </div>
                </div>

                {/* Physical Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-300" />
                    <span>Category: <span className="text-white font-bold">{selectedProduct.category}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-blue-300" />
                    <span>Weight: <span className="text-white font-bold">{selectedProduct.weight}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-300" />
                    <span>Dimensions: <span className="text-white font-bold">{selectedProduct.dimensions}</span></span>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Spatial Location Map Card */}
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#0071C1]" />
                  Spatial Warehouse Map Location
                </CardTitle>
                <CardDescription>Visual coordinate routing breakdown for picking and replenishment pathfinding.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  
                  {/* Bin Card details */}
                  <div className="p-4 bg-slate-50 border border-gray-100 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Bin Code</span>
                      <h3 className="text-xl font-bold text-blue-700 font-mono mt-1">{selectedProduct.bin}</h3>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-4 leading-normal">
                      Allocated picking storage bin.
                    </p>
                  </div>

                  {/* Zone Details */}
                  <div className="p-4 bg-slate-50 border border-gray-100 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Zone Classification</span>
                      <h3 className="text-lg font-bold text-gray-900 mt-1">{selectedProduct.zone}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold mt-4">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>High Frequency Aisle</span>
                    </div>
                  </div>

                  {/* Rack & Shelf */}
                  <div className="p-4 bg-slate-50 border border-gray-100 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rack & Shelf Level</span>
                      <h3 className="text-lg font-bold text-gray-900 mt-1">Rack {selectedProduct.rack}</h3>
                    </div>
                    <span className="text-xs text-gray-600 font-medium mt-4">
                      Level: <span className="font-bold text-gray-900">{selectedProduct.shelf}</span>
                    </span>
                  </div>

                  {/* Spatial Coordinates details */}
                  <div className="p-4 bg-slate-50 border border-gray-100 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Spatial Coordinates</span>
                      {matchingBin ? (
                        <div className="mt-2 text-xs font-mono font-bold text-slate-800 space-y-1">
                          <div>X-Offset: {matchingBin.x}m</div>
                          <div>Y-Offset: {matchingBin.y}m</div>
                          <div>Z-Elevation: {matchingBin.z}m</div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 mt-2">Not calculated</div>
                      )}
                    </div>
                    <Badge variant="outline" className="mt-4 w-fit text-[9px] uppercase font-mono">3D Twin Grid</Badge>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Inbound History & OCR References Grid */}
            <Card className="border border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-gray-150 pb-3 bg-slate-50/40">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <ArrowDownToLine className="w-4 h-4 text-blue-600" />
                  Inbound Receiving History & OCR Manifest Links
                </CardTitle>
                <CardDescription>Traces the document flow and supplier source reference codes for this SKU.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Inbound ID</TableHead>
                      <TableHead>Source Doc Reference</TableHead>
                      <TableHead>Supplier Name</TableHead>
                      <TableHead>Verified Qty</TableHead>
                      <TableHead>Received Date</TableHead>
                      <TableHead>Receipt Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProductInbounds.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-gray-500 text-xs font-medium">
                          No OCR verified inbound records are currently linked to this SKU.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedProductInbounds.map((inb) => (
                        <TableRow key={inb.id} className="hover:bg-slate-50/20">
                          <TableCell className="font-bold text-gray-900 font-mono text-xs">{inb.id}</TableCell>
                          <TableCell className="font-mono text-[11px] text-blue-700 font-bold bg-blue-50/40 px-2 py-0.5 border border-blue-100 rounded w-fit">
                            {inb.documentId} / Ref: {inb.documentReference}
                          </TableCell>
                          <TableCell className="text-xs text-gray-700">{inb.supplier}</TableCell>
                          <TableCell className="font-bold text-slate-800 text-xs">{inb.verifiedQuantity} units</TableCell>
                          <TableCell className="text-gray-400 font-mono text-[10px]">{inb.receivedDate}</TableCell>
                          <TableCell>
                            <Badge variant={inb.status === 'STORED' ? 'success' : 'warning'} className="text-[9px] uppercase">
                              {inb.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {totalInboundPages > 1 && (
                  <div className="p-2 border-t border-gray-100">
                    <Pagination
                      currentPage={inboundPage}
                      totalPages={totalInboundPages}
                      onPageChange={setInboundPage}
                      totalItems={productInbounds.length}
                      pageSize={itemsPerPage}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
          
          {/* Column 3: Audit Movements Log Specific to this Item */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="border border-gray-100 shadow-sm h-full flex flex-col">
              <CardHeader className="border-b border-gray-100 pb-4 bg-slate-50/40">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#0071C1]" />
                  Product Spatial Audit Log
                </CardTitle>
                <CardDescription>Historical tracking log specific to SKU {selectedProduct.sku}.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-y-auto">
                {paginatedProductMovements.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center text-xs">
                    <Clock className="w-8 h-8 text-gray-300 mb-2" />
                    <span>No telemetry movements recorded for this item in this session.</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative border-l-2 border-slate-100 pl-4 space-y-6">
                      {paginatedProductMovements.map((mov, i) => (
                        <div key={i} className="relative">
                          <span className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600 shadow-xs"></span>
                          <div className="text-xs">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-gray-900 truncate max-w-[80px]">{mov.user}</span>
                              <span className="text-gray-400 text-[9px] font-medium">{mov.time}</span>
                            </div>
                            <p className="text-gray-600 text-[10px]">
                              Dispatched from <span className="font-mono text-gray-800 font-semibold">{mov.from}</span> to <span className="font-mono text-blue-700 bg-blue-50 px-1 rounded font-semibold">{mov.to}</span>
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">{mov.type?.replace('_', ' ')}</span>
                              <span className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${mov.qty > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                                Qty: {mov.qty > 0 ? `+${mov.qty}` : mov.qty}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {totalMovementPages > 1 && (
                      <Pagination
                        currentPage={movementPage}
                        totalPages={totalMovementPages}
                        onPageChange={setMovementPage}
                        totalItems={productMovements.length}
                        pageSize={itemsPerPage}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      )}
    </div>
  );
}
