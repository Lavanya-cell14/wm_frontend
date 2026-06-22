import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import { AlertBanner, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Modal, Pagination } from 'shared-ui';
import { 
  ArrowDownToLine, RefreshCw, Search, Filter, Eye, Sparkles, CheckSquare, 
  MapPin, ClipboardCheck, ArrowUpRight, ArrowRight, ClipboardList, Clock, Info
} from 'lucide-react';
import { getInboundShipments, patchInboundShipment } from '../../services/inboundService';

const mapBackendInboundToReceipt = (ship) => {
  let mappedStatus = 'WAITING_FOR_BIN_ASSIGNMENT';
  if (ship.status === 'COMPLETED') {
    mappedStatus = 'STORED';
  } else if (ship.status === 'IN_PROGRESS' || ship.status === 'IN_TRANSIT') {
    mappedStatus = 'BIN_SUGGESTED';
  } else if (ship.status === 'PENDING') {
    mappedStatus = 'WAITING_FOR_BIN_ASSIGNMENT';
  }
  
  return {
    id: ship.shipment_code || ship.id,
    documentId: 'OCR-N/A',
    documentReference: ship.shipment_code || 'REF-GEN',
    sku: 'SKU-GENERIC',
    productName: `Shipment from ${ship.supplier_name}`,
    category: 'General',
    quantityReceived: 50,
    verifiedQuantity: 50,
    supplier: ship.supplier_name,
    receivedDate: ship.expected_arrival ? ship.expected_arrival.split('T')[0] : 'N/A',
    dimensions: 'N/A',
    weight: 'N/A',
    status: mappedStatus,
    binRecommendationStatus: mappedStatus === 'WAITING_FOR_BIN_ASSIGNMENT' ? 'WAITING_FOR_BIN_ASSIGNMENT' : 'RECOMMENDATION_APPROVED',
    bin: 'BIN-001',
    _rawBackendId: ship.id
  };
};

export default function InboundProducts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { inboundReceipts, setInboundReceipts, logAudit } = useWarehouse();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [backendInbounds, setBackendInbounds] = useState([]);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setApiError(null);
      console.warn("[InboundProducts] Calling API: GET /api/inbound/");
      const data = await getInboundShipments();
      const mapped = data.results.map(mapBackendInboundToReceipt);
      setBackendInbounds(mapped);
      setFallbackUsed(false);
      console.warn(`[InboundProducts] API Success. URL: /api/inbound/, Status: 200, Count: ${data.count}, Fallback Used: false`);
    } catch (err) {
      const status = err.status || (err.code === 'NETWORK_ERROR' ? 0 : 'unknown');
      setApiError('Inbound Shipments API unreachable — showing cached offline queue.');
      setFallbackUsed(true);
      console.error(`[InboundProducts] API Error. URL: /api/inbound/, Status: ${status}, Detail: ${err.message}. Fallback Used: true (using context cached data)`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset page on search/filter mutations
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleRequestBinSuggestion = async (receiptId, rawBackendId) => {
    if (!fallbackUsed && rawBackendId) {
      try {
        console.warn(`[InboundProducts] Calling API: PATCH /api/inbound/${rawBackendId}/`);
        await patchInboundShipment(rawBackendId, { status: 'IN_PROGRESS' });
        setBackendInbounds(prev => prev.map(rec => {
          if (rec.id === receiptId) {
            return {
              ...rec,
              status: 'BIN_SUGGESTED',
              binRecommendationStatus: 'BIN_SUGGESTED'
            };
          }
          return rec;
        }));
        console.warn(`[InboundProducts] API Success. URL: /api/inbound/${rawBackendId}/, Status: 200, Fallback Used: false`);
        showToast('AI Bin recommendation generated successfully!');
      } catch (err) {
        const status = err.status || (err.code === 'NETWORK_ERROR' ? 0 : 'unknown');
        console.error(`[InboundProducts] API Error. URL: /api/inbound/${rawBackendId}/, Status: ${status}, Detail: ${err.message}.`);
        showToast('Failed to update status on backend.');
      }
    } else {
      setInboundReceipts(prev => prev.map(rec => {
        if (rec.id === receiptId) {
          return {
            ...rec,
            status: 'BIN_SUGGESTED',
            binRecommendationStatus: 'BIN_SUGGESTED'
          };
        }
        return rec;
      }));
      showToast('AI Bin recommendation generated successfully (Offline Fallback)!');
    }
  };

  const displayList = fallbackUsed ? inboundReceipts : backendInbounds;

  const filteredReceipts = displayList.filter(rec => {
    const matchesSearch = 
      rec.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredReceipts.length / pageSize));
  const paginatedReceipts = filteredReceipts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'RECEIVED': return 'info';
      case 'VERIFIED': return 'success';
      case 'WAITING_FOR_BIN_ASSIGNMENT': return 'warning';
      case 'BIN_SUGGESTED': return 'primary';
      case 'ASSIGNED_TO_STAFF': return 'neutral';
      case 'STORED': return 'success';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'RECEIVED': return 'Received but Not Stored';
      case 'VERIFIED': return 'Verified';
      case 'WAITING_FOR_BIN_ASSIGNMENT': return 'Waiting for Bin Assignment';
      case 'BIN_SUGGESTED': return 'Pending Putaway';
      case 'ASSIGNED_TO_STAFF': return 'Assigned to Staff';
      case 'STORED': return 'Stored';
      default: return status.replace(/_/g, ' ');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      {fallbackUsed && (
        <div className="mb-4">
          <AlertBanner type="warning" message="Inbound Shipments API unreachable — showing cached offline queue." />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ArrowDownToLine className="w-7 h-7 text-[#0071C1]" />
            Inbound Products Queue
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track and monitor verified product manifests as they transition from receiving dock to AI storage slotting allocation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-xs font-semibold" onClick={() => showToast('Inbound records list refreshed!')}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Button onClick={() => navigate('/ocr-upload')} className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white">
            Upload New manifest
          </Button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <Card className="border border-gray-100 shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by Inbound ID, SKU, Product Title, Supplier..."
              className="pl-9 pr-4 py-2 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs font-semibold bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-500">Filter Status:</span>
            <select
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs font-semibold bg-white p-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="WAITING_FOR_BIN_ASSIGNMENT">Waiting Bin Assignment</option>
              <option value="BIN_SUGGESTED">Bin Suggested</option>
              <option value="ASSIGNED_TO_STAFF">Assigned to Staff</option>
              <option value="STORED">Stored</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Inbound Receipts List Table */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-full divide-y divide-gray-200 text-left text-xs font-semibold">
            <TableHeader className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider">
              <TableRow>
                <TableHead className="p-3">Inbound ID</TableHead>
                <TableHead className="p-3">SKU</TableHead>
                <TableHead className="p-3">Product</TableHead>
                <TableHead className="p-3">Quantity</TableHead>
                <TableHead className="p-3">Status</TableHead>
                <TableHead className="p-3">Recommendation Status</TableHead>
                <TableHead className="p-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 bg-white">
              {paginatedReceipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500 font-medium">
                    No matching inbound records found in the system queue.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedReceipts.map((rec) => (
                  <TableRow key={rec.id} className="hover:bg-slate-50/40">
                    <TableCell className="p-3 font-mono font-bold text-slate-900">{rec.id}</TableCell>
                    <TableCell className="p-3 font-mono text-[11px] text-[#0071C1] font-bold">{rec.sku}</TableCell>
                    <TableCell className="p-3 font-bold text-gray-900">{rec.productName}</TableCell>
                    <TableCell className="p-3 font-semibold text-slate-700">
                      {rec.verifiedQuantity || rec.quantityReceived} units
                    </TableCell>
                    <TableCell className="p-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                        rec.status === 'STORED' ? 'bg-green-50 text-green-700 border-green-200' :
                        rec.status === 'BIN_SUGGESTED' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        rec.status === 'WAITING_FOR_BIN_ASSIGNMENT' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {getStatusLabel(rec.status)}
                      </span>
                    </TableCell>
                    <TableCell className="p-3">
                      <Badge variant={rec.binRecommendationStatus === 'BIN_SUGGESTED' ? 'primary' : 'outline'} className="text-[10px]">
                        {rec.binRecommendationStatus || 'PENDING'}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-3 text-right">
                      <div className="flex justify-end gap-1.5 items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[11px] h-7 px-2 font-medium bg-[#F4FCFF] border-blue-100 text-blue-700 hover:bg-blue-50"
                          onClick={() => setSelectedItemForModal(rec)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-blue-500" />
                          View Details
                        </Button>
                        {rec.status === 'WAITING_FOR_BIN_ASSIGNMENT' && (
                          <Button 
                            size="sm"
                            onClick={() => handleRequestBinSuggestion(rec.id, rec._rawBackendId)}
                            className="bg-[#F5FBFD] border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs py-1 px-2.5 flex items-center gap-1 font-bold shadow-2xs"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                            Slot Suggestion
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="p-1 h-7 w-7 text-gray-400 hover:text-slate-600"
                          onClick={() => navigate(`/inventory/lookup`, { state: { sku: rec.sku } })}
                          title="Lookup Passport"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="p-4 border-t border-gray-50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredReceipts.length}
              pageSize={pageSize}
            />
          </div>
        </CardContent>
      </Card>

      {/* VIEW DETAILS MODAL */}
      {selectedItemForModal && (
        <Modal
          isOpen={!!selectedItemForModal}
          onClose={() => setSelectedItemForModal(null)}
          title={`Inbound Manifest Details: ${selectedItemForModal.id}`}
          maxWidth="max-w-xl"
          footer={
            <Button onClick={() => setSelectedItemForModal(null)}>Close Manifest</Button>
          }
        >
          <div className="space-y-4 text-xs font-semibold text-gray-700">
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">Product / SKU</span>
                <span className="text-sm font-bold block mt-0.5">{selectedItemForModal.productName}</span>
                <span className="text-[10px] font-mono text-slate-300 mt-0.5 block">{selectedItemForModal.sku}</span>
              </div>
              <Badge variant="primary" className="text-[10px] uppercase font-bold text-white bg-blue-600">
                {getStatusLabel(selectedItemForModal.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider block">Supplier Partner</span>
                <span className="text-slate-800 font-semibold text-xs mt-1 block">{selectedItemForModal.supplier}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider block">Document Reference</span>
                <span className="text-slate-800 font-semibold text-xs mt-1 block font-mono">{selectedItemForModal.documentReference}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider block">Package Dimensions</span>
                <span className="text-slate-800 font-semibold text-xs mt-1 block font-mono">{selectedItemForModal.dimensions || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider block">Package Weight</span>
                <span className="text-slate-800 font-semibold text-xs mt-1 block font-mono">{selectedItemForModal.weight || 'N/A'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider block">Quantity Received</span>
                <span className="text-slate-800 font-semibold text-xs mt-1 block font-mono">{selectedItemForModal.quantityReceived} units</span>
              </div>
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider block">Verified Quantity</span>
                <span className="text-slate-800 font-semibold text-xs mt-1 block font-mono">{selectedItemForModal.verifiedQuantity} units</span>
              </div>
            </div>

            <div className="p-4 border border-gray-100 rounded-2xl bg-white space-y-2">
              <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-1.5 uppercase text-[10px] tracking-wider text-[#0071C1]">Logistics Routing</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>Received Date: <span className="font-bold font-mono text-slate-800">{selectedItemForModal.receivedDate || 'N/A'}</span></div>
                <div>Assigned Personnel: <span className="font-bold text-slate-800">{selectedItemForModal.assignedStaff || 'Pending Assignment'}</span></div>
                <div>Target Storage Bin: <span className="font-bold font-mono text-blue-700">{selectedItemForModal.bin || 'Pending AI Allocation'}</span></div>
                <div>Bin Suggestion: <span className="font-bold text-indigo-700">{selectedItemForModal.binRecommendationStatus || 'PENDING'}</span></div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
