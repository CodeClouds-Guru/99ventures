class EmailEventListner {
    listen(payload) {
        console.log(payload)
    }
}

module.exports = {
    'event': 'send_email',
    'classname': EmailEventListner
}