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
  return true;
}

main({
  Records: [{
    body: '{\"cpi\": 1, \"is_live\": true, \"industry\": \"other\", \"survey_id\": 33245195, \"conversion\": 0.182403, \"study_type\": \"adhoc\", \"survey_name\": \"Other Survey \", \"account_name\": \"Probity Research\", \"collects_pii\": false, \"bid_incidence\": 90, \"survey_quotas\": [{\"questions\": [], \"quota_cpi\": 1, \"conversion\": 0.182403, \"survey_quota_id\": 169589010, \"survey_quota_type\": \"Total\", \"number_of_respondents\": 568}], \"message_reason\": \"activated\", \"respondent_pids\": [], \"total_remaining\": 568, \"country_language\": \"eng_us\", \"survey_group_ids\": [2953748], \"mobile_conversion\": 0.11, \"overall_completes\": 170, \"earnings_per_click\": 0.182403, \"survey_provider_id\": 1, \"length_of_interview\": 33, \"completion_percentage\": 0.621333, \"survey_qualifications\": [{\"precodes\": [\"18\", \"19\", \"20\", \"21\", \"22\", \"23\", \"24\", \"25\", \"26\", \"27\", \"28\", \"29\", \"30\", \"31\", \"32\", \"33\", \"34\", \"35\", \"36\", \"37\", \"38\", \"39\", \"40\", \"41\", \"42\", \"43\", \"44\", \"45\", \"46\", \"47\", \"48\", \"49\", \"50\", \"51\", \"52\", \"53\", \"54\", \"55\", \"56\", \"57\", \"58\", \"59\", \"60\", \"61\", \"62\", \"63\", \"64\", \"65\", \"66\", \"67\", \"68\", \"69\", \"70\", \"71\", \"72\", \"73\", \"74\", \"75\", \"76\", \"77\", \"78\", \"79\", \"80\", \"81\", \"82\", \"83\", \"84\", \"85\", \"86\", \"87\", \"88\", \"89\", \"90\", \"91\", \"92\", \"93\", \"94\", \"95\", \"96\", \"97\", \"98\", \"99\"], \"question_id\": 42, \"logical_operator\": \"OR\"}, {\"precodes\": [\"1\", \"2\"], \"question_id\": 43, \"logical_operator\": \"OR\"}], \"total_client_entrants\": 932, \"survey_quota_calc_type\": \"prescreens\", \"bid_length_of_interview\": 20, \"is_only_supplier_in_group\": false, \"termination_length_of_interview\": 1}'
  }]
})

// exports.handler = async (event, context) => {
//   try {
//     context.callbackWaitsForEmptyEventLoop = false;
//     return await main(event);
//   } catch (error) {
//     console.error(error);
//   } finally {
//     await db.sequelize.connectionManager.pool.destroyAllNow();
//     return true;
//   }
// };