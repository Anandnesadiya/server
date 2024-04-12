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

const getbook = (req, res) => {
  let promise = Promise.resolve();


  return promise
    .then(() => {
      let query = `
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
        order by  BookID desc`;

      return mssql.query(query);
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
    });
}

const getbookbyid = (req, res) => {
  let promise = Promise.resolve();
  const BookID = req.params.BookID;


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
      where Books.BookID = ${BookID};`
      );
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

const addbook = (req, res) => {
  const error = validationResult(req);
  const { Title, Author, Genre, Price, ISBN, Quantity, CoverPhoto } = req.body;

  let sqlquery = ""
  let promise = helper.paramValidate(
    { code: 4005, val: !req.body.Title },
    { code: 4003, val: !req.body.Author },
    { code: 4003, val: !req.body.Genre },
    { code: 4003, val: !req.body.Price },
    { code: 4003, val: !req.body.ISBN },
    { code: 4003, val: !req.body.Quantity },
    { code: 4003, val: !req.body.CoverPhoto },
  );

  return promise
    .then(() => {
      if (!error.isEmpty()) {
        return Promise.reject(error.errors[0])
      }
    })
    .then(() => {
      sqlquery = `INSERT INTO Books (Title, Author, Genre, Price, ISBN, Quantity, CoverPhoto) VALUES ('${Title}','${Author}','${Genre}',${Price},'${ISBN}',${Quantity},'${CoverPhoto}')`
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

const updatebookbyid = (req, res) => {
  const BookID = req.params.BookID;
  let promise = Promise.resolve();
  const { Title, Author, Genre, Price, ISBN, Quantity, CoverPhoto, ModificationTime } = req.body;

  let setClauses = [];

  if (Title) {
    setClauses.push(`Title = '${Title}'`);
  }
  if (Author) {
    setClauses.push(`Author = '${Author}'`);
  }
  if (Genre) {
    setClauses.push(`Genre = '${Genre}'`);
  }
  if (Price) {
    setClauses.push(`Price = ${Price}`);
  }
  if (ISBN) {
    setClauses.push(`ISBN = '${ISBN}'`);
  }
  if (Quantity) {
    setClauses.push(`Quantity = ${Quantity}`);
  }
  if (CoverPhoto) {
    setClauses.push(`CoverPhoto = '${CoverPhoto}'`);
  }

  const setClauseString = setClauses.join(', ');

  return promise
    .then(() => {
      mssql.query(`UPDATE Books SET ${setClauseString},ModificationTime = getutcdate() Where BookID = ${BookID}`);
    })
    .then(() => {
      return helper.success(res, 'Record Updated Successfully!');
    })
    .catch(err => {
      helper.error(res, err);
    });
}

const deletebookbyid = (req, res) => {
  const BookID = req.params.BookID;

  let promise = Promise.resolve();
  return promise
    .then(() => {
      return mssql.query(`delete from offers where BookID = ${BookID}`)
    })
    .then(() => {
      return mssql.query(`delete from Books where BookID = ${BookID}`)
    })
    .then(() => {
      return helper.success(res, 'Data Deleted Successfully!');
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);
    })
}

const addoffer = (req, res) => {
  const error = validationResult(req);
  const BookID = req.params.BookID;
  const { Title, Discount } = req.body;

  let sqlquery = ""
  let promise = helper.paramValidate(
    { code: 4005, val: !req.body.Title },
    { code: 4003, val: !req.body.Discount }
  );

  return promise
    .then(() => {
      if (!error.isEmpty()) {
        return Promise.reject(error.errors[0])
      }
    })
    .then(() => {
      sqlquery = `INSERT INTO Offers (BookID , Title, Discount) VALUES (${BookID},'${Title}',${Discount})`
    })
    .then(() => {
      return mssql.query(sqlquery);
    })
    .then(() => {
      return helper.success(res, 'Offer added successfully!');
    })
    .catch(err => {
      helper.error(res, err);
    });
}

const deleteofferbybookid = (req, res) => {
  const BookID = req.params.BookID;

  let promise = Promise.resolve();
  return promise
    .then(() => {
      return mssql.query(`delete from Offers where BookID = ${BookID}`)
    })
    .then(() => {
      return helper.success(res, 'Offer Deleted Successfully!');
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);
    })
}

const getbookbysearch = (req,res)=>{
  let promise = Promise.resolve();
  return promise
    .then(()=>{
      return db.executeSearchingSp('PR_Books_Select_Limited', req.query);
    })
    .then((result)=>{
      res.json(result);
    })
    .catch(err=>{
      console.log(err);
      res.status(500).send(err);
    })
}

module.exports = { getbook, addbook, updatebookbyid, deletebookbyid, getbookbyid, addoffer, deleteofferbybookid ,getbookbysearch};