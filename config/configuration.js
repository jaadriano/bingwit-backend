'use strict';

const _     = require('lodash');
const path  = require('path');

const config = {
    APP_NAME: 'bingwit-backend',
    PORT: 3000,
    LOGS_DIR: path.normalize(__dirname + '/../logs'),
    use: (env) => {
        _.assign(config, require(__dirname + '/env/' + env));
        return config;
    }
}

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

module.exports = config.use(process.env.NODE_ENV);