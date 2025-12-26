import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/UI/Components';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, user } = useAuth(); // Get user from context
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect when user is authenticated
    useEffect(() => {
        if (user) {
            if (user.role === 'super_admin') navigate('/super-admin/dashboard');
            else if (user.role === 'admin') navigate('/admin/dashboard');
            else if (user.role === 'user') navigate('/user/dashboard');
            else navigate('/unauthorized');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            // Redirection handled by useEffect
        } catch (err) {
            console.error(err);
            setError('Failed to log in. Please check your credentials.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="w-full max-w-md p-4 animate-fade-in">
                <Card className="shadow-xl bg-white/80 backdrop-blur-md border-white">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-[var(--color-primary)] text-white text-xl font-bold rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                            R
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                        <p className="text-[var(--color-text-muted)] text-sm mt-2">Enter your credentials to access the RBAC System.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            id="email"
                            label="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            required
                        />
                        <Input
                            id="password"
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                                <span className="text-lg">⚠️</span> {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-blue-500/20" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In to Dashboard'}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-[var(--color-text-muted)]">
                            Protected System &copy; 2025. Authorized Access Only.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Login;
