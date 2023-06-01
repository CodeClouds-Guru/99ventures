
class Purespectrum {

    constructor(db, record) {
        this.record = record;
        this.db = db;
        this.surveySync = this.surveySync.bind(this);
        this.surveyQualificationSync = this.surveyQualificationSync.bind(this);
        this.getQuestionType = this.getQuestionType.bind(this);
        this.getSurveyStatus = this.getSurveyStatus.bind(this);
    }

    surveySync = async()=> {
        var params = [
            this.record.survey_provider_id,
            this.record.survey_performance.overall.loi,
            this.record.cpi,
            this.record.survey_name,
            new Date(),
            new Date(),
            this.record.survey_id,
            this.getSurveyStatus(this.record.survey_status),
            JSON.stringify(this.record),
            null
        ];
        var sql;

        const chkSql = `SELECT id FROM surveys WHERE survey_provider_id = ? AND survey_number = ? AND deleted_at IS NULL`;
        const surveyData = await this.db.query(chkSql, [this.record.survey_provider_id, this.record.survey_id]);
        if(surveyData.length) {
            const surveyIds = surveyData.map(sr => sr.id);
            let surveyId = surveyData[0].id;
            let dlSql = `DELETE FROM surveys WHERE id IN (?)`;
            await this.db.query(dlSql, [surveyIds]);

            let qlSql = `DELETE FROM survey_qualifications WHERE survey_id IN (?)`;
            await this.db.query(qlSql, [surveyIds]);

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

                let sqlQry = `SELECT sq.id as qualification_id, sq.survey_question_id, qs.survey_provider_question_id, qs.question_type, ap.option, ap.id as answer_precode_id
                FROM survey_qualifications AS sq JOIN survey_questions AS qs ON (sq.survey_question_id = qs.id)
                JOIN survey_answer_precodes AS ap ON (ap.precode = qs.survey_provider_question_id)
                WHERE sq.deleted_at IS NULL AND qs.deleted_at IS NULL AND qs.deleted_at IS NULL AND sq.survey_id = ?`;
                const qlData = await db.query(sqlQry, [surveyId]);
                
                const ansPrecodeParams = [];                
                for(const row of qualifications){
                    let data = qlData.filter(r => +row.qualification_code === +r.survey_provider_question_id);                   
                    if(row.condition_codes){
                        data.filter(r=> row.condition_codes.includes(r.option) && r.question_type !== 'range')
                        .forEach(row => {
                            ansPrecodeParams.push([
                                row.qualification_id,
                                row.answer_precode_id
                            ]);
                        });
                    } else {
                        let range = row.range_sets[0];
                        data.filter(r=> r.question_type === 'open-ended' && (+range.from <= +r.option && +range.to >= +r.option))
                        .forEach(row => {
                            ansPrecodeParams.push([
                                row.qualification_id,
                                row.answer_precode_id
                            ]);
                        });
                    }
                };
                console.log('======================')
                console.log(ansPrecodeParams)
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