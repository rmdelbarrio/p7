import { NextResponse } from 'next/server';
import { API_BASE } from '../../../lib/config'; 

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // NOTE: NestJS backend uses 'username' for login, so we pass 'email' as 'username'
    const backendResponse = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: email, password }),
    });

    const data = await backendResponse.json();
    
    if (backendResponse.ok) {
      const token = data.accessToken;
      
      const response = NextResponse.json({
        token,
        user: { id: 1, username: email, email: email } 
      });

      response.cookies.set('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400, 
      });

      return response;
    } else {
      return NextResponse.json(
        { error: data.message || data.error || 'Login failed from backend' },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An internal error occurred during login.' },
      { status: 500 }
    );
  }
}
