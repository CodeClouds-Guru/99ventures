const PageParser = require('../../helpers/PageParser');
const ScriptParser = require('../../helpers/ScriptParser');
const { Member } = require('../../models');
const Handlebars = require('handlebars');
const util = require('util');

class StaticPageController {
  constructor() {}

  /**
   * Show Survey Status
   */
  async showStatus(req, res) {
    //Redirecting user to the static page.
    //Page have to be created from admin
    res.redirect('/survey-' + req.params.status);

    /*let content = '';
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
      case 'tentative':
        content += `<p>You did not complete your survey.</p>`;
        break;
      case 'security':
        content += `<p>The advertiser’s security system has detected some unusual activity and you have been blocked from attempting to complete this survey.</p>
              <p>Please ensure that all surveys are being completed correctly, and in line with the requirements of the advertiser to prevent similar issues in future.</p>
              <p>Please be aware that failure to complete surveys correctly could result in your account being blocked.</p>`;
        break;
      case 'no-survey':
        content += `<p>Sorry! no surveys are available now.</p>`;
        break;
      case 'account-blocked':
        content += `<p>Please be aware that failure to complete surveys correctly could result in your account being blocked.</p>`;
        break;
      default:
        content = '';
    }

    var pagePerser = new PageParser('survey', content);
    var page_content = await pagePerser.preview(req);
    res.render('page', { page_content });*/
  }

  /**
   * Get Script data
   * @param {*} req
   * @param {*} res
   */
  async getScripts(req, res) {
    var resp = {
      status: false,
      error: '',
      html: '',
    };
    try {
      const params = req.query;
      if (req.query.member) {
        var user = await Member.findOne({ where: { id: req.query.member } });
        // console.log('===========', user);
      }
      const scriptParser = new ScriptParser();
      const parsed = await scriptParser.parseScript(
        req.query.script,
        user,
        params
      );
      //   console.log(util.inspect(parsed, false, null, true));
      const template = Handlebars.compile(parsed.script_html);
      var html = template({
        data: parsed.data,
        page_count: parsed.page_count,
        other_details: parsed.other_details,
      });
      // console.log('======', html);
      resp = {
        ...resp,
        status: true,
        html,
      };
    } catch (e) {
      console.error(e);
      resp.error = e.message;
    } finally {
      res.json(resp);
    }
  }
}

module.exports = StaticPageController;
