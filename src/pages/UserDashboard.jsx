import React, { useState, useEffect } from 'react';
import { Card, Button } from '../components/UI/Components';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
    const { user, API_URL } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        if (!user) return;
        try {
            // Use backend filtering
            const res = await fetch(`${API_URL}/works?assignedTo=${user.id}`);
            const myTasks = await res.json();
            setTasks(Array.isArray(myTasks) ? myTasks : []);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTasks();
        const interval = setInterval(fetchTasks, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [user, API_URL]);

    const handleStatusChange = async (taskId, newStatus) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        try {
            await fetch(`${API_URL}/works/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchTasks(); // Refresh to confirm
        } catch (err) {
            console.error("Update failed", err);
            alert("Failed to update status");
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Tasks</h2>
            <Card>
                {loading ? "Loading..." : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-3">Title</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.length === 0 ? (
                                    <tr><td colSpan="4" className="p-4 text-center text-gray-400">No tasks assigned.</td></tr>
                                ) : (
                                    tasks.map(task => (
                                        <tr key={task.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-medium">{task.title}</td>
                                            <td className="p-3 text-gray-500">{task.description}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs rounded-full ${task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                        task.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                {task.status !== 'Completed' && (
                                                    <div className="space-x-2">
                                                        {task.status === 'Pending' && (
                                                            <button onClick={() => handleStatusChange(task.id, 'In Progress')} className="text-blue-600 hover:underline text-xs">Start</button>
                                                        )}
                                                        {task.status === 'In Progress' && (
                                                            <button onClick={() => handleStatusChange(task.id, 'Completed')} className="text-green-600 hover:underline text-xs">Complete</button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default UserDashboard;
