import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, User, Settings, Package, ClipboardList } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from 'shared-ui';

export default function RoleSelection() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'inventory',
      title: 'Inventory Officer',
      description: 'Manage stock levels, incoming goods, and OCR.',
      icon: <Package className="w-8 h-8 text-purple-600 mb-4" />,
      path: '/inventory/dashboard',
      color: 'border-purple-100 hover:border-purple-500'
    },
    {
      id: 'operator',
      title: 'Warehouse Operator',
      description: 'Handle putaway, picking, and warehouse tasks.',
      icon: <User className="w-8 h-8 text-green-600 mb-4" />,
      path: '/operator/dashboard',
      color: 'border-green-100 hover:border-green-500'
    },
    {
      id: 'manager',
      title: 'Warehouse Manager',
      description: 'Oversee operations, analytics, and team performance.',
      icon: <Settings className="w-8 h-8 text-blue-600 mb-4" />,
      path: '/manager/dashboard',
      color: 'border-blue-100 hover:border-blue-500'
    },
    {
      id: 'admin',
      title: 'System Admin',
      description: 'Configure warehouse layout and system settings.',
      icon: <ClipboardList className="w-8 h-8 text-orange-600 mb-4" />,
      path: '/admin/dashboard',
      color: 'border-orange-100 hover:border-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#114a87] via-[#1d5fa3] to-[#2672bb] relative overflow-hidden flex flex-col justify-center py-12 sm:px-6 lg:px-8 select-none">
      
      {/* High-Tech Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
      
      {/* Decorative glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[10%] left-[20%] w-[35%] h-[35%] rounded-full bg-amber-500/5 blur-[110px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/10 blur-[130px] pointer-events-none" />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-4xl text-center mb-12">
        <div className="flex justify-center text-amber-400 mb-4 drop-shadow-[0_4px_16px_rgba(251,191,36,0.3)]">
          <Box className="w-16 h-16 animate-pulse" />
        </div>
        <h2 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
          Welcome to Warehouse<span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-md">AI</span>
        </h2>
        <p className="mt-3 text-base text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
          An intelligent warehouse operations platform utilizing AI slotting algorithms, real-time 3D digital twins, automated OCR document parsing, and dynamic route optimization to maximize facility throughput.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-200 bg-white/10 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Select your role to access the corresponding dashboard
        </div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-6xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => (
            <div 
              key={role.id}
              onClick={() => navigate(role.path)}
              className="cursor-pointer transition-transform transform hover:-translate-y-1"
            >
              <Card className={`h-full border-2 transition-colors ${role.color} bg-white shadow-lg hover:shadow-xl rounded-2xl`}>
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center">
                    {role.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{role.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-gray-600 px-4 pb-6">
                  <CardDescription className="text-gray-500 font-medium text-xs leading-relaxed">{role.description}</CardDescription>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
