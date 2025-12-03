"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// FIX: Using absolute path alias (@/lib/auth)
import * as Auth from '@/lib/auth'; 

import Header from '@/components/Header';
import { 
    User, Clock, CheckCircle, XCircle, Trash, Edit, PlusCircle, UserCog, List, RefreshCw
} from 'lucide-react';
// FIX: Use absolute alias for config as well
import { API_BASE } from '@/lib/config'; 

// --- Constants & Types ---
// The /users controller handles the full user management API
const USERS_API_URL = API_BASE.replace('/auth', '/users'); 
const REGISTER_API_URL = `${API_BASE}/register`; // Use existing auth/register for user creation

interface LoginRecord {
  id: number;
  userId: number;
  username: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

interface UserAccount {
    id: number; // Corresponds to user_id in DB
    username: string;
    role: 'user' | 'admin';
    // Status is primarily visual on frontend, derived from backend data if available
    status: 'Active' | 'Suspended'; 
}


export default function DashboardPage() {
    const router = useRouter();
    const [loginRecords, setLoginRecords] = useState<LoginRecord[]>([]);
    const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
    const [loading, setLoading] = useState(true);
    // FIX: Initialize currentUsername to null/empty string to prevent SSR issues
    const [currentUsername, setCurrentUsername] = useState<string | null>(null); 
    
    // --- State for CRUD Operations ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
    const [newUsername, setNewUsername] = useState('');
    const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
    const [newStatus, setNewStatus] = useState<'Active' | 'Suspended'>('Active');
    const [initialPassword, setInitialPassword] = useState('');
    const [message, setMessage] = useState('');


    // --- Data Fetching: READ Operation ---
    
    const fetchUserAccounts = useCallback(async () => {
        // Use Auth.getToken()
        const token = Auth.getToken();
        if (!token) {
             setLoading(false);
             return;
        }

        try {
            // Live API Call to NestJS Users Controller (GET /users)
            const response = await fetch(USERS_API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                const data: any[] = await response.json();
                // Map the data to include a simplified status field for the UI
                setUserAccounts(data.map(u => ({
                    id: u.user_id,
                    username: u.username,
                    role: u.role || 'user',
                    status: 'Active', // Mocked as active since there's no DB status field
                })));
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || 'Failed to load user accounts from API.');
                setUserAccounts([]);
            }
        } catch (error) {
            console.error('API Error:', error);
            setMessage('Network error loading users. Check backend status.');
        } finally {
            // NOTE: We don't set loading to false here, but rather after all useEffect logic runs
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (!Auth.isAuthenticated()) { // Use Auth.isAuthenticated()
            router.push('/login');
            return;
        }

        const token = Auth.getToken(); // Use Auth.getToken()
        if (token) {
            // FIX: Move currentUsername logic entirely inside useEffect
            const payload = Auth.decodeJwt(token); // Use Auth.decodeJwt()
            setCurrentUsername(payload?.username || 'User');
        }

        fetchUserAccounts().then(() => {
            setLoading(false); // Set loading false only after data fetch attempt is complete
        });
        
        // Mock Login Records (Backend endpoint for this still needs to be built)
        const mockRecords: LoginRecord[] = [
            { id: 1, userId: 1, username: 'SA1', timestamp: new Date().toISOString(), ipAddress: '192.168.1.1', userAgent: 'Chrome on Mac' },
            { id: 2, userId: 2, username: 'TestUser', timestamp: new Date(Date.now() - 3600000).toISOString(), ipAddress: '74.125.0.1', userAgent: 'Firefox' },
        ];
        setLoginRecords(mockRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

    }, [router, fetchUserAccounts]);
    
    // --- CRUD Handlers (Live API Calls) ---

    const handleOpenModal = (user: UserAccount | null = null) => {
        setEditingUser(user);
        setNewUsername(user ? user.username : '');
        setNewRole(user ? user.role : 'user');
        setNewStatus(user ? user.status : 'Active');
        setInitialPassword(''); 
        setMessage('');
        setIsModalOpen(true);
    };

    const handleSaveUser = async () => {
        if (!newUsername.trim()) {
            setMessage("Username cannot be empty.");
            return;
        }
        
        const token = Auth.getToken(); // Use Auth.getToken()
        if (!token) return;

        setLoading(true);

        try {
            const isUpdate = !!editingUser;
            
            let url: string;
            let method: 'POST' | 'PUT';
            let bodyPayload: any;

            if (isUpdate) {
                // UPDATE (PUT request to /users/:id)
                url = `${USERS_API_URL}/${editingUser?.id}`;
                method = 'PUT';
                // Your UsersController only expects role/status change for now
                bodyPayload = { role: newRole, status: newStatus }; 
            } else {
                // CREATE (POST request to /auth/register)
                if (!initialPassword) {
                     setMessage("Password is required for new users.");
                     setLoading(false);
                     return;
                }
                url = REGISTER_API_URL;
                method = 'POST';
                // Note: Auth/register only uses username/password, role is DEFAULTED by the backend DB
                bodyPayload = { username: newUsername, password: initialPassword }; 
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyPayload),
            });

            if (response.ok) {
                setMessage(isUpdate ? `User ${newUsername} updated! (Role: ${newRole})` : `User ${newUsername} created!`);
                setIsModalOpen(false); 
            } else {
                const errorData = await response.json();
                // If register fails due to duplicate username, the message will show here
                setMessage(errorData.message || `${isUpdate ? 'Update' : 'Creation'} failed.`);
            }
        } catch (error) {
            console.error('CRUD API error:', error);
            setMessage('Network error during user management.');
        } finally {
            await fetchUserAccounts(); // Re-fetch all users to reflect changes
            setLoading(false);
            setEditingUser(null);
        }
    };

    const handleDeleteUser = async (userId: number, username: string) => {
        // IMPORTANT: Never use window.confirm in a production frame environment. This should be replaced with a custom modal UI.
        if (!window.confirm(`Are you sure you want to delete user ${username}? This cannot be undone.`)) return;

        const token = Auth.getToken(); // Use Auth.getToken()
        if (!token) return;
        
        setLoading(true);

        try {
            // Live API Call to NestJS Users Controller (DELETE /users/:id)
            const response = await fetch(`${USERS_API_URL}/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 204) { // 204 No Content is successful deletion
                setMessage(`User ${username} deleted successfully.`);
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || 'Deletion failed.');
            }
        } catch (error) {
            console.error('Delete API error:', error);
            setMessage('Network error during deletion.');
        } finally {
            await fetchUserAccounts();
            setLoading(false);
        }
    };

    // --- Styling and Conditional Render ---

    const dashboardStyle: React.CSSProperties = {
        minHeight: '100vh',
        backgroundColor: 'rgb(247, 249, 250)', 
        padding: '16px',
        width: '100%',
        fontFamily: '"Inter", sans-serif',
    };
    
    const cardStyle: React.CSSProperties = {
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid rgb(239, 243, 244)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
        padding: '24px',
    };

    const headerContentStyle: React.CSSProperties = {
        borderBottom: '1px solid rgb(239, 243, 244)',
        paddingBottom: '16px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    };

    if (loading || currentUsername === null) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgb(247, 249, 250)' }}>
                <RefreshCw size={32} style={{ color: 'rgb(29, 155, 240)' }} className="animate-spin" />
                <span style={{ marginLeft: '12px', fontSize: '18px', color: 'rgb(83, 100, 113)' }}>Loading Dashboard...</span>
            </div>
        );
    }

    // --- Main Render ---

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Header /> 
            
            <main style={{ 
                flex: 1, 
                padding: '16px', 
                maxWidth: '1200px', 
                margin: '0 auto', 
                paddingTop: '24px',
                ...dashboardStyle 
            }}>
                
                {/* Dashboard Header */}
                <div style={headerContentStyle}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'rgb(20, 23, 26)', display: 'flex', alignItems: 'center' }}>
                            <UserCog size={32} style={{ color: 'rgb(29, 155, 240)', marginRight: '10px' }} />
                            User Console
                        </h1 >
                        <p style={{ fontSize: '14px', color: 'rgb(83, 100, 113)', marginTop: '4px' }}>
                            Welcome, {currentUsername}. Manage users and monitor activity.
                        </p>
                    </div>
                    {message && (
                        <div style={{ 
                            padding: '8px 12px', 
                            borderRadius: '8px', 
                            backgroundColor: message.includes('failed') || message.includes('error') ? 'rgb(255, 240, 240)' : 'rgb(220, 240, 255)',
                            color: message.includes('failed') || message.includes('error') ? 'rgb(255, 0, 0)' : 'rgb(29, 155, 240)',
                            border: '1px solid',
                            borderColor: message.includes('failed') || message.includes('error') ? 'rgb(255, 0, 0)' : 'rgb(29, 155, 240)',
                            fontWeight: '500',
                            transition: 'opacity 0.5s'
                        }}>
                            {message}
                        </div>
                    )}
                </div>

                {/* --- User Management Grid --- */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '32px' }}>
                    
                    {/* User Management Card (CRUD) */}
                    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgb(239, 243, 244)', paddingBottom: '16px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'rgb(20, 23, 26)', display: 'flex', alignItems: 'center' }}>
                                <User size={20} style={{ marginRight: '8px', color: 'rgb(83, 100, 113)' }} />
                                User Accounts ({userAccounts.length})
                            </h2>
                            <button 
                                onClick={() => handleOpenModal()}
                                style={{ 
                                    padding: '8px 16px', 
                                    backgroundColor: 'rgb(29, 155, 240)', 
                                    color: 'white', 
                                    borderRadius: '9999px', 
                                    fontWeight: 'bold', 
                                    border: 'none', 
                                    cursor: 'pointer', 
                                    transition: 'background-color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgb(26, 140, 216)'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgb(29, 155, 240)'}
                            >
                                <PlusCircle size={16} style={{ marginRight: '8px' }} />
                                Add User
                            </button>
                        </div>
                        
                        {/* User List Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ minWidth: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgb(239, 243, 244)', backgroundColor: 'rgb(247, 249, 250)' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', color: 'rgb(83, 100, 113)', fontSize: '12px', fontWeight: 'bold', width: '30%' }}>USERNAME</th>
                                        <th style={{ padding: '12px', textAlign: 'left', color: 'rgb(83, 100, 113)', fontSize: '12px', fontWeight: 'bold', width: '20%' }}>ROLE</th>
                                        <th style={{ padding: '12px', textAlign: 'left', color: 'rgb(83, 100, 113)', fontSize: '12px', fontWeight: 'bold', width: '20%' }}>STATUS</th>
                                        <th style={{ padding: '12px', textAlign: 'left', color: 'rgb(83, 100, 113)', fontSize: '12px', fontWeight: 'bold', width: '15%' }}>ACTIONS</th>
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
                                                    backgroundColor: user.role === 'admin' ? 'rgb(255, 240, 240)' : 'rgb(240, 255, 240)',
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
                                                    onClick={() => handleDeleteUser(user.id, user.username)}
                                                    title="Delete User"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(255, 0, 0)' }}
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {userAccounts.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center', padding: '16px', color: 'rgb(83, 100, 113)' }}>
                                                No users found. Start by adding a new user.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Login Monitoring Card */}
                    <div style={{ ...cardStyle, marginTop: '24px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'rgb(20, 23, 26)', marginBottom: '16px', borderBottom: '1px solid rgb(239, 243, 244)', paddingBottom: '16px', display: 'flex', alignItems: 'center' }}>
                            <Clock size={20} style={{ marginRight: '8px', color: 'rgb(83, 100, 113)' }} />
                            Recent Login Activity (MOCK)
                        </h2 >
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {loginRecords.map((record) => (
                                <div key={record.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid rgb(247, 249, 250)' }}>
                                    <List size={20} style={{ color: 'rgb(29, 155, 240)', marginRight: '10px', flexShrink: 0 }} />
                                    <div>
                                        <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'rgb(20, 23, 26)' }}>{record.username}</p>
                                        <p style={{ fontSize: '12px', color: 'rgb(83, 100, 113)' }}>
                                            {new Date(record.timestamp).toLocaleString()} from {record.ipAddress}
                                        </p>
                                        <p style={{ fontSize: '10px', color: 'rgb(120, 120, 120)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                                            Agent: {record.userAgent.substring(0, 50)}...
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
                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgb(204, 214, 221)', backgroundColor: 'white' }}
                            />
                            
                            <label style={{ fontWeight: 'bold', fontSize: '14px', color: 'rgb(20, 23, 26)' }}>Role</label>
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
                                required
                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgb(204, 214, 221)', backgroundColor: 'white' }}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>

                             <label style={{ fontWeight: 'bold', fontSize: '14px', color: 'rgb(20, 23, 26)' }}>Status (Visual Only)</label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value as 'Active' | 'Suspended')}
                                required
                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgb(204, 214, 221)' }}
                            >
                                <option value="Active">Active</option>
                                <option value="Suspended">Suspended</option>
                            </select>

                            {!editingUser && ( // Only ask for password on creation
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontWeight: 'bold', fontSize: '14px', color: 'rgb(20, 23, 26)' }}>Initial Password</label>
                                    <input
                                        type="password"
                                        value={initialPassword}
                                        onChange={(e) => setInitialPassword(e.target.value)}
                                        placeholder="Set initial password (required for creation)"
                                        required
                                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgb(204, 214, 221)' }}
                                    />
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ padding: '10px 20px', backgroundColor: 'transparent', color: 'rgb(83, 100, 113)', border: '1px solid rgb(204, 214, 221)', borderRadius: '9999px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s' }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgb(239, 243, 244)'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    style={{ padding: '10px 20px', backgroundColor: 'rgb(29, 155, 240)', color: 'white', borderRadius: '9999px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgb(26, 140, 216)'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgb(29, 155, 240)'}
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
