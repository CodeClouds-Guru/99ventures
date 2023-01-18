const base = require('./base')
const path = require('path');
const socket = require('./socket')
const app = socket(base())
global.appRoot = path.resolve(__dirname);
app.listen(process.env.PORT || 4000)
