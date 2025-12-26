import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());


// --- ROUTES ---

// 0. Root Route (Health Check)
app.get('/', (req, res) => {
    res.send("RBAC Server is running. API is at /api/");
});

// 1. Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email} with pass: ${password}`);
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, row) => {
        if (err) {
            console.error("Login DB Error:", err);
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            console.log("Login failed: Invalid credentials or user not found.");
            return res.status(401).json({ error: "Invalid credentials" });
        }
        console.log("Login successful:", row.email);
        res.json({ user: row });
    });
});

// 2. Register / Create User (Supports creating Admins or Users)
app.post('/api/users', (req, res) => {
    const { email, password, name, role, createdBy } = req.body;
    db.run(
        "INSERT INTO users (email, password, name, role, created_by) VALUES (?, ?, ?, ?, ?)",
        [email, password, name, role, createdBy],
        function (err) {
            if (err) {
                // Check unique constraint (SQLite: 'UNIQUE', MySQL: 'Duplicate entry')
                if (err.message.includes('UNIQUE') || err.message.includes('Duplicate entry')) return res.status(400).json({ error: "Email already exists" });
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID, email, name, role });
        }
    );
});

// 3. Get Users by Role
app.get('/api/users', (req, res) => {
    const role = req.query.role;
    let sql = "SELECT id, email, name, role, created_at FROM users";
    let params = [];

    if (role) {
        sql += " WHERE role = ?";
        params.push(role);
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 4. Create Work
app.post('/api/works', (req, res) => {
    const { title, description, assignedTo, createdBy } = req.body;
    db.run(
        "INSERT INTO works (title, description, assigned_to, created_by) VALUES (?, ?, ?, ?)",
        [title, description, assignedTo, createdBy],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, title, status: 'Pending' });
        }
    );
});

// 5. Get Works (With Filters)
app.get('/api/works', (req, res) => {
    const assignedTo = req.query.assignedTo;

    let sql = `
        SELECT w.*, u.name as assigned_to_name 
        FROM works w 
        LEFT JOIN users u ON w.assigned_to = u.id
    `;
    let params = [];

    if (assignedTo) {
        sql += " WHERE w.assigned_to = ?";
        params.push(assignedTo);
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 6. Update Work (Status or Assignee)
app.put('/api/works/:id', (req, res) => {
    const { status, assignedTo } = req.body;
    const { id } = req.params;

    let sql = "UPDATE works SET ";
    let params = [];
    let updates = [];

    if (status) {
        updates.push("status = ?");
        params.push(status);
    }
    if (assignedTo) {
        updates.push("assigned_to = ?");
        params.push(assignedTo);
    }

    if (updates.length === 0) return res.status(400).json({ error: "No fields to update" });

    sql += updates.join(", ") + " WHERE id = ?";
    params.push(id);

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, changes: this.changes });
    });
});

// 7. Seed Endpoint (Bootstrap)
app.post('/api/seed', (req, res) => {
    const { email, password } = req.body;
    db.run(
        "INSERT INTO users (email, password, name, role, created_by) VALUES (?, ?, 'Super Admin', 'super_admin', 'system')",
        [email, password],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE') || err.message.includes('Duplicate entry')) return res.status(400).json({ error: "Super Admin already exists" });
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Super Admin created" });
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
