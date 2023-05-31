
class Lucid {

    constructor(db, record) {
        this.record = record;
        this.db = db;
        this.surveySync = this.surveySync.bind(this);
        this.surveyQualificationSync = this.surveyQualificationSync.bind(this);
    }

    surveySync = async()=> {
        var params = [
            this.record.survey_provider_id,
            this.record.length_of_interview,
            this.record.cpi,
            this.record.survey_name,
            new Date(),
            new Date(),
            this.record.survey_id,
            this.record.is_live || this.record.is_live === 'true' ? 'active' : 'draft',
            JSON.stringify(this.record),
            null
        ];
        var sql;
        const chkSql = `SELECT id FROM surveys WHERE survey_provider_id = ? AND survey_number = ? AND deleted_at IS NULL LIMIT 1`;

        const surveyData = await this.db.query(chkSql, [this.record.survey_provider_id, this.record.survey_id]);
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

        if((this.record.is_live || this.record.is_live === 'true') && this.record.message_reason !== 'deactivated') {
            const rows = await this.db.query(sql, params);
            console.log(rows.insertId)
            console.log('Survey_number', this.record.survey_id);
            await this.surveyQualificationSync(rows.insertId, this.db);
            return rows;
        }
        return true;
    }

    surveyQualificationSync = async(surveyId, db)=> {
        const survey_question_ids = this.record.survey_qualifications.map((item) => item.question_id);
        if(survey_question_ids.length) {
            let sql = `SELECT sq.id, sq.survey_provider_question_id FROM survey_questions AS sq  WHERE sq.deleted_at IS NULL AND sq.survey_provider_id = ? AND sq.survey_provider_question_id IN (?)`;
            const survey_questions = await db.query(sql, [this.record.survey_provider_id, survey_question_ids]);

            const params = survey_questions.map(qd => {
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
            await db.query(qlSql, [params]);
               
            // const precodesSet = [];
            // for(const item of this.record.survey_qualifications){
            //     for(let pr of item.precodes){
            //         precodesSet.push([
            //             pr,
            //             item.question_id
            //         ]);
            //     }
            // }
            // let sapSql = 'INSERT IGNORE INTO survey_answer_precodes (`option`, precode) VALUES ?';
            // await db.query(sapSql, [precodesSet]);

            let joinSql = `SELECT sq.id as qualification_id, sq.survey_question_id, qs.survey_provider_question_id, qs.question_type, ap.option, ap.id as answer_precode_id
            FROM survey_qualifications AS sq JOIN survey_questions AS qs ON (sq.survey_question_id = qs.id)
            JOIN survey_answer_precodes AS ap ON (ap.precode = qs.survey_provider_question_id)
            WHERE sq.deleted_at IS NULL AND qs.deleted_at IS NULL AND qs.deleted_at IS NULL AND sq.survey_id = ?`;
            const qlData = await db.query(joinSql, [surveyId]);
            
            // console.log(qlData);

            const ansPrecodeParams = []
            for(const item of this.record.survey_qualifications){
                qlData
                    .filter(row => row.survey_provider_question_id === item.question_id)
                    .filter(opt => item.precodes.includes(opt.option))
                    .forEach(el => {
                        ansPrecodeParams.push([
                            el.qualification_id,
                            el.answer_precode_id
                        ]);
                    });
            }

            console.log(ansPrecodeParams);

            let sapsqSql = `INSERT INTO survey_answer_precode_survey_qualifications (survey_qualification_id, survey_answer_precode_id) VALUES ?`;
            await db.query(sapsqSql, [ansPrecodeParams]);
            return true;
        }
    }

}


module.exports = Lucid;