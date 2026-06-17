import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared-ui';
import Pagination from '../../components/ui/Pagination';
import { History, FileText, ChevronRight, Eye, Download } from 'lucide-react';

export default function OcrHistory() {
  const { ocrDocuments = [] } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter for fully processed (verified or rejected) documents
  const historicalDocs = ocrDocuments.filter(d => 
    ['VERIFIED', 'REJECTED'].includes(d.status) &&
    (d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || 
     d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
     d.supplierName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(historicalDocs.length / pageSize));
  const paginatedDocs = historicalDocs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCSV = (doc) => {
    alert(`Exporting parsed metadata for document ${doc.fileName} as CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* Header section with breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <span>OCR Center</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#0071C1]">History Log</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-[#0071C1]" />
            OCR Document History
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Audit historically uploaded manifests and verify extraction confidence levels.
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="space-y-3">
        <SearchFilterBar 
          searchPlaceholder="Search document name, code reference, or supplier..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* List Table */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-slate-50/50 flex flex-row justify-between items-center pb-4">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">Historical Manifest Log</CardTitle>
            <CardDescription>Records of verified and rejected inbound logistics manifests.</CardDescription>
          </div>
          <Badge variant="outline" className="font-bold text-slate-700">
            {historicalDocs.length} Total Processed
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Reference ID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Confidence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Processed Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDocs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-gray-500 text-sm font-medium">
                    No processed documents found in history.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDocs.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-slate-50/20 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="font-bold text-gray-900 text-xs">{doc.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-500">{doc.id}</TableCell>
                    <TableCell className="font-semibold text-gray-800 text-xs">{doc.supplierName}</TableCell>
                    <TableCell className="text-xs text-gray-500 font-semibold">{doc.documentType || 'Invoice'}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={doc.confidenceScore >= 90 ? 'success' : 'warning'} className="text-[10px]">
                        {doc.confidenceScore}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={doc.status === 'VERIFIED' ? 'success' : 'error'} className="text-[9px] uppercase font-bold">
                        {doc.status === 'VERIFIED' ? 'Approved' : 'Rejected'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1.5 justify-end">
                        <Button 
                          onClick={() => handleExportCSV(doc)}
                          className="inline-flex items-center px-2 py-1 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-[10px] text-slate-600 font-bold gap-1 transition-colors"
                          title="Export CSV"
                        >
                          <Download className="w-3 h-3 text-slate-500" />
                          Export
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={historicalDocs.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
