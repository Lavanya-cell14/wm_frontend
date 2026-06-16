import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, SearchFilterBar, Pagination } from 'shared-ui';
import { CheckSquare, Clock, MapPin, Box, ArrowRight, Tag, Calendar, Sparkles } from 'lucide-react';

export default function CompletedTasks() {
  const { putawayTasks } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter completed tasks
  const completedTasks = putawayTasks
    .filter(t => t.status === 'COMPLETED')
    .filter(task => {
      const query = searchQuery.toLowerCase();
      return (
        task.id.toLowerCase().includes(query) ||
        (task.inboundId && task.inboundId.toLowerCase().includes(query)) ||
        task.product.toLowerCase().includes(query) ||
        task.sku.toLowerCase().includes(query) ||
        (task.destinationBin && task.destinationBin.toLowerCase().includes(query))
      );
    });

  const totalPages = Math.max(1, Math.ceil(completedTasks.length / pageSize));
  
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const pagedTasks = completedTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-[#0071C1]" />
            Completed Tasks Logs
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Audit logs of all physically stored inbound receipts completed by warehouse staff.
          </p>
        </div>
        <Badge variant="success" className="text-sm px-3 py-1 font-bold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          {completedTasks.length} Completed
        </Badge>
      </div>

      {/* Filter and Search Panel */}
      <Card className="border border-gray-150 shadow-xs">
        <CardContent className="p-4">
          <SearchFilterBar 
            placeholder="Search completed logs by Task ID, Inbound ID, Product name, or Destination bin..." 
            onSearch={(val) => setSearchQuery(val)} 
          />
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="border border-gray-150 shadow-xs">
        <CardContent className="p-0">
          {completedTasks.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Box className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-900 text-base">No completed tasks logs</h3>
              <p className="text-gray-500 text-sm">No historical completions match your active search terms.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Stored Bin</TableHead>
                  <TableHead>Completed At</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedTasks.map((task) => {
                  return (
                    <TableRow key={task.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-bold text-gray-900 font-mono text-xs">{task.id}</TableCell>
                      <TableCell>
                        <div className="font-bold text-gray-900">{task.product}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{task.sku}</div>
                      </TableCell>
                      <TableCell className="font-bold text-gray-950">{task.quantity} Units</TableCell>
                      <TableCell>
                        <span className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 font-bold w-fit">
                          {task.destinationBin || task.bin || 'BIN-002'}
                        </span>
                        <div className="text-[9px] text-gray-400 font-medium mt-0.5">
                          Zone: {task.destinationZone || task.zone}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {formatDateTime(task.completedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 font-semibold text-xs">
                        {task.assignedStaffName || 'Warehouse Operator'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" className="text-[10px] uppercase font-bold">
                          COMPLETED
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="px-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={completedTasks.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(Math.max(1, Math.min(totalPages, p)))}
          />
        </div>
      )}
    </div>
  );
}
