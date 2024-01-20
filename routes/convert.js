const express = require('express');

const convert = require('../controllers/convert');

const router = express.Router();

router.post('/toJson', convert.toJson);

router.get('/health', convert.health);


module.exports = router;

