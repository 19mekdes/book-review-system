// C:\Users\PC_1\OneDrive\Desktop\Book Review\BOOK\src\hooks\useRole.ts
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'user' | 'moderator';

export const useRole = () => {
  const { user } = useAuth();

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const isUser = (): boolean => {
    return user?.role === 'user';
  };

  const isModerator = (): boolean => {
    return user?.role === 'moderator';
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role as UserRole);
  };

  const getRole = (): UserRole | null => {
    return user?.role as UserRole || null;
  };

  return {
    isAdmin,
    isUser,
    isModerator,
    hasRole,
    getRole,
    role: user?.role
  };
};

export default useRole;