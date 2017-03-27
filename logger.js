'no use strict'

var fs = require('fs');
var path = require('path');

var Logger = {};

// create log file using timestamp
Logger.init = function() {
    var timestamp = Math.floor(+new Date() / 1000);
    Logger.logfile = './log/log_' + timestamp;
    fs.writeFile(Logger.logfile, '', ['utf8', 'w'], (err, fd) => {
        if(err) {
            Logger.console(err);
            return;
        }
        Logger.console('Logger is ready. Log file: log_' + timestamp);
    });
};

Logger.log = function(content) {
    var info = getCallInfo(1);
    console.log(info.date, info.filename, 'line:' + info.line, content);
    var data = info.date + info.filename + 'line: ' +  info.line + content;
    // var data = new Buffer(new Date().toISOString() + ': ' + content);
    fs.writeFile(Logger.logfile, data, (err) => {
        if(err) {
            Logger.console(err);
        } else {
            Logger.console('Log Success.');
        }
    });
};

Logger.console = function(content) {
    var info = getCallInfo(1);
    console.log(info.date, info.filename, 'line:' + info.line, content);
};

var getCallInfo = function(level) {
    var orig, err, stack, line, column, filename;
    var res = {
        date: new Date().toLocaleString('zh-CN')
    };
    level = level || 0;
    orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack) {
        return stack;
    };
    err = new Error();
    Error.captureStackTrace(err, arguments.callee);
    stack = err.stack;
    Error.prepareStackTrace = orig;

    if(stack && stack[level]) {
        res.line = stack[level].getLineNumber();
        res.column = stack[level].getColumnNumber();
        res.filename = path.resolve(stack[level].getFileName());
    }

    return res;
}

module.exports = Logger;
