// lib/auth.ts
import { API_BASE } from "./config"; // Import API_BASE

export const TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken"; 

// ... (other functions remain the same)

export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
}

export async function logoutUser() { // Made asynchronous to handle API call
  if (typeof window !== 'undefined') {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
        try {
            // Attempt to call the NestJS API logout endpoint
            await fetch(`${API_BASE}/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Note: Your NestJS API might expect the Refresh Token in the Authorization header
                    // or in the body. I'll send it in the body as a common practice for clean logout,
                    // but you might need to adjust this based on your backend logic.
                    // For now, let's assume the API requires the refresh token to invalidate the session.
                },
                body: JSON.stringify({ refreshToken }), // Sending refreshToken to invalidate session
            });
        } catch (error) {
            // Log error but continue with client-side cleanup, 
            // as the most important thing is logging the user out locally.
            console.error("Failed to call backend logout API:", error);
        }
    }
    
    // Client-side cleanup
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
  }
}

export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    // A user is considered authenticated if they have an access token
    return !!localStorage.getItem(TOKEN_KEY);
  }
  return false;
}

export interface User {
  id: number;
  email: string;
  username: string;
}

export interface AuthResponse {
  accessToken: string; // Updated to match NestJS standard
  refreshToken: string; // Updated to match NestJS standard
  user: User;
}
