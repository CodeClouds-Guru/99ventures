const {
  MemberTransaction,
  Member,
  SurveyProvider,
  Survey,
} = require('../../models');

class SurveycallbackController {
  constructor() {}

  async save(req, res) {
    const logger1 = require('../helpers/Logger')(
      `outcome-${req.params.provider}.log`
    );
    // console.log('===================req', req);
    logger1.info(JSON.stringify(req.query));
    logger1.info(JSON.stringify(req.body));

    const provider = req.params.provider;
    if (provider === 'cint') {
      const username = req.params.ssi;
      const reward = req.params.reward;

      let member = await Member.findOne({
        attributes: ['id', 'username'],
        where: {
          username: username,
        },
      });
      if (member) {
        const note = provider;
        const transaction_obj = {
          member_id: member ? member.id : null,
          amount: reward,
          note: note + ' ' + req.params.status,
          type: 'credited',
          amount_action: 'survey',
          created_by: null,
          payload: JSON.stringify(req.query),
        };
        console.log('transaction_obj', transaction_obj);
        let result = await MemberTransaction.updateMemberTransactionAndBalance(
          transaction_obj
        );
        res.send(req.query);
      }
    }
  }

  async syncSurvey(req, res) {
    const logger1 = require('../helpers/Logger')(req.params.provider + '.log');
    //   console.log('===================req', req);
    logger1.info(JSON.stringify(req.query));
    logger1.info(JSON.stringify(req.body));
    let survey = req.body;

    if (survey.length > 0) {
      const provider = req.params.provider;
      let survey_provider = await SurveyProvider.findOne({
        attributes: ['id'],
        where: { name: provider.charAt(0).toUpperCase() + provider.slice(1) },
      });
      let survey_sync = [];
      survey.forEach(function (record, key) {
        survey_sync.push({
          survey_provider_id: survey_provider.id,
          loi: record.length_of_interview,
          cpi: record.cpi,
          name: record.survey_name,
          survey_number: record.survey_id,
        });
      });
      let model = await Survey.bulkCreate(survey_sync, {
        updateOnDuplicate: ['survey_number'],
        ignoreDuplicates: true,
      });
    }
  }
}

module.exports = SurveycallbackController;
