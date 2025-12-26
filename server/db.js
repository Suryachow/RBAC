import mysql from 'mysql2';

// Use a Pool for better stability and concurrency
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'rbac_db',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Helper to get a dedicated connection for initialization tasks
const runInit = () => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("Database connection failed:", err.message);
            return;
        }

        connection.query("CREATE DATABASE IF NOT EXISTS rbac_db", (err) => {
            if (err) {
                console.error("Error creating database:", err.message);
                connection.release();
                return;
            }
            // Switch to the DB
            connection.changeUser({ database: 'rbac_db' }, (err) => {
                if (err) {
                    console.error("Error switching to database:", err.message);
                    connection.release();
                    return;
                }
                createTables(connection);
            });
        });
    });
};

function createTables(connection) {
    const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255),
            role VARCHAR(50) NOT NULL DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by VARCHAR(50)
        )
    `;

    const worksTable = `
        CREATE TABLE IF NOT EXISTS works (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'Pending',
            assigned_to INT,
            created_by INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        )
    `;

    // 1. Create Users Table
    connection.query(usersTable, (err) => {
        if (err) {
            console.error("Error creating users table:", err.message);
            connection.release(); // Release on error
            return;
        }
        console.log("Users table ready.");

        // 2. Seed Super Admin
        const seedQuery = `
            INSERT INTO users (email, password, name, role, created_by)
            SELECT * FROM (SELECT 'super@rbac.com', '123', 'Super Admin', 'super_admin', 'system') AS tmp
            WHERE NOT EXISTS (
                SELECT email FROM users WHERE email = 'super@rbac.com'
            ) LIMIT 1;
        `;
        connection.query(seedQuery, (err) => {
            if (err) console.error("Error seeding super admin:", err.message);
            else console.log("Default Super Admin ensured: super@rbac.com / 123");

            // 3. Create Works Table (After Users, because of FK dependency usually, though here FK is to users)
            connection.query(worksTable, (err) => {
                if (err) console.error("Error creating works table:", err.message);
                else console.log("Works table ready.");

                // 4. Release Connection
                connection.release();
            });
        });
    });
}

// Start Init
runInit();

// Wrapper for Query Execution (Auto-acquires connection from pool and uses correct DB)
const execute = (sql, params, callback) => {
    pool.getConnection((err, connection) => {
        if (err) return callback(err);

        // Ensure we are using the correct DB (in case connection was reset or new)
        connection.changeUser({ database: 'rbac_db' }, (err) => {
            if (err) {
                connection.release();
                return callback(err);
            }

            connection.query(sql, params, (err, results) => {
                connection.release(); // Always release
                callback(err, results);
            });
        });
    });
};

const db = {
    all: (query, params, callback) => execute(query, params, callback),
    get: (query, params, callback) => {
        execute(query, params, (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },
    run: (query, params, callback) => {
        execute(query, params, function (err, results) {
            if (err) return callback(err);
            // Mock 'this' for sqlite compatibility expected by server.js
            callback.call({ lastID: results.insertId, changes: results.affectedRows }, null);
        });
    }
};

export default db;
