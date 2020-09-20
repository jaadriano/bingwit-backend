/* Author: Sir Rommel Bulalacao */

pe = require('parse-error');

to = (promise) => {
    return promise
    .then(data => {
        return [null, data];
    }).catch(err => 
        [pe(err)]
    );
}


TE = function(err_message, log) {
    if(log === true) {
        console.error(err_message);
    }

    throw new Error(err_message);
};

ReE = (res, err, code) => {

    if (typeof err !== 'object') {
        err = { message: err };
    }
    
    if (typeof code !== 'undefined') {
        res.statusCode = code;
    }

    err.message = err.message || '';
    err.context = err.context || '';
    err.success = false;

    return res.json({
        success: false,
        error: err
    });
};

ReS = (res, data, code) => {
    let send_data = { success: true };
    
    if (typeof data === 'object') {
        send_data = Object.assign(data, send_data);
    }
    
    if (typeof code !== 'undefined') {
        res.statusCode = code;
    }

    return res.json(send_data);
};

ReF = (res, data, option) => {
    res.setHeader('Content-disposition', 'attachment; filename='+option.filename);
    res.set('Content-Type', option.type || 'text/csv');
    res.status(200).send(data);
};

process.on('unhandledReject', error => {
    console.error('Uncaught Error', pe(error));
});