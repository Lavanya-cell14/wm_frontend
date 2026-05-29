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
  AlertBanner,
  SearchFilterBar
} from 'shared-ui';
import { Users, Plus, Mail, CheckCircle2, XCircle, Lock, Edit2, ShieldAlert, KeyRound } from 'lucide-react';

export default function UserManagement() {
  const { user: currentAdmin } = useAuth();
  const { logAudit, workers: usersList, setWorkers: setUsersList, generateNextId } = useWarehouse();

  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingUserId, setEditingUserId] = useState(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('STAFF');
  const [formWarehouse, setFormWarehouse] = useState('Central Fulfillment A');
  const [formStatus, setFormStatus] = useState('Active');

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormName('');
    setFormEmail('');
    setFormRole('STAFF');
    setFormWarehouse('Central Fulfillment A');
    setFormStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setModalMode('edit');
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormWarehouse(user.warehouse);
    setFormStatus(user.status);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (id) => {
    const updated = usersList.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
        
        // Log Audit Event
        logAudit(
          currentAdmin?.email || 'admin@warehouseai.com',
          'ADMIN',
          nextStatus === 'Active' ? 'USER_ACTIVATE' : 'USER_DEACTIVATE',
          'Users',
          `Changed status of ${u.name} (${u.email}) to ${nextStatus}`
        );

        showToast(`User status for ${u.name} set to ${nextStatus}.`, 'success');
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsersList(updated);
  };

  const handleResetPassword = (name, email) => {
    logAudit(
      currentAdmin?.email || 'admin@warehouseai.com',
      'ADMIN',
      'USER_PASSWORD_RESET',
      'Users',
      `Triggered security password reset invitation for ${name} (${email})`
    );
    showToast(`Password reset link dispatched securely to ${email}.`, 'success');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formName || !formEmail) {
      showToast('Please fulfill all user input fields.', 'error');
      return;
    }

    if (modalMode === 'add') {
      const nextId = generateNextId('WRK-', usersList.map(u => u.id));
      const newUser = {
        id: nextId,
        name: formName,
        email: formEmail,
        role: formRole,
        warehouse: formWarehouse,
        status: formStatus,
        lastLogin: 'Never',
        createdAt: new Date().toISOString().split('T')[0]
      };

      setUsersList([...usersList, newUser]);

      // Audit Log
      logAudit(
        currentAdmin?.email || 'admin@warehouseai.com',
        'ADMIN',
        'USER_PROVISIONED',
        'Users',
        `Successfully created new user account for ${newUser.name} with role ${newUser.role}`
      );

      showToast(`User ${newUser.name} created successfully!`, 'success');
    } else {
      // Edit mode
      const updated = usersList.map(u => {
        if (u.id === editingUserId) {
          // Audit Log
          logAudit(
            currentAdmin?.email || 'admin@warehouseai.com',
            'ADMIN',
            'USER_DETAILS_MUTATION',
            'Users',
            `Modified profile values of ${u.name} (Role: ${formRole}, WH: ${formWarehouse})`
          );

          return {
            ...u,
            name: formName,
            email: formEmail,
            role: formRole,
            warehouse: formWarehouse,
            status: formStatus
          };
        }
        return u;
      });
      setUsersList(updated);
      showToast(`User profile values updated successfully!`, 'success');
    }

    setIsModalOpen(false);
  };

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type={toastType} message={toastMessage} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-[#0071C1]" />
            User Management Registry
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Provision staff profiles, configure warehouse assignments, reset security keys, and govern user lifecycle.
          </p>
        </div>
        <Button className="gap-2 font-semibold" onClick={handleOpenAddModal}>
          <Plus className="w-4 h-4" />
          Provision User
        </Button>
      </div>

      {/* Search Input Filter */}
      <div className="space-y-3">
        <SearchFilterBar 
          searchPlaceholder="Search profiles by name, email, or role access..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Registry Table */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-slate-50/50 flex flex-row justify-between items-center pb-4">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">Platform Accounts Ledger</CardTitle>
            <CardDescription>Live database ledger displaying core user settings and last verified access telemetry.</CardDescription>
          </div>
          <Badge variant="primary">{filteredUsers.length} Users Listed</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / Credentials</TableHead>
                <TableHead>Role Access</TableHead>
                <TableHead>Assigned Warehouse</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead>Last Sign-In</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500 text-sm font-medium">
                    No active user accounts found matching query.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  let roleBadge = 'default';
                  if (user.role === 'ADMIN') roleBadge = 'error';
                  else if (user.role === 'MANAGER') roleBadge = 'primary';
                  else if (user.role === 'INVENTORY_CLERK') roleBadge = 'warning';

                  return (
                    <TableRow key={user.id} className="hover:bg-slate-50/20 transition-colors">
                      {/* Name & Email */}
                      <TableCell>
                        <div className="font-bold text-gray-900 text-xs">{user.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {user.email}
                        </div>
                      </TableCell>

                      {/* Role */}
                      <TableCell>
                        <Badge variant={roleBadge} className="text-[9px] font-bold">
                          {user.role}
                        </Badge>
                      </TableCell>

                      {/* Assigned Warehouse */}
                      <TableCell className="text-xs text-gray-600 font-semibold font-sans">
                        {user.warehouse}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {user.status === 'Active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-50 text-red-700 border-red-200">
                            <XCircle className="w-3.5 h-3.5" />
                            Inactive
                          </span>
                        )}
                      </TableCell>

                      {/* Last Login */}
                      <TableCell className="text-xs text-gray-400 font-medium">
                        {user.lastLogin}
                      </TableCell>

                      {/* Created At */}
                      <TableCell className="text-xs text-gray-400 font-medium font-mono">
                        {user.createdAt}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex gap-1.5 justify-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[10px] h-7 px-2 font-medium"
                            onClick={() => handleOpenEditModal(user)}
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[10px] h-7 px-2 font-medium"
                            onClick={() => handleResetPassword(user.name, user.email)}
                          >
                            <KeyRound className="w-3 h-3 mr-1 text-amber-500" />
                            Reset
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`text-[10px] h-7 px-2 font-medium ${user.status === 'Active' ? 'text-red-600 border-red-100 hover:bg-red-50' : 'text-emerald-600 border-emerald-100 hover:bg-emerald-50'}`}
                            onClick={() => handleToggleStatus(user.id)}
                          >
                            {user.status === 'Active' ? 'Disable' : 'Enable'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit/Add Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden transform scale-100 transition-all duration-300">
            <div className="p-6 bg-slate-50 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0071C1]" />
                {modalMode === 'add' ? 'Provision New User' : 'Edit User Settings'}
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">
                Establish or modify account metadata access constraints.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs font-semibold text-gray-700">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wide block text-[10px]">Full Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Liam Sterling"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wide block text-[10px]">Email Address</label>
                <input 
                  type="email"
                  placeholder="e.g. l.sterling@warehouseai.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                  required
                />
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wide block text-[10px]">Security Role Profile</label>
                <select 
                  value={formRole} 
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                >
                  <option value="ADMIN">ADMIN (System Control)</option>
                  <option value="MANAGER">MANAGER (Fulfillment Control)</option>
                  <option value="STAFF">STAFF (Floor Operations)</option>
                  <option value="INVENTORY_CLERK">INVENTORY_CLERK (Quarantines & Audits)</option>
                  <option value="OPERATOR">OPERATOR (AGV Paths & Heavy Load)</option>
                </select>
              </div>

              {/* Warehouse Assignment */}
              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wide block text-[10px]">Assigned Warehouse</label>
                <select 
                  value={formWarehouse} 
                  onChange={(e) => setFormWarehouse(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                >
                  <option value="All Facilities">All Facilities (Global Admin)</option>
                  <option value="Central Fulfillment A">Central Fulfillment A</option>
                  <option value="East Coast Distribution">East Coast Distribution</option>
                  <option value="West Coast Hub">West Coast Hub</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wide block text-[10px]">Activation Status</label>
                <select 
                  value={formStatus} 
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                >
                  <option value="Active">Active Account (Full Sync)</option>
                  <option value="Inactive">Inactive Account (Locked Access)</option>
                </select>
              </div>

              {/* Footer */}
              <div className="flex gap-2.5 justify-end pt-4 border-t border-gray-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                >
                  {modalMode === 'add' ? 'Provision User' : 'Save Profiles'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
