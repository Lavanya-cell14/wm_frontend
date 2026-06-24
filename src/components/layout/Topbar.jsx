import React from 'react';
import { Button } from 'shared-ui';
import { Menu, Bell, User, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const mapRoleLabel = (role) => {
  if (!role) return 'User';
  const r = role.toUpperCase();
  if (r === 'ADMIN') return 'Administrator';
  if (r === 'WAREHOUSE_MANAGER' || r === 'MANAGER') return 'Warehouse Manager';
  if (r === 'WAREHOUSE_OPERATOR' || r === 'OPERATOR' || r === 'STAFF') return 'Warehouse Operator';
  if (r === 'RECEIVING_INVENTORY_OFFICER' || r === 'CLERK' || r === 'INVENTORY') return 'Receiving Inventory Officer';
  return role;
};

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white shadow-sm flex items-center justify-between px-4 lg:px-8 z-40 sticky top-0">
      <div className="flex items-center">
        <Button 
          className="p-2 -ml-2 mr-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </Button>
      </div>

      
      <div className="flex items-center gap-3 sm:gap-4">
        <Button 
          onClick={toggleTheme}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-gray-600" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-400" />
          )}
        </Button>

        <Button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>
        
        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
        
        <div className="flex items-center gap-2 p-1.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#0071C1]">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:flex flex-col items-start mr-2">
            <span className="text-sm font-semibold text-gray-700 leading-tight">{user?.name || 'Admin User'}</span>
            <span className="text-[11px] text-gray-500">{mapRoleLabel(user?.role)}</span>
          </div>
        </div>

        <Button 
          onClick={handleLogout}
          className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors ml-1"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}

