// lib/auth.ts
export const TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken"; // New constant

export function saveToken(accessToken: string, refreshToken?: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, accessToken);
    // Also set a cookie for middleware access
    document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
    
    if (refreshToken) {
      // Store refresh token for later use
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken); 
    }
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function logoutUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY); // Remove refresh token
    // Also remove the cookie
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
  }
}

export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem(TOKEN_KEY);
  }
  return false;
}

// Removed mockUsers array

export interface User {
  id: number;
  email: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
