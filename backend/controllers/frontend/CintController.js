const Cint = require('../../helpers/Cint');
const { Member } = require('../../models');
class CintController {

    survey = async(req, res) => {        
        try {
            const userId = req.query.user_id;
            const member = await Member.findOne({
                attributes: ['username', 'gender', 'email', 'zip_code', 'dob'],
                where: {
                    id: userId
                }
            });
            if(member){
                // const queryString = new URLSearchParams(req.query).toString();
                const queryString = `user_id=${member.id}&gender=${member.gender}&email=${member.email}&zip_code=${member.zip_code}&date_of_birth=${member.dob}&ip_address=&ssi=${member.username}`
                const cintObj = new Cint();
                const partUrl = 'https://www.your-surveys.com/suppliers_api/surveys/user';
                const result = await cintObj.fetchAndReturnData(`${partUrl}?${queryString}`);
            
                const surveys = result.surveys;                
                if (surveys.length) {
                    var surveyHtml = '';
                    for (let survey of surveys) {
                        const entryLink = survey.entry_link;
                        const rebuildEntryLink = entryLink.replace('SUBID', req.query.ssi);
                        tbodyData += `
                            <div class="col-6 col-sm-4 col-md-3 col-xl-2">
                                <div class="bg-white card mb-2">
                                    <div class="card-body position-relative">
                                        <div class="d-flex justify-content-between">
                                            <h6 class="text-primary m-0">${survey.name}</h6>
                                        </div>
                                        <div class="text-primary small">5 Minutes</div>
                                        <div class="d-grid mt-1">
                                            <a href="${rebuildEntryLink}" class="btn btn-primary text-white rounded-1">Earn $${survey.conversion_rate}</a>
                                        </div>
                                    </div>
                                </div>
                            </div>                        
                        `;
                    }
                    res.send({
                        status: true,
                        message: 'Success',
                        result: surveyHtml
                    });
                } else {
                    res.json({
                        staus: false,
                        message: 'Surveys not found!'
                    });
                }
            } else {
                res.json({
                    staus: false,
                    message: 'Member not found!'
                });
            }
        }
        catch (error) {
            res.json({
                staus: false,
                message: error.response.data.messages
            });
            const logger = require('../../helpers/Logger')(`cint-survey-errror.log`);
			logger.error(error);
        }
    }
}

module.exports = CintController;