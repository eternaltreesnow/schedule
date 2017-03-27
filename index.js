'use strict'
const http = require('http');
const Request = require('request');
const schedule = require('node-schedule');
const querystring = require('querystring');

let scheduleFunc = function() {
    schedule.scheduleJob('1-59 * * * * *', function() {
        console.log(new Date());
        updateRank();
    });
    schedule.scheduleJob('* * 1 * * *', function() {
        console.log(new Date());
    })
};

/**
 * 更新排名信息
 */
let updateRank = function() {
    let opts = {
        host: '127.0.0.1',
        port: 80,
        path: '/grade/index/updateRank',
        successText: 'Update Rank Successfully',
        endText: 'Update Rank end',
        reTryTimes: 30
    };
    httpTemplate(opts);
};

/**
 * 更新相关参数
 */
let updateParam = function() {
    let opts = {
        host: '127.0.0.1',
        port: 12345,
        path: '/Starry/index.php/updateParam',
        successText: 'Update Params Successfully',
        endText: 'Update Params end',
        reTryTimes: 30
    };
    httpTemplate(opts);
};

/**
 * http request template
 * @param  {Object} opts parameters
 */
let httpTemplate = function(opts) {
    // init request data
    let param = {
        code: getCode()
    };
    param = querystring.stringify(param);
    // try times
    let draw = 1;

    // init request options
    let option = {
        host: opts.host || '127.0.0.1',
        port: opts.port || 80,
        path: opts.path || '/grade/index/updateRank',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': param.length
        }
    };

    Request(option, function(error, res, body) {
        if(!error && res.statusCode == 200) {
            console.log(body);
        } else {
            console.error('Update Rank error');
            console.error(error);
        }
    });

    // init http request
    let request = http.request(option, (response) => {
        response.setEncoding('utf8');
        response.on('data', function(data) {
            data = JSON.parse(data);
            if(data.status === 200) {
                console.log(new Date(), opts.successText);
                request.end();
            } else {
                console.log(new Date(), data);
                if(draw < opts.reTryTimes) {
                    request.write(param);
                    draw++;
                } else {
                    request.end();
                }
            }
        });
        response.on('end', function() {
            console.log(new Date(), opts.endText);
        });
    });

    // send http request & data
    request.write(param);
};

/**
 * 获取调用密钥
 * @return {String} 密钥
 */
let getCode = function() {
    return '123456';
};

scheduleFunc();
