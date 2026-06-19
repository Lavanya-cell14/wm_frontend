import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    name: 'Demo User',
    email: 'user@warehouseai.com',
    role: 'WAREHOUSE_MANAGER'
  });

  useEffect(() => {
    const updateRoleFromPath = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        setUser({
          name: 'System Admin',
          email: 'admin@warehouseai.com',
          role: 'ADMIN'
        });
      } else if (path.startsWith('/manager')) {
        setUser({
          name: 'Warehouse Manager',
          email: 'manager@warehouseai.com',
          role: 'WAREHOUSE_MANAGER'
        });
      } else if (path.startsWith('/operator') || path.startsWith('/staff')) {
        setUser({
          name: 'Warehouse Operator',
          email: 'staff@warehouseai.com',
          role: 'WAREHOUSE_OPERATOR'
        });
      } else if (path.startsWith('/inventory')) {
        setUser({
          name: 'Inventory Officer',
          email: 'inventory@warehouseai.com',
          role: 'RECEIVING_INVENTORY_OFFICER'
        });
      }
    };

    updateRoleFromPath();

    // Listen for path changes
    window.addEventListener('popstate', updateRoleFromPath);
    
    // Hijack history methods to detect client-side route changes
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      updateRoleFromPath();
    };
    
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      updateRoleFromPath();
    };

    return () => {
      window.removeEventListener('popstate', updateRoleFromPath);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  const logout = () => {
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, logout, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: {
        name: 'Demo User',
        email: 'user@warehouseai.com',
        role: 'WAREHOUSE_MANAGER'
      },
      logout: () => {},
      isAuthenticated: true
    };
  }
  return context;
}
