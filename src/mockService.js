// Initial Mock Data
const INITIAL_USERS = [
    { id: '1', name: 'Super Admin', email: 'super@rbac.com', password: '123', role: 'super_admin', created_at: new Date().toISOString() },
    { id: '2', name: 'Admin User', email: 'admin@rbac.com', password: '123', role: 'admin', created_at: new Date().toISOString() },
    { id: '3', name: 'John Doe', email: 'user@rbac.com', password: '123', role: 'user', created_at: new Date().toISOString() },
];

const INITIAL_WORKS = [
    { id: '101', title: 'Design Homepage', description: 'Create figma designs', status: 'In Progress', assigned_to: '3', created_by: '2', created_at: new Date().toISOString() },
    { id: '102', title: 'Fix Login Bug', description: 'Auth error on refresh', status: 'Pending', assigned_to: '3', created_by: '2', created_at: new Date().toISOString() },
];

// Helper to simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const mockService = {
    // Auth
    login: async (email, password) => {
        await delay();
        const users = JSON.parse(localStorage.getItem('rbac_users')) || INITIAL_USERS;
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) throw new Error('Invalid credentials');
        return user;
    },

    registerUser: async (email, password, role, name, createdBy) => {
        await delay();
        const users = JSON.parse(localStorage.getItem('rbac_users')) || INITIAL_USERS;
        if (users.find(u => u.email === email)) throw new Error('User already exists');

        const newUser = {
            id: Date.now().toString(),
            email,
            password,
            name,
            role,
            created_at: new Date().toISOString(),
            created_by: createdBy
        };

        users.push(newUser);
        localStorage.setItem('rbac_users', JSON.stringify(users));
        return newUser;
    },

    // Data Access
    getUsers: async (role) => {
        await delay();
        let users = JSON.parse(localStorage.getItem('rbac_users'));
        if (!users) {
            users = INITIAL_USERS;
            localStorage.setItem('rbac_users', JSON.stringify(users));
        }
        if (role) return users.filter(u => u.role === role);
        return users;
    },

    getWorks: async (assignedTo) => {
        await delay();
        let works = JSON.parse(localStorage.getItem('rbac_works'));
        if (!works) {
            works = INITIAL_WORKS;
            localStorage.setItem('rbac_works', JSON.stringify(works));
        }

        // Enrich work with user details (like a join)
        const users = JSON.parse(localStorage.getItem('rbac_users')) || INITIAL_USERS;

        let filtered = works;
        if (assignedTo) filtered = works.filter(w => w.assigned_to === assignedTo);

        return filtered.map(w => ({
            ...w,
            assigned_to_name: users.find(u => u.id === w.assigned_to)?.name || 'Unknown'
        }));
    },

    createWork: async (workData) => {
        await delay();
        const works = JSON.parse(localStorage.getItem('rbac_works')) || INITIAL_WORKS;
        const newWork = {
            id: Date.now().toString(),
            ...workData,
            status: 'Pending',
            created_at: new Date().toISOString()
        };
        works.push(newWork);
        localStorage.setItem('rbac_works', JSON.stringify(works));
        return newWork;
    },

    updateWork: async (id, updates) => {
        await delay();
        const works = JSON.parse(localStorage.getItem('rbac_works')) || INITIAL_WORKS;
        const index = works.findIndex(w => w.id === id);
        if (index === -1) throw new Error('Work not found');

        works[index] = { ...works[index], ...updates };
        localStorage.setItem('rbac_works', JSON.stringify(works));
        return works[index];
    }
};
