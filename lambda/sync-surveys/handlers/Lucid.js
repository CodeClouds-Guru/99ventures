const AWS = require('aws-sdk');
const Models = require("../models");
const { Op, Model } = require("sequelize");

class Lucid {
    constructor(record) {
        this.record = record;
        this.sync = this.sync.bind(this);
        this.getSurveyQuestionIds = this.getSurveyQuestionIds.bind(this);
    }

    /**
     * Create qualification array
     * @param {int} survey_id 
     * @returns array of survey qualifications
     */
    async sync() {
        let data = {
            survey_provider_id: this.record.survey_provider_id,
            status: this.record.is_live || this.record.is_live === 'true' ? 'active' : 'draft',
            loi: this.record.length_of_interview,
            cpi: this.record.cpi,
            name: this.record.survey_name,
            survey_number: this.record.survey_id,
            original_json: this.record
        };
        console.log('Finding survey');
        const existing_data = await Models.Survey.findOne({
            attributes: ['id'],
            where: {
                survey_provider_id: this.record.survey_provider_id,
                survey_number: this.record.survey_id,
            }
        });

        if (existing_data) {
            data.id = existing_data.id;
            // await Models.Survey.destroy({
            //     where: {
            //         id: existing_data.id
            //     }
            // });
            await existing_data.destroy();
        }
        console.log('deleted survey');
        if ((this.record.is_live || this.record.is_live === 'true') && this.record.message_reason !== 'deactivated') {
            const survey = await Models.Survey.create(data);
            console.log('created survey');

            const survey_qualifications = await this.getSurveyQuestionIds(survey.id);
            console.log('fetched qualification');


            await Models.SurveyQualification.bulkCreate(survey_qualifications, {
                include: [{
                    model: Models.SurveyAnswerPrecodes,
                }]
            });
            console.log('created qualification');
        }
        return true;
    }

    /**
     * Create qualification array
     * @param {int} survey_id 
     * @returns array of survey qualifications
     */
    async getSurveyQuestionIds(survey_id) {
        const survey_question_ids = this.record.survey_qualifications.map((item) => item.question_id);
        const survey_questions = await Models.SurveyQuestion.findAll({
            attributes: ['id', 'survey_provider_question_id'],
            where: {
                survey_provider_id: this.record.survey_provider_id,
                survey_provider_question_id: {
                    [Op.in]: survey_question_ids
                }
            },
            raw: true
        });
        const survey_qualifications = this.record.survey_qualifications.map(item => {
            const db_question = survey_questions.find(row => row.survey_provider_question_id === item.question_id);
            item.survey_question_id = 0;
            item.survey_id = survey_id;
            item.SurveyAnswerPrecodes = item.precodes;
            delete item.precodes;
            if (db_question) {
                item.survey_question_id = db_question.id;
            }
            return item;
        });
        return survey_qualifications;
    }
}

module.exports = Lucid;
