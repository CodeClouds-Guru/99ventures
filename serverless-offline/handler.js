'use strict';
const createDBConnection = require('./db');
const Schlesinger = require('./functions/schlesinger');
const Lucid = require('./functions/lucid');

/**
 * Main deployable func
 * @param {*} event 
 * @param {*} context 
 * @returns 
 */
module.exports.surveySync = async (event, context) => {	
    // context.callbackWaitsForEmptyEventLoop = true;
    var surveys = [];
    var db = null;
    try {
        if(event.Records) {
            db = createDBConnection();
            const records = event.Records;
            for(let record of records){
                const surveyData = JSON.parse(record.body);
                if ('survey_provider_id' in surveyData) {
                    try {
                        await db.beginTransaction();
                        switch (surveyData.survey_provider_id) {
                            case 1:
                            case '1':
                                const lucid = new Lucid(db, surveyData);
                                var result = await lucid.surveySync();
                                surveys.push(result);
                                break;
                            case 4:
                            case '4':
                                const sch = new Schlesinger(db, surveyData);
                                var result = await sch.surveySync();
                                surveys.push(result);
                                break;
                            default:
                                surveys = []
                        }
                        console.log('result', result)
                        surveys.push(result);
                        await db.commit();
                    } catch ( err ) {
                        console.log(err)
                        await db.rollback();
                        throw err;
                    }
                }
            }
        }
    } catch ( err ) {
        console.log(err)
    }
    finally {
        if(db){
            await db.close();
        }
        return {
            statusCode: 200,
            body: JSON.stringify({ surveys })
        }
    }
}


/*
//For testing purpose
module.exports.surveySync = async (context) => {	
    const event = {
        "Records": [
            {
                "body": "{\"cpi\": 0.8918, \"is_live\": true, \"industry\": \"other\", \"survey_id\": 1234567890, \"conversion\": 0, \"study_type\": \"adhoc\", \"survey_name\": \"SC16704944_SCAPIUser\", \"account_name\": \"Schlesinger Group\", \"collects_pii\": false, \"bid_incidence\": 99, \"survey_quotas\": [{\"questions\": [], \"quota_cpi\": 0.8918, \"conversion\": 0, \"survey_quota_id\": 185120849, \"survey_quota_type\": \"Total\", \"number_of_respondents\": 637}], \"message_reason\": \"updated\", \"respondent_pids\": [], \"total_remaining\": 637, \"country_language\": \"eng_us\", \"survey_group_ids\": [], \"mobile_conversion\": 0, \"overall_completes\": 0, \"earnings_per_click\": 0, \"survey_provider_id\": 1, \"length_of_interview\": 0, \"completion_percentage\": 0, \"survey_qualifications\": [{\"precodes\": [\"18\", \"19\", \"20\", \"21\", \"22\", \"23\", \"24\", \"25\", \"26\", \"27\", \"28\", \"29\", \"30\", \"31\", \"32\", \"33\", \"34\", \"35\", \"36\", \"37\", \"38\", \"39\", \"40\", \"41\", \"42\", \"43\", \"44\", \"45\", \"46\", \"47\", \"48\", \"49\", \"50\", \"51\", \"52\", \"53\", \"54\", \"55\", \"56\", \"57\", \"58\", \"59\", \"60\", \"61\", \"62\", \"63\", \"64\", \"65\", \"66\", \"67\", \"68\", \"69\", \"70\", \"71\", \"72\", \"73\", \"74\", \"75\", \"76\", \"77\", \"78\", \"79\", \"80\", \"81\", \"82\", \"83\", \"84\", \"85\", \"86\", \"87\", \"88\", \"89\", \"90\", \"91\", \"92\", \"93\", \"94\", \"95\", \"96\", \"97\", \"98\", \"99\"], \"question_id\": 42, \"logical_operator\": \"OR\"}], \"total_client_entrants\": 2, \"survey_quota_calc_type\": \"completes\", \"bid_length_of_interview\": 11, \"is_only_supplier_in_group\": false, \"termination_length_of_interview\": 0}"
            },
            {
                "body": "{\"cpi\": 0.8918, \"is_live\": true, \"industry\": \"other\", \"survey_id\": 1234567890, \"conversion\": 0, \"study_type\": \"adhoc\", \"survey_name\": \"SC16704944_SCAPIUser\", \"account_name\": \"Schlesinger Group\", \"collects_pii\": false, \"bid_incidence\": 99, \"survey_quotas\": [{\"questions\": [], \"quota_cpi\": 0.8918, \"conversion\": 0, \"survey_quota_id\": 185120849, \"survey_quota_type\": \"Total\", \"number_of_respondents\": 637}], \"message_reason\": \"new\", \"respondent_pids\": [], \"total_remaining\": 637, \"country_language\": \"eng_us\", \"survey_group_ids\": [], \"mobile_conversion\": 0, \"overall_completes\": 0, \"earnings_per_click\": 0, \"survey_provider_id\": 1, \"length_of_interview\": 0, \"completion_percentage\": 0, \"survey_qualifications\": [{\"precodes\": [\"18\", \"19\", \"20\", \"21\", \"22\", \"23\", \"24\", \"25\", \"26\", \"27\", \"28\", \"29\", \"30\", \"31\", \"32\", \"33\", \"34\", \"35\", \"36\", \"37\", \"38\", \"39\", \"40\", \"41\", \"42\", \"43\", \"44\", \"45\", \"46\", \"47\", \"48\", \"49\", \"50\", \"51\", \"52\", \"53\", \"54\", \"55\", \"56\", \"57\", \"58\", \"59\", \"60\", \"61\", \"62\", \"63\", \"64\", \"65\", \"66\", \"67\", \"68\", \"69\", \"70\", \"71\", \"72\", \"73\", \"74\", \"75\", \"76\", \"77\", \"78\", \"79\", \"80\", \"81\", \"82\", \"83\", \"84\", \"85\", \"86\", \"87\", \"88\", \"89\", \"90\", \"91\", \"92\", \"93\", \"94\", \"95\", \"96\", \"97\", \"98\", \"99\"], \"question_id\": 42, \"logical_operator\": \"OR\"}], \"total_client_entrants\": 0, \"survey_quota_calc_type\": \"completes\", \"bid_length_of_interview\": 11, \"is_only_supplier_in_group\": false, \"termination_length_of_interview\": 0}"
            }
        ]
    };
    var surveys = [];
    var db = null;
    try {
        if(event.Records) {
            const records = event.Records;
            var db = createDBConnection();
            for(let record of records){
                const surveyData = JSON.parse(record.body);                
                if ('survey_provider_id' in surveyData) {                    
                    try {
                        await db.beginTransaction();
                        switch (surveyData.survey_provider_id) {
                            case 1:
                            case '1':
                                const lucid = new Lucid(db, surveyData);
                                var result = await lucid.surveySync();
                                surveys.push(result);
                                break;
                            case 4:
                            case '4':
                                const sch = new Schlesinger(db, surveyData);
                                var result = await sch.surveySync();
                                surveys.push(result);
                                break;
                            default:
                                surveys = []
                        }
                        console.log('result', result)
                        surveys.push(result);
                        await db.commit();
                    } catch ( err ) {
                        console.log(err)
                        await db.rollback();
                        throw err;
                    }
                }
            }
        }
    } catch ( err ) {
        console.log(err)
    }
    finally{
        if(db){
            await db.close();
        }
        return {
            statusCode: 200,
            body: JSON.stringify({ surveys })
        }
    }
}
*/