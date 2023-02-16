const { Survey, SurveyQuestion, SurveyAnswerPrecodes } = require('../../models');
const PurespectrumHelper = require('../../helpers/Purespectrum');
const db = require('../../models/index');


class PureSpectrumController {
    constructor() {}

    async save(req, res) {
        const psObj = new PurespectrumHelper;
        const allSurveys = await psObj.fetchAndReturnData('/surveys');
        if ('success' === allSurveys.apiStatus) {
            const params = []
			for(let survey of allSurveys.surveys ){
				params.push({
                    survey_provider_id: 3,
                    loi: survey.survey_performance.overall.loi,
                    cpi: survey.cpi,
                    name: survey.survey_name,
                    survey_number: survey.survey_id,
                    created_at: new Date()
                });
			}
            
            await Survey.bulkCreate(params, {
                updateOnDuplicate: ['survey_provider_id', 'survey_number'],
                ignoreDuplicates: true,
            });
		}
        res.json({ status: true, message: 'Updated' });
        return;
    }
}

module.exports = PureSpectrumController;