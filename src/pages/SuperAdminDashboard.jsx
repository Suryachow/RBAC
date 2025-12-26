import React, { useState, useEffect } from 'react';
import { Card, Button } from '../components/UI/Components';
import { useAuth } from '../context/AuthContext';

const SuperAdminDashboard = () => {
    const { registerUser, API_URL } = useAuth();

    const [admins, setAdmins] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalAdmins: 0, activeNow: 0 });

    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminPass, setNewAdminPass] = useState('');
    const [newAdminName, setNewAdminName] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/users?role=admin`);
            const data = await res.json();

            // Fetch ALL users to get total count - simple approach
            const resAll = await fetch(`${API_URL}/users`);
            const allUsers = await resAll.json();

            setAdmins(Array.isArray(data) ? data : []);
            setStats({
                totalUsers: Array.isArray(allUsers) ? allUsers.length : 0,
                totalAdmins: Array.isArray(data) ? data.length : 0,
                activeNow: 1 // Dummy
            });
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // 5 sec poll
        return () => clearInterval(interval);
    }, [API_URL]);

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await registerUser(newAdminEmail, newAdminPass, 'admin', newAdminName);
            setSuccess(`Admin ${newAdminName} created successfully.`);
            setNewAdminName('');
            setNewAdminEmail('');
            setNewAdminPass('');
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Super Admin Dashboard</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">Total Users</div>
                        <div className="text-3xl font-bold text-[var(--color-primary)]">{stats.totalUsers}</div>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">Total Admins</div>
                        <div className="text-3xl font-bold text-indigo-600">{stats.totalAdmins}</div>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">Active Now</div>
                        <div className="text-3xl font-bold text-green-600">{stats.activeNow}</div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Create Admin Form */}
                <Card title="Create New Admin">
                    {(error || success) && (
                        <div className={`p-3 mb-3 border-l-4 ${error ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
                            {error || success}
                        </div>
                    )}
                    <form onSubmit={handleAddAdmin} className="space-y-3">
                        <input className="w-full p-2 border" placeholder="Name" value={newAdminName} onChange={e => setNewAdminName(e.target.value)} required />
                        <input className="w-full p-2 border" placeholder="Email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} required />
                        <input className="w-full p-2 border" placeholder="Password" type="password" value={newAdminPass} onChange={e => setNewAdminPass(e.target.value)} required />
                        <Button type="submit" className="w-full">Create Admin</Button>
                    </form>
                </Card>

                {/* Admin List */}
                <Card title="Existing Admins">
                    {loading ? "Loading..." : (
                        <ul className="space-y-2">
                            {admins.length === 0 ? <p className="text-gray-400">No admins found.</p> : admins.map(admin => (
                                <li key={admin.id} className="p-2 border-b last:border-0 flex justify-between items-center">
                                    <span className="font-medium">{admin.name}</span>
                                    <span className="text-sm text-gray-500">{admin.email}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
