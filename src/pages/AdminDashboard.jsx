import React, { useState, useEffect } from 'react';
import { Button } from '../components/UI/Components';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { registerUser, user, API_URL } = useAuth();

    const [teamMembers, setTeamMembers] = useState([]);
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPass, setNewUserPass] = useState('');
    const [newUserName, setNewUserName] = useState('');

    const [taskTitle, setTaskTitle] = useState('');
    const [taskDesc, setTaskDesc] = useState('');
    const [taskAssignee, setTaskAssignee] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchData = async () => {
        try {
            // Fetch users with role 'user'
            const resUsers = await fetch(`${API_URL}/users?role=user`);
            const dUsers = await resUsers.json();

            // Fetch all works
            const resWorks = await fetch(`${API_URL}/works`);
            const dWorks = await resWorks.json();

            setTeamMembers(Array.isArray(dUsers) ? dUsers : []);
            setWorks(Array.isArray(dWorks) ? dWorks : []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [API_URL]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await registerUser(newUserEmail, newUserPass, 'user', newUserName);
            setSuccess(`User ${newUserName} created successfully`);
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPass('');
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreateWork = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!taskAssignee) {
            setError("Please select a user");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/works`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: taskTitle,
                    description: taskDesc,
                    assignedTo: taskAssignee,
                    createdBy: user.id
                })
            });
            if (!res.ok) throw new Error("Failed to create task");

            setSuccess("Task assigned successfully");
            setTaskTitle('');
            setTaskDesc('');
            setTaskAssignee('');
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSwapWork = async (workId, newUserId) => {
        try {
            const res = await fetch(`${API_URL}/works/${workId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignedTo: newUserId })
            });
            if (!res.ok) throw new Error("Failed to swap");
            fetchData();
        } catch (err) {
            console.error("Swap error:", err);
            alert("Failed to swap user");
        }
    };

    // Enrich works with assignee names
    const enrichedWorks = works.map(work => {
        const assignee = teamMembers.find(m => m.id == work.assigned_to) || teamMembers.find(m => m.id == work.assignedTo);
        return {
            ...work,
            assigneeName: assignee ? assignee.name : 'Unknown'
        };
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--color-primary)]">Admin Dashboard</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage users, assignments, and workflows efficiently.</p>
                </div>
            </div>

            {(error || success) && (
                <div className={`p-4 rounded-lg flex items-center gap-3 shadow-sm ${error ? 'border-l-4 border-red-500 bg-red-50 text-red-700' : 'border-l-4 border-green-500 bg-green-50 text-green-700'}`}>
                    <span className="text-xl">{error ? '⚠️' : '✅'}</span>
                    <span className="font-medium">{error || success}</span>
                </div>
            )}

            {/* Create New User */}
            <section className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Create New User</h3>
                    <span className="text-2xl text-gray-300">👤</span>
                </div>
                <div className="p-6">
                    <form onSubmit={handleCreateUser} className="flex flex-col md:flex-row gap-5 items-end">
                        <div className="flex-1 w-full space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</label>
                            <input
                                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                                placeholder="e.g. John Doe"
                                value={newUserName}
                                onChange={e => setNewUserName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex-1 w-full space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
                            <input
                                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                                placeholder="e.g. john@example.com"
                                value={newUserEmail}
                                onChange={e => setNewUserEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex-1 w-full space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
                            <input
                                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                type="password"
                                value={newUserPass}
                                onChange={e => setNewUserPass(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="h-[50px] px-8 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)]">
                            Create User
                        </Button>
                    </form>
                </div>
            </section>

            {/* Assign New Work */}
            <section className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Assign New Work</h3>
                    <span className="text-2xl text-gray-300">⚡</span>
                </div>
                <div className="p-6">
                    <form onSubmit={handleCreateWork} className="flex flex-col md:flex-row gap-5 items-end">
                        <div className="w-full md:w-1/4 space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Task Title</label>
                            <input
                                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                                placeholder="e.g. Design Homepage"
                                value={taskTitle}
                                onChange={e => setTaskTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="w-full md:flex-1 space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
                            <input
                                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                                placeholder="Brief details about the task..."
                                value={taskDesc}
                                onChange={e => setTaskDesc(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-1/4 space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assignee</label>
                            <select
                                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all text-gray-700 cursor-pointer"
                                value={taskAssignee}
                                onChange={(e) => setTaskAssignee(e.target.value)}
                                required
                            >
                                <option value="">Select Assignee...</option>
                                {teamMembers.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button type="submit" className="h-[50px] px-8 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)]">
                            Assign Task
                        </Button>
                    </form>
                </div>
            </section>

            {/* Manage Works & Swaps */}
            <section className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">Manage Works & Swaps</h3>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center p-8 text-gray-400 animate-pulse">Loading data...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-gray-100 text-gray-500 uppercase text-xs tracking-wider">
                                        <th className="p-4 font-semibold">Task Details</th>
                                        <th className="p-4 font-semibold">Status</th>
                                        <th className="p-4 font-semibold">Assigned To (Swap)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {enrichedWorks.length === 0 ? (
                                        <tr><td colSpan="3" className="p-8 text-center text-gray-400 italic">No tasks active currently.</td></tr>
                                    ) : (
                                        enrichedWorks.map(work => (
                                            <tr key={work.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="p-4 align-top">
                                                    <div className="font-bold text-[var(--color-primary)] text-base mb-1">{work.title}</div>
                                                    <div className="text-xs text-gray-500 leading-relaxed max-w-md">{work.description}</div>
                                                </td>
                                                <td className="p-4 align-top">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${work.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            work.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                'bg-blue-50 text-blue-700 border-blue-200'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${work.status === 'Completed' ? 'bg-green-500' :
                                                                work.status === 'Pending' ? 'bg-amber-500' :
                                                                    'bg-blue-500'
                                                            }`}></span>
                                                        {work.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-top">
                                                    <div className="relative">
                                                        <select
                                                            className="w-full sm:w-48 p-2 pl-3 pr-8 border border-gray-200 rounded-md text-sm bg-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none cursor-pointer hover:border-gray-300 transition-all shadow-sm group-hover:shadow"
                                                            value={work.assigned_to || work.assignedTo}
                                                            onChange={(e) => handleSwapWork(work.id, e.target.value)}
                                                        >
                                                            {teamMembers.map(m => (
                                                                <option key={m.id} value={m.id}>
                                                                    {m.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            {/* Current Team Members */}
            <section className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Current Team Members</h3>
                    <span className="bg-[var(--color-primary)] text-white text-xs px-2 py-1 rounded-full">{teamMembers.length} Members</span>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teamMembers.length === 0 ? (
                            <p className="text-gray-500 col-span-full text-center py-4">No team members found.</p>
                        ) : (
                            teamMembers.map(member => (
                                <div key={member.id} className="flex items-center p-3 border border-gray-100 rounded-lg hover:border-gray-200 hover:shadow-sm transition-all bg-gray-50/30">
                                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold mr-3">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="font-semibold text-gray-800 text-sm truncate">{member.name}</h4>
                                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminDashboard;
