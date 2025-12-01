// app/api/threads/route.ts
import { NextResponse } from 'next/server';

// Mock data - replace with database
let threads = [
  {
    id: 1,
    title: 'Welcome to mBoard!',
    content: 'This is the first thread. Feel free to introduce yourself!',
    author: { id: 1, username: 'admin', email: 'admin@example.com' },
    createdAt: new Date().toISOString(),
    postCount: 3,
    lastActivity: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json(threads);
}

export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();

    const newThread = {
      id: threads.length + 1,
      title,
      content,
      author: { id: 1, username: 'current_user', email: 'user@example.com' }, // In real app, get from auth
      createdAt: new Date().toISOString(),
      postCount: 0,
      lastActivity: new Date().toISOString(),
    };

    threads.unshift(newThread);

    return NextResponse.json(newThread);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}