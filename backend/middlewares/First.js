class First {
  run(req, res, next) {
    console.log('First')
    next()
  }
}
module.exports = First
