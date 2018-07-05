/**
 * Created by stig on 2017/3/30.
 */

var path = require("path");
var sqlite3 = require('sqlite3').verbose();
var Promise = require("bluebird");
var db = new sqlite3.Database(path.join(__dirname, 'usrinfoDB.db'),function(data){
    // console.log(data);
});

db.serialize(function() {
    // db.run("CREATE TABLE  IF NOT EXISTS lorem (info TEXT)");

    // var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    // for (var i = 0; i < 10; i++) {
    //     stmt.run("Ipsum " + i);
    // }
    // stmt.finalize();
    //
    // db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
    //     console.log(row.id + ": " + row.info);
    // });
});

var responseObj ={
    result:'success',
    data:{},
    error:{}
};
var sqliteObj = {};

sqliteObj.createTable = function (sql) {
    return new Promise(function (accept,reject) {
        db.run(sql,function (err) {
            if(!err){
                accept(responseObj);
            }else{
                responseObj.result = "error";
                responseObj.error = err;
                reject(responseObj);
            }
        }); 
    });
}

sqliteObj.execute = function (sql,varArr) {
    return new Promise(function (accept,reject) {
        var stmt = db.prepare(sql);
        var flag = false;
        if(stmt.run.call(stmt,varArr)){
            flag = true;
        }
        stmt.finalize();
        if(flag){
            accept(responseObj);
        }else{
            responseObj.result = "error";
            responseObj.error = err;
            reject(responseObj);
        }
    });

}

sqliteObj.query = function (sql) {
    return new Promise(function (accept,reject) {
        db.all(sql, function(err, row) {
            if(!err){
                responseObj.data = row;
                accept(responseObj);
            }else{
                responseObj.result = "error";
                responseObj.error = err;
                reject(responseObj);
            }
        });
    });

}

// db.close();

module.exports = sqliteObj;