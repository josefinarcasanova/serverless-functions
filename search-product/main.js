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

    const allowedFields = [
        'name',
        'main_category',
        'sub_category',
        'ratings',
        'no_of_ratings',
        'discount_price',
        'actual_price',
    ];

    const textFields = ['name', 'main_category', 'sub_category'];
    const numericFields = ['ratings', 'no_of_ratings', 'discount_price', 'actual_price'];
    const table_name = "jcasanova_playground.amazon_products";

    const conditions = [];
    const values = [];
    let index = 1;

    for (const key of allowedFields) {
        const value = args[key];
        if (value !== undefined) {
            if (textFields.includes(key)) {
                conditions.push(`${key} ILIKE $${index}`);
                values.push(`%${value}%`);
                index++;
            } else if (numericFields.includes(key)) {
                if (typeof value === 'object' && (value.min !== undefined || value.max !== undefined)) {
                    if (value.min !== undefined) {
                        conditions.push(`${key} >= $${index}`);
                        values.push(value.min);
                        index++;
                    }
                    if (value.max !== undefined) {
                        conditions.push(`${key} <= $${index}`);
                        values.push(value.max);
                        index++;
                    }
                } else {
                    conditions.push(`${key} = $${index}`);
                    values.push(value);
                    index++;
                }
            }
        }
    }

    if (conditions.length === 0) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'No valid search parameters provided' }),
        };
    }

    const query = `
        SELECT name, main_category, sub_category, image, link, ratings, no_of_ratings, discount_price, actual_price
        FROM ${table_name}
        WHERE ${conditions.join(' AND ')}
    `;

    try {
        const result = await pool.query(query, values);
        console.log(result.rows);
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.rows),
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

main({
    "name": "lloyd"
})