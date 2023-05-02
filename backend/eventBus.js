const events = require('events');
const globalListner = new events.EventEmitter();
var normalizedPath = require('path').join(__dirname, 'listeners');
require('fs')
  .readdirSync(normalizedPath)
  .forEach(function (file) {
    const { event, classname } = require('./listeners/' + file);
    // console.log(event, eval(`new ${classname}`));
    globalListner.on(event, function (data) {
      const obj = eval(`new ${classname}`);
      obj.listen(data);
    });
  });

module.exports = globalListner;
