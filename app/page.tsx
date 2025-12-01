// app/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Image, MapPin, Calendar } from 'lucide-react';
import Header from '../components/Header';

interface Thread {
  id: number;
  content: string;
  author: {
    username: string;
    displayName: string;
    avatar: string;
  };
  createdAt: string;
  likes: number;
  retweets: number;
  replies: number;
  isLiked: boolean;
  isRetweeted: boolean;
}

const mockThreads: Thread[] = [
  {
    id: 1,
    content: 'Message BIRB :))',
    author: {
      username: 'admin',
      displayName: 'mBoard Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    },
    createdAt: new Date().toISOString(),
    likes: 0,
    retweets: 0,
    replies: 0,
    isLiked: false,
    isRetweeted: false
  },
];

function CreateThread({ onThreadCreated }: { onThreadCreated: () => void }) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      console.log('Creating thread:', content);
      setContent('');
      onThreadCreated();
    }
  };

  const formStyle = {
    borderBottom: '1px solid rgb(239, 243, 244)',
    padding: '16px',
  };

  return (
    <div style={formStyle}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <img 
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" 
          alt="Your avatar"
          style={{ width: '48px', height: '48px', borderRadius: '50%' }}
        />
        <div style={{ flex: 1 }}>
          <form onSubmit={handleSubmit}>
            <textarea
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                width: '100%',
                fontSize: '20px',
                color: 'placeholder-gray-500',
                border: 'none',
                resize: 'none',
                outline: 'none',
                minHeight: '120px',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', color: 'rgb(29, 155, 240)' }}>
                <button type="button" style={{ padding: '8px', borderRadius: '50%', transition: 'background-color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <Image size={20} />
                </button>
                <button type="button" style={{ padding: '8px', borderRadius: '50%', transition: 'background-color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <MapPin size={20} />
                </button>
                <button type="button" style={{ padding: '8px', borderRadius: '50%', transition: 'background-color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <Calendar size={20} />
                </button>
              </div>
              <button
                type="submit"
                disabled={!content.trim()}
                style={{
                  backgroundColor: 'rgb(29, 155, 240)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontWeight: 'bold',
                  transition: 'background-color 0.2s',
                  opacity: !content.trim() ? 0.5 : 1,
                  cursor: !content.trim() ? 'not-allowed' : 'pointer'
                }}
                onMouseOver={(e) => {
                  if (content.trim()) {
                    e.currentTarget.style.backgroundColor = 'rgb(26, 140, 216)';
                  }
                }}
                onMouseOut={(e) => {
                  if (content.trim()) {
                    e.currentTarget.style.backgroundColor = 'rgb(29, 155, 240)';
                  }
                }}
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ThreadCard({ thread }: { thread: Thread }) {
  const [isLiked, setIsLiked] = useState(thread.isLiked);
  const [isRetweeted, setIsRetweeted] = useState(thread.isRetweeted);
  const [likeCount, setLikeCount] = useState(thread.likes);
  const [retweetCount, setRetweetCount] = useState(thread.retweets);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleRetweet = () => {
    setIsRetweeted(!isRetweeted);
    setRetweetCount(isRetweeted ? retweetCount - 1 : retweetCount + 1);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const cardStyle = {
    borderBottom: '1px solid rgb(239, 243, 244)',
    padding: '16px',
    transition: 'background-color 0.2s',
    cursor: 'pointer'
  };

  return (
    <div 
      style={cardStyle}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgb(247, 249, 249)'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div style={{ display: 'flex', gap: '12px' }}>
        <img 
          src={thread.author.avatar} 
          alt={thread.author.displayName}
          style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0 }}
        />
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontWeight: 'bold', color: '#000' }}>{thread.author.displayName}</span>
            <span style={{ color: 'rgb(83, 100, 113)' }}>@{thread.author.username}</span>
            <span style={{ color: 'rgb(83, 100, 113)' }}>·</span>
            <span style={{ color: 'rgb(83, 100, 113)' }}>{formatTime(thread.createdAt)}</span>
            <button style={{ marginLeft: 'auto', padding: '8px', borderRadius: '50%', color: 'rgb(83, 100, 113)', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <MoreHorizontal size={16} />
            </button>
          </div>
          
          <p style={{ color: '#000', marginBottom: '12px', lineHeight: '1.5', whiteSpace: 'pre-wrap' as const }}>
            {thread.content}
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '425px', color: 'rgb(83, 100, 113)' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgb(29, 155, 240)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgb(83, 100, 113)'}>
              <div style={{ padding: '8px', borderRadius: '50%', transition: 'background-color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <MessageCircle size={18} />
              </div>
              <span style={{ fontSize: '13px' }}>{thread.replies}</span>
            </button>
            
            <button 
              onClick={handleRetweet}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                transition: 'color 0.2s',
                color: isRetweeted ? 'rgb(0, 186, 124)' : 'rgb(83, 100, 113)'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgb(0, 186, 124)'}
              onMouseOut={(e) => e.currentTarget.style.color = isRetweeted ? 'rgb(0, 186, 124)' : 'rgb(83, 100, 113)'}>
              <div style={{ padding: '8px', borderRadius: '50%', transition: 'background-color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 186, 124, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <Repeat2 size={18} />
              </div>
              <span style={{ fontSize: '13px' }}>{retweetCount}</span>
            </button>
            
            <button 
              onClick={handleLike}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                transition: 'color 0.2s',
                color: isLiked ? 'rgb(249, 24, 128)' : 'rgb(83, 100, 113)'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgb(249, 24, 128)'}
              onMouseOut={(e) => e.currentTarget.style.color = isLiked ? 'rgb(249, 24, 128)' : 'rgb(83, 100, 113)'}>
              <div style={{ padding: '8px', borderRadius: '50%', transition: 'background-color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(249, 24, 128, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              </div>
              <span style={{ fontSize: '13px' }}>{likeCount}</span>
            </button>
            
            <button style={{ display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgb(29, 155, 240)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgb(83, 100, 113)'}>
              <div style={{ padding: '8px', borderRadius: '50%', transition: 'background-color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <Share size={18} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(1024);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    setIsLoggedIn(!!token);
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    setTimeout(() => {
      setThreads(mockThreads);
      setLoading(false);
    }, 1000);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleThreadCreated = () => {
    setLoading(true);
    setTimeout(() => {
      setThreads(mockThreads);
      setLoading(false);
    }, 500);
  };

  const mainStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'white'
  };

  const contentStyle = {
    flex: 1,
    maxWidth: '600px',
    borderLeft: '1px solid rgb(239, 243, 244)',
    borderRight: '1px solid rgb(239, 243, 244)',
    minHeight: '100vh'
  };

  const headerStyle = {
    position: 'sticky' as const,
    top: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgb(239, 243, 244)',
    padding: '16px',
    zIndex: 40
  };

  return (
    <div style={mainStyle}>
      <Header />
      
      <main style={contentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Home</h1>
        </div>

        {/* Create Thread */}
        {isLoggedIn && <CreateThread onThreadCreated={handleThreadCreated} />}

        {/* Threads Feed */}
        <div>
          {loading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ borderBottom: '1px solid rgb(239, 243, 244)', padding: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: 'rgb(239, 243, 244)', 
                    borderRadius: '50%',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ 
                        height: '16px', 
                        backgroundColor: 'rgb(239, 243, 244)', 
                        borderRadius: '4px', 
                        width: '80px',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }} />
                      <div style={{ 
                        height: '16px', 
                        backgroundColor: 'rgb(239, 243, 244)', 
                        borderRadius: '4px', 
                        width: '64px',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }} />
                    </div>
                    <div style={{ 
                      height: '16px', 
                      backgroundColor: 'rgb(239, 243, 244)', 
                      borderRadius: '4px', 
                      width: '75%',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }} />
                    <div style={{ 
                      height: '16px', 
                      backgroundColor: 'rgb(239, 243, 244)', 
                      borderRadius: '4px', 
                      width: '50%',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            threads.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))
          )}
        </div>

        {!loading && threads.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 16px' }}>
            <div style={{ color: 'rgb(83, 100, 113)', fontSize: '18px', marginBottom: '8px' }}>
              No threads yet
            </div>
            <p style={{ color: 'rgb(139, 152, 165)' }}>
              {isLoggedIn ? 'Start the conversation!' : 'Sign in to create the first thread'}
            </p>
          </div>
        )}
      </main>

      {/* Right sidebar - placeholder */}
      <aside style={{ 
        width: '350px', 
        padding: '16px', 
        display: windowWidth >= 1024 ? 'block' : 'none' 
      }}>
        <div style={{ 
          backgroundColor: 'rgb(247, 249, 249)', 
          borderRadius: '16px', 
          padding: '16px' 
        }}>
          <h3 style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '16px' }}>
            What's happening
          </h3>
          {/* Trending topics would go here */}
        </div>
      </aside>
    </div>
  );
}