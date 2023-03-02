
const PageParser = require('../../helpers/PageParser');

class StaticPageController {
    constructor() {}

    /**
     * Show Survey Status
     */
    async showStatus(req, res) {
        let content = '';
        switch (req.params.status) {
            case 'termination':
                content += '<h1>Survey Termination</h1>';
                content += `<p>Unfortunately, you do not meet the requirements to qualify for this survey and your participation cannot be accepted.</p>`;
                break;
            case 'terms':
                content += '<h1>Survey Terms & Conditions</h1>';
                content += `<p>The advertiser’s security system has detected some unusual activity and you have been blocked from attempting to complete this survey.</p>
                <p>Please ensure that all surveys are being completed correctly, and in line with the requirements of the advertiser to prevent similar issues in future.</p>
                <p>Please be aware that failure to complete surveys correctly could result in your account being blocked.</p>`;
                break;
            case 'over-quota':
                content += '<h1>Survey Terms & Conditions</h1>';
                content += `<p>Unfortunately, that survey quota is already full and the company are unable to accept your submission.</p>`;
                break;
            case 'complete':
                content += `<h1>Congratulations on completing another survey with MoreSurveys.com.</h1>
                <p>You will receive your credit directly to your account balance shortly.</p>
                <p id="ipel">In the meantime, check out more survey options below to continue earning.</p>`;
                break;
            case 'security':
                content += `<p>The advertiser’s security system has detected some unusual activity and you have been blocked from attempting to complete this survey.</p>
              <p>Please ensure that all surveys are being completed correctly, and in line with the requirements of the advertiser to prevent similar issues in future.</p>
              <p>Please be aware that failure to complete surveys correctly could result in your account being blocked.</p>`
                break;
            case 'no-survey':
                content += `<p>Sorry! no surveys are available now.</p>`
                break;
            case 'account-blocked':
                content += `<p>Please be aware that failure to complete surveys correctly could result in your account being blocked.</p>`
                break;
            default:
                content = '';
        }


        var pagePerser = new PageParser('survey', content);
        var page_content = await pagePerser.preview(req);
        res.render('page', { page_content });
    }

}

module.exports = StaticPageController;