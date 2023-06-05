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