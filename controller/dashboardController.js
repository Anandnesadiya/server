const mssql = require('mssql');
const express = require("express");
const app = express();
app.use(express.json());
const moment = require('moment-timezone');
require('dotenv').config();



const getorderprice = (req, res) => {
    let promise = Promise.resolve();

    return promise
        .then(() => {
            return mssql.query(`SELECT * FROM Orders`);
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

const getbookdata = (req, res) => {
    let promise = Promise.resolve();

    return promise
        .then(() => {
            return mssql.query(`SELECT Count(*) as TotalBooks FROM Books`);
        })
        .then((result) => {
            res.json(result.recordset);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        })
}

const getdataforchart = (req, res) => {
    let promise = Promise.resolve();

    return promise
        .then(() => {
            return mssql.query(`SELECT 
            FORMAT(CreationTime, 'yyyy-MM-dd') AS OrderDate,
            SUM(OrderPrice) AS TotalOrderPrice
        FROM 
            [bookstore].[dbo].[Orders]
        GROUP BY 
            FORMAT(CreationTime, 'yyyy-MM-dd')
        ORDER BY 
            OrderDate;`);
        })
        .then((result) => {
            result.recordset.forEach((record) => {
                record.CreationTimeIST = moment(record.CreationTime).tz('Asia/Kolkata').format('YYYY-MM-DD');
            });
            res.json(result.recordset);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        })
}


module.exports = { getorderprice, getbookdata, getdataforchart }