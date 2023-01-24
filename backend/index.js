const base = require('./base')
const path = require('path');
const socket = require('./socket')
const app = base()
global.appRoot = path.resolve(__dirname);
const server = app.listen(process.env.PORT || 4000)
var io = require('socket.io')(server);
global.io = io; //declared globaly

io.sockets.on('connection', (socket) => {
    global.socket = socket; //declared globaly
    console.log('user connected');
    // socket.on('news', (newMessage) => {
    //     console.log('newMessage', newMessage);
    // });
    socket.emit("shoutbox", { name: 'Tez', place: 'USA', message: 'Survey credited' });
    socket.on('disconnect', function () {
        console.log('A user disconnected');
    });
});