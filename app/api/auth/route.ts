// app/api/auth/route.ts
import { NextResponse } from 'next/server';
import { mockUsers } from '../../../lib/auth';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = mockUsers.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Check if username is taken
    const existingUsername = mockUsers.find(user => user.username === username);
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = {
      id: mockUsers.length + 1,
      username,
      email,
      password, // In real app, hash this password
    };

    // Generate token
    const token = `token-${Date.now()}-${newUser.id}`;

    const response = NextResponse.json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });

    // Set HTTP-only cookie for middleware
    response.cookies.set('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}