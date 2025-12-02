'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import {
  Home,
  Search,
  Bell,
  Mail,
  User,
  LogOut,
  MessageCircle,
  Users,
  Settings,
} from 'lucide-react';
// Import authentication utilities
import { isAuthenticated, logoutUser } from '@/lib/auth'; 

export default function Header() {
  const router = useRouter(); // Initialize router for redirection
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1024);

  // Function to update authentication state
  const checkAuthStatus = useCallback(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  // --- Effect for Auth Check and Window Resize ---
  useEffect(() => {
    checkAuthStatus(); // Initial auth check

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    // Set initial width and attach listener
    setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [checkAuthStatus]);

  // --- Logout Handler (Integrated with live backend logic) ---
  const handleLogout = async () => {
    // 1. Call the centralized async logout function (removes tokens locally and calls backend)
    await logoutUser(); 
    
    // 2. Update local state
    setIsLoggedIn(false);
    
    // 3. Redirect to login page
    router.push('/login'); 
  };

  const NavButton = ({ icon: Icon, label, href, onClick }: any) => {
    const buttonStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      borderRadius: '9999px',
      width: '100%',
      textAlign: 'left' as const,
      transition: 'background-color 0.2s',
      backgroundColor: 'transparent',
      color: 'inherit', // Ensure text color is inherited
      cursor: 'pointer',
      border: 'none',
    };

    const content = (
      <button
        onClick={onClick}
        style={buttonStyle}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(15, 20, 25, 0.1)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <Icon size={24} />
        <span style={{ fontSize: '20px', display: windowWidth >= 1024 ? 'block' : 'none' }}>
          {label}
        </span>
      </button>
    );

    if (href) {
      return <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link>;
    }

    return content;
  };

  const headerStyle = {
    position: 'sticky' as const,
    top: 0,
    height: '100vh',
    width: windowWidth >= 1024 ? '256px' : '80px',
    borderRight: '1px solid rgb(239, 243, 244)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    zIndex: 10, // Ensure header is above content
    backgroundColor: 'white',
  };

  return (
    <header style={headerStyle}>
      {/* Logo */}
      <div style={{ marginBottom: '16px', padding: '12px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'rgb(29, 155, 240)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>m</span>
          </div>
          <span style={{ 
            fontWeight: 'bold', 
            fontSize: '20px',
            display: windowWidth >= 1024 ? 'block' : 'none'
          }}>
            mBoard
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <NavButton icon={Home} label="Home" href="/" />
        <NavButton icon={Search} label="Explore" href="/explore" />
        <NavButton icon={Bell} label="Notifications" href="/notifications" />
        <NavButton icon={Mail} label="Messages" href="/messages" />
        <NavButton icon={Users} label="Communities" href="/communities" />
        <NavButton icon={MessageCircle} label="Threads" href="/threads" />
        
        {/* Protected Links */}
        {isLoggedIn && (
          <>
            <NavButton icon={User} label="Profile" href="/dashboard" />
            <NavButton icon={Settings} label="Settings" href="/settings" />
          </>
        )}
      </nav>

      {/* Auth Section */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {isLoggedIn ? (
          <NavButton 
            icon={LogOut} 
            label="Logout" 
            onClick={handleLogout} 
            style={{ color: '#dc2626' }}
          />
        ) : (
          <>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <NavButton icon={User} label="Login" href="/login" />
            </Link>
            
            {/* Register/Sign Up Button - Styled differently */}
            <Link href="/register" style={{ textDecoration: 'none' }}>
              <button style={{
                backgroundColor: 'rgb(29, 155, 240)',
                color: 'white',
                borderRadius: '9999px',
                padding: '12px',
                width: '100%',
                fontWeight: 'bold',
                transition: 'background-color 0.2s',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgb(26, 140, 216)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgb(29, 155, 240)'}>
                <span style={{ display: windowWidth >= 1024 ? 'block' : 'none', fontSize: '18px' }}>
                  Sign Up
                </span>
                <span style={{ display: windowWidth >= 1024 ? 'none' : 'block', fontSize: '24px' }}>
                  +
                </span>
              </button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
