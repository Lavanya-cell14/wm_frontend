import React from 'react';
import { Users, Shield, Plus, Building, Mail, CheckCircle, XCircle } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import Button from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import SearchFilterBar from '../components/ui/SearchFilterBar';

const mockUsers = [
  { id: 'USR-01', name: 'Sarah Jenkins', email: 's.jenkins@warehouse.ai', role: 'admin', warehouse: 'All Facilities', status: 'active' },
  { id: 'USR-02', name: 'Michael Chen', email: 'm.chen@warehouse.ai', role: 'manager', warehouse: 'Central Fulfillment A', status: 'active' },
  { id: 'USR-03', name: 'David Rodriguez', email: 'd.rodriguez@warehouse.ai', role: 'operator', warehouse: 'East Coast Distribution', status: 'active' },
  { id: 'USR-04', name: 'Emma Wilson', email: 'e.wilson@warehouse.ai', role: 'operator', warehouse: 'West Coast Hub', status: 'inactive' },
  { id: 'USR-05', name: 'James Taylor', email: 'j.taylor@warehouse.ai', role: 'viewer', warehouse: 'All Facilities', status: 'active' },
];

export default function UsersRoles() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Users & Roles</h1>
          <p className="text-gray-500 text-sm mt-1">Manage system access, permissions, and staff assignments</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value="124" icon={Users} trend={2} trendLabel="new this month" />
        <StatCard title="Active Operators" value="86" icon={CheckCircle} />
        <StatCard title="Pending Invites" value="5" icon={Mail} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="flex-1">
            <SearchFilterBar placeholder="Search users by name, email, or role..." onSearch={() => {}} />
          </div>
          <Button variant="outline" className="gap-2">
            <Shield className="w-4 h-4" />
            Manage Roles
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Warehouse Assignment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={user.role === 'admin' ? 'primary' : user.role === 'manager' ? 'secondary' : 'default'}
                    className="capitalize"
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building className="w-4 h-4" />
                    {user.warehouse}
                  </div>
                </TableCell>
                <TableCell>
                  {user.status === 'active' ? (
                    <Badge variant="success" className="gap-1"><CheckCircle className="w-3 h-3"/> Active</Badge>
                  ) : (
                    <Badge variant="error" className="gap-1"><XCircle className="w-3 h-3"/> Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm" className={user.status === 'active' ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}>
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
