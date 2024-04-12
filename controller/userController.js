const mssql = require('mssql');
const express = require("express");
const { body, validationResult, check } = require('express-validator');
const app = express();
app.use(express.json());
// const db = require("../index");
const db = require("../database/config");
const jwt = require('jsonwebtoken');
const { promises } = require('nodemailer/lib/xoauth2');
const path = require('path');
const helper = require('../core/helper');
const moment = require('moment-timezone');


const createuser = (req, res) => {
    const error = validationResult(req);
    const { UserName, Email, Password, PhoneNumber } = req.body;

    let sqlquery = ""
    let promise = helper.paramValidate(
        { code: 4005, val: !req.body.UserName },
        { code: 4003, val: !req.body.Email },
        { code: 4003, val: !req.body.Password },
        { code: 4003, val: !req.body.PhoneNumber }
    );

    return promise
        .then(() => {
            if (!error.isEmpty()) {
                return Promise.reject(error.errors[0])
            }
        })
        .then(() => {
            return mssql.query(`SELECT COUNT (*) AS count FROM User_Register WHERE Email = '${Email}'`);
        })
        .then((result) => {
            const emailExists = result.recordset[0].count > 0;

            if (emailExists) {
                return Promise.reject(4001);
            }
        })
        .then(() => {
            sqlquery = `INSERT INTO User_Register (UserName,Email,Password, PhoneNumber) VALUES ('${UserName}','${Email}','${Password}','${PhoneNumber}')`
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

const userlogin = (req, res) => {
    const error = validationResult(req);
    const { Password, Email, UserID } = req.body;
    let promise = Promise.resolve();

    return promise
        .then(() => {
            if (!error.isEmpty()) {
                return res.status(400).send(error.errors[0]);
            }
        })
        .then(() => {
            return mssql.query(`SELECT * FROM User_Register WHERE Email = '${Email}'`);
        })
        .then((result) => {
            if (result.recordset.length == 0) {
                return Promise.reject(2002);
            }
        })
        .then(() => {
            return mssql.query(`SELECT * FROM User_Register WHERE Email = '${Email}' AND Password = '${Password}'`);
        })
        .then((result) => {
            if (result.recordset.length == 0) {
                return Promise.reject(2003);
            }
            else {
                return Promise.resolve();
            }
        })
        .then(() => {
            const queryUserID = mssql.query(`SELECT UserID FROM User_Register WHERE  Email = '${Email}' and Password = '${Password}'`);

            return Promise.all([queryUserID]);
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

const getalluser = (req, res) => {
    let promise = Promise.resolve();

    return promise
        .then(() => {
            return mssql.query(`SELECT * FROM User_Register`);
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

const getuserbyid = (req, res) => {
    const UserID = req.params.UserID;
    let promise = Promise.resolve();
    return promise
        .then(() => {
            return mssql.query(`SELECT * FROM User_Register WHERE UserID = ${UserID}`);
        })
        .then((result) => {
            res.json(result.recordset);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        })
}

const getuserbyusersession = (req, res) => {
    let promise = Promise.resolve();
    return promise
        .then(() => {
            return mssql.query(`SELECT * FROM User_Register WHERE UserID = ${req.userSession.userid}`);
        })
        .then((result) => {
            res.json(result.recordset);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        })
}

const updateuserbyid = (req, res) => {
    const UserID = req.params.UserID;
    let promise = Promise.resolve();
    const { UserName, Email, Password, PhoneNumber } = req.body;

    let setClauses = [];

    if (UserName) {
        setClauses.push(`UserName = '${UserName}'`);
    }
    if (Email) {
        setClauses.push(`Email = '${Email}'`);
    }
    if (Password) {
        setClauses.push(`Password = '${Password}'`);
    }
    if (PhoneNumber) {
        setClauses.push(`PhoneNumber = '${PhoneNumber}'`);
    }

    const setClauseString = setClauses.join(', ');

    return promise
        .then(() => {
            return mssql.query(`SELECT COUNT (*) AS count FROM User_Register WHERE Email = '${Email}' AND UserID! = ${UserID}`);
        })
        .then((result) => {
            const emailExists = result.recordset[0].count > 0;
            if (emailExists) {
                return Promise.reject(4001);
            }
        })
        .then(() => {
            if (req.userSession.userid == UserID) {
                mssql.query(`UPDATE User_Register SET ${setClauseString},ModificationTime = getutcdate() WHERE UserID = ${UserID}`);
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

module.exports = { createuser, userlogin, getalluser, getuserbyid, updateuserbyid ,getuserbyusersession }