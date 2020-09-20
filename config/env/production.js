'use strict';

/* Add production configurations here */
module.exports = {
    ENV: 'production',
    url: 'https://bingwit-backend.herokuapp.com/',
    database: {
        host: 'r42ii9gualwp7i1y.chr7pe7iynqr.eu-west-1.rds.amazonaws.com',
        port: '3306',
        db: 'r4gahfn9sroaekbx',
        user: 'ecqnn8tmeu6m5ujg',
        password: 'kvm3wwb8ppwf9w1c',
        dialect: 'mysql'
    },
    server: {
        host: 'https://bingwit-backend.herokuapp.com/',
        port: 80
    },
    messageBirdKey: {
        key: 'Yl9bbKZWWwC64ZVxpKJ11pAkb'
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
