'use strict';
const createDBConnection = require('./db');
const Schlesinger = require('./functions/schlesinger');
const Lucid = require('./functions/lucid');
const Purespectrum = require('./functions/purespectrum');

/**
 * Main deployable func
 * @param {*} event 
 * @param {*} context 
 * @returns 
 */
/*module.exports.surveySync = async (event, context) => {
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
                            case 3:
                            case '3':
                                const psObj = new Purespectrum(db, surveyData);
                                var result = await psObj.surveySync();
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
}*/



module.exports.surveySync = async (context) => {
    const event = {
        "Records": [{"IR":2,"CPI":0.57,"LOI":13,"LiveLink":"https://surveys.sample-cube.com?VID=21092&SID=CAA0FE0B-D7D2-4B0E-B9A6-CD576D0A370D&LID=1&pid=[#scid#]&uid=[#scid2#]&zid=[#scid3#]","SurveyId":17987498,"AccountId":1,"UrlTypeId":0,"CollectPII":false,"IndustryId":30,"LanguageId":1,"IsManualInc":false,"StudyTypeId":1,"BillingEntityId":2,"IsMobileAllowed":true,"IsQuotaLevelCPI":false,"IsTabletAllowed":true,"UpdateTimeStamp":"2023-08-08T05:49:17.8341736","IsNonMobileAllowed":true,"IsSurveyGroupExist":true,"Qual_UpdateTimeStamp":"2023-08-08T05:49:17.96","Group_UpdateTimeStamp":"2023-08-07T05:19:15.067","Quota_UpdateTimeStamp":"2023-08-08T05:49:18.153","survey_provider_id":4,"qualifications":[{"QualificationId":59,"UpdateTimeStamp":"2023-08-07T05:19:11.363","AnswerIds":["18-49"],"AnswerCodes":["1"]},{"QualificationId":60,"UpdateTimeStamp":"2023-08-08T06:52:03.597","AnswerIds":["1873","1874"],"AnswerCodes":["1","2"]}]},{"IR":30,"CPI":1.48,"LOI":13,"LiveLink":"https://surveys.sample-cube.com?VID=21092&SID=709EEF9B-FC2B-4AA0-9870-107A4B0DB917&LID=3&pid=[#scid#]&uid=[#scid2#]&zid=[#scid3#]","SurveyId":17916141,"AccountId":1,"UrlTypeId":1,"CollectPII":false,"IndustryId":30,"LanguageId":3,"IsManualInc":false,"StudyTypeId":1,"BillingEntityId":2,"IsMobileAllowed":false,"IsQuotaLevelCPI":false,"IsTabletAllowed":false,"UpdateTimeStamp":"2023-08-08T06:10:30.38","IsNonMobileAllowed":true,"IsSurveyGroupExist":false,"Qual_UpdateTimeStamp":"2023-08-06T03:08:46.423","Group_UpdateTimeStamp":"2023-08-07T06:15:06.98","Quota_UpdateTimeStamp":"2023-08-08T05:29:14.58","survey_provider_id":4,"qualifications":[{"QualificationId":59,"UpdateTimeStamp":"2023-08-06T03:08:46.423","AnswerIds":["40-54","20-29"],"AnswerCodes":["1","1"]},{"QualificationId":60,"UpdateTimeStamp":"2023-08-03T01:45:04.337","AnswerIds":["58","59"],"AnswerCodes":["1","2"]},{"QualificationId":631,"UpdateTimeStamp":"2023-08-10T00:21:51.623","AnswerIds":["54149","54151"],"AnswerCodes":["2","4"]}]}]
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
                            case 3:
                            case '3':
                                const psObj = new Purespectrum(db, surveyData);
                                var result = await psObj.surveySync();
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


//For testing purpose
/*module.exports.surveySync = async (context) => {	
    const event = {
        "Records": [
            {
                "body": "{\"survey_id\":15770519,\"survey_name\":\"Exciting New Survey #15770519\",\"surveyLocalization\":\"en_US\",\"survey_status\":22,\"field_end_date\":1685381823928,\"category\":\"Exciting New\",\"category_code\":232,\"crtd_on\":1684431424250,\"mod_on\":1684431425499,\"soft_launch\":false,\"click_balancing\":0,\"price_type\":1,\"pii\":false,\"buyer_message\":\"\",\"buyer_id\":651,\"incl_excl\":0,\"cpi\":5.85,\"last_complete_date\":null,\"project_last_complete_date\":null,\"survey_grouping\":{},\"survey_performance\":{\"overall\":{\"ir\":25,\"loi\":15},\"last_block\":{\"ir\":null,\"loi\":null,\"epc\":null,\"acpi\":null,\"ppm\":null,\"oqp\":null,\"bdp\":null,\"bqtp\":null,\"bstp\":null,\"btp\":null}},\"supplier_completes\":{\"needed\":100,\"achieved\":0,\"remaining\":100,\"guaranteed_allocation\":0,\"guaranteed_allocation_remaining\":0},\"pds\":{\"enabled\":false,\"buyer_name\":null},\"channel_type\":null,\"link_security\":2,\"quotas\":[{\"quota_id\":\"220bb036-b5b8-45ac-a636-3007c5b38cd4\",\"quantities\":{\"currently_open\":100,\"remaining\":100,\"achieved\":0},\"criteria\":[{\"qualification_code\":212,\"range_sets\":[{\"units\":311,\"to\":65,\"from\":35}]},{\"qualification_code\":211,\"condition_codes\":[\"111\"]},{\"qualification_code\":218,\"condition_codes\":[\"112\"]}],\"crtd_on\":1684431424307,\"mod_on\":1684431424307,\"last_complete_date\":null}],\"qualifications\":[{\"condition_codes\":[\"111\"],\"qualification_code\":211},{\"range_sets\":[{\"units\":311,\"to\":65,\"from\":35}],\"qualification_code\":212},{\"condition_codes\":[\"112\"],\"qualification_code\":218}],\"survey_provider_id\":\"3\"}"
            },
            {
                "body": "{\"survey_id\":16106582,\"survey_name\":\"Exciting New Survey #16106582\",\"surveyLocalization\":\"en_US\",\"survey_status\":22,\"field_end_date\":1686425547000,\"category\":\"Exciting New\",\"category_code\":232,\"crtd_on\":1685555765859,\"mod_on\":1685561547680,\"soft_launch\":false,\"click_balancing\":0,\"price_type\":1,\"pii\":false,\"buyer_message\":\"\",\"buyer_id\":651,\"incl_excl\":0,\"cpi\":1.2,\"last_complete_date\":null,\"project_last_complete_date\":null,\"survey_grouping\":{},\"survey_performance\":{\"overall\":{\"ir\":30,\"loi\":15},\"last_block\":{\"ir\":null,\"loi\":null,\"epc\":null,\"acpi\":null,\"ppm\":null,\"oqp\":null,\"bdp\":null,\"bqtp\":null,\"bstp\":null,\"btp\":null}},\"supplier_completes\":{\"needed\":35,\"achieved\":0,\"remaining\":35,\"guaranteed_allocation\":0,\"guaranteed_allocation_remaining\":0},\"pds\":{\"enabled\":false,\"buyer_name\":null},\"channel_type\":null,\"link_security\":2,\"quotas\":[{\"quota_id\":\"5ece1723-2c8f-4bb6-8db6-ec610ff23180\",\"quantities\":{\"currently_open\":33,\"remaining\":33,\"achieved\":0},\"criteria\":[{\"qualification_code\":212,\"range_sets\":[{\"units\":311,\"to\":85,\"from\":40}]},{\"qualification_code\":211,\"condition_codes\":[\"112\",\"111\"]},{\"qualification_code\":213,\"range_sets\":[{\"units\":321,\"to\":79999,\"from\":75000},{\"units\":321,\"to\":84999,\"from\":80000},{\"units\":321,\"to\":89999,\"from\":85000},{\"units\":321,\"to\":94999,\"from\":90000},{\"units\":321,\"to\":99999,\"from\":95000},{\"units\":321,\"to\":124999,\"from\":100000},{\"units\":321,\"to\":149999,\"from\":125000},{\"units\":321,\"to\":174999,\"from\":150000},{\"units\":321,\"to\":199999,\"from\":175000},{\"units\":321,\"to\":249999,\"from\":200000}]}],\"crtd_on\":1685555765920,\"mod_on\":1685555765920,\"last_complete_date\":null}],\"qualifications\":[{\"condition_codes\":[\"112\",\"111\"],\"qualification_code\":211},{\"range_sets\":[{\"units\":311,\"to\":85,\"from\":40}],\"qualification_code\":212},{\"range_sets\":[{\"units\":321,\"to\":79999,\"from\":75000},{\"units\":321,\"to\":84999,\"from\":80000},{\"units\":321,\"to\":89999,\"from\":85000},{\"units\":321,\"to\":94999,\"from\":90000},{\"units\":321,\"to\":99999,\"from\":95000},{\"units\":321,\"to\":124999,\"from\":100000},{\"units\":321,\"to\":149999,\"from\":125000},{\"units\":321,\"to\":174999,\"from\":150000},{\"units\":321,\"to\":199999,\"from\":175000},{\"units\":321,\"to\":249999,\"from\":200000}],\"qualification_code\":213}],\"survey_provider_id\":\"3\"}"
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
                            case 3:
                            case '3':
                                const psObj = new Purespectrum(db, surveyData);
                                var result = await psObj.surveySync();
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
}*/