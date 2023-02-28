const base = require('./base')
const path = require('path');
const socket = require('./socket')
const app = base()
global.appRoot = path.resolve(__dirname);
const server = app.listen(process.env.PORT || 4000)
var io = require('socket.io')(server);
global.io = io; //declared globaly

const { Shoutbox } = require("../backend/models");
console.log(io)
io.sockets.on('connection', (socket) => {
    global.socket = socket; //declared globaly
    console.log('user connected');
    // socket.on('news', (newMessage) => {
    //     console.log('newMessage', newMessage);
    // });
    // socket.emit("shoutbox", { name: 'Tez', place: 'USA', message: 'Survey credited' });
    socket.on('disconnect', function () {
        console.log('A user disconnected');
    });
    // socket.on('shoutbox', function (data) {
    //     console.log('on shoutbox', data);
    // });
    socket.on('shoutbox_client', async function(data){
        console.log('socket data',data)
        await Shoutbox.create({
            company_id: 1,
            company_portal_id: 1,
            member_id: data.member_id,
            survey_provider_id: data.survey_provider_id ?? null,
            verbose: data.message,
            created_at: new Date()
        })
        socket.emit("shoutbox", { name: 'Tez', place: 'USA', message: data.message });
    })
});