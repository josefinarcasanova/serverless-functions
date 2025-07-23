const fs = require('fs');

const { Pool } = require('pg');
require('dotenv').config();

let db_pool = null;

/**
 * Create connection to the database
 */
function createPool() {
    try {
        const pool = new Pool({
            host: process.env.PGHOST,
            user: process.env.PGUSER,
            password: process.env.PGPASSWORD,
            database: process.env.PGDBNAME,
            port: process.env.PGPORT,
            ssl: {
                rejectUnauthorized: false
            }
        });
        console.log("PostgreSQL connection successful.");
        return pool;
    } catch (err) {
        console.error('Database error:', err);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
}

function getPool() {
    if (!db_pool) {
        db_pool = createPool();
    }
    return db_pool;
}

module.exports = { getPool };


