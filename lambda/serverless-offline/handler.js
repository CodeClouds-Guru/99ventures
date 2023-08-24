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
}


/*
module.exports.surveySync = async (context) => {
    const event = {
        "Records": [
           {
                "body": "{\n   \"message_reason\":\"updated\",\n   \"survey_id\":39995387,\n   \"survey_name\":\"Other Survey\",\n   \"account_name\":\"Intellisurvey\",\n   \"country_language\":\"eng_gb\",\n   \"industry\":\"other\",\n   \"study_type\":\"adhoc\",\n   \"bid_length_of_interview\":15,\n   \"bid_incidence\":30,\n   \"collects_pii\":false,\n   \"survey_group_ids\":[\n      \n   ],\n   \"is_live\":true,\n   \"survey_quota_calc_type\":\"completes\",\n   \"is_only_supplier_in_group\":false,\n   \"cpi\":1.25,\n   \"total_client_entrants\":325,\n   \"total_remaining\":14,\n   \"completion_percentage\":0.674419,\n   \"conversion\":0.089506,\n   \"overall_completes\":29,\n   \"mobile_conversion\":0.07,\n   \"earnings_per_click\":0.111883,\n   \"length_of_interview\":10,\n   \"termination_length_of_interview\":1,\n   \"respondent_pids\":[\n      \n   ],\n   \"survey_quotas\":[\n      {\n         \"survey_quota_id\":200754518,\n         \"survey_quota_type\":\"Total\",\n         \"quota_cpi\":1.25,\n         \"conversion\":0.089506,\n         \"number_of_respondents\":14,\n         \"questions\":[\n            \n         ]\n      }\n   ],\n   \"survey_qualifications\":[\n      {\n         \"question_id\":42,\n         \"logical_operator\":\"OR\",\n         \"precodes\":[\n            \"18\",\n            \"19\",\n            \"20\",\n            \"21\",\n            \"22\",\n            \"23\",\n            \"24\",\n            \"25\",\n            \"26\",\n            \"27\",\n            \"28\",\n            \"29\",\n            \"30\",\n            \"31\",\n            \"32\",\n            \"33\",\n            \"34\",\n            \"35\",\n            \"36\",\n            \"37\",\n            \"38\",\n            \"39\",\n            \"40\",\n            \"41\",\n            \"42\",\n            \"43\",\n            \"44\",\n            \"45\",\n            \"46\",\n            \"47\",\n            \"48\",\n            \"49\",\n            \"50\",\n            \"51\",\n            \"52\",\n            \"53\",\n            \"54\",\n            \"55\",\n            \"56\",\n            \"57\",\n            \"58\",\n            \"59\",\n            \"60\",\n            \"61\",\n            \"62\",\n            \"63\",\n            \"64\",\n            \"65\",\n            \"66\",\n            \"67\",\n            \"68\",\n            \"69\",\n            \"70\",\n            \"71\",\n            \"72\",\n            \"73\",\n            \"74\",\n            \"75\",\n            \"76\",\n            \"77\",\n            \"78\",\n            \"79\",\n            \"80\",\n            \"81\",\n            \"82\",\n            \"83\",\n            \"84\",\n            \"85\",\n            \"86\",\n            \"87\",\n            \"88\",\n            \"89\",\n            \"90\",\n            \"91\",\n            \"92\",\n            \"93\",\n            \"94\",\n            \"95\",\n            \"96\",\n            \"97\",\n            \"98\",\n            \"99\"\n         ]\n      },\n      {\n         \"question_id\":754,\n         \"logical_operator\":\"OR\",\n         \"precodes\":[\n            \"1\",\n            \"2\",\n            \"3\",\n            \"4\",\n            \"5\",\n            \"6\",\n            \"7\",\n            \"8\"\n         ]\n      }\n   ],\n   \"survey_provider_id\":1,\n   \"country_id\":225\n}"
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
}
*/

/*
//For testing purpose
module.exports.surveySync = async (context) => {	
    const event = {
        "Records": [
            {
                "body": "{\n      \"survey_id\": 18512079,\n      \"survey_name\": \"Exciting New Survey #18512079\",\n      \"surveyLocalization\": \"en_GB\",\n      \"survey_status\": 22,\n      \"field_end_date\": 1693474910109,\n      \"category\": \"Exciting New\",\n      \"category_code\": 232,\n      \"crtd_on\": 1692697310494,\n      \"mod_on\": 1692697555195,\n      \"soft_launch\": false,\n      \"click_balancing\": 0,\n      \"price_type\": 1,\n      \"pii\": false,\n      \"buyer_message\": \"\",\n      \"buyer_id\": 651,\n      \"incl_excl\": 0,\n      \"cpi\": 1.05,\n      \"last_complete_date\": null,\n      \"project_last_complete_date\": null,\n      \"survey_grouping\": {\n        \"survey_ids\": [\n          18512079\n        ],\n        \"exclusion_period\": 30\n      },\n      \"survey_performance\": {\n        \"overall\": {\n          \"ir\": 50,\n          \"loi\": 15\n        },\n        \"last_block\": {\n          \"ir\": null,\n          \"loi\": null,\n          \"oqp\": null,\n          \"bdp\": null,\n          \"bqtp\": null,\n          \"bstp\": null,\n          \"btp\": null\n        }\n      },\n      \"supplier_completes\": {\n        \"needed\": 5,\n        \"achieved\": 0,\n        \"remaining\": 5,\n        \"guaranteed_allocation\": 0,\n        \"guaranteed_allocation_remaining\": 0\n      },\n      \"pds\": {\n        \"enabled\": false,\n        \"buyer_name\": null\n      },\n      \"channel_type\": null,\n      \"link_security\": 2,\n      \"channel_parent\": null,\n      \"quotas\": [\n        {\n          \"quota_id\": \"20aed378-e0a0-4190-8688-1d92d4ca0cca\",\n          \"quantities\": {\n            \"currently_open\": 5,\n            \"remaining\": 5,\n            \"achieved\": 0\n          },\n          \"criteria\": [\n            {\n              \"qualification_code\": 212,\n              \"range_sets\": [\n                {\n                  \"units\": 311,\n                  \"to\": 99,\n                  \"from\": 25\n                }\n              ]\n            },\n            {\n              \"qualification_code\": 237,\n              \"condition_codes\": [\n                \"115\"\n              ]\n            }\n          ],\n          \"crtd_on\": 1692697310538,\n          \"mod_on\": 1692697310538,\n          \"last_complete_date\": null\n        }\n      ],\n      \"qualifications\": [\n        {\n          \"range_sets\": [\n            {\n              \"units\": 311,\n              \"to\": 99,\n              \"from\": 25\n            }\n          ],\n          \"qualification_code\": 212\n        },\n        {\n          \"condition_codes\": [\n            \"115\"\n          ],\n          \"qualification_code\": 237\n        }\n      ],\n      \"survey_provider_id\": 3,\n      \"country_id\": 225,\n      \"db_qualication_codes\": [\n        {\n          \"qualification_id\": 212,\n          \"answer_ids\": [\n            5556616,\n            5556617,\n            5556618,\n            5556619,\n            5556620,\n            5556621,\n            5556622,\n            5556623,\n            5556624,\n            5556625,\n            5556626,\n            5556627,\n            5556628,\n            5556629,\n            5556630,\n            5556631,\n            5556632,\n            5556633,\n            5556634,\n            5556635,\n            5556636,\n            5556637,\n            5556638,\n            5556639,\n            5556640,\n            5556641,\n            5556642,\n            5556643,\n            5556644,\n            5556645,\n            5556646,\n            5556647,\n            5556648,\n            5556649,\n            5556650,\n            5556651,\n            5556652,\n            5556653,\n            5556654,\n            5556655,\n            5556656,\n            5556657,\n            5556658,\n            5556659,\n            5556660,\n            5556661,\n            5556662,\n            5556663,\n            5556664,\n            5556665,\n            5556666,\n            5556667,\n            5556668,\n            5556669,\n            5556670,\n            5556671,\n            5556672,\n            5556673,\n            5556674,\n            5556675,\n            5556676,\n            5556677,\n            5556678,\n            5556679,\n            5556680,\n            5556681,\n            5556682,\n            5556683,\n            5556684,\n            5556685,\n            5556686,\n            5556687,\n            5556688,\n            5556689,\n            5556690\n          ]\n        }\n      ]\n    }"
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