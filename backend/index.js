const base = require('./base')
const path = require('path');
const app = base()
global.appRoot = path.resolve(__dirname);
app.listen(process.env.PORT || 4000)
