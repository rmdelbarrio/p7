"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    isAuthenticated, 
    getToken, 
    decodeJwt, 
    getUserRole 
} from '../../lib/auth'; 
import Header from '@/components/Header';
import { LogIn, User, Clock, CheckCircle, XCircle, Trash, Edit, PlusCircle, AlertTriangle } from 'lucide-react';

// --- Types ---
interface LoginRecord {
  id: number;
  userId: number;
  username: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

// Mock User Data for CRUD Demo (In a real app, this would be fetched from the API)
interface UserAccount {
    id: number;
    username: string;
    role: 'user' | 'admin';
    status: 'Active' | 'Suspended';
}

const initialUsers: UserAccount[] = [
    { id: 1, username: 'SA1', role: 'admin', status: 'Active' },
    { id: 2, username: 'user_a', role: 'user', status: 'Active' },
    { id: 3, username: 'user_b', role: 'user', status: 'Suspended' },
];


export default function DashboardPage() {
    const router = useRouter();
    const [loginRecords, setLoginRecords] = useState<LoginRecord[]>([]);
    const [userAccounts, setUserAccounts] = useState<UserAccount[]>(initialUsers);
    const [loading, setLoading] = useState(true);
    const [currentUsername, setCurrentUsername] = useState('...');
    const [isAdmin, setIsAdmin] = useState(false);
    
    // --- State for CRUD Operations (MOCK) ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
    const [newUsername, setNewUsername] = useState('');
    const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
    const [message, setMessage] = useState('');

    // --- Utility Functions ---

    // Helper to decode JWT payload to get the username for display
    const decodeUsername = () => {
        const token = getToken();
        if (!token) return 'Guest';
        try {
            const payload = decodeJwt(token);
            return payload ? payload.username : 'Admin';
        } catch (e) {
            return 'Admin';
        }
    }

    // --- Data Fetching ---

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const authCheck = isAuthenticated();
        const roleCheck = getUserRole() === 'admin';

        if (!authCheck) {
            router.push('/login');
            return;
        }

        setIsAdmin(roleCheck);
        setCurrentUsername(decodeUsername());

        if (roleCheck) {
            fetchLoginRecords();
            // In a real app, you would fetch userAccounts from the API here too
        } else {
            setLoading(false);
        }
    }, [router]);

    const fetchLoginRecords = async () => {
        try {
            // NOTE: This remains MOCK data as the backend API endpoint for logs doesn't exist yet
            const mockRecords: LoginRecord[] = [
                { id: 1, userId: 1, username: 'SA1', timestamp: new Date().toISOString(), ipAddress: '192.168.1.1', userAgent: 'Chrome on Mac' },
                { id: 2, userId: 1, username: 'SA1', timestamp: new Date(Date.now() - 3600000).toISOString(), ipAddress: '192.168.1.1', userAgent: 'Chrome on Mac' },
                { id: 3, userId: 2, username: 'user_a', timestamp: new Date(Date.now() - 7200000).toISOString(), ipAddress: '74.125.0.1', userAgent: 'Firefox on Linux' },
            ];
            setLoginRecords(mockRecords);
        } catch (error) {
            console.error('Error fetching login records:', error);
            setMessage("Failed to load records.");
        } finally {
            setLoading(false);
        }
    };
    
    // --- CRUD Handlers (MOCK: Client-side only) ---

    const handleOpenModal = (user: UserAccount | null = null) => {
        setEditingUser(user);
        setNewUsername(user ? user.username : '');
        setNewRole(user ? user.role : 'user');
        setMessage('');
        setIsModalOpen(true);
    };

    const handleSaveUser = () => {
        if (!newUsername.trim()) {
            setMessage("Username cannot be empty.");
            return;
        }

        if (editingUser) {
            // Update Operation
            setUserAccounts(userAccounts.map(u => 
                u.id === editingUser.id ? { ...u, username: newUsername, role: newRole } : u
            ));
            setMessage(`User ${newUsername} updated! (Mock Success)`);
        } else {
            // Create Operation
            const newUser: UserAccount = {
                id: Date.now(), // Mock ID
                username: newUsername,
                role: newRole,
                status: 'Active',
            };
            setUserAccounts([...userAccounts, newUser]);
            setMessage(`User ${newUsername} created! (Mock Success)`);
        }
        setIsModalOpen(false);
    };

    const handleDeleteUser = (userId: number) => {
        if (userId === 1) { // Prevent deleting the mock SA1 admin
             setMessage("Cannot delete Super Admin (SA1) in mock mode.");
             return;
        }
        // Delete Operation
        setUserAccounts(userAccounts.filter(u => u.id !== userId));
        setMessage(`User ID ${userId} deleted! (Mock Success)`);
    };

    // --- Conditional Render ---

    const dashboardStyle = {
        minHeight: '100vh',
        backgroundColor: 'rgb(247, 249, 250)', // Light Gray background
        padding: '16px',
        width: '100%',
    };

    if (loading) {
        return (
             <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgb(247, 249, 250)' }}>
                <Clock size={32} style={{ color: 'rgb(29, 155, 240)' }} className="animate-spin" />
                <span style={{ marginLeft: '12px', fontSize: '18px', color: 'rgb(83, 100, 113)' }}>Loading Dashboard...</span>
            </div>
        );
    }

    if (!isAdmin) {
        return (
             <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgb(247, 249, 250)', padding: '24px' }}>
                <AlertTriangle size={64} style={{ color: 'rgb(255, 0, 0)', marginBottom: '16px' }} />
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'rgb(20, 23, 26)', marginBottom: '8px' }}>Access Denied</h1>
                <p style={{ fontSize: '16px', color: 'rgb(83, 100, 113)', marginBottom: '24px' }}>You must be an administrator to view this page.</p>
                <button
                    onClick={() => router.push('/')}
                    style={{ padding: '10px 20px', backgroundColor: 'rgb(29, 155, 240)', color: 'white', borderRadius: '9999px', fontWeight: 'bold', transition: 'background-color 0.2s', border: 'none' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgb(26, 140, 216)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgb(29, 155, 240)'}
                >
                    Go Home
                </button>
            </div>
        );
    }
    
    // --- Styles for Twitter/mBoard Theme ---
    const cardStyle = {
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid rgb(239, 243, 244)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        padding: '24px',
    };

    const headerContentStyle = {
        borderBottom: '1px solid rgb(239, 243, 244)',
        paddingBottom: '16px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    };
    
    // --- Main Render ---

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Header /> 
            <main style={{ flex: 1, padding: '16px', marginLeft: '80px', paddingTop: '24px', maxWidth: '1000px', margin: '0 auto', ...dashboardStyle }}>
                
                {/* Dashboard Header */}
                <div style={headerContentStyle}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'rgb(20, 23, 26)', display: 'flex', alignItems: 'center' }}>
                            <User size={32} style={{ color: 'rgb(29, 155, 240)', marginRight: '10px' }} />
                            Admin Console
                        </h1>
                        <p style={{ fontSize: '14px', color: 'rgb(83, 100, 113)', marginTop: '4px' }}>
                            Welcome, {currentUsername}. Manage users and monitor activity.
                        </p>
                    </div>
                    {message && (
                        <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgb(240, 255, 240)', color: 'rgb(21, 128, 61)', border: '1px solid rgb(21, 128, 61)' }}>
                            {message}
                        </div>
                    )}
                </div>

                {/* --- Stats and User Management Grid --- */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    
                    {/* User Management Card */}
                    <div style={{ ...cardStyle, gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgb(239, 243, 244)', paddingBottom: '16px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'rgb(20, 23, 26)' }}>
                                User Accounts ({userAccounts.length})
                            </h2>
                            <button 
                                onClick={() => handleOpenModal()}
                                style={{ padding: '8px 16px', backgroundColor: 'rgb(29, 155, 240)', color: 'white', borderRadius: '9999px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgb(26, 140, 216)'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgb(29, 155, 240)'}
                            >
                                <PlusCircle size={16} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />
                                <span style={{ verticalAlign: 'middle' }}>New User</span>
                            </button>
                        </div>
                        
                        {/* User List Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgb(239, 243, 244)', backgroundColor: 'rgb(247, 249, 250)' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', color: 'rgb(83, 100, 113)', fontSize: '12px', fontWeight: 'bold' }}>USERNAME</th>
                                        <th style={{ padding: '12px', textAlign: 'left', color: 'rgb(83, 100, 113)', fontSize: '12px', fontWeight: 'bold' }}>ROLE</th>
                                        <th style={{ padding: '12px', textAlign: 'left', color: 'rgb(83, 100, 113)', fontSize: '12px', fontWeight: 'bold' }}>STATUS</th>
                                        <th style={{ padding: '12px', textAlign: 'left', color: 'rgb(83, 100, 113)', fontSize: '12px', fontWeight: 'bold' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userAccounts.map((user) => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid rgb(239, 243, 244)' }}>
                                            <td style={{ padding: '12px', fontSize: '14px', fontWeight: 'bold', color: 'rgb(20, 23, 26)' }}>{user.username}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ 
                                                    padding: '4px 8px', 
                                                    borderRadius: '8px', 
                                                    fontSize: '12px', 
                                                    fontWeight: 'bold',
                                                    backgroundColor: user.role === 'admin' ? 'rgb(255, 204, 204)' : 'rgb(204, 255, 204)',
                                                    color: user.role === 'admin' ? 'rgb(255, 0, 0)' : 'rgb(0, 128, 0)'
                                                }}>
                                                    {user.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', color: user.status === 'Active' ? 'rgb(0, 128, 0)' : 'rgb(255, 0, 0)' }}>
                                                    {user.status === 'Active' ? <CheckCircle size={14} style={{ marginRight: '4px' }} /> : <XCircle size={14} style={{ marginRight: '4px' }} />}
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <button 
                                                    onClick={() => handleOpenModal(user)}
                                                    title="Edit User"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(29, 155, 240)', marginRight: '8px' }}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    title="Delete User"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(255, 0, 0)' }}
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Login Monitoring Card */}
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'rgb(20, 23, 26)', marginBottom: '16px', borderBottom: '1px solid rgb(239, 243, 244)', paddingBottom: '16px' }}>
                            Recent Logins
                        </h2>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {loginRecords.map((record) => (
                                <div key={record.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgb(247, 249, 250)' }}>
                                    <LogIn size={20} style={{ color: 'rgb(29, 155, 240)', marginRight: '10px' }} />
                                    <div>
                                        <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'rgb(20, 23, 26)' }}>{record.username}</p>
                                        <p style={{ fontSize: '12px', color: 'rgb(83, 100, 113)' }}>
                                            {new Date(record.timestamp).toLocaleString()} from {record.ipAddress}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {loginRecords.length === 0 && <p style={{ color: 'rgb(83, 100, 113)', textAlign: 'center', padding: '16px' }}>No recent login activity.</p>}
                        </div>
                    </div>
                </div>
            </main>
            
            {/* --- Modal for CRUD --- */}
            {isModalOpen && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    zIndex: 20 
                }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '400px', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid rgb(239, 243, 244)', paddingBottom: '10px' }}>
                            {editingUser ? 'Edit User' : 'Create New User'}
                        </h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleSaveUser(); }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '14px', color: 'rgb(20, 23, 26)' }}>Username</label>
                            <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="Enter username"
                                required
                                disabled={editingUser && editingUser.id === 1} // Prevent SA1 edit
                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgb(204, 214, 221)' }}
                            />
                            
                            <label style={{ fontWeight: 'bold', fontSize: '14px', color: 'rgb(20, 23, 26)' }}>Role</label>
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
                                required
                                disabled={editingUser && editingUser.id === 1} // Prevent SA1 role change
                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgb(204, 214, 221)' }}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ padding: '10px 20px', backgroundColor: 'transparent', color: 'rgb(83, 100, 113)', border: '1px solid rgb(204, 214, 221)', borderRadius: '9999px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    style={{ padding: '10px 20px', backgroundColor: 'rgb(29, 155, 240)', color: 'white', borderRadius: '9999px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
