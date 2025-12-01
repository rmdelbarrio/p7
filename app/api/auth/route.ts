// app/api/auth/route.ts
import { NextResponse } from 'next/server';
import { API_BASE } from '../../../lib/config'; // Import API_BASE
// import { mockUsers } from '../../../lib/auth'; // Removed mock data import

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
    
    // Call the external NestJS API registration endpoint
    const backendResponse = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // NestJS registration endpoint expects username and password
      body: JSON.stringify({ username, password }),
    });

    const data = await backendResponse.json();
    
    if (backendResponse.ok) {
        // Successful registration, pass through the NestJS response (e.g., { id, username, role })
        return NextResponse.json(data);
    } else {
      // Pass backend error details to the frontend
      return NextResponse.json(
        { error: data.message || data.error || 'Registration failed from backend' },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An internal error occurred during registration.' },
      { status: 500 }
    );
  }
}
