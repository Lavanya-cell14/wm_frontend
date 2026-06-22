import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, Building, Mail, CheckCircle, XCircle } from 'lucide-react';
import { DashboardStatCard, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, SearchFilterBar, Pagination } from 'shared-ui';

import { useWarehouse } from '../context/WarehouseContext';

export default function UsersRoles() {
  const { workers } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredUsers = (workers || []).map(w => ({
    id: w.id,
    name: w.name,
    email: w.email,
    role: (w.role === 'WAREHOUSE_OPERATOR' || w.role === 'staff') ? 'staff' : (w.role === 'WAREHOUSE_MANAGER' || w.role === 'manager') ? 'manager' : (w.role === 'RECEIVING_INVENTORY_OFFICER' || w.role === 'clerk') ? 'clerk' : w.role.toLowerCase(),
    warehouse: w.warehouse,
    status: (w.status || '').toLowerCase() === 'active' ? 'active' : 'inactive'
  })).filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination parameters
  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        <DashboardStatCard title="Total Users" value={String(filteredUsers.length)} icon={Users} trend={2} trendLabel="new this month" />
        <DashboardStatCard title="Active Staff" value={String(filteredUsers.filter(u => u.role === 'staff' && u.status === 'active').length)} icon={CheckCircle} />
        <DashboardStatCard title="Pending Invites" value="0" icon={Mail} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="flex-1">
            <SearchFilterBar 
              placeholder="Search users by name, email, or role..." 
              onSearch={(val) => setSearchQuery(val)} 
            />
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
            {paginatedUsers.map((user) => (
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
                    variant={user.role === 'admin' ? 'primary' : user.role === 'manager' ? 'secondary' : user.role === 'clerk' ? 'warning' : 'default'}
                  >
                    {user.role === 'clerk' ? 'Inventory Officer' : user.role === 'staff' ? 'Warehouse Operator' : user.role === 'manager' ? 'Warehouse Manager' : user.role === 'admin' ? 'System Admin' : user.role}
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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredUsers.length}
          pageSize={itemsPerPage}
        />
      </div>
    </div>
  );
}
