const base = require('./base')
const path = require('path');
const socket = require('./socket')
const app = base()
global.appRoot = path.resolve(__dirname);
const server = app.listen(process.env.PORT || 4000)
var io = require('socket.io')(server);
io.sockets.on('connection', (socket) => {
    console.log('user connected');
    // socket.on('shoutbox', (newMessage) => {
    //     console.log('newMessage', newMessage);
    // });
    socket.emit("shoutbox", { name: 'Tez', place: 'USA', message: 'Survey credited' });
    socket.on('disconnect', function () {
        console.log('A user disconnected');
    });
    socket.on('shoutbox_client', function(data){
        socket.emit("shoutbox", { name: 'Tez', place: 'USA', message: data.message });
    })
});