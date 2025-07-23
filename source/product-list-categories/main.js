async function main(args) {
    const { Pool } = require('pg');
    require('dotenv').config();

    return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: args
        };

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
        let payload = args;

        // If the function is invoked via HTTP (e.g., Postman), the body will be a string
        if (args.body && typeof args.body === 'string') {
            payload = JSON.parse(args.body);
        }

        filters = payload.inputs || payload;

        if (typeof filters === 'string') {
            filters = JSON.parse(filters);
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
        let keys = [];
        let values = [];

        if (Object.keys(filters).length === 0) {
            // Return distinct main categories
            query = `SELECT DISTINCT main_category FROM ${table_name} WHERE main_category IS NOT NULL ORDER BY main_category`;
        } else if ((Object.keys(filters).length === 1) & (filters.main_category)) {
            // Return distinct sub-categories for a given main category
            query = `SELECT DISTINCT sub_category FROM ${table_name} WHERE LOWER(main_category) = LOWER($1) AND sub_category IS NOT NULL ORDER BY sub_category`;
            values = [filters.main_category];
        } else if ((Object.keys(filters).length === 1) & filters.sub_category) {
            // Return distinct sub-categories for a given main category
            query = `SELECT * FROM ${table_name} WHERE LOWER(sub_category) = LOWER($1) AND sub_category IS NOT NULL`;
            values = [filters.sub_category];
        } else {
            /* return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: { error: 'Invalid input. Provide either an empty object or { main_category: "{SOME_CATEGORY}" }' },
            }; */
            query = `SELECT * FROM ${table_name}`;
            values = [];
            let conditions = [];

            const keys = Object.keys(filters);

            if (keys.length > 0) {
                keys.forEach((key, index) => {
                    conditions.push(`LOWER(${key}) = LOWER($${index + 1})`);
                    values.push(filters[key]);
                });

                query += ` WHERE ${conditions.join(' AND ')}`;
            }
        }
        console.log(query);

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

//input = '{ "main_category": "car & motorbike"}'
//input = {"sub_category": "Air Conditioners"}
//input = { "main_category": "appliances", "sub_category": "Air Conditioners"}
/* input = {}
async function test() { console.log(await main(input)) };
test() */