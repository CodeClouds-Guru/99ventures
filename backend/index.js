const base = require('./base')
const path = require('path');
const app = base()
global.appRoot = path.resolve(__dirname);
const server = app.listen(process.env.PORT || 4000)
var io = require('socket.io')(server);
global.io = io; //declared globaly

const { Shoutbox } = require("../backend/models");
io.sockets.on('connection', (socket) => {
    global.socket = socket;
    socket.on('disconnect', function () {
        console.log('A user disconnected');
    });

    socket.on('shoutbox_client', async function (data) {
        await Shoutbox.create({
            company_id: data.company_id,
            company_portal_id: data.company_portal_id,
            member_id: data.member_id,
            survey_provider_id: data.survey_provider_id ?? null,
            verbose: data.message,
            created_at: new Date()
        })
        io.emit("shoutbox", { name: 'Tez', place: 'USA', message: data.message });
    })
});