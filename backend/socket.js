module.exports = (app) => {
    var server = require('http').createServer(app);
    var io = require('socket.io')(server);
    io.on('connection', function (socket) {
        socket.on('shoutbox', function (data) {
            console.log(data);
        });
        socket.emit('shoutbox', { bp: 'high' })
    });
    return app;
}