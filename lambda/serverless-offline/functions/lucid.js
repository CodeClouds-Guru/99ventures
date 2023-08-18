
class Lucid {

    constructor(db, record) {
        this.record = record;
        this.db = db;
        this.surveySync = this.surveySync.bind(this);
        this.surveyQualificationSync = this.surveyQualificationSync.bind(this);
    }

    surveySync = async () => {
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

        let countrySql = `SELECT id from countries WHERE lucid_language_code = ? AND deleted_at IS NULL LIMIT 1`;
        const country = await this.db.query(countrySql, [this.record.country_language]);
        if(country.length < 1){
            return {
                'message': 'Unable to locate country id',
                'status': false
            }
        }

        const chkSql = `SELECT id FROM surveys WHERE survey_provider_id = ? AND survey_number = ? AND country_id = ? AND deleted_at IS NULL`;
        const surveyData = await this.db.query(chkSql, [this.record.survey_provider_id, this.record.survey_id, country[0].id]);
        if (surveyData.length) {
            let surveyId = surveyData[0].id;
            const surveyIds = surveyData.map(sr => sr.id);

            let deleteSql = `DELETE surveys, survey_qualifications FROM surveys JOIN survey_qualifications ON (surveys.id = survey_qualifications.survey_id) WHERE surveys.id IN (?)`;
            await this.db.query(deleteSql, [surveyIds]);

            params = [surveyId, ...params, country[0].id];
            sql = `INSERT INTO surveys (id, survey_provider_id, loi, cpi, name, created_at, updated_at, survey_number, status, original_json, url, country_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        } else {
            params.push(country[0].id);
            sql = `INSERT INTO surveys (survey_provider_id, loi, cpi, name, created_at, updated_at, survey_number, status, original_json, url, country_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        }

        if ((this.record.is_live || this.record.is_live === 'true') && this.record.message_reason !== 'deactivated') {
            const rows = await this.db.query(sql, params);
            // console.log(rows.insertId)
            await this.surveyQualificationSync(rows.insertId, this.db, country[0].id);
            return rows;
        }
        return true;
    }

    surveyQualificationSync = async (surveyId, db, country_id) => {
        const survey_question_ids = this.record.survey_qualifications.map((item) => item.question_id);
        if (survey_question_ids.length) {
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
            WHERE sq.deleted_at IS NULL 
            AND qs.deleted_at IS NULL 
            AND ap.deleted_at IS NULL 
            AND sq.survey_id = ? 
            AND ap.country_id = ? 
            AND ap.survey_provider_id = ?`;
            const qlData = await db.query(joinSql, [surveyId, country_id, this.record.survey_provider_id]);

            const ansPrecodeParams = []
            for (const item of this.record.survey_qualifications) {
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

            // console.log(ansPrecodeParams);

            let sapsqSql = `INSERT INTO survey_answer_precode_survey_qualifications (survey_qualification_id, survey_answer_precode_id) VALUES ?`;
            await db.query(sapsqSql, [ansPrecodeParams]);
            return true;
        }
    }

}


module.exports = Lucid;