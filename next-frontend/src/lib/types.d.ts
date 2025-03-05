// User types

export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  roles?: string[];
}

/**
 * Extend the built-in types from Next-Auth
 */
declare module "next-auth" {
  interface Session {
    user: User;
    expires: string;
    accessToken: string;
    error?: string;
  }
}

export interface UserInfo {
  sub: string;  // Keycloak user ID
  email?: string;
  emailVerified?: boolean;
  preferredUsername?: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  locale?: string;
  realmAccess?: { [key: string]: string[] };  // Roles
  resourceAccess?: { [key: string]: { [key: string]: string[] } };  // Client roles
}

interface User {
  id: string;
  username: string;
  email?: string;
  company?: string;
  position?: string;
  phone?: string;
  address?: string;
  profileData?: Record<string, never>;
  createdAt?: string; // using ISO string format for datetime
  updatedAt?: string;
}


// Item types
export interface Item {
  id: number;
  title: string;
  description?: string;
  owner_id: string;
}

export interface ItemCreate {
  title: string;
  description?: string;
}

export interface ItemUpdate {
  title?: string;
  description?: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
