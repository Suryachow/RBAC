import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../UI/Components';

const SidebarLink = ({ to, children }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `block px-4 py-2.5 mx-2 my-1 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 group'
            }`
        }
    >
        {children}
    </NavLink>
);

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="flex h-screen bg-[var(--color-background)] font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-[var(--color-border)] flex flex-col shadow-sm z-10">
                <div className="p-6 border-b border-[var(--color-border)] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-lg">
                        R
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-[var(--color-text-main)] leading-none">RBAC System</h1>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1 uppercase tracking-wider font-semibold">
                            {user.role.replace('_', ' ')}
                        </p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {user.role === 'super_admin' && (
                        <>
                            <SidebarLink to="/super-admin/dashboard">Dashboard</SidebarLink>
                            <SidebarLink to="/super-admin/users">User Management</SidebarLink>
                            <SidebarLink to="/super-admin/system">System Settings</SidebarLink>
                        </>
                    )}
                    {user.role === 'admin' && (
                        <>
                            <SidebarLink to="/admin/dashboard">Dashboard</SidebarLink>
                            <SidebarLink to="/admin/team">My Team</SidebarLink>
                            <SidebarLink to="/admin/assignments">Assignments</SidebarLink>
                        </>
                    )}
                    {user.role === 'user' && (
                        <>
                            <SidebarLink to="/user/dashboard">My Dashboard</SidebarLink>
                            <SidebarLink to="/user/tasks">My Tasks</SidebarLink>
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-[var(--color-border)] bg-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)]/20 text-[var(--color-primary)] flex items-center justify-center font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-[var(--color-text-main)] truncate">{user.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)] truncate">{user.email}</p>
                        </div>
                    </div>
                    <Button variant="danger" onClick={handleLogout} className="w-full text-sm justify-center">
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white border-b border-[var(--color-border)] h-16 flex items-center px-8 justify-between shadow-sm z-0">
                    <h2 className="text-lg font-semibold text-[var(--color-text-main)]">
                        Control Panel
                    </h2>
                    <div className="text-sm font-medium text-[var(--color-text-muted)] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-8 bg-[var(--color-background)]">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
