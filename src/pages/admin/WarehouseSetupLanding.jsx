import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from 'shared-ui';
import { 
  Building2, 
  Layers, 
  LayoutGrid, 
  Grid, 
  Box, 
  ArrowRight, 
  FolderTree, 
  Info,
  ChevronRight
} from 'lucide-react';

export default function WarehouseSetupLanding() {
  const navigate = useNavigate();
  const { 
    warehouses = [], 
    zones = [], 
    racks = [], 
    shelves = [], 
    bins = [] 
  } = useWarehouse();

  // Cards configuration for each physical layout component
  const setupCards = [
    {
      title: 'Zone Groups',
      description: 'Group warehouse zones by custom temperature rules, security level, or ambient controls.',
      count: 2, // Mocked value matching ZoneGroupList configuration
      countLabel: 'Zone Groups',
      icon: Layers,
      path: '/admin/zone-groups',
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      title: 'Zones',
      description: 'Configure specific physical storage zones dedicated to standard, bulk, or high-value items.',
      count: zones.length,
      countLabel: 'Zones',
      icon: LayoutGrid,
      path: '/admin/zones',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
      title: 'Aisles',
      description: 'Map out walkways and access paths within zones to streamline picker operations.',
      count: 6, // Mocked value matching AisleList configuration
      countLabel: 'Aisles',
      icon: Grid,
      path: '/admin/aisles',
      color: 'from-pink-500 to-purple-500',
      bgColor: 'bg-pink-50 text-pink-600 border-pink-100',
    },
    {
      title: 'Racks',
      description: 'Define vertical rack structure layouts positioned along structural warehouse aisles.',
      count: racks.length,
      countLabel: 'Racks',
      icon: LayoutGrid,
      path: '/admin/racks',
      color: 'from-orange-500 to-pink-500',
      bgColor: 'bg-orange-50 text-orange-600 border-orange-100',
    },
    {
      title: 'Shelves',
      description: 'Configure individual shelf levels per storage rack to organize small or dense packaging.',
      count: shelves.length,
      countLabel: 'Shelves',
      icon: Layers,
      path: '/admin/shelves',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      title: 'Bins',
      description: 'Manage individual bin locations, dimensions, occupancy statuses, and item capacities.',
      count: bins.length,
      countLabel: 'Bins',
      icon: Box,
      path: '/admin/bins',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header section with breadcrumb trail */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <span>Admin</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#0071C1]">Warehouse Setup</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-[#0071C1]" />
            Warehouse Structure Setup
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure the structural hierarchy and space allocation of your physical warehouses.
          </p>
        </div>
        
        {/* Interactive setup tree visualization link */}
        <Button 
          variant="outline" 
          className="gap-2 text-xs font-semibold hover:border-[#0071C1] hover:text-[#0071C1] transition-all duration-200" 
          onClick={() => navigate('/admin/structure-tree')}
        >
          <FolderTree className="w-4 h-4 text-[#0071C1]" />
          Visual Hierarchy Tree
        </Button>
      </div>

      {/* Info Banner explaining structural relationship */}
      <Card className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-100/30">
        <CardContent className="p-4 flex gap-3 items-start">
          <div className="p-2 bg-blue-100/60 rounded-lg text-blue-700">
            <Info className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">Hierarchy Relationship: </span>
            Warehouse &rarr; Zone Groups &rarr; Zones &rarr; Aisles &rarr; Racks &rarr; Shelves &rarr; Bins. 
            Modifying higher-level layers can cascade affects down to localized storage bins. Be cautious when editing active locations.
          </div>
        </CardContent>
      </Card>

      {/* Interactive Grid of Setup Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {setupCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              onClick={() => navigate(card.path)}
              className="group cursor-pointer transform hover:-translate-y-1.5 transition-all duration-300"
            >
              <Card className="h-full border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden relative">
                {/* Visual top border strip gradient */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />
                
                <CardHeader className="pt-6 pb-2 px-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-3 rounded-xl border ${card.bgColor} transition-transform group-hover:scale-110 duration-300`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    {/* Badge displaying current active record counts */}
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-black text-slate-800 tracking-tight leading-none">
                        {card.count}
                      </span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                        {card.countLabel}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-base font-bold text-gray-900 group-hover:text-[#0071C1] transition-colors duration-200 flex items-center gap-1.5">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="px-5 pb-5 pt-0 flex-1 flex flex-col justify-between">
                  <CardDescription className="text-xs text-gray-500 leading-relaxed mb-4">
                    {card.description}
                  </CardDescription>
                  
                  {/* Footer link animation trigger */}
                  <div className="flex items-center text-xs font-bold text-[#0071C1] group-hover:text-blue-700 transition-colors mt-auto">
                    Configure Layout 
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1.5 duration-200" />
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
