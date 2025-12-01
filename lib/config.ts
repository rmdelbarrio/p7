// lib/config.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const APP_CONFIG = {
  name: 'mBoard',
  description: 'A Twitter-style message board',
  version: '1.0.0',
};

export const AUTH_CONFIG = {
  tokenKey: 'accessToken',
  tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
};