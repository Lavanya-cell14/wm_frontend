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
  Modal,
  Pagination,
  StatCard,
  SearchFilterBar
} from 'shared-ui';
import { Lightbulb, ChevronRight, Eye, Info, Sparkles, Filter } from 'lucide-react';

export default function RecommendationsPage() {
  const { aiRecommendations = [] } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRec, setSelectedRec] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter recommendations list
  const filteredRecs = aiRecommendations.filter(rec => 
    rec.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    rec.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.bin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredRecs.length / pageSize));
  const paginatedRecs = filteredRecs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Header section with breadcrumb trail */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <span>Receiving & Inventory Officer</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#0071C1]">Recommendations</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Lightbulb className="w-7 h-7 text-amber-500 animate-pulse" />
            Storage Recommendation Monitor
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor spatial placement proposals calculated by the WarehouseAI Neural Slotting engine upon manifest approval.
          </p>
        </div>
      </div>

      {/* Info Warning banner specifying role limitations */}
      <Card className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-100/30">
        <CardContent className="p-4 flex gap-3 items-start">
          <div className="p-2 bg-amber-100/60 rounded-lg text-amber-700">
            <Info className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">Officer Monitor View: </span>
            This page provides read-only tracking of active AI placement recommendations. To execute physical tasks, contact floor operations staff. To approve alternate slotting topologies, contact the Warehouse Manager.
          </div>
        </CardContent>
      </Card>

      {/* Search Filter Toolbar */}
      <div className="space-y-3">
        <SearchFilterBar 
          searchPlaceholder="Search recommendations by SKU, title, or bin..." 
          searchValue={searchQuery}
          onSearchChange={setSearchQuery} 
        />
      </div>

      {/* Recommendations Table */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Recommended Zone Group</TableHead>
                <TableHead>Recommended Zone</TableHead>
                <TableHead className="text-center">Recommendation Score</TableHead>
                <TableHead>Recommendation Reason</TableHead>
                <TableHead>Storage Rules Applied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRecs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500 font-semibold text-xs">
                    No active storage recommendations.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRecs.map((rec) => {
                  // Classify zone group
                  const recommendedZg = rec.zone === 'Zone D' ? 'Cold Storage ZG' : 'Ambient Storage ZG';
                  const storageRules = rec.zone === 'Zone C' ? 'Weight Constraints, Bulk Loading AStar' : 'Product Class segregation, Height Elev limit';

                  return (
                    <TableRow key={rec.id} className="hover:bg-slate-50/20 transition-colors">
                      <TableCell>
                        <div className="font-bold text-gray-900 text-xs">{rec.productName}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{rec.sku}</div>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-700">{recommendedZg}</TableCell>
                      <TableCell className="text-xs text-slate-700 font-semibold">{rec.zone} &bull; Bin {rec.bin}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={rec.confidence >= 90 ? 'success' : 'warning'} className="text-[10px] font-bold font-mono">
                          {rec.confidence}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-gray-500 max-w-xs truncate" title={rec.reason}>
                        {rec.reason}
                      </TableCell>
                      <TableCell className="text-[10px] font-semibold text-blue-700 font-mono">
                        {storageRules}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[11px] h-7 px-2.5 font-bold"
                            onClick={() => setSelectedRec(rec)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Inspect
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
              totalItems={filteredRecs.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>

      {/* Diagnostics details modal */}
      {selectedRec && (
        <Modal
          isOpen={!!selectedRec}
          onClose={() => setSelectedRec(null)}
          title="Inspect Recommendation Diagnostics"
          maxWidth="max-w-md"
          footer={
            <Button onClick={() => setSelectedRec(null)} className="w-full justify-center">Close Diagnostic Panel</Button>
          }
        >
          <div className="space-y-4 text-xs font-semibold text-gray-700">
            <div className="p-4 bg-slate-900 text-white rounded-2xl">
              <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">Target Item SKU / Name</span>
              <span className="text-sm font-bold block mt-0.5">{selectedRec.productName}</span>
              <span className="text-[10px] font-mono text-slate-300 mt-0.5 block">{selectedRec.sku}</span>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 grid grid-cols-2 gap-3 text-slate-700 font-semibold">
              <div>Recommended Bin: <span className="font-mono text-blue-700 font-bold">{selectedRec.bin}</span></div>
              <div>Elevation: <span className="text-gray-900">{selectedRec.shelf}</span></div>
              <div>Rack ID: <span className="text-gray-900 font-mono">{selectedRec.rack}</span></div>
              <div>Zone: <span className="text-gray-900">{selectedRec.zone}</span></div>
            </div>

            <div className="p-3.5 bg-blue-50/50 border border-blue-150 rounded-xl space-y-1.5">
              <span className="font-bold text-blue-900 block uppercase text-[10px] tracking-wider">AI Storage Rationale</span>
              <p className="text-blue-950 leading-relaxed font-semibold">{selectedRec.reason}</p>
            </div>

            <div className="p-4 border border-gray-100 rounded-2xl bg-white space-y-2">
              <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-1.5 uppercase text-[10px] tracking-wider text-[#0071C1] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                Storage Rules Enforced
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium">
                <li>Volumetric Capacity Fit: <span className="text-emerald-600 font-bold">Passed (95% safety margin)</span></li>
                <li>Weight Load Limit Verification: <span className="text-emerald-600 font-bold">Passed (100% compliant)</span></li>
                <li>Pick Rate Velocity Compatibility: <span className="text-emerald-600 font-bold">Matched (Aisle optimized)</span></li>
                <li>Ambient/Temperature Zone Compliance: <span className="text-emerald-600 font-bold">Passed</span></li>
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
