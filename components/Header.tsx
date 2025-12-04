"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home,
  LogOut,
  UserCog, // Used for Dashboard/Profile
  LogIn,
  UserPlus,
  MessageCircle, // Used for Messages link
  Settings 
} from 'lucide-react';
// FIX: Using relative path to match your current Next.js file structure
import * as Auth from '../lib/auth'; 

// Only include Home and Messages by default
const coreNavItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/messages', icon: MessageCircle, label: 'Messages' }, 
];

export default function Header() {
  const router = useRouter(); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1024);

  const checkAuthStatus = useCallback(() => {
    setIsLoggedIn(Auth.isAuthenticated());
  }, []);

  useEffect(() => {
    checkAuthStatus();

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [checkAuthStatus]);

  const handleLogout = async () => {
    await Auth.logoutUser();
    setIsLoggedIn(false);
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
      color: 'inherit',
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
    zIndex: 10,
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

      {/* Navigation (Streamlined) */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {coreNavItems.map((item) => (
          <NavButton key={item.href} icon={item.icon} label={item.label} href={item.href} />
        ))}
        
        {/* Protected Links (Dashboard/Profile) */}
        {isLoggedIn && (
          <>
            <NavButton icon={UserCog} label="Dashboard" href="/dashboard" />
            <NavButton icon={Settings} label="Settings" href="/settings" /> 
          </>
        )}
      </nav>

      {/* Auth Section */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {isLoggedIn ? (
          // LOGOUT BUTTON
          <NavButton 
            icon={LogOut} 
            label="Logout" 
            onClick={handleLogout} 
            style={{ color: 'rgb(220, 38, 38)' }} 
          />
        ) : (
          <>
            {/* LOGIN LINK */}
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <NavButton icon={LogIn} label="Login" href="/login" />
            </Link>
            
            {/* REGISTER/SIGN UP BUTTON (Blue Button Style) */}
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
