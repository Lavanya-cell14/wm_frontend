import React from 'react';
import { Menu, Search, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white shadow-sm flex items-center justify-between px-4 lg:px-8 z-40 sticky top-0">
      <div className="flex items-center">
        <button 
          className="p-2 -ml-2 mr-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="hidden sm:flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#56A8F0] focus-within:border-[#56A8F0] transition-all">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-48 text-gray-700 outline-none"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
        
        <div className="flex items-center gap-2 p-1.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#0071C1]">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:flex flex-col items-start mr-2">
            <span className="text-sm font-semibold text-gray-700 leading-tight">{user?.name || 'Admin User'}</span>
            <span className="text-[11px] text-gray-500 capitalize">{user?.role?.toLowerCase().replace('_', ' ') || 'Manager'}</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors ml-1"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

