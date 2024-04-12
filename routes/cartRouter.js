const express = require("express");
const router = express.Router();
const { body, check } = require('express-validator');
const { insertcart, deletecartitembyid, getbookbyuserincart,order } = require("../controller/cartController");
const verifyToken = require("../middleware/authMiddleware");
const app = express();
app.use(express.json());

const bodyParser = require('body-parser');

router.post('/insert/:BookID', verifyToken, insertcart);

router.get('/getcartdata', verifyToken, getbookbyuserincart);

router.delete('/deletecartdata/:CartItemID', verifyToken, deletecartitembyid);

router.post('/order',order);

module.exports = router;