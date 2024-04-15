const express = require("express");
const router = express.Router();
const { body, check } = require('express-validator');
const verifyToken = require("../middleware/authMiddleware");
const app = express();
app.use(express.json());
const { getorderprice ,getbookdata, getdataforchart} = require("../controller/dashboardController");



router.get('/orderprice', verifyToken, getorderprice);

router.get('/booksdata', verifyToken, getbookdata);

router.post('/chartdata', verifyToken, getdataforchart);


module.exports = router;