// lib/auth.ts
export const TOKEN_KEY = "accessToken";

export function saveToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    // Also set a cookie for middleware access
    document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Lax`;
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

// Mock user data - replace with actual API calls
export const mockUsers = [
  { id: 1, email: 'user@example.com', password: 'password', username: 'demo_user' },
  { id: 2, email: 'test@example.com', password: 'test123', username: 'test_user' },
];

export interface User {
  id: number;
  email: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}