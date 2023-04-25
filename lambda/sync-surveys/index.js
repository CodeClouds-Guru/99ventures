const Lucid = require("./handlers/Lucid");
const db = require('./models/index');
const Schlesinger = require('./handlers/Schlesinger');

const main = async (event) => {

  if (event.Records) {
    event.Records.forEach(async record => {
      var record = JSON.parse(record.body);
      if (('survey_provider_id' in record)) {
        switch (record.survey_provider_id) {
          case 1:
          case '1':
            const obj = new Lucid(record);
            await obj.sync();
            break;
          case 4:
          case '4':
            const sobj = new Schlesinger(record);
            await sobj.main();
            break;
          default:
            break;
        }
      }
    });
  }
}

exports.handler = async (event, context) => {
  try {
    context.callbackWaitsForEmptyEventLoop = false;
    return await main(event);
  } catch (error) {
    console.error(error);
  } finally {
    await db.sequelize.connectionManager.pool.destroyAllNow();
    return true;
  }
};