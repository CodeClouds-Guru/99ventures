const Cint = require('../../helpers/Cint');

class CintController {

    survey = async(req, res) => {
        try {
            const queryString = new URLSearchParams(req.query).toString();
            const cintObj = new Cint();
            const partUrl = 'https://www.your-surveys.com/suppliers_api/surveys/user';
            const result = await cintObj.fetchAndReturnData(`${partUrl}?${queryString}`);
          
            const surveys = result.surveys;
            var tbodyData = '';
            if (surveys.length) {
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
            } else {
                tbodyData += `<p>No records found!</p>`
            }
            res.send(tbodyData)
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
}

module.exports = CintController;