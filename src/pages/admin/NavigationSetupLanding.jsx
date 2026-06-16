import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from 'shared-ui';
import { 
  Map, 
  Navigation, 
  Activity, 
  ArrowRight, 
  Info,
  ChevronRight,
  TrendingUp,
  Compass
} from 'lucide-react';

export default function NavigationSetupLanding() {
  const navigate = useNavigate();

  // Navigation components cards setup
  const navigationCards = [
    {
      title: 'Navigation Nodes',
      description: 'Configure layout waypoint intersection positions and discrete coordinate tracking points.',
      count: 5, // Matching NavigationNodes list size
      countLabel: 'Nodes',
      icon: Navigation,
      path: '/admin/nav-nodes',
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      title: 'Navigation Edges',
      description: 'Define and manage path links, weight routing cost parameters, and directional flow lanes.',
      count: 4, // Matching NavigationEdges list size
      countLabel: 'Edges',
      icon: Activity,
      path: '/admin/nav-edges',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      title: 'Walking Paths',
      description: 'Establish operational corridors, optimized picking guidance routes, and walking zones.',
      count: 3, // Mocked/estimated paths count
      countLabel: 'Paths',
      icon: Map,
      path: '/admin/walking-paths',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 text-purple-600 border-purple-100',
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
            <span className="text-[#0071C1]">Navigation Setup</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Compass className="w-7 h-7 text-[#0071C1]" />
            Warehouse Navigation Layout
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure transit grids, waypoint coordinate grids, and picking route algorithms.
          </p>
        </div>
      </div>

      {/* Warning/Info banner outlining graph layout rules */}
      <Card className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-100/30">
        <CardContent className="p-4 flex gap-3 items-start">
          <div className="p-2 bg-indigo-100/60 rounded-lg text-indigo-700">
            <Info className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">Graph Theory Rules: </span>
            A navigation map is composed of coordinates (<span className="font-semibold text-slate-900">Nodes</span>) connected by pathways (<span className="font-semibold text-slate-900">Edges</span>). 
            Optimal route calculations and visual digital twins use this topology dataset for real-time guidance telemetry.
          </div>
        </CardContent>
      </Card>

      {/* Responsive cards list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {navigationCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              onClick={() => navigate(card.path)}
              className="group cursor-pointer transform hover:-translate-y-1.5 transition-all duration-300"
            >
              <Card className="h-full border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden relative">
                {/* Accent top bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />
                
                <CardHeader className="pt-6 pb-2 px-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-3 rounded-xl border ${card.bgColor} transition-transform group-hover:scale-110 duration-300`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-black text-slate-800 tracking-tight leading-none">
                        {card.count}
                      </span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                        {card.countLabel}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-base font-bold text-gray-900 group-hover:text-[#0071C1] transition-colors duration-200">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="px-5 pb-5 pt-0 flex-1 flex flex-col justify-between">
                  <CardDescription className="text-xs text-gray-500 leading-relaxed mb-4">
                    {card.description}
                  </CardDescription>
                  
                  <div className="flex items-center text-xs font-bold text-[#0071C1] group-hover:text-blue-700 transition-colors mt-auto">
                    Configure Graph 
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
