const mssql = require('mssql');
const express = require("express");
const app = express();
app.use(express.json());
// const db = require("../index");
const helper = require('../core/helper');
const moment = require('moment-timezone');


const addwish = (req, res) => {
    const BookID = req.params.BookID;
    let sqlquery = ""
    let promise = Promise.resolve();

    return promise
        .then(() => {
            sqlquery = `INSERT INTO Wishlist (UserID , BookID) VALUES (${req.userSession.userid},${BookID})`
        })
        .then(() => {
            return mssql.query(sqlquery);
        })
        .then(() => {
            return helper.success(res, 'Books added successfully into a WishList!');
        })
        .catch(err => {
            helper.error(res, err);
        });

}

const deletewish = (req, res) => {
    const BookID = req.params.BookID;
    let sqlquery = ""
    let promise = Promise.resolve();

    return promise
        .then(() => {
            sqlquery = `Delete from Wishlist where UserID = ${req.userSession.userid} and BookID = ${BookID}`
        })
        .then(() => {
            return mssql.query(sqlquery);
        })
        .then(() => {
            return helper.success(res, 'Wish added successfully into a WishList!');
        })
        .catch(err => {
            helper.error(res, err);
        });
}

const getwishlistbyusersession = (req, res) => {
    const UserID = req.userSession.userid;
    let promise = Promise.resolve();
    return promise
        .then(() => {
            return mssql.query(`SELECT BookID FROM Wishlist WHERE UserID = ${UserID}`);
        })
        .then((result) => {
            res.json(result.recordset);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        })
}

const getalldetailsofwishlist = (req, res) => {
    let promise = Promise.resolve();
    return promise
        .then(() => {
            return mssql.query(`
            SELECT 
            Books.Author, 
            Books.BookID,
            Books.CoverPhoto,
            Books.CreationTime,
            Books.Genre,
            Books.ISBN,
            Books.ModificationTime,
            Books.Price,
            Books.Quantity,
            Books.Title,
            COALESCE(Offers.Title, 'No offers') AS OfferTitle,
            COALESCE(Offers.Discount, 0) AS Discount,
            Offers.CreationTime AS OfferCreationTime,
            Offers.ModificationTime AS OfferModificationTime
          FROM 
            Books
          FULL OUTER JOIN 
            Offers ON Books.BookID = Offers.BookID
          FULL OUTER JOIN
            Wishlist ON Books.BookID = Wishlist.BookID
            where UserID = ${req.userSession.userid}
            order by  BookID desc
            `);
        })
        .then((result) => {
            res.json(result.recordset);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        })
}

module.exports = { addwish, deletewish, getwishlistbyusersession, getalldetailsofwishlist }