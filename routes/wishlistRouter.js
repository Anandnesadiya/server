const express = require("express");
const router = express.Router();
const { body, check } = require('express-validator');
const { addwish, getwishlistbyusersession, getalldetailsofwishlist, deletewish } = require("../controller/wishlistController");
const verifyToken = require("../middleware/authMiddleware");
const app = express();
app.use(express.json());

const bodyParser = require('body-parser');

router.get('/addwish/:BookID', verifyToken, addwish);

router.delete('/deletewish/:BookID', verifyToken, deletewish);

router.get('/getwishlist', verifyToken, getwishlistbyusersession);

router.get('/getbookdetailsofwishlist', verifyToken, getalldetailsofwishlist);


module.exports = router;