const { request, response } = require("express");

// Utility functions
const utils = require("../utils/input-parsing");

// Data Schemas
const product_schema = require("../models/postgresql/product.schema");

const pg_pool = require("../controllers/postgresql.controller");
const { skip } = require("node:test");

/**
 * Searches for products
 * @param {JSON} req request information
 * @param {JSON} res response
 * @returns {JSON} search result
 */
const search_products = async (req = request, res = response) => {
    try {
        let filters = utils.parse_input_json(req.body);

        const allowedFields = product_schema.product.columns;
        const table_name = product_schema.product.table_name;

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
        //console.log("filters: ", filters)
        //console.log("conditions:", conditions)

        if (conditions.length === 0) {
            /* return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: { error: `Invalid search parameters provided. Provided ${JSON.stringify(filters)}` },
            }; */
            res.status(400).json({ error: `Invalid search parameters provided. Provided ${JSON.stringify(filters)}` });
        }

        let query = `
        SELECT name, main_category, sub_category, image, link, ratings, no_of_ratings, discount_price, actual_price
        FROM ${table_name}
        WHERE ${conditions.join(' AND ')}
    `;
        // if limit is specified, add it
        if (filters.limit) {
            query = query.concat(` LIMIT(${filters.limit})`);
        }
      
        const result = await pg_pool.getPool().query(query, values);
        /* return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.rows),
        }; */
        res.status(200).json(result.rows);

    } catch (err) {
        console.error('Database error:', err);
        /* return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal server error' }),
        }; */
        res.status(500).json({ error: 'Internal server error' });
        
    }
}

/**
 * Searches for products by categories
 * @param {JSON} req request information
 * @param {JSON} res response
 * @returns {JSON} search result
 */
const search_categories = async (req = request, res = response) => {
    try {
        let filters = utils.parse_input_json(req.body);

        const table_name = product_schema.product.table_name;

        let query = "";
        let values = [];

        // send empty input, returns main_category list
        if (Object.keys(filters).length === 0) {
            // Return distinct main categories
            query = `SELECT DISTINCT main_category FROM ${table_name} WHERE LOWER(main_category) IS NOT NULL ORDER BY main_category`;
        }
        // send only main_category, return sub_category list for that main_category
        else if ((Object.keys(filters).length == 1) && (filters.main_category)) {
            // Return distinct sub-categories for a given main category
            query = `SELECT DISTINCT sub_category FROM ${table_name} WHERE LOWER(main_category) = LOWER($1) AND sub_category IS NOT NULL ORDER BY sub_category`;
            values = [filters.main_category];
        }
        // send only sub_category, returns products under that sub_category
        else if ((Object.keys(filters).length == 1) && (filters.sub_category)) {
            // Return distinct sub-categories for a given main category
            console.log(filters, Object.keys(filters).length)
            query = `SELECT * FROM ${table_name} WHERE LOWER(sub_category) = LOWER($1) AND sub_category IS NOT NULL`;
            values = [filters.sub_category];
        } else {
            /* return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: { error: `Invalid input. Filters: ${filters}` }
            }; */
            res.status(400).json({ error: `Invalid input. Filters: ${filters}` });
            
            /* console.log("ultimo else", filters, Object.keys(filters).length)
            query = `SELECT * FROM ${table_name}`;
            values = [];
            let conditions = [];

            const keys = Object.keys(filters);

            if (keys.length > 0) {
                keys.forEach((key, index) => {
                    if (key != "limit" ){
                        conditions.push(`LOWER(${key}) = LOWER($${index + 1})`);
                        values.push(filters[key]);
                    }
                });

                query += ` WHERE ${conditions.join(' AND ')}`;
            } */
        }
        console.log(query);

        const result = await pg_pool.getPool().query(query, values);
        const key = Object.keys(result.rows[0] || {})[0];
        const row_list = result.rows.map(row => row[key]);

        console.log(row_list);

        /* return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(row_list),
        }; */
        res.status(200).json(row_list);
    } catch (err) {
        console.error('Database error:', err);
        /* return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal server error' }),
        }; */
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    search_products,
    search_categories
};