const mssql = require('mssql');
const express = require("express");
const { body, validationResult, check } = require('express-validator');
const app = express();
app.use(express.json());
// const db = require("../index");
const jwt = require('jsonwebtoken');
const path = require('path');
const helper = require('../core/helper');
const moment = require('moment-timezone');
 
const createadmin = (req, res) => {
  const error = validationResult(req);
  const { UserName, Password, Email, PhoneNumber, ProfilePhoto } = req.body;

  let sqlquery = ""
  console.log("GIT");
  let promise = helper.paramValidate(
    { code: 4005, val: !req.body.UserName },
    { code: 4003, val: !req.body.PhoneNumber },
    { code: 4003, val: !req.body.Email }
  );

  return promise
    .then(() => {
      if (!error.isEmpty()) {
        return Promise.reject(error.errors[0])
      }
    })
    .then(() => {
      return mssql.query(`SELECT COUNT (*) AS count FROM User_Master WHERE Email = '${Email}'`);
    })
    .then((result) => {
      const emailExists = result.recordset[0].count > 0;

      if (emailExists) {
        return Promise.reject(4001);
      }
    })
    // .then(()=>{
    //   if(body('Email').isEmail()){
    //     return Promise.reject(4006);
    //   }
    // })
    .then(() => {
        sqlquery = `INSERT INTO User_Master (UserName,Password,Email,PhoneNumber,ProfilePhoto) VALUES ('${UserName}','${Password}','${Email}','${PhoneNumber}','${ProfilePhoto}')`
    })
    .then(() => {
      return mssql.query(sqlquery);
    })
    .then(() => {
      return helper.success(res, 'User added successfully!');
    })
    .catch(err => {
      helper.error(res, err);
    });
}

const login = (req, res) => {
  const error = validationResult(req);
  const { Password, Email, UserID, OTP } = req.body;
  let promise = Promise.resolve();

  return promise
    .then(() => {
      if (!error.isEmpty()) {
        return res.status(400).send(error.errors[0]);
      }
    })
    .then(() => {
      return mssql.query(`SELECT * FROM User_Master WHERE Email = '${Email}'`);
    })
    .then((result) => {
      if (result.recordset.length == 0) {
        return Promise.reject(2002);
      }
    })
    .then(() => {
      return mssql.query(`SELECT * FROM User_Master WHERE Email = '${Email}' AND Password = '${Password}'`);
    })
    .then((result) => {
      if (result.recordset.length == 0) {
        return Promise.reject(2004);
      }
      else {
        return Promise.resolve();
      }
    })
    .then(() => {
      if (OTP) {
        const queryUserID = mssql.query(`SELECT UserID FROM User_Master WHERE  Email = '${Email}' and Password = '${Password}'and OTP = ${OTP}`);

        return Promise.all([queryUserID]);
      }

      else {
        return Promise.reject('Please Enter OTP');
      }
    })
    .then(([resultUserID]) => {
      const userID = resultUserID.recordset[0].UserID;
      const token = jwt.sign({ password: Password, email: Email, userid: userID }, 'your-secret-key');
      return Promise.resolve({ accesstoken: token });
    })
    .then((token) => {
      return helper.success(res, token);
    })
    .catch(err => {
      helper.error(res, err);
    });
}

const getall = (req, res) => {  
  let promise = Promise.resolve();

  return promise
    .then(() => {
        return mssql.query(`SELECT * FROM User_Master`);
    })
    .then((result) => {
      result.recordset.forEach((record) => {
        record.CreationTimeIST = moment(record.CreationTime).tz('Asia/Kolkata').format('LLLL');
      });
      res.json(result.recordset);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);
    })
}

const updatebyid = (req, res) => {
  const UserID = req.params.UserID;
  let promise = Promise.resolve();
  const { UserName, Password, Email, PhoneNumber, ProfilePhoto, ModificationTime } = req.body;

  let setClauses = [];

  if (UserName) {
    setClauses.push(`UserName = '${UserName}'`);
  }
  if (Password) {
    setClauses.push(`Password = '${Password}'`);
  }
  if (Email) {
    setClauses.push(`Email = '${Email}'`);
  }
  if (PhoneNumber) {
    setClauses.push(`PhoneNumber = '${PhoneNumber}'`);
  }
  if (ProfilePhoto) {
    setClauses.push(`ProfilePhoto = '${ProfilePhoto}'`);
  }

  const setClauseString = setClauses.join(', ');

  return promise
    .then(() => {
      return mssql.query(`SELECT COUNT (*) AS count FROM User_Master WHERE Email = '${Email}' AND UserID! = ${UserID}`);
    })
    .then((result) => {
      const emailExists = result.recordset[0].count > 0;

      if (emailExists) {
        return Promise.reject(4001);
      }
    })
    .then(() => {
      if (req.userSession.userid == UserID) {
        mssql.query(`UPDATE User_Master SET ${setClauseString},ModificationTime = getutcdate() WHERE UserID = ${UserID}`);
      }
      else {
        return Promise.reject('You can not update the data');
      }
    })
    .then(() => {
      return helper.success(res, 'Record Updated Successfully!');
    })
    .catch(err => {
      helper.error(res, err);
    });
}

const getdatabyid = (req, res) => {
  const UserID = req.params.UserID;
  let promise = Promise.resolve();
  return promise
    .then(() => {
      return mssql.query(`SELECT * FROM User_Master WHERE UserID = ${UserID}`);
    })
    .then((result) => {
      res.json(result.recordset);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);
    })
}

const getProfile = (req, res) => {
  const UserID = req.userSession.userid;
  let promise = Promise.resolve();
  return promise
    .then(() => {
      return mssql.query(`SELECT * FROM User_Master WHERE UserID = ${UserID}`);
    })
    .then((result) => {
      res.json(result.recordset);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);
    })
}


module.exports = { createadmin, login, getall, updatebyid ,getdatabyid, getProfile}