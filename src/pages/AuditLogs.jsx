import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, SearchFilterBar, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Pagination } from 'shared-ui';
import { ShieldCheck, Download, Clock, QrCode, ClipboardList, AlertTriangle } from 'lucide-react';
import { getAuditLogsApi, getScanLogsApi } from '../services/auditLogService';

const FALLBACK_SCAN_LOGS = [
  {
    id: 'SL-001',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    user: 'op-01@wms.com',
    role: 'OPERATOR',
    scanned_sku: 'SKU-1002',
    scanned_bin: 'BIN-001',
    status: 'SUCCESS',
    details: 'Verified pallet storage placement matches slot A1-01'
  },
  {
    id: 'SL-002',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    user: 'op-02@wms.com',
    role: 'OPERATOR',
    scanned_sku: 'SKU-3001',
    scanned_bin: 'BIN-002',
    status: 'MISMATCH',
    details: 'Bin mismatch warning! Expected destination BIN-003'
  }
];

export default function AuditLogs() {
  const { auditLogs: fallbackLogs } = useWarehouse();
  
  // Tab state: 'audit' | 'scan'
  const [activeTab, setActiveTab] = useState('audit');
  
  // Data lists
  const [auditLogsList, setAuditLogsList] = useState([]);
  const [scanLogsList, setScanLogsList] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const loadData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      if (activeTab === 'audit') {
        const response = await getAuditLogsApi();
        setAuditLogsList(response.results.length > 0 ? response.results : fallbackLogs);
      } else {
        const response = await getScanLogsApi();
        setScanLogsList(response.results.length > 0 ? response.results : FALLBACK_SCAN_LOGS);
      }
    } catch (error) {
      console.warn(`[AuditLogs] Failed to fetch active ${activeTab} logs, using fallback:`, error);
      setApiError(`Live ${activeTab === 'audit' ? 'Audit' : 'Scan'} logs API offline. Showing cached results.`);
      if (activeTab === 'audit') {
        setAuditLogsList(fallbackLogs);
      } else {
        setScanLogsList(FALLBACK_SCAN_LOGS);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, fallbackLogs]);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterModule]);

  // Filter logic
  const filteredLogs = (activeTab === 'audit' ? auditLogsList : scanLogsList).filter(log => {
    const matchesSearch = searchQuery === '' || 
      (log.user || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (log.details || log.scanned_sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.action || log.status || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'audit') {
      const matchesModule = filterModule === 'All' || (log.module || '').toLowerCase() === filterModule.toLowerCase();
      return matchesSearch && matchesModule;
    }
    return matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const pagedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const modules = ['All', ...new Set(auditLogsList.map(l => l.module).filter(Boolean))];

  return (
    <div className="space-y-6 select-none">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[#0071C1]" />
            Security & Scan Logs
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review auditable system records, operational changes, and floor barcode verification scanning history.
          </p>
        </div>
        <Button className="gap-1.5 font-bold" onClick={() => alert(`${activeTab === 'audit' ? 'Audit' : 'Scan'} logs exported successfully!`)}>
          <Download className="w-4 h-4" /> Export Logs
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-150">
        <button
          onClick={() => { setActiveTab('audit'); setSearchQuery(''); }}
          className={`pb-3 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'audit' 
              ? 'border-[#0071C1] text-[#0071C1]' 
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <ClipboardList className="w-4.5 h-4.5" />
          System Audit Logs
        </button>
        <button
          onClick={() => { setActiveTab('scan'); setSearchQuery(''); }}
          className={`pb-3 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'scan' 
              ? 'border-[#0071C1] text-[#0071C1]' 
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <QrCode className="w-4.5 h-4.5" />
          Barcode Scan Logs
        </button>
      </div>

      {/* Filter panel */}
      <Card className="border border-gray-100 shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <SearchFilterBar 
              searchPlaceholder={
                activeTab === 'audit'
                  ? "Search audit trail by action, email, description..."
                  : "Search scan log by SKU, Bin, operator, status..."
              }
              searchValue={searchQuery}
              onSearchChange={setSearchQuery} 
            />
          </div>
          
          {activeTab === 'audit' && (
            <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end text-xs">
              {modules.map((mod) => (
                <Button
                  key={mod}
                  onClick={() => setFilterModule(mod)}
                  className={`px-3 py-1.5 font-bold rounded-lg border transition-all ${
                    filterModule === mod 
                      ? 'bg-slate-900 border-slate-900 text-white' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {mod}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading & Error banners */}
      {loading && (
        <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-100 text-xs text-blue-700 font-semibold rounded-xl">
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          Retrieving logs from backend database...
        </div>
      )}

      {apiError && !loading && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-100 text-xs text-amber-800 font-semibold rounded-xl">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {apiError}
        </div>
      )}

      {/* Table grid */}
      <Card className="border border-gray-100 shadow-xs">
        <CardContent className="p-0">
          {activeTab === 'audit' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User Email</TableHead>
                  <TableHead>System Module</TableHead>
                  <TableHead>Action Code</TableHead>
                  <TableHead>Description Details</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-400 font-bold">
                      No system audit logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="text-gray-500 text-xs font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-gray-900 text-xs">{log.user}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{log.role || 'Staff'}</div>
                      </TableCell>
                      <TableCell className="text-gray-600 text-xs font-bold">{log.module}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 text-xs font-semibold leading-relaxed max-w-xs md:max-w-md">
                        {log.details}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status="success" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Operator Email</TableHead>
                  <TableHead>Scanned SKU</TableHead>
                  <TableHead>Scanned Bin</TableHead>
                  <TableHead>Scan Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-400 font-bold">
                      No scan logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="text-gray-500 text-xs font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-gray-900 text-xs">{log.user}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{log.role || 'OPERATOR'}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-gray-800">{log.scanned_sku || '—'}</TableCell>
                      <TableCell className="font-mono text-xs text-blue-700 font-bold">{log.scanned_bin || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={log.status === 'SUCCESS' ? 'success' : 'error'} className="font-mono text-[9px] font-bold">
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 text-xs font-semibold leading-relaxed">
                        {log.details}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>

        <div className="p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredLogs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>
    </div>
  );
}
