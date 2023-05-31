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



//For testing purpose
/*module.exports.surveySync = async (context) => {	
    const event = {
        "Records": [
            {
                "body": "{\"IR\": 40, \"CPI\": 3.15, \"LOI\": 12, \"LiveLink\": \"https://surveys.sample-cube.com?VID=21092&SID=414E115D-005F-41A1-AEAB-23F42E6F0C18&LID=3&pid=[#scid#]&uid=[#scid2#]&zid=[#scid3#]\", \"SurveyId\": 15971564, \"AccountId\": 1, \"UrlTypeId\": 1, \"CollectPII\": false, \"IndustryId\": 30, \"LanguageId\": 3, \"IsManualInc\": false, \"StudyTypeId\": 1, \"qualifications\": [{\"AnswerIds\": [\"45-99\"], \"AnswerCodes\": [\"1\"], \"QualificationId\": 59, \"UpdateTimeStamp\": \"2023-05-26T18:46:38.17\"}, {\"AnswerIds\": [\"58\", \"59\"], \"AnswerCodes\": [\"1\", \"2\"], \"QualificationId\": 60, \"UpdateTimeStamp\": \"2023-05-26T18:45:51.827\"}, {\"AnswerIds\": [\"22938,22973,22959,22709,23093,22711,22946,22715,22968,22722,23004,22723,23936,22727,22942,22730,22949,22731,22963,22732,22971,22738,22987,22748,23067,22901,23170,22902,24590,22903,22940,22904,22945,22905,22947,22906,22957,22907,22960,22908,22965,22909,22969,22910,22972,22911,22974,22920,22923,23055,22924,23084,22931,23117,22932,23921,22935,24562,22936,22567,22937\"], \"AnswerCodes\": [\"1\"], \"QualificationId\": 143, \"UpdateTimeStamp\": \"2023-05-27T08:17:34.007\"}, {\"AnswerIds\": [\"147801\"], \"AnswerCodes\": [\"4\"], \"QualificationId\": 7054, \"UpdateTimeStamp\": \"2023-04-20T18:30:13.85\"}, {\"AnswerIds\": [\"54833\", \"54834\"], \"AnswerCodes\": [\"1\", \"2\"], \"QualificationId\": 742, \"UpdateTimeStamp\": \"2023-05-26T18:47:06.29\"}], \"BillingEntityId\": 2, \"IsMobileAllowed\": true, \"IsQuotaLevelCPI\": false, \"IsTabletAllowed\": true, \"UpdateTimeStamp\": \"2023-05-30T00:12:44.153\", \"IsNonMobileAllowed\": true, \"IsSurveyGroupExist\": false, \"survey_provider_id\": \"4\", \"Qual_UpdateTimeStamp\": \"2023-05-27T08:17:34.007\", \"Group_UpdateTimeStamp\": \"2023-05-29T04:45:01.79\", \"Quota_UpdateTimeStamp\": \"2023-05-30T00:12:44.153\"}"
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