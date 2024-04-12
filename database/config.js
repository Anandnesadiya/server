const mssql = require('mssql');
var db = {};
var dbPool = null;
// const path = require('path')
require('dotenv').config();
const connection = mssql.connect({
    server: process.env.SERVER,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    options: {
        trustServerCertificate: true,
      },
});

function dbConnection(){
    return new Promise(function(resolve,reject){
        connection.then((connected) =>{
            console.log('Connected to MySQL');
            dbPool = connected;
            return resolve(connected);
        }).catch((err) => {
            console.error('Error connecting to MySQL: ', err);
            return reject(err);
        })
    })
}
dbConnection()

let executeListingSp = function (sp_name, params) {
    return new Promise(function (fulfill, reject) {
        const request = dbPool.request();
        request.input('searchbyusername', mssql.VarChar, (params.searchbyusername || null));
        request.input('page', mssql.Int, params.page||1);
        request.input('pageSize', mssql.Int, params.pageSize||2);
        return request
            .execute(sp_name).then(result => {
                fulfill(result.recordset);
            }).catch(err => {
                reject(err);
            });
    });
};

let executeSearchingSp = function (sp_name, params) {
    return new Promise(function (fulfill, reject) {
        const request = dbPool.request();
        request.input('searchbybooktitle', mssql.VarChar, (params.searchbybooktitle || null));
        request.input('Author', mssql.VarChar, (params.searchbybooktitle || null));
        request.input('Genre', mssql.VarChar, (params.searchbybooktitle || null));
        request.input('ISBN', mssql.VarChar, (params.searchbybooktitle || null));
        return request
            .execute(sp_name).then(result => {  
                fulfill(result.recordset);
            }).catch(err => {
                reject(err);
            });
    });
};

module.exports = {executeListingSp,executeSearchingSp};
