'use strict';

const file_stream_rotator   = require('file-stream-rotator');
const winston               = require('winston');
const log_level             = process.env.LOG_LEVEL || 'debug';

exports.configure_logger = (directory) => {
    const log_directory = directory;

    return file_stream_rotator.getStream({
        date_format: 'MM-DD-YYYY',
        filename: log_directory + '/access-%DATE%.log',
        frequency: 'daily',
        verbose: false
    });
};

exports.winston_logger = winston.createLogger({
    level: log_level,
    transports: [
        new winston.transports.Console({format: winston.format.simple()})
    ]
});