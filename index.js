'use strict'
const Request = require('request');
const querystring = require('querystring');
const Logger = require('./logger');
const Schedule = require('node-schedule');

// initial request status
let Status = {
    'success': 200,     // 更新成功
    'end': 100,         // 更新失败，且不再更新
    'continue': 400,    // 更新失败，需要继续更新
    'error': 500        // 网络请求错误
};

/**
 * 更新排名信息
 */
let updateRank = function(draw) {
    let opts = {
        uri: 'http://intelligent.tpai.qq.com/grade/update/updateTest',
        code: '123456'
    };

    httpAgent(opts, draw, function(res) {
        if(res.status === Status.success) {
            Logger.console('Update Rank success');
        } else if(res.status === Status.end) {
            Logger.console('Update Rank failed & Update end');
            Logger.console('Message: ' + res.message);
        } else if(res.status === Status.continue) {
            Logger.console('Update Rank failed & Update continue: draw = ' + draw);
            Logger.console('Message: ' + res.message);
            draw = +res.draw;
            if(draw < 6) {
                setTimeout(function() {
                    updateRank(draw + 1);
                }, 10 * 1000);
            }
        } else if(res.status === Status.error) {
            Logger.console('Update Rank failed & Update error');
            Logger.console(res.message);
        }
    });
};

/**
 * http request template
 * @param  {Object} opts parameters
 * @param  {Number} draw Http request index
 */
let httpAgent = function(opts, draw, callback) {
    // init request body
    let param = querystring.stringify({
        code: opts.code,
        draw: draw
    });

    // init request options
    let option = {
        uri: opts.uri || 'http://intelligent.tpai.qq.com/grade/update/updateTest',
        body: param,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': param.length
        }
    };

    let result = {};

    Request(option, function(error, res, body) {
        if(!error && res.statusCode == 200) {
            let data = JSON.parse(body);

            if(data.status === 3) {
                result.status = Status.success;
            } else if(data.status === 5) {
                result.status = Status.end;
            } else {
                result.status = Status.continue;
            }
            result.draw = data.draw;
            result.message = data.message;
            callback(result);
        } else {
            result.status = Status.error;
            if(error) {
                result.message = error;
            } else {
                result.message = res.body;
            }
            callback(result);
        }
    });
};

let scheduleFunc = function() {
    Schedule.scheduleJob('0 50 20 * * *', function() {
        console.log(new Date());
        updateRank(1);
    });
};

scheduleFunc();
