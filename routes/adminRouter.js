const express = require("express");
const router = express.Router();
const { body, validationResult, check } = require('express-validator');
const { createadmin, login, getall ,getdatabyid,updatebyid, getProfile} = require("../controller/adminControllers");
const verifyToken = require("../middleware/authMiddleware")
const app = express();
app.use(express.json());


router.post('/register',
  [
    body('Email').isEmail().withMessage('Invalid email address').exists('Email').withMessage('Email is required').notEmpty().withMessage('Email is not empty')
  ], createadmin
);

router.post('/login',
  body('Password').exists('Password').withMessage('Password is required').notEmpty().withMessage('Password is not empty'),
  body('Email').exists('Email').withMessage('Email is required').notEmpty().withMessage('Email is not empty'), login,
);

router.put('/updatedata/:UserID', verifyToken,updatebyid);

router.get('/getdata/:UserID',verifyToken, getdatabyid);

router.get('/profile/',verifyToken, getProfile);

router.get('/getdata', verifyToken, getall);



module.exports = router;
