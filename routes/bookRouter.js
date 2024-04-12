const express = require("express");
const router = express.Router();
const { body, check } = require('express-validator');
const { getbook, addbook, updatebookbyid, deletebookbyid ,getbookbyid, addoffer,getbookbysearch, deleteofferbybookid} = require("../controller/bookController");
const verifyToken = require("../middleware/authMiddleware")
const app = express();
app.use(express.json());
const bodyParser = require('body-parser')


router.get('/getbooks',getbook);

router.get('/getbook/:BookID',getbookbyid);

router.post('/addbook',verifyToken,addbook);

router.put('/updatebook/:BookID',verifyToken,updatebookbyid);

router.delete('/deletebook/:BookID',verifyToken,deletebookbyid);

router.post('/addoffer/:BookID',verifyToken,addoffer);

router.delete('/deleteoffer/:BookID',verifyToken,deleteofferbybookid);

router.get('/getbookbysearch',verifyToken,getbookbysearch);

module.exports = router;