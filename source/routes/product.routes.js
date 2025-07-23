const { Router } = require("express");
const { search_products, search_categories } = require("../controllers/product.controller");

const router = Router();

// Search product by fields
router.post('/product', search_products);

// Search product by categories
router.post('/categories', search_categories);


module.exports = router;