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
}

export interface AuthResponse {
  accessToken: string; 
  refreshToken: string; 
  user: User;
}

// ----------------------
// 1. SAVE TOKEN (FIXES BUILD ERROR IN LOGIN PAGE)
// ----------------------
/**
 * Saves the access and refresh tokens to localStorage and sets the access token cookie.
 * This function is needed by 'app/login/page.tsx'
 */
export function saveToken(accessToken: string, refreshToken?: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, accessToken);
    
    // Set a cookie for Next.js Middleware to read the token
    document.cookie = `${TOKEN_KEY}=${accessToken}; path=/; max-age=86400; SameSite=Lax; secure;`;
    
    if (refreshToken) {
      // Store refresh token for session renewal/logout API call
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken); 
    }
  }
}

// ----------------------
// 2. GETTERS
// ----------------------
/**
 * Retrieves the access token. (Needed by middleware and protected API calls)
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * Retrieves the refresh token. (Needed by logout)
 */
export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
}

/**
 * Checks if a user is authenticated. (NEEDED BY HEADER/MIDDLEWARE)
 */
export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem(TOKEN_KEY);
  }
  return false;
}

// ----------------------
// 3. LOGOUT (Integrated with live backend API)
// ----------------------
/**
 * Logs the user out: calls the backend API to invalidate the refresh token 
 * and cleans up local storage/cookies.
 */
export async function logoutUser() { 
  if (typeof window !== 'undefined') {
    const refreshToken = getRefreshToken();
    // API_BASE is 'https://adet-aiah.onrender.com/auth'
    const LOGOUT_API_URL = `${API_BASE}/logout`; 

    if (refreshToken) {
        try {
            // Call the NestJS API logout endpoint to invalidate the session token
            await fetch(LOGOUT_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }), 
            });
        } catch (error) {
            console.error("Failed to call backend logout API:", error);
        }
    }
    
    // Client-side cleanup: Remove tokens from storage and cookie
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    // Clear the cookie by setting an expiry date in the past
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
  }
}
