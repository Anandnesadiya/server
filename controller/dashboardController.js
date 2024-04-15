const mssql = require('mssql');
const express = require("express");
const app = express();
app.use(express.json());
const moment = require('moment-timezone');
require('dotenv').config();
const helper = require('../core/helper');




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

// const getdataforchart = (req, res) => {
//     let promise = Promise.resolve();

//     return promise
//         .then(() => {
// return mssql.query(`DECLARE @StartDate DATETIME
// DECLARE @EndDate DATETIME

// SET @StartDate = NULL
// SET @EndDate = NULL

// IF @StartDate IS NULL AND @EndDate IS NULL
// BEGIN
//     SET @StartDate = DATEADD(day, -7, GETDATE()) 
//     SET @EndDate = GETDATE() -- Current date
// END

// SELECT 
//     FORMAT(CreationTime, 'yyyy-MM-dd') AS OrderDate,
//     SUM(OrderPrice) AS TotalOrderPrice
// FROM 
//     [bookstore].[dbo].[Orders]
// WHERE 
//     (CreationTime >= @StartDate OR @StartDate IS NULL) 
//     AND (CreationTime <= @EndDate OR @EndDate IS NULL)
// GROUP BY 
//     FORMAT(CreationTime, 'yyyy-MM-dd')
// ORDER BY 
//     OrderDate;

//         `);
//         })
//         .then((result) => {
//             result.recordset.forEach((record) => {
//                 record.CreationTimeIST = moment(record.CreationTime).tz('Asia/Kolkata').format('YYYY-MM-DD');
//             });
//             res.json(result.recordset);
//         })
//         .catch(err => {
//             console.log(err);
//             res.status(500).send(err);
//         })
// }

const getdataforchart = (req, res) => {
    const { StartDate, EndDate } = req.body;

    let sqlquery = `
        DECLARE @StartDate DATETIME
        DECLARE @EndDate DATETIME
                
        SET @StartDate = ${StartDate ? `'${StartDate}'` : 'DATEADD(day, -7, GETDATE())'}
        SET @EndDate = ${EndDate ? `DATEADD(day, 1, '${EndDate}')` : 'GETDATE()'}

        SELECT 
            FORMAT(CreationTime, 'yyyy-MM-dd') AS OrderDate,
            SUM(OrderPrice) AS TotalOrderPrice
        FROM 
            [bookstore].[dbo].[Orders]
        WHERE 
            (CreationTime > @StartDate OR @StartDate IS NULL) 
            AND (CreationTime < @EndDate OR @EndDate IS NULL)
        GROUP BY 
            FORMAT(CreationTime, 'yyyy-MM-dd')
        ORDER BY 
            OrderDate;
    `;
    
    mssql.query(sqlquery)
        .then((result) => {
            res.json(result.recordset);
        })
        .catch(err => {
            helper.error(res, err);
        });
}



module.exports = { getorderprice, getbookdata, getdataforchart }