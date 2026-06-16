import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
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
  AlertBanner 
} from 'shared-ui';
import { Shield, ShieldCheck, ShieldAlert, Key, Save, RefreshCw, Check, X } from 'lucide-react';

export default function RoleManagement() {
  const { user } = useAuth();
  const { logAudit } = useWarehouse();
  
  const [toastMessage, setToastMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState('WAREHOUSE_MANAGER');
  
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Mock Roles and Permissions Data
  const [rolesPermissions, setRolesPermissions] = useState({
    ADMIN: {
      description: 'Full administrative override and platform configuration control.',
      permissions: {
        'sys:config': true,
        'user:write': true,
        'user:read': true,
        'wh:write': true,
        'wh:read': true,
        'inv:write': true,
        'inv:read': true,
        'agv:control': true,
      }
    },
    WAREHOUSE_MANAGER: {
      description: 'Executive monitoring, analytics, and decision-support for warehouse operations.',
      permissions: {
        'sys:config': false,
        'user:write': false,
        'user:read': true,
        'wh:write': true,
        'wh:read': true,
        'inv:write': true,
        'inv:read': true,
        'agv:control': true,
      }
    },
    WAREHOUSE_OPERATOR: {
      description: 'Floor level storage tasks, validation scanning, and route execution duties.',
      permissions: {
        'sys:config': false,
        'user:write': false,
        'user:read': false,
        'wh:write': false,
        'wh:read': true,
        'inv:write': true,
        'inv:read': true,
        'agv:control': false,
      }
    },
    RECEIVING_INVENTORY_OFFICER: {
      description: 'Quarantine approvals, stock audits, adjustments, and reservations hold management.',
      permissions: {
        'sys:config': false,
        'user:write': false,
        'user:read': false,
        'wh:write': false,
        'wh:read': true,
        'inv:write': true,
        'inv:read': true,
        'agv:control': false,
      }
    }
  });

  const permissionLabels = {
    'sys:config': { name: 'System Settings Override', desc: 'Allows modifications to global thresholds, retention parameters, and system backups.' },
    'user:write': { name: 'Staff Profile Provisioning', desc: 'Allows creation, details mutation, disabling, and resetting keys for user accounts.' },
    'user:read': { name: 'View User Directories', desc: 'Allows reading user rosters and assigned warehouse facility matrices.' },
    'wh:write': { name: 'Facility Zone Layout Edit', desc: 'Allows additions, mutations, or deletions of warehouses, zones, shelf and bin grids.' },
    'wh:read': { name: 'View Facility Matrices', desc: 'Allows real-time telemetry rendering of zones, bin structures, and physical capacities.' },
    'inv:write': { name: 'Stock Mutations & Holds', desc: 'Allows manual stock adjustments, reservations, and damaged quarantine logs.' },
    'inv:read': { name: 'View Inventory Ledgers', desc: 'Allows searching products, reviewing reorder levels, and tracking movement traces.' },
    'agv:control': { name: 'AGV Path Dispatch Control', desc: 'Allows AGV command dispatches, route changes, AGV panic-stops, and twin tracking.' }
  };

  const handleTogglePermission = (permissionKey) => {
    setRolesPermissions(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        permissions: {
          ...prev[selectedRole].permissions,
          [permissionKey]: !prev[selectedRole].permissions[permissionKey]
        }
      }
    }));
  };

  const handleSavePermissions = () => {
    // Log Audit Event
    logAudit(
      user?.email || 'admin@warehouseai.com',
      'ADMIN',
      'RBAC_CONFIGURATION_MUTATION',
      'Security',
      `Modified RBAC security permissions profile for role ${selectedRole}`
    );
    showToast(`Role policies for ${selectedRole} synchronized with active gateway!`);
  };

  const handleResetPermissions = () => {
    showToast('Restored default role policy configurations.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[#0071C1]" />
            Security Profile & RBAC Governance
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure system permissions, govern access profiles, and synchronize security policies across credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-xs font-semibold" onClick={handleResetPermissions}>
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Profiles
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Hand: Roles Selector Cards */}
        <div className="space-y-4">
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Security Groups</CardTitle>
              <CardDescription>Select a security profile below to review governance scopes.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {Object.keys(rolesPermissions).map((role) => {
                const isActive = selectedRole === role;
                const count = 1; // display indicators
                let badgeVariant = 'default';
                if (role === 'ADMIN') badgeVariant = 'error';
                else if (role === 'WAREHOUSE_MANAGER') badgeVariant = 'primary';
                else if (role === 'RECEIVING_INVENTORY_OFFICER') badgeVariant = 'warning';

                return (
                  <div
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col gap-1.5 ${
                      isActive 
                        ? 'border-[#0071C1] bg-blue-50/20 shadow-md translate-x-1' 
                        : 'border-gray-100 hover:border-slate-300 bg-white hover:bg-slate-50/20'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-xs tracking-wider flex items-center gap-1.5">
                        <Key className={`w-3.5 h-3.5 ${isActive ? 'text-[#0071C1]' : 'text-slate-400'}`} />
                        {role}
                      </span>
                      <Badge variant={badgeVariant} className="text-[9px]">Scope Active</Badge>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      {rolesPermissions[role].description}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Hand: Permissions Matrix Configurator */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-slate-50/50 flex flex-row justify-between items-center pb-4">
              <div>
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#0071C1]" />
                  Permissions Policies: <span className="text-[#0071C1]">{selectedRole}</span>
                </CardTitle>
                <CardDescription>Grant or deny specific system operation scopes for this group profile.</CardDescription>
              </div>
              <Button className="gap-2 font-semibold h-8 text-xs" onClick={handleSavePermissions}>
                <Save className="w-3.5 h-3.5" />
                Commit Policy
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">Status</TableHead>
                    <TableHead>System Scope Parameter</TableHead>
                    <TableHead>Scope Details</TableHead>
                    <TableHead className="text-right w-24">Policy Toggle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.keys(permissionLabels).map((pKey) => {
                    const hasPerm = rolesPermissions[selectedRole].permissions[pKey];
                    const label = permissionLabels[pKey];

                    return (
                      <TableRow key={pKey} className="hover:bg-slate-50/10 transition-colors">
                        {/* Status badge Indicator */}
                        <TableCell className="text-center">
                          {hasPerm ? (
                            <span className="inline-flex items-center justify-center p-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center p-1 rounded-full bg-slate-50 text-slate-400 border border-slate-100">
                              <X className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </TableCell>

                        {/* Parameter Name */}
                        <TableCell className="font-bold text-gray-900 text-xs">
                          {label.name}
                          <span className="block font-mono text-[9px] text-[#0071C1] mt-0.5">{pKey}</span>
                        </TableCell>

                        {/* Description */}
                        <TableCell className="text-xs text-gray-500 font-medium">
                          {label.desc}
                        </TableCell>

                        {/* Policy Switch Checkbox */}
                        <TableCell className="text-right">
                          <button
                            onClick={() => handleTogglePermission(pKey)}
                            disabled={selectedRole === 'ADMIN'}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              hasPerm ? 'bg-emerald-500' : 'bg-slate-200'
                            } ${selectedRole === 'ADMIN' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                hasPerm ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Security Advisory Alert */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex gap-3 text-xs">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-gray-900">Security Access Governance Advisory</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                Roles permissions directly impact microservices authorization headers at the API Gateway level. Altering scopes will mandate active users in those groups to re-authenticate on their next synchronization handshake interval (60 seconds standard cache ttl). ADMIN role carries global hard-coded overrides and cannot be mutated.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
