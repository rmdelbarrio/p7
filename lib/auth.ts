// lib/auth.ts
// This file contains all client-side authentication logic and utilities.

import { API_BASE } from "./config"; 

// Constants
export const TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";

// Interfaces
export interface User {
  id: number;
  email: string; 
  username: string;
  role: string; // Ensure role is here for client-side checks
}

export interface AuthResponse {
  accessToken: string; 
  refreshToken: string; 
  user: User;
}

// Helper function to decode JWT payload (not fully secure, but sufficient for roles)
export function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// ----------------------
// 1. SAVE TOKEN 
// ----------------------
export function saveToken(accessToken: string, refreshToken?: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, accessToken);
    document.cookie = `${TOKEN_KEY}=${accessToken}; path=/; max-age=86400; SameSite=Lax; secure;`;
    
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken); 
    }
  }
}

// ----------------------
// 2. GETTERS
// ----------------------
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    // FIX: Changing return value logic slightly to force re-evaluation by the compiler
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? token : null;
  }
  return null;
}

export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
}

export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem(TOKEN_KEY);
  }
  return false;
}

export function getUserRole(): string | null {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const payload = decodeJwt(token);
    return payload ? payload.role : null;
  }
  return null;
}

// ----------------------
// 3. LOGOUT 
// ----------------------
export async function logoutUser() { 
  if (typeof window !== 'undefined') {
    const refreshToken = getRefreshToken();
    const LOGOUT_API_URL = `${API_BASE}/logout`; 

    if (refreshToken) {
        try {
            await fetch(LOGOUT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }), 
            });
        } catch (error) {
            console.error("Failed to call backend logout API:", error);
        }
    }
    
    // Client-side cleanup
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
  }
}
