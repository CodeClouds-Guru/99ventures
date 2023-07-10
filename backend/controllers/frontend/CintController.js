const Cint = require('../../helpers/Cint');
const { Member } = require('../../models');
class CintController {

    surveys = async(userId,params) => {        
        if (!userId) {
            return{
                staus: false,
                message: 'Unauthorized!'
            }
        } 
        else {
            try {
                // const userId = req.query.user_id;
                const pageNo = 'pageno' in params ? parseInt(params.pageno) : 1;
                const perPage = 'perpage' in params ? parseInt(params.perpage) : 12;
                const orderBy = 'orderby' in params ? params.orderby : 'id';
                const order = 'order' in params ? params.order : 'desc';
                const ssi = 'ssi' in params ? params.ssi : '';
                if(!userId) {
                    return {
                        staus: false,
                        message: 'Userid not found!'
                    }                }
                const member = await Member.findOne({
                    attributes: ['username', 'gender', 'email', 'zip_code', 'dob'],
                    where: {
                        id: userId
                    }
                });
                if(member){
                    // const queryString = new URLSearchParams(req.query).toString();
                    const queryString = `user_id=${member.id}&gender=${member.gender}&email=${member.email}&zip_code=${member.zip_code}&date_of_birth=${member.dob}&ip_address=${sc_request.ip}&ssi=${member.username}`
                    const cintObj = new Cint();
                    const partUrl = 'https://www.your-surveys.com/suppliers_api/surveys/user';
                    const result = await cintObj.fetchAndReturnData(`${partUrl}?${queryString}`);
                
                    const surveys = result.surveys;   
                    var survey_list = []             
                    if (surveys.length) {
                        var surveyHtml = '';
                        for (let survey of surveys) {
                            const entryLink = survey.entry_link;
                            const rebuildEntryLink = entryLink.replace('SUBID', ssi);
                            let temp_survey = {
                                survey_number: '',
                                name: survey.name,
                                cpi: parseFloat(survey.conversion_rate).toFixed(2),
                                loi: '',
                                link:rebuildEntryLink
                            }
                            survey_list.push(temp_survey)
                            // tbodyData += `
                            //     <div class="col-6 col-sm-4 col-md-3 col-xl-2">
                            //         <div class="bg-white card mb-2">
                            //             <div class="card-body position-relative">
                            //                 <div class="d-flex justify-content-between">
                            //                     <h6 class="text-primary m-0">${survey.name}</h6>
                            //                 </div>
                            //                 <div class="text-primary small">5 Minutes</div>
                            //                 <div class="d-grid mt-1">
                            //                     <a href="${rebuildEntryLink}" class="btn btn-primary text-white rounded-1">Earn $${survey.conversion_rate}</a>
                            //                 </div>
                            //             </div>
                            //         </div>
                            //     </div>                        
                            // `;
                        }
                        return {
                            status: true,
                            message: 'Success',
                            result: {
                                surveys:survey_list,
                                page_count:1
                            }
                        }
                    } else {
                        return{
                            staus: false,
                            message: 'Sorry! no surveys have been matched now! Please try again later.'
                        }
                    }
                } else {
                    return{
                        staus: false,
                        message: 'Member not found!'
                    }
                }
            }
            catch (error) {
                const logger = require('../../helpers/Logger')(`cint-survey-errror.log`);
                logger.error(error);
                return{
                    staus: false,
                    message: error.response ? error.response.data.messages : 'No Survey Found!'
                }
            }
        }
    }
}

module.exports = CintController;