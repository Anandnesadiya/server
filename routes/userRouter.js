const express = require("express");
const router = express.Router();
const { body, validationResult, check } = require('express-validator');
const { createuser, getuserbyusersession, userlogin, getalluser, getuserbyid, updateuserbyid } = require("../controller/userController");
const verifyToken = require("../middleware/authMiddleware")
const app = express();
app.use(express.json());
const bodyParser = require('body-parser')


router.post('/register',
  [
    body('Email').isEmail().withMessage('Invalid email address').exists('Email').withMessage('Email is required').notEmpty().withMessage('Email is not empty')
  ], createuser
);

router.post('/login',
  body('Password').exists('Password').withMessage('Password is required').notEmpty().withMessage('Password is not empty'),
  body('Email').exists('Email').withMessage('Email is required').notEmpty().withMessage('Email is not empty'), userlogin
);

router.get('/getdata', verifyToken, getalluser);

router.get('/getdata/:UserID', verifyToken, getuserbyid);

router.put('/updatedata/:UserID', verifyToken, updateuserbyid);

router.get('/getdatabyusersession', verifyToken, getuserbyusersession);

module.exports = router;
