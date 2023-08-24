
class Schlesinger {

    constructor(db, record) {
        this.record = record;
        this.db = db;
        this.surveySync = this.surveySync.bind(this);
        this.surveyQualificationSync = this.surveyQualificationSync.bind(this);
    }

    surveySync = async () => {
        if(this.record.country_id == null){
            return {
                'message': 'Unable to locate country id!',
                'status': false
            }
        }
        if(!('db_qualication_codes' in this.record)){
            return {
                'message': 'Unable to proceed!',
                'status': false
            }
        }
        const {db_qualication_codes, ...surveyJson} = this.record;
        var params = [
            this.record.survey_provider_id,
            this.record.LOI,
            this.record.CPI,
            null,
            new Date(),
            new Date(),
            this.record.SurveyId,
            'live',
            JSON.stringify(surveyJson),
            null
        ];
        var sql;

        const countryId = this.record.country_id;
        const chkSql = `SELECT id FROM surveys WHERE survey_provider_id = ? AND survey_number = ? AND deleted_at IS NULL LIMIT 1`;
        const surveyData = await this.db.query(chkSql, [this.record.survey_provider_id, this.record.SurveyId]);
        if (surveyData.length) {
            let surveyId = surveyData[0].id;
            let surveyIds = surveyData.map(sr => sr.id);
            
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
                const qualificationIds = qualifications.map(ql => ql.QualificationId);
                let sql = `SELECT sq.id, sq.question_type, sq.survey_provider_question_id FROM survey_questions AS sq  WHERE sq.deleted_at IS NULL AND sq.survey_provider_id = ? AND sq.survey_provider_question_id IN (?)`;
                const questionData = await db.query(sql, [this.record.survey_provider_id, qualificationIds]);

                const params = questionData.map(qd => {
                    let params = [
                        surveyId,
                        qd.id,
                        'OR',
                        new Date(),
                        new Date()
                    ];
                    return params;
                });

                await db.query(
                    `INSERT INTO survey_qualifications (survey_id, survey_question_id, logical_operator, created_at, updated_at)  VALUES ?`,
                    [params]
                );

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
                    if (!row.AnswerIds[0].includes('-')) {      // Not Range
                        let data = qlData.find(r => +row.QualificationId === +r.survey_provider_question_id && r.question_type !== 'range');
                        let ansQl = `SELECT id FROM survey_answer_precodes AS ap WHERE ap.precode = ? AND ap.country_id = ? AND ap.survey_provider_id = ? AND ap.option IN (?)`;
                        answerIds = await db.query(ansQl, [
                            row.QualificationId, 
                            country_id, 
                            this.record.survey_provider_id, 
                            row.AnswerIds
                        ]);

                        for(let ans of answerIds) {
                            ansPrecodeParams.push([
                                data.qualification_id,
                                ans.id
                            ]);
                        }
                    } else {    // Range
                        let range = row.AnswerIds[0].split('-');
                        const dbQualifiedIds = (dbQualifications.length) ? dbQualifications.find(r=> +r.qualification_id === +row.QualificationId) : undefined;
                        if(dbQualifiedIds !== undefined && ('answer_ids' in dbQualifiedIds) && dbQualifiedIds.answer_ids.length) {
                            let data = qlData.find(r => +dbQualifiedIds.qualification_id === +r.survey_provider_question_id && r.question_type === 'range');
                            for(let ansId of dbQualifiedIds.answer_ids) {
                                ansPrecodeParams.push([
                                    data.qualification_id,
                                    ansId
                                ]);
                            }
                        } 
                        else if(+row.QualificationId !== 59){
                            let data = qlData.find(r => r.question_type === 'range' && +row.QualificationId === +r.survey_provider_question_id);
                            // let data = qlData.find(r => r.question_type === 'range' && +range[0] <= +r.option && +range[1] >= +r.option);
                            let ansQl = `SELECT id from survey_answer_precodes as ap where ap.precode = ? and ap.country_id = ? and ap.survey_provider_id = ? and ap.option BETWEEN ? AND ?`;
                            answerIds = await db.query(ansQl, [
                                row.QualificationId, 
                                country_id, 
                                this.record.survey_provider_id, 
                                range[0],
                                range[1]
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

                await db.query(
                    `INSERT INTO survey_answer_precode_survey_qualifications (survey_qualification_id, survey_answer_precode_id) VALUES ?`,
                    [ansPrecodeParams]
                );
            }
        }
        return true;
    }
}

module.exports = Schlesinger;