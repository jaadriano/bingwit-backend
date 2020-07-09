'use strict';

/* Add development configurations here */
module.exports = {
    ENV: 'development',
    url: 'http://127.0.0.1:3000',
    database: {
        host: '127.0.0.1',
        port: '3306',
        db: 'bingwit_backend',
        user: 'bingwit_backend',
        password: 'b1n9w1t'
    },
    server: {
        host: '127.0.0.1',
        port: 3000
    },
    messageBirdKey: {
        key: 'KPqpABNWnQMG54YcYgfCBl82r'
    },
    jwt: {
        secret: 'secret@bingwit'
    },
    s3: {
        directory: __dirname+'/../../temp/',
        bucket_name: 'bingwit',
        iam_user_key: 'AKIAIXWVD3VMGKJ5WSXQ',
        iam_user_secret: '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'
    }
};