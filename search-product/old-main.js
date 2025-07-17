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
            rejectUnauthorized: false // Accept self-signed certs (common in cloud DBs)
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
    const table_name = "jcasanova_playground.amazon_products"

    const conditions = [];
    const values = [];

    let index = 1;
    for (const key of allowedFields) {
        if (args[key]) {
            if (typeof args[key] === 'string') conditions.push(`LOWER(${key}) LIKE LOWER($${index})`);
            values.push(`%${args[key]}%`);
        } else {
            conditions.push(`${key} = $${index}`);
            values.push(args[key]);
        }
        index++;
    }

    if (conditions.length === 0) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: { error: 'No valid search parameters provided' },
        };
    }

    const query = `
    SELECT name, main_category, sub_category, image, link, ratings, no_of_ratings, discount_price, actual_price
    FROM ${table_name}
    WHERE ${conditions.join(' AND ')}
  `;

    try {
        const result = await pool.query(query, values);
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: result.rows,
        };
    } catch (err) {
        console.error('Database error:', err);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: { error: 'Internal server error' },
        };
    }
}

module.exports.main = main;


async function test (){console.log(await main({ name: 'lloyd' }))};

test()
