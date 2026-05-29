import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { sidebarItems } from '../../data/sidebarItems';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ onMobileClose, isCollapsed = false, onToggleCollapse }) {
  const { user } = useAuth();
  
  return (
    <aside className="w-full h-full flex flex-col justify-between z-[150] transition-all duration-300 relative bg-gradient-to-b from-[#114a87] via-[#1d5fa3] to-[#2672bb] shadow-[20px_0_60px_rgba(17,74,135,0.3)]">
      <div>
        {/* Header Block */}
        <div className="flex items-center pt-5 px-4 pb-5 border-b border-white/10 min-h-[65px]">
          <div className="flex items-center justify-between w-full">
            {!isCollapsed ? (
              <div className="text-white font-bold text-xl tracking-wider animate-in fade-in duration-200">
                Warehouse<span className="text-blue-300">AI</span>
              </div>
            ) : (
              <div className="text-white font-black text-xl mx-auto font-mono text-center tracking-wider animate-in fade-in duration-200">
                W<span className="text-blue-300">A</span>
              </div>
            )}
            
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
        
        {/* Nav list */}
        <div className="relative mt-4 flex-1 overflow-y-auto px-3 max-h-[calc(100vh-140px)]">
          <nav className="flex flex-col relative z-10 gap-1.5">
            {sidebarItems
              .filter(item => !item.allowedRoles || item.allowedRoles.includes(user?.role))
              .map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    title={isCollapsed ? item.name : undefined}
                    className={({ isActive }) => 
                      `group flex items-center relative font-semibold rounded-xl transition-all duration-200 ease-in-out ${
                        isCollapsed ? 'justify-center h-11 w-11 mx-auto' : 'gap-3 px-4 h-11'
                      } ${
                        isActive 
                          ? 'text-white bg-white/15 backdrop-blur-sm' 
                          : 'text-blue-100/70 hover:text-white hover:bg-white/8'
                      }`
                    }
                  >
                    {/* Active highlight strip */}
                    {({ isActive }) => (
                      <>
                        {isActive && !isCollapsed && (
                          <span className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-md bg-white animate-in slide-in-from-left duration-250"></span>
                        )}
                        <Icon className={`flex-shrink-0 transition-transform group-hover:scale-110 duration-200 ${
                          isCollapsed ? 'w-5 h-5' : 'w-[18px] h-[18px]'
                        }`} />
                        {!isCollapsed && (
                          <span className="text-[13px] tracking-wide animate-in fade-in duration-200">{item.name}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
          </nav>
        </div>
      </div>
      
      {/* Footer Block */}
      <div className="relative border-t border-white/10 px-3 py-3 shrink-0 flex flex-col gap-2">
        {/* System Operations Status indicator */}
        {!isCollapsed && (
          <div className="flex flex-col gap-1 animate-in fade-in duration-200">
            <div className="text-[10px] font-semibold text-blue-200/50 uppercase tracking-widest mb-1 pl-2">System</div>
            <div className="flex items-center cursor-pointer py-2.5 rounded-xl text-blue-100/70 hover:text-white hover:bg-white/8 transition-all text-[13px] font-medium gap-3 pl-4 px-4">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span>Operational</span>
            </div>
          </div>
        )}

        {/* Collapsible toggle chevron button on desktop */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="w-10 h-10 mx-auto hidden lg:flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-xl transition-all border border-white/5 shadow-inner"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-white" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-white" />
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
