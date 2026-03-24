import { UserRole } from '../types/user.types';

// ============================================
// Role Hierarchy & Permissions
// ============================================

/**
 * Role hierarchy where higher roles inherit permissions from lower roles
 * Admin > Moderator > User
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'Admin': 100,
  'Moderator': 50,
  'User': 10,
};

/**
 * Permission definitions for each role
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  'Admin': [
    'view_dashboard',
    'manage_users',
    'manage_books',
    'manage_reviews',
    'manage_categories',
    'moderate_content',
    'view_reports',
    'export_data',
    'import_data',
    'manage_settings',
    'view_analytics',
    'manage_roles',
    'delete_content',
    'ban_users',
    'feature_books',
    'pin_reviews',
    'send_notifications',
    'view_logs',
    'manage_badges',
    'access_all'
  ],
  
  'Moderator': [
    'view_dashboard',
    'moderate_reviews',
    'flag_content',
    'view_reports',
    'export_data',
    'feature_books',
    'pin_reviews',
    'view_analytics',
    'manage_own_content',
    'edit_own_profile',
    'delete_own_content',
    'report_content',
    'view_public_data'
  ],
  
  'User': [
    'view_public_data',
    'create_reviews',
    'edit_own_reviews',
    'delete_own_reviews',
    'comment_on_reviews',
    'like_content',
    'bookmark_books',
    'follow_users',
    'create_reading_list',
    'edit_own_profile',
    'upload_avatar',
    'change_own_password',
    'report_content',
    'view_own_analytics',
    'export_own_data'
  ],
};

/**
 * Resource-based permissions
 */
export const RESOURCE_PERMISSIONS = {
  BOOKS: {
    view: ['Admin', 'Moderator', 'User'] as UserRole[],
    create: ['Admin', 'Moderator'] as UserRole[],
    edit: ['Admin', 'Moderator'] as UserRole[],
    delete: ['Admin'] as UserRole[],
    feature: ['Admin', 'Moderator'] as UserRole[],
    archive: ['Admin'] as UserRole[],
  },
  REVIEWS: {
    view: ['Admin', 'Moderator', 'User'] as UserRole[],
    create: ['Admin', 'Moderator', 'User'] as UserRole[],
    edit: ['Admin', 'Moderator'] as UserRole[],
    delete: ['Admin', 'Moderator'] as UserRole[],
    moderate: ['Admin', 'Moderator'] as UserRole[],
    feature: ['Admin', 'Moderator'] as UserRole[],
    pin: ['Admin', 'Moderator'] as UserRole[],
  },
  USERS: {
    view: ['Admin', 'Moderator', 'User'] as UserRole[],
    edit: ['Admin'] as UserRole[],
    delete: ['Admin'] as UserRole[],
    ban: ['Admin'] as UserRole[],
    promote: ['Admin'] as UserRole[],
    view_sensitive: ['Admin'] as UserRole[],
  },
  CATEGORIES: {
    view: ['Admin', 'Moderator', 'User'] as UserRole[],
    create: ['Admin'] as UserRole[],
    edit: ['Admin'] as UserRole[],
    delete: ['Admin'] as UserRole[],
  },
  ANALYTICS: {
    view_basic: ['Admin', 'Moderator', 'User'] as UserRole[],
    view_detailed: ['Admin', 'Moderator'] as UserRole[],
    view_admin: ['Admin'] as UserRole[],
  },
} as const;

// ============================================
// Core Role Guard Functions
// ============================================

/**
 * Check if a role has sufficient hierarchy level
 */
export const hasRoleLevel = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
};

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (
  userRole: UserRole,
  permission: string,
  options?: {
    resource?: string;
    ownerId?: number;
    currentUserId?: number;
  }
): boolean => {
  // Check if user has the permission through their role
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  
  if (rolePermissions.includes('access_all') || rolePermissions.includes(permission)) {
    return true;
  }

  // Check if user is the owner of the resource (for self-modification)
  if (options?.ownerId && options?.currentUserId) {
    if (options.ownerId === options.currentUserId) {
      // Users can always edit their own content
      if (permission.includes('edit_own') || permission.includes('delete_own')) {
        return true;
      }
      
      // Specific resource-based self permissions
      if (permission === 'edit_review' && userRole === 'User') {
        return true;
      }
      if (permission === 'delete_review' && userRole === 'User') {
        return true;
      }
      if (permission === 'edit_profile' && userRole === 'User') {
        return true;
      }
    }
  }

  return false;
};

/**
 * Check if user can access a specific resource
 */
export const canAccessResource = (
  userRole: UserRole,
  resource: keyof typeof RESOURCE_PERMISSIONS,
  action: string,
  options?: {
    ownerId?: number;
    currentUserId?: number;
  }
): boolean => {
  const resourcePermissions = RESOURCE_PERMISSIONS[resource];
  
  if (!resourcePermissions) {
    return false;
  }

  // Check if the action exists for this resource
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allowedRoles = (resourcePermissions as any)[action];
  
  if (!allowedRoles || !Array.isArray(allowedRoles)) {
    return false;
  }

  // Check if user's role is in the allowed roles
  if (allowedRoles.includes(userRole)) {
    return true;
  }

  // Special case: users can edit/delete their own reviews
  if ((action === 'edit' || action === 'delete') && resource === 'REVIEWS') {
    if (options?.ownerId && options?.currentUserId && options.ownerId === options.currentUserId) {
      return true;
    }
  }

  // Special case: users can edit their own profile
  if (action === 'edit' && resource === 'USERS') {
    if (options?.ownerId && options?.currentUserId && options.ownerId === options.currentUserId) {
      return true;
    }
  }

  return false;
};

// ============================================
// Role-based Route Guards
// ============================================

export interface RouteGuardResult {
  allowed: boolean;
  redirectTo?: string;
  message?: string;
}

/**
 * Check if user can access a route
 */
export const canAccessRoute = (
  userRole: UserRole,
  requiredRole: UserRole | UserRole[],
  options?: {
    redirectTo?: string;
    message?: string;
  }
): RouteGuardResult => {
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  const hasAccess = requiredRoles.some(role => hasRoleLevel(userRole, role));
  
  if (!hasAccess) {
    return {
      allowed: false,
      redirectTo: options?.redirectTo || '/',
      message: options?.message || 'You do not have permission to access this page.',
    };
  }

  return { allowed: true };
};

/**
 * Check if user can access admin routes
 */
export const canAccessAdmin = (userRole: UserRole): RouteGuardResult => {
  return canAccessRoute(userRole, 'Admin', {
    redirectTo: '/dashboard',
    message: 'Admin access required.',
  });
};

/**
 * Check if user can access moderator routes
 */
export const canAccessModerator = (userRole: UserRole): RouteGuardResult => {
  return canAccessRoute(userRole, ['Admin', 'Moderator'], {
    redirectTo: '/dashboard',
    message: 'Moderator access required.',
  });
};

// ============================================
// UI Component Guards
// ============================================

/**
 * Check if a UI element should be shown based on role
 */
export const shouldShowElement = (
  userRole: UserRole,
  requiredRole: UserRole | UserRole[]
): boolean => {
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return requiredRoles.some(role => hasRoleLevel(userRole, role));
};

/**
 * Get visible actions for a user on a resource
 */
export const getVisibleActions = (
  userRole: UserRole,
  resource: keyof typeof RESOURCE_PERMISSIONS,
  options?: {
    ownerId?: number;
    currentUserId?: number;
  }
): string[] => {
  const actions: string[] = [];
  const resourcePermissions = RESOURCE_PERMISSIONS[resource];

  if (!resourcePermissions) {
    return actions;
  }

  Object.entries(resourcePermissions).forEach(([action, allowedRoles]) => {
    if (allowedRoles.includes(userRole)) {
      actions.push(action);
    } else if (
      (action === 'edit' || action === 'delete') &&
      options?.ownerId &&
      options?.currentUserId &&
      options.ownerId === options.currentUserId
    ) {
      actions.push(action);
    }
  });

  return actions;
};

// ============================================
// Role-based Data Filtering
// ============================================

/**
 * Filter sensitive data based on user role
 */
export const filterSensitiveData = <T extends Record<string, unknown>>(
  data: T,
  userRole: UserRole,
  sensitiveFields: string[]
): Partial<T> => {
  if (userRole === 'Admin') {
    return data;
  }

  const filtered = { ...data };
  sensitiveFields.forEach(field => {
    delete filtered[field];
  });

  return filtered;
};

/**
 * Get visible fields for a user
 */
export const getVisibleFields = (
  userRole: UserRole,
  allFields: string[],
  fieldVisibility: Record<string, UserRole[]>
): string[] => {
  return allFields.filter(field => {
    const allowedRoles = fieldVisibility[field];
    return !allowedRoles || allowedRoles.includes(userRole);
  });
};

// ============================================
// Permission List
// ============================================

export const PERMISSIONS = {
  // User permissions
  VIEW_PUBLIC_DATA: 'view_public_data',
  CREATE_REVIEW: 'create_reviews',
  EDIT_OWN_REVIEW: 'edit_own_reviews',
  DELETE_OWN_REVIEW: 'delete_own_reviews',
  COMMENT: 'comment_on_reviews',
  LIKE: 'like_content',
  BOOKMARK: 'bookmark_books',
  FOLLOW: 'follow_users',
  CREATE_READING_LIST: 'create_reading_list',
  EDIT_OWN_PROFILE: 'edit_own_profile',
  UPLOAD_AVATAR: 'upload_avatar',
  CHANGE_OWN_PASSWORD: 'change_own_password',
  REPORT_CONTENT: 'report_content',
  VIEW_OWN_ANALYTICS: 'view_own_analytics',
  EXPORT_OWN_DATA: 'export_own_data',

  // Moderator permissions
  VIEW_DASHBOARD: 'view_dashboard',
  MODERATE_REVIEWS: 'moderate_reviews',
  FLAG_CONTENT: 'flag_content',
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  FEATURE_BOOKS: 'feature_books',
  PIN_REVIEWS: 'pin_reviews',
  VIEW_ANALYTICS: 'view_analytics',

  // Admin permissions
  MANAGE_USERS: 'manage_users',
  MANAGE_BOOKS: 'manage_books',
  MANAGE_REVIEWS: 'manage_reviews',
  MANAGE_CATEGORIES: 'manage_categories',
  MODERATE_CONTENT: 'moderate_content',
  IMPORT_DATA: 'import_data',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_DETAILED_ANALYTICS: 'view_detailed_analytics',
  MANAGE_ROLES: 'manage_roles',
  DELETE_CONTENT: 'delete_content',
  BAN_USERS: 'ban_users',
  SEND_NOTIFICATIONS: 'send_notifications',
  VIEW_LOGS: 'view_logs',
  MANAGE_BADGES: 'manage_badges',
  ACCESS_ALL: 'access_all',
} as const;

// ============================================
// Role Labels
// ============================================

export const ROLE_LABELS: Record<UserRole, string> = {
  'Admin': 'Administrator',
  'Moderator': 'Moderator',
  'User': 'User',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  'Admin': 'Full access to all system features and settings',
  'Moderator': 'Can moderate content and manage reports',
  'User': 'Standard user with basic permissions',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  'Admin': '#f44336',
  'Moderator': '#ff9800',
  'User': '#2196f3',
};

// ============================================
// Default Export
// ============================================

const roleGuard = {
  // Core functions
  hasRoleLevel,
  hasPermission,
  canAccessResource,
  canAccessRoute,
  canAccessAdmin,
  canAccessModerator,
  shouldShowElement,
  getVisibleActions,
  filterSensitiveData,
  getVisibleFields,
  
  // Constants
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  RESOURCE_PERMISSIONS,
  PERMISSIONS,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_COLORS,
};

export default roleGuard;