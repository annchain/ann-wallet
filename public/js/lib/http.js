/**
 * Created by stig on 2017/5/8.
 */

var http = require('http');

var qs = require('querystring');
var urlModule = require('url');

var obj = {};
obj.get = function(url,successCallback,errCallback){
    // console.log('in http get');
    // console.log(url);

    var urlObj = urlModule.parse(url);
    // console.log(urlObj);

    var options = {
        hostname: urlObj.hostname,
        port: urlObj.port?urlObj.port:80,
        path: urlObj.path,
        method: 'GET'
    };

    var req = http.request(options, function (res) {
        console.log('GET STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));  
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk); 

            successCallback(JSON.parse(chunk));
        });
    });

    req.on('error', function (e) {
        console.log('-----error-------'+e);
        // console.log('problem with request: ' + e.message); 
        if(errCallback){
            errCallback(e);
        }
    });

    req.end();
}

obj.post = function(url,postData,successCallback,errCallback){

    // console.log('in http post');
    // console.log(url);
    var urlObj = urlModule.parse(url);
    // console.log(urlObj);
    var body = postData;

    var bodyString = JSON.stringify(body);

    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': bodyString.length
    };

    var options = {
        host: urlObj.hostname,
        port: urlObj.port?urlObj.port:80,
        path: urlObj.path,
        method: 'POST',
        headers: headers
    };

    var req=http.request(options,function(res){
        console.log('GET STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers)); 
        res.setEncoding('utf-8');

        var responseString = '';

        res.on('data', function(data) {
            console.log('data in ');
            console.log(data);
            responseString += data;
            successCallback(JSON.parse(responseString));
        });

        res.on('end', function(res) {
            //这里接收的参数是字符串形式,需要格式化成json格式使用
            var resultObject = JSON.parse(responseString);
            console.log(resultObject);
        });

        req.on('error', function(e) {
            // TODO: handle error.
            console.log('-----error-------'+e);
            if(errCallback){
                errCallback(e);
            }
        });
    });
    req.write(bodyString);
    req.end();
}

obj.parseUrl = function(url){
    console.log('in parseUrl');
    var result = urlModule.parse(url);
    console.log(result);
    return result;
}

module.exports = obj;
