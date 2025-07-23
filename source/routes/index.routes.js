const { Router } = require("express");
const { get_index } = require("../controllers/index.controller");

const router = Router();

// Search product by fields
router.post('/', get_index);

module.exports = router;