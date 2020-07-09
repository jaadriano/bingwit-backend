'use strict';

exports.initializeSocket = (io) => {
    io.on('connection', (socket) => {
        socket.on('raise', (data) => {
            socket.emit('bid', { message: `You raised your bid to ${data}` });
        });
    });
}