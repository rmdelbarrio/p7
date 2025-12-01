// components/Header.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Home, 
  Search, 
  Bell, 
  Mail, 
  User, 
  LogOut,
  MessageCircle,
  Users,
  Settings
} from 'lucide-react';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1024);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    setIsLoggedIn(!!token);
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    window.location.href = '/';
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
      return <Link href={href}>{content}</Link>;
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
  };

  return (
    <header style={headerStyle}>
      {/* Logo */}
      <div style={{ marginBottom: '16px', padding: '12px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '9999px',
              width: '100%',
              color: '#dc2626',
              transition: 'background-color 0.2s',
              backgroundColor: 'transparent',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={24} />
            <span style={{ fontSize: '20px', display: windowWidth >= 1024 ? 'block' : 'none' }}>
              Logout
            </span>
          </button>
        ) : (
          <>
            <Link href="/login">
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '9999px',
                width: '100%',
                transition: 'background-color 0.2s',
                backgroundColor: 'transparent',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(15, 20, 25, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <User size={24} />
                <span style={{ fontSize: '20px', display: windowWidth >= 1024 ? 'block' : 'none' }}>
                  Login
                </span>
              </button>
            </Link>
            <Link href="/register">
              <button style={{
                backgroundColor: 'rgb(29, 155, 240)',
                color: 'white',
                borderRadius: '9999px',
                padding: '12px',
                width: '100%',
                fontWeight: 'bold',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgb(26, 140, 216)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgb(29, 155, 240)'}>
                <span style={{ display: windowWidth >= 1024 ? 'block' : 'none' }}>
                  Sign Up
                </span>
                <span style={{ display: windowWidth >= 1024 ? 'none' : 'block' }}>
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