import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { sidebarItems } from '../../data/sidebarItems';

export default function Sidebar({ onMobileClose }) {
  return (
    <aside className="w-full h-full flex flex-col justify-between z-[150] transition-all duration-300 relative bg-gradient-to-b from-[#114a87] via-[#1d5fa3] to-[#2672bb] shadow-[20px_0_60px_rgba(17,74,135,0.3)]">
      <div>
        <div className="flex items-center pt-5 px-4 pb-5 border-b border-white/10">
          <div className="flex items-center justify-between w-full">
            <div className="text-white font-bold text-xl tracking-wider">Warehouse<span className="text-blue-300">AI</span></div>
            {onMobileClose && (
              <button 
                onClick={onMobileClose}
                className="ml-auto p-1.5 bg-black/15 hover:bg-black/25 rounded-lg transition-colors lg:hidden"
              >
                <ChevronLeft className="text-white w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        <div className="relative mt-4 flex-1 overflow-y-auto px-3">
          <nav className="flex flex-col relative z-10 gap-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => 
                    `group flex items-center gap-3 pl-4 px-4 h-11 font-medium rounded-xl transition-all duration-300 ease-in-out ${
                      isActive 
                        ? 'text-white bg-white/15 backdrop-blur-sm' 
                        : 'text-blue-100/70 hover:text-white hover:bg-white/8'
                    }`
                  }
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <span className="text-[13px] tracking-wide">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
      
      <div className="relative border-t border-white/10 px-3 py-3">
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-semibold text-blue-200/50 uppercase tracking-widest mb-1 pl-2">System</div>
          <div className="flex items-center cursor-pointer py-2.5 rounded-xl text-blue-100/70 hover:text-white hover:bg-white/8 transition-all text-[13px] font-medium gap-3 pl-4 px-4">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>All Systems Operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
