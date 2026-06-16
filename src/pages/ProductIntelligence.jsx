import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, DashboardStatCard, Button, Badge, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared-ui';
import { BrainCircuit, Cpu, Scale, HelpCircle, ArrowRight, Eye, Sparkles } from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';

export default function ProductIntelligence() {
  const navigate = useNavigate();
  const { inventory } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRuleModal, setActiveRuleModal] = useState(null);

  // Hardcode product catalog for rich AI suitability rules representation
  const catalog = [
    { sku: 'SKU-1001', name: 'Dell Laptop', category: 'Electronics', weight: '2.4 kg', dimensions: '35x24x3 cm', speed: 'Fast', rule: 'Store in climate-controlled Zone B. Low humidity. Heavy packing not allowed.', suitability: 'Fragile / Electronic Class' },
    { sku: 'SKU-1002', name: 'MacBook Pro', category: 'Electronics', weight: '1.6 kg', dimensions: '31x22x2 cm', speed: 'Fast', rule: 'Store in high security Zone B bins. Lockable racks. Strict temperature bounds.', suitability: 'Fragile / Electronic Class' },
    { sku: 'SKU-1003', name: 'Logitech Mouse', category: 'Accessories', weight: '0.1 kg', dimensions: '10x6x4 cm', speed: 'Medium', rule: 'Store in shallow bin partitions in Zone A. Gravity flow racks for easy replenishment.', suitability: 'Standard Handling' },
    { sku: 'SKU-2041', name: 'Industrial Drills', category: 'Industrial Tools', weight: '8.5 kg', dimensions: '45x30x15 cm', speed: 'Slow', rule: 'Heavy load lower racks in Zone C. Forklift access path required.', suitability: 'Heavy / Heavy Duty Support' },
    { sku: 'SKU-3092', name: 'Safety Helmets', category: 'Safety Equipment', weight: '0.4 kg', dimensions: '28x22x16 cm', speed: 'Medium', rule: 'Store in bulkhead bins in Zone A. High-level shelving okay.', suitability: 'Standard Handling / Safety Class' }
  ];

  const filteredCatalog = catalog.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <BrainCircuit className="w-7 h-7 text-[#0071C1]" />
          AI Product Storage Intelligence
        </h1>
        <p className="text-gray-500 text-sm mt-1">AI-based storage optimization rules, suitability profiles, and fast/slow inventory catalog tracking.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardStatCard title="Total Catalog SKUs" value="124 SKUs" icon={Cpu} />
        <DashboardStatCard title="Electronics Class" value="48 SKUs" icon={Sparkles} />
        <DashboardStatCard title="Heavy Items Class" value="16 SKUs" icon={Scale} />
        <DashboardStatCard title="Fast Moving Class" value="35 SKUs" icon={BrainCircuit} />
        <DashboardStatCard title="Needing AI Review" value="3 SKUs" icon={HelpCircle} />
      </div>

      {/* Filter */}
      <Card className="border border-gray-100 shadow-xs">
        <CardContent className="p-4">
          <SearchFilterBar 
            placeholder="Search AI product intelligence directory by SKU or name..." 
            onSearch={(val) => setSearchQuery(val)} 
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-gray-100 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product / SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Physical Specifications</TableHead>
                <TableHead>Suitability Classification</TableHead>
                <TableHead>Velocity (Speed)</TableHead>
                <TableHead className="text-right">Storage Rules</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCatalog.map((item) => (
                <TableRow key={item.sku} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell>
                    <div className="font-semibold text-gray-900 text-sm">{item.name}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">{item.sku}</div>
                  </TableCell>
                  <TableCell className="text-gray-600 text-xs font-semibold">{item.category}</TableCell>
                  <TableCell className="text-gray-500 text-xs font-medium">
                    {item.weight} • {item.dimensions}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.suitability}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.speed === 'Fast' ? 'success' : item.speed === 'Medium' ? 'warning' : 'outline'}>
                      {item.speed} Moving
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" className="gap-1 text-xs text-gray-600" onClick={() => setActiveRuleModal(item)}>
                        <BrainCircuit className="w-3.5 h-3.5 text-blue-600" /> Rule
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 text-xs text-gray-600" onClick={() => navigate('/inventory')}>
                        <Eye className="w-3.5 h-3.5 text-gray-500" /> Stock
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Storage Rule Details Modal */}
      {activeRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">AI Storage Rule Sheet</h3>
              </div>
              <button className="text-slate-400 hover:text-white font-semibold text-lg" onClick={() => setActiveRuleModal(null)}>×</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="font-bold text-slate-900 text-sm">{activeRuleModal.name}</div>
                <div className="text-slate-500 font-mono mt-0.5">{activeRuleModal.sku}</div>
                <div className="mt-2 text-slate-700 font-semibold">Classification: {activeRuleModal.suitability}</div>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800 uppercase tracking-wide">Optimized Bin Placement Rule</h4>
                <p className="text-slate-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  {activeRuleModal.rule}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-between text-[11px] font-semibold text-gray-500">
                <span>Velocity Class: {activeRuleModal.speed}</span>
                <span>Max Stack Limit: 5 levels</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2 justify-end">
              <Button onClick={() => setActiveRuleModal(null)}>Close Rule</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
