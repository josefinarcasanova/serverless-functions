
async function main(args) {
    const { Pool } = require('pg');
    require('dotenv').config();

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

    let filters = {};
    try {
        if (typeof args === 'string') {
            filters = JSON.parse(args);
        } else if (typeof args === 'object') {
            if ('inputs' in args) {
                filters = args.inputs;
            } else {
                filters = args;
            }
        }
    } catch (e) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: { error: 'Invalid JSON input' },
        };
    }

    const table_name = "jcasanova_playground.amazon_products";

    try {
        let query = "";
        let values = [];

        if (Object.keys(filters).length === 0) {
            // Return distinct main categories
            query = `SELECT DISTINCT main_category FROM ${table_name} WHERE main_category IS NOT NULL ORDER BY main_category`;
        } else if (filters.main_category) {
            // Return distinct sub-categories for a given main category
            query = `SELECT DISTINCT sub_category FROM ${table_name} WHERE LOWER(main_category) = LOWER($1) AND sub_category IS NOT NULL ORDER BY sub_category`;
            values = [filters.main_category];
        } else {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: { error: 'Invalid input. Provide either an empty object or { main_category: "{SOME_CATEGORY}" }' },
            };
        }

        const result = await pool.query(query, values);
        const key = Object.keys(result.rows[0] || {})[0];
        const list = result.rows.map(row => row[key]);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(list),
        };
    } catch (err) {
        console.error('Database error:', err);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
}

module.exports.main = main;
