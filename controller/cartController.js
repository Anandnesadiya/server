const mssql = require('mssql');
const express = require("express");
const { body, validationResult, check } = require('express-validator');
const app = express();
app.use(express.json());
const helper = require('../core/helper');
const moment = require('moment-timezone');
const Razorpay = require("razorpay");
require('dotenv').config();



const insertcart = (req, res) => {
    const BookID = req.params.BookID;
    const error = validationResult(req);
    const { Quantity } = req.body;

    let sqlquery = ""
    let promise = helper.paramValidate(
        { code: 4005, val: !req.body.Quantity }
    );

    return promise
        .then(() => {
            if (!error.isEmpty()) {
                return Promise.reject(error.errors[0])
            }
        })
        .then(() => {
            sqlquery = `INSERT INTO Cart (UserID,BookID,Quantity) VALUES ('${req.userSession.userid}','${BookID}','${Quantity}')`
        })
        .then(() => {
            return mssql.query(sqlquery);
        })
        .then(() => {
            return helper.success(res, 'Book added successfully into a cart!');
        })
        .catch(err => {
            helper.error(res, err);
        });
}

const getbookbyuserincart = (req, res) => {
    let promise = Promise.resolve();

    return promise
        .then(() => {
            return mssql.query(`
            select 
            Cart.Quantity,
            Cart.CartItemID,
            Cart.CreationTime ,
            Cart.ModificationTime,
            Books.Author, 
            Books.Title, 
            Books.Genre,
            Books.Price,
            Books.ISBN,
            Offers.Discount
            from 
            Cart left outer join Books 
            on Cart.BookID = Books.BookID
            left outer join Offers
            on Cart.BookID = Offers.BookID
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

const deletecartitembyid = (req, res) => {
    const CartItemID = req.params.CartItemID;

    let promise = Promise.resolve();
    return promise
        .then(() => {
            return mssql.query(`delete from Cart where CartItemID = ${CartItemID}`)
        })
        .then(() => {
            return helper.success(res, 'Data Deleted Successfully!');
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        })
}

const order = async (req, res) => {

    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET
        })

        const options = await req.body;
        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).send("Error");
        }
        res.json(order);
    }
    catch {
        res.send("error");
    }
}
 
module.exports = { insertcart, getbookbyuserincart, deletecartitembyid, order }