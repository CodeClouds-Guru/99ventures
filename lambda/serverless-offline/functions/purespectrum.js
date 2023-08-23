
class Purespectrum {

    constructor(db, record) {
        this.record = record;
        this.db = db;
        this.surveySync = this.surveySync.bind(this);
        this.surveyQualificationSync = this.surveyQualificationSync.bind(this);
        this.getQuestionType = this.getQuestionType.bind(this);
        this.getSurveyStatus = this.getSurveyStatus.bind(this);
    }

    surveySync = async () => {
        console.log('purespectrum');
        console.log(this.record)
        if(this.record.country_id == null){
            return {
                'message': 'Unable to locate country id',
                'status': false
            }
        }
        if(typeof this.record.db_qualication_codes === 'undefined'){
            return {
                'message': 'Unable to proceed!',
                'status': false
            }
        }
        const {db_qualication_codes, ...surveyJson} = this.record;
        var params = [
            this.record.survey_provider_id,
            this.record.survey_performance.overall.loi,
            this.record.cpi,
            this.record.survey_name,
            new Date(),
            new Date(),
            this.record.survey_id,
            this.getSurveyStatus(this.record.survey_status),
            JSON.stringify(surveyJson),
            null
        ];
        var sql;
        const countryId = this.record.country_id;
        // const chkSql = `SELECT id FROM surveys WHERE survey_provider_id = ? AND survey_number = ? AND country_id = ? AND deleted_at IS NULL`;
        const chkSql = `SELECT id FROM surveys WHERE survey_provider_id = ? AND survey_number = ? AND deleted_at IS NULL`;
        const surveyData = await this.db.query(chkSql, [this.record.survey_provider_id, this.record.survey_id]);
        if (surveyData.length) {
            const surveyIds = surveyData.map(sr => sr.id);
            let surveyId = surveyData[0].id;

            let deleteSql = `DELETE surveys, survey_qualifications FROM surveys JOIN survey_qualifications ON (surveys.id = survey_qualifications.survey_id) WHERE surveys.id IN (?)`;
            await this.db.query(deleteSql, [surveyIds]);

            params = [surveyId, ...params, countryId];
            sql = `INSERT INTO surveys (id, survey_provider_id, loi, cpi, name, created_at, updated_at, survey_number, status, original_json, url, country_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        } else {
            params.push(countryId);
            sql = `INSERT INTO surveys (survey_provider_id, loi, cpi, name, created_at, updated_at, survey_number, status, original_json, url, country_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        }

        const rows = await this.db.query(sql, params);
        await this.surveyQualificationSync(rows.insertId, this.db, countryId);
        return rows;
    }

    surveyQualificationSync = async (surveyId, db, country_id) => {
        if (this.record.qualifications) {
            const qualifications = this.record.qualifications;
            const dbQualifications = this.record.db_qualication_codes;
            if (qualifications.length) {
                const qualificationIds = qualifications.map(ql => ql.qualification_code);
                let sql = `SELECT sq.id, sq.question_type, sq.survey_provider_question_id FROM survey_questions AS sq  WHERE sq.deleted_at IS NULL AND sq.survey_provider_id = ? AND sq.survey_provider_question_id IN (?)`;
                const questionData = await db.query(sql, [this.record.survey_provider_id, qualificationIds]);

                const params = questionData.map(qd => {
                    return [
                        surveyId,
                        qd.id,
                        'OR',
                        new Date(),
                        new Date()
                    ];
                });
                let qlSql = `INSERT INTO survey_qualifications (survey_id, survey_question_id, logical_operator, created_at, updated_at)  VALUES ?`;
                const qlRows = await db.query(qlSql, [params]);
                // console.log(qlRows)

                /*let sqlQry = `SELECT sq.id as qualification_id, sq.survey_question_id, qs.survey_provider_question_id, qs.question_type, ap.option, ap.id as answer_precode_id
                FROM survey_qualifications AS sq JOIN survey_questions AS qs ON (sq.survey_question_id = qs.id)
                JOIN survey_answer_precodes AS ap ON (ap.precode = qs.survey_provider_question_id)
                WHERE sq.deleted_at IS NULL 
                AND qs.deleted_at IS NULL 
                AND ap.deleted_at IS NULL 
                AND sq.survey_id = ? 
                AND ap.country_id = ? 
                AND ap.survey_provider_id = ?`;*/

                let sqlQry = `SELECT sq.id as qualification_id, sq.survey_question_id, qs.survey_provider_question_id, qs.question_type
                FROM survey_qualifications AS sq JOIN survey_questions AS qs ON (sq.survey_question_id = qs.id)                
                WHERE sq.deleted_at IS NULL 
                AND qs.deleted_at IS NULL                 
                AND sq.survey_id = ?`;
                const qlData = await db.query(sqlQry, [surveyId]);

                const ansPrecodeParams = [];
                for (const row of qualifications) 
                {
                    var answerIds = [];
                    let data = qlData.find(r => +row.qualification_code === +r.survey_provider_question_id);
                    if (row.condition_codes) {
                        let ansQl = `SELECT id from survey_answer_precodes as ap where ap.precode = ? and ap.country_id = ? and ap.survey_provider_id = ? and ap.option IN (?)`;
                        answerIds = await db.query(ansQl, [
                            row.qualification_code, country_id, 
                            this.record.survey_provider_id, 
                            row.condition_codes
                        ]);
                        for(let ans of answerIds) {
                            ansPrecodeParams.push([
                                data.qualification_id,
                                ans.id
                            ]);
                        }
                    } else if(row.range_sets.length) {
                        const dbQualifiedIds = (typeof dbQualifications !== 'undefined' && dbQualifications.length) ? 
                                                dbQualifications.find(r=> +r.qualification_id === +row.qualification_code) : 
                                                {};
                        if(dbQualifiedIds !== null && ('answer_ids' in dbQualifiedIds) && dbQualifiedIds.answer_ids.length) {
                            for(let ansId of dbQualifiedIds.answer_ids) {
                                ansPrecodeParams.push([
                                    data.qualification_id,
                                    ansId
                                ]);
                            }
                        }
                        else if(+row.qualification_code !== 212) {
                            let range = row.range_sets[0];
                            let ansQl = `SELECT id from survey_answer_precodes as ap where ap.precode = ? and ap.country_id = ? and ap.survey_provider_id = ? and ap.option BETWEEN ? AND ?`;
                            answerIds = await db.query(ansQl, [
                                row.qualification_code, 
                                country_id, 
                                this.record.survey_provider_id, 
                                range.from, 
                                range.to
                            ]);
                            for(let ans of answerIds) {
                                ansPrecodeParams.push([
                                    data.qualification_id,
                                    ans.id
                                ]);
                            }
                        }
                    }
                };
                
                let sapSql = `INSERT INTO survey_answer_precode_survey_qualifications (survey_qualification_id, survey_answer_precode_id) VALUES ?`;
                await db.query(sapSql, [ansPrecodeParams]);
            }
        }
        return true;
    }

    getQuestionType(id) {
        const questionType = {
            1: 'singlepunch',
            2: 'singlepunch-alt',
            3: 'multipunch',
            4: 'range',
            5: 'open-ended',
            6: 'type 6'
        }
        return questionType[id];
    }

    getSurveyStatus(statusId) {
        const statusObj = {
            11: 'draft',
            22: 'live',
            33: 'paused',
            44: 'closed'
        }
        return statusObj[statusId];
    }
}

module.exports = Purespectrum;