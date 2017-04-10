'use strict'
const Request = require('request');
const querystring = require('querystring');
const Logger = require('./logger');
const Schedule = require('node-schedule');
const MD5 = require('md5');

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
    let date = +new Date();
    let opts = {
        uri: 'http://intelligent.tpai.qq.com/grade/update/updateRank',
        date: date,
        code: getCode(date, 'update')
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
                }, 5 * 60 * 1000);
            }
        } else if(res.status === Status.error) {
            Logger.console('Update Rank failed & Update error');
            Logger.console(res.message);
        }
    });
};

/**
 * 备份Starry日志
 */
let uploadLogStarry = function(draw) {
    let date = +new Date();
    let opts = {
        uri: 'http://intelligent.tpai.qq.com/grade/update/uploadInfoToCos',
        date: date,
        code: getCode(date, 'log')
    };

    httpAgent(opts, draw, function(res) {
        if(res.status === Status.success) {
            Logger.console('Upload Starry Log success');
        } else if(res.status === Status.end) {
            Logger.console('Upload Starry Log failed');
            Logger.console('Message: ' + res.message);
        } else if(res.status === Status.error) {
            Logger.console('Upload Starry Log failed & Upload error');
            Logger.console(res.message);
        } else {
            Logger.console(res);
        }
    });
};

/**
 * 备份starry-console日志
 */
let uploadLogConsole = function(draw) {
    let date = +new Date();
    let opts = {
        uri: 'http://intelligent.tpai.qq.com/starry-console/index/index/uploadInfoToCos',
        date: date,
        code: getCode(date, 'log')
    };

    httpAgent(opts, draw, function(res) {
        if(res.status === Status.success) {
            Logger.console('Upload Console Log success');
        } else if(res.status === Status.end) {
            Logger.console('Upload Console Log failed');
            Logger.console('Message: ' + res.message);
        } else if(res.status === Status.error) {
            Logger.console('Upload Console Log failed & Upload error');
            Logger.console(res.message);
        } else {
            Logger.console(res);
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
        date: opts.date,
        draw: draw
    });

    // init request options
    let option = {
        uri: opts.uri || 'http://intelligent.tpai.qq.com/grade/update/updateRank',
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
    Schedule.scheduleJob('0 20 12 * * *', function() {
        console.log(new Date());
        updateRank(1);
    });

    Schedule.scheduleJob('0 0 1 * * *', function() {
        console.log(new Date());
        uploadLogStarry(1);
        uploadLogConsole(1);
    });
};

let getCode = function(date, type) {
    return MD5(date + type + 'workflow');
};

let testSchedule = function() {
    Schedule.scheduleJob('0 30 9 * * *', function() {
        console.log(new Date());
        console.log('Test schedule begin!');
    });

    Schedule.scheduleJob('0 50 9 * * *', function() {
        console.log(new Date());
        updateRank(6);
    });

    Schedule.scheduleJob('0 10 10 * * *', function() {
        console.log(new Date());
        updateRank(6);
    });

    Schedule.scheduleJob('0 30 10 * * *', function() {
        console.log(new Date());
        updateRank(6);
    });

    Schedule.scheduleJob('0 50 10 * * *', function() {
        console.log(new Date());
        updateRank(6);
    });

    Schedule.scheduleJob('0 0 11 * * *', function() {
        console.log(new Date());
        updateRank(6);
    });

    Schedule.scheduleJob('0 20 11 * * *', function() {
        console.log(new Date());
        updateRank(6);
    });

    Schedule.scheduleJob('0 40 11 * * *', function() {
        console.log(new Date());
        updateRank(6);
    });

    Schedule.scheduleJob('0 0 12 * * *', function() {
        console.log(new Date());
        updateRank(6);
    });

    Schedule.scheduleJob('0 20 12 * * *', function() {
        console.log(new Date());
        updateRank(6);
    });

    Schedule.scheduleJob('0 30 12 * * *', function() {
        console.log(new Date());
        updateRank(6);
    });

    Schedule.scheduleJob('0 20 13 * * *', function() {
        console.log(new Date());
        updateRank(6);
    });

    Schedule.scheduleJob('0 40 13 * * *', function() {
        console.log(new Date());
        updateRank(6);
    });

    Schedule.scheduleJob('0 0 14 * * *', function() {
        console.log(new Date());
        updateRank(6);
    });

    Schedule.scheduleJob('0 20 14 * * *', function() {
        console.log(new Date());
        updateRank(6);
    });

    Schedule.scheduleJob('0 40 14 * * *', function() {
        console.log(new Date());
        updateRank(6);
    });

    Schedule.scheduleJob('0 0 15 * * *', function() {
        console.log(new Date());
        updateRank(6);
    });
};

testSchedule();
// scheduleFunc();
// updateRank(6);
