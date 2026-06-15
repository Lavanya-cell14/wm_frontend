import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, Building, Mail, CheckCircle, XCircle } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import Button from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import Pagination from '../components/ui/Pagination';

const mockUsers = [
  { id: 'USR-01', name: 'Sarah Jenkins', email: 's.jenkins@warehouse.ai', role: 'admin', warehouse: 'All Facilities', status: 'active' },
  { id: 'USR-02', name: 'Michael Chen', email: 'm.chen@warehouse.ai', role: 'manager', warehouse: 'Central Fulfillment A', status: 'active' },
  { id: 'USR-03', name: 'David Rodriguez', email: 'd.rodriguez@warehouse.ai', role: 'staff', warehouse: 'East Coast Distribution', status: 'active' },
  { id: 'USR-04', name: 'Emma Wilson', email: 'e.wilson@warehouse.ai', role: 'staff', warehouse: 'West Coast Hub', status: 'inactive' },
  { id: 'USR-05', name: 'James Taylor', email: 'j.taylor@warehouse.ai', role: 'clerk', warehouse: 'All Facilities', status: 'active' },
  { id: 'USR-06', name: 'Alex Johnson', email: 'a.johnson@warehouse.ai', role: 'staff', warehouse: 'Central Fulfillment A', status: 'active' },
  { id: 'USR-07', name: 'Sophia Martinez', email: 's.martinez@warehouse.ai', role: 'staff', warehouse: 'Central Fulfillment A', status: 'active' },
  { id: 'USR-08', name: 'Liam Davies', email: 'l.davies@warehouse.ai', role: 'staff', warehouse: 'East Coast Distribution', status: 'active' },
  { id: 'USR-09', name: 'Olivia Brown', email: 'o.brown@warehouse.ai', role: 'manager', warehouse: 'West Coast Hub', status: 'active' },
  { id: 'USR-10', name: 'Noah Wilson', email: 'n.wilson@warehouse.ai', role: 'staff', warehouse: 'Central Fulfillment A', status: 'inactive' },
  { id: 'USR-11', name: 'Isabella Taylor', email: 'i.taylor@warehouse.ai', role: 'clerk', warehouse: 'East Coast Distribution', status: 'active' },
  { id: 'USR-12', name: 'Lucas Thomas', email: 'l.thomas@warehouse.ai', role: 'staff', warehouse: 'West Coast Hub', status: 'active' },
  { id: 'USR-13', name: 'Mia White', email: 'm.white@warehouse.ai', role: 'staff', warehouse: 'Central Fulfillment A', status: 'active' },
];

export default function UsersRoles() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination parameters
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
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
        <StatCard title="Total Users" value={String(mockUsers.length)} icon={Users} trend={2} trendLabel="new this month" />
        <StatCard title="Active Staff" value={String(mockUsers.filter(u => u.role === 'staff' && u.status === 'active').length)} icon={CheckCircle} />
        <StatCard title="Pending Invites" value="5" icon={Mail} />
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
