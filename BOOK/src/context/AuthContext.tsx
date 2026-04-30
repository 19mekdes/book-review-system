import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  roleId: number;
  avatar?: string;
  bio?: string;
  location?: string;
  created_at?: string;
}
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load stored auth
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setToken(storedToken);
        setUser(parsedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
      }
    }

    setLoading(false);
  }, []);


  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user: userData } = res.data;

      setToken(accessToken);
      setUser(userData);

      
      localStorage.setItem('token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(userData));

      
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      
      if (userData.roleId === 1 || userData.role === 'admin' || userData.role === 'Admin') {
        
        navigate('/admin');
      } else {
        
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };


  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const isAuthenticated = !!token && !!user;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};