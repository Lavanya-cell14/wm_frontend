import React, { createContext, useContext, useState, useEffect } from 'react';

export const mockUsers = [
  { name: 'Warehouse Manager', email: 'manager@warehouseai.com', password: 'Manager@123', role: 'WAREHOUSE_MANAGER' },
  { name: 'Warehouse Operator', email: 'staff@warehouseai.com', password: 'Staff@123', role: 'WAREHOUSE_OPERATOR' },
  { name: 'Receiving & Inventory Officer', email: 'inventory@warehouseai.com', password: 'Inventory@123', role: 'RECEIVING_INVENTORY_OFFICER' },
  { name: 'System Admin', email: 'admin@warehouseai.com', password: 'Admin@123', role: 'ADMIN' }
];

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('warehouseUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser && parsedUser.role === 'OPERATOR') {
        localStorage.removeItem('warehouseUser');
        setUser(null);
      } else {
        setUser(parsedUser);
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('warehouseUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('warehouseUser');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
