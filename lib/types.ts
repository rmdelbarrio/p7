// lib/types.ts
export interface Thread {
  id: number;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  postCount: number;
  lastActivity: string;
}

export interface Post {
  id: number;
  content: string;
  author: User;
  threadId: number;
  createdAt: string;
  likes: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  joinedAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}