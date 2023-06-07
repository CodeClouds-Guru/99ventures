
class Schlesinger {

    constructor(db, record) {
        this.record = record;
        this.db = db;
        this.surveySync = this.surveySync.bind(this);
        this.surveyQualificationSync = this.surveyQualificationSync.bind(this);
    }

    surveySync = async()=> {
        var params = [
            this.record.survey_provider_id,
            this.record.LOI,
            this.record.CPI,
            null,
            new Date(),
            new Date(),
            this.record.SurveyId,
            'live',
            JSON.stringify(this.record),
            null
        ];
        var sql;

        const chkSql = `SELECT id FROM surveys WHERE survey_provider_id = ? AND survey_number = ? AND deleted_at IS NULL LIMIT 1`;
        const surveyData = await this.db.query(chkSql, [this.record.survey_provider_id, this.record.SurveyId]);
        if(surveyData.length) {   
            let surveyId = surveyData[0].id;
            let dlSql = `DELETE FROM surveys WHERE id = ?`;
            await this.db.query(dlSql, [surveyId]);

            let qlSql = `DELETE FROM survey_qualifications WHERE survey_id = ?`
            await this.db.query(qlSql, [surveyId]);

            params = [surveyId, ...params];
            sql = `INSERT INTO surveys (id, survey_provider_id, loi, cpi, name, created_at, updated_at, survey_number, status, original_json, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        } else {
            sql = `INSERT INTO surveys (survey_provider_id, loi, cpi, name, created_at, updated_at, survey_number, status, original_json, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        }
        
        const rows = await this.db.query(sql, params);
        console.log(rows.insertId)
        
        await this.surveyQualificationSync(rows.insertId, this.db);        
        return rows;
    }

    surveyQualificationSync = async(surveyId, db) => {
        if(this.record.qualifications){
            const qualifications = this.record.qualifications;
            if(qualifications.length){
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
                
                let qlSql = `INSERT INTO survey_qualifications (survey_id, survey_question_id, logical_operator, created_at, updated_at)  VALUES ?`;
                const qlRows = await db.query(qlSql, [params]);
                console.log(qlRows)
                let sqlQry = `SELECT sq.id as qualification_id, sq.survey_question_id, qs.survey_provider_question_id, qs.question_type, ap.option, ap.id as answer_precode_id
                FROM survey_qualifications AS sq JOIN survey_questions AS qs ON (sq.survey_question_id = qs.id)
                JOIN survey_answer_precodes AS ap ON (ap.precode = qs.survey_provider_question_id)
                WHERE sq.deleted_at IS NULL AND qs.deleted_at IS NULL AND qs.deleted_at IS NULL AND sq.survey_id = ?`;
                const qlData = await db.query(sqlQry, [surveyId]);
                console.log(qlData)
                const ansPrecodeParams = []
                
                for(const row of qualifications){
                    let data = qlData.filter(r => +row.QualificationId === +r.survey_provider_question_id);                   
                    if(!row.AnswerIds[0].includes('-')){
                        data.filter(r=> row.AnswerIds.includes(r.option) && r.question_type !== 'range')
                        .filter(opt => row.AnswerIds.includes(opt.option))
                        .forEach(row => {
                            ansPrecodeParams.push([
                                row.qualification_id,
                                row.answer_precode_id
                            ]);
                        });
                    } else {
                        let range = row.AnswerIds[0].split('-');                            
                        data.filter(r=> r.question_type === 'range' && +range[0] <= +r.option && +range[1] >= +r.option)
                        .forEach(row => {
                            ansPrecodeParams.push([
                                row.qualification_id,
                                row.answer_precode_id
                            ]);
                        });
                    }
                };
                console.log('------------s' + surveyId)
                let sapSql = `INSERT INTO survey_answer_precode_survey_qualifications (survey_qualification_id, survey_answer_precode_id) VALUES ?`;
                const result = await db.query(sapSql, [ansPrecodeParams]);
                console.log(result)
            }
        }
        return true;
    }
}

module.exports = Schlesinger;