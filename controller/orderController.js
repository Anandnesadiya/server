const mssql = require('mssql');
const express = require("express");
const app = express();
app.use(express.json());
const moment = require('moment-timezone');
require('dotenv').config();



const carttoorder = (req, res) => {
    mssql.query(`
    INSERT INTO Orders (UserID, BookID, Quantity, OrderPrice) 
    SELECT 
        c.UserID, 
        c.BookID, 
        c.Quantity, 
        (b.Price - ((b.price * COALESCE(o.Discount, 0)) / 100 ))
    FROM
        Cart c
    full outer JOIN
        Books b ON c.BookID = b.BookID
    full outer Join
        Offers o On b.BookID = o.BookID    
    WHERE
        c.UserID = ${req.userSession.userid};
    `)
        .then(() => {   
            return mssql.query(`UPDATE Books
            SET Quantity = Quantity - (SELECT Quantity FROM Cart WHERE UserID = ${req.userSession.userid} AND Books.BookID = Cart.BookID)
            WHERE BookID IN (SELECT BookID FROM Cart WHERE UserID = ${req.userSession.userid});`);
        })
        .then(() => {
            return mssql.query(`DELETE FROM Cart WHERE UserID = ${req.userSession.userid}`);
        })
        .then(() => {
            res.status(200).send("Cart items successfully converted to orders and removed from cart.");
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err.message || "Internal Server Error");
        });
};

const getorderbyuserid = (req, res) => {
    let promise = Promise.resolve();

    return promise
        .then(() => {
            return mssql.query(`select 
            Orders.Quantity ,
            Orders.CreationTime ,
            Orders.ModificationTime ,
            Orders.OrderPrice,
            Books.Author , Books.Title ,
            Books.Genre , 
            Books.Price , 
            Books.ISBN ,
            Books.BookID,
            Offers.Discount 
            from Orders left outer join Books 
            on Orders.BookID = Books.BookID 
            left outer join Offers
            on Books.BookID = Offers.BookID
            where UserID = ${req.userSession.userid}`);
        })
        .then((result) => {
            result.recordset.forEach((record) => {
                record.CreationTimeIST = moment(record.CreationTime).tz('Asia/Kolkata').format('lll');
            });
            res.json(result.recordset);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        })
}


module.exports = { carttoorder, getorderbyuserid }