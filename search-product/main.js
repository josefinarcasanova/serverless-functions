
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
        if (typeof args.inputs === 'string') {
            filters = JSON.parse(args.inputs);
        } else if (typeof args.inputs === 'object') {
            filters = args.inputs;
        } else {
            filters = args;
        }
    } catch (e) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: { error: 'Invalid JSON in inputs field' },
        };
    }

    const allowedFields = [
        'name',
        'main_category',
        'sub_category',
        'ratings',
        'no_of_ratings',
        'discount_price',
        'actual_price',
    ];
    const table_name = "jcasanova_playground.amazon_products";

    const conditions = [];
    const values = [];

    let index = 1;
    for (const key of allowedFields) {
        if (filters[key]) {
            if (typeof filters[key] === 'string') {
                conditions.push(`LOWER(${key}) LIKE LOWER($${index})`);
                values.push(`%${filters[key]}%`);
            } else {
                conditions.push(`${key} = $${index}`);
                values.push(filters[key]);
            }
            index++;
        }
    }
    console.log("filters: ",filters)
    console.log("conditions:" , conditions)

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

input = {
  "inputs": "{ \"name\": \"lloyd\",\"ratings\" : 4.2 }"
}
//input = { 'name' : 'lloyd'}
async function test (){console.log(await main(input))};
test()
