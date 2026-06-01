import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

function parseToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return {}; }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('tt_token'));

  function login(newToken) {
    localStorage.setItem('tt_token', newToken);
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem('tt_token');
    setToken(null);
  }

  const payload = token ? parseToken(token) : {};

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout, username: payload.username || '', managerName: payload.name || '' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
