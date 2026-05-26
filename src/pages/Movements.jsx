import React, { useState } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import StatusBadge from '../components/ui/StatusBadge';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Activity, Clock, MapPin, ArrowRightLeft } from 'lucide-react';

export default function Movements() {
  const { movements } = useWarehouse();
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMovements = movements.filter(mov => {
    const matchesType = filterType === 'All' || mov.type.toLowerCase() === filterType.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      mov.item.toLowerCase().includes(searchQuery.toLowerCase()) || 
      mov.sku.toLowerCase().includes(searchQuery.toLowerCase()) || 
      mov.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Activity className="w-7 h-7 text-[#0071C1]" />
          Movements Log
        </h1>
        <p className="text-gray-500 text-sm mt-1">Audit complete stock movements, transits, and internal reallocations history.</p>
      </div>

      {/* Filter panel */}
      <Card className="border border-gray-100 shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <SearchFilterBar 
              placeholder="Search movements by ID, SKU, product..." 
              onSearch={(val) => setSearchQuery(val)} 
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end text-xs">
            {['All', 'Putaway', 'Picking', 'Reallocation'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 font-bold rounded-lg border transition-all ${
                  filterType === type 
                    ? 'bg-slate-900 border-slate-900 text-white' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Table */}
        <div className="xl:col-span-2">
          <Card className="border border-gray-100 shadow-xs">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Product / SKU</TableHead>
                    <TableHead>Transit Path</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell className="font-bold text-gray-900 font-mono text-xs">{mov.id}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-gray-900 text-xs">{mov.item}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{mov.sku}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-mono text-[10px] font-semibold">{mov.from}</span>
                          <ArrowRightLeft className="w-3 h-3 text-gray-400 mx-0.5" />
                          <span className="font-mono text-blue-700 bg-blue-50 px-1 rounded font-bold">{mov.to}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900 text-xs">{mov.qty || 1} units</TableCell>
                      <TableCell>
                        <Badge variant={mov.type === 'Picking' ? 'warning' : mov.type === 'Putaway' ? 'success' : 'outline'}>
                          {mov.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 text-xs font-semibold">{mov.user}</TableCell>
                      <TableCell className="text-gray-500 text-xs font-semibold">{mov.time}</TableCell>
                      <TableCell>
                        <StatusBadge status={mov.status === 'Completed' ? 'success' : 'warning'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Timeline feed column */}
        <div className="xl:col-span-1">
          <Card className="border border-gray-100 shadow-xs h-full">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" /> Real-time Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="relative border-l-2 border-slate-100 pl-4 space-y-6">
                {movements.map((mov, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600"></span>
                    <div className="text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-gray-900">{mov.item}</span>
                        <span className="text-gray-400 text-[10px]">{mov.time}</span>
                      </div>
                      <p className="text-gray-500 text-[11px] leading-relaxed">
                        Transited from <span className="font-mono">{mov.from}</span> into bin location <span className="font-mono text-blue-600 font-bold">{mov.to}</span>.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
