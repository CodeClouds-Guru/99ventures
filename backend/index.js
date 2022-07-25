const base = require('./base')
const app = base()
app.listen(process.env.PORT || 4000)
console.log(process.env.APP_SECRET)
