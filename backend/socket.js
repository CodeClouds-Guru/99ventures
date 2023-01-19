module.exports = (app) => {
    var server = require('http').Server(app);
    var io = require('socket.io')(server);

    io.on('connection', (socket) => {
        console.log('connected');
        socket.on('disconnect', function () {
            console.log('A user disconnected');
        });
    });
    return app;
}