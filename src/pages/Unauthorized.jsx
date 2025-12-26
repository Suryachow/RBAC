import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/UI/Components';

const Unauthorized = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-4">403</h1>
            <p className="text-xl text-gray-600 mb-8">Access Denied. You do not have permission to view this page.</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
    );
};
export default Unauthorized;
