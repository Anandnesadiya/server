const express = require("express");
const router = express.Router();
const { body, check } = require('express-validator');
const { carttoorder, getorderbyuserid } = require("../controller/orderController");
const verifyToken = require("../middleware/authMiddleware");
const app = express();
app.use(express.json());

const bodyParser = require('body-parser');

router.get('/carttoorder', verifyToken, carttoorder);

router.get('/getdatabyuserid',verifyToken,getorderbyuserid);

module.exports = router;