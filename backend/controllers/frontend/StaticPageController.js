const PageParser = require('../../helpers/PageParser');
const ScriptParser = require('../../helpers/ScriptParser');
const { Member } = require('../../models');
const Handlebars = require('handlebars');
const util = require('util');
const jwt = require('jsonwebtoken');

class StaticPageController {
  constructor() { }

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
      } else {
        var user = req.session.member;
      }
      const scriptParser = new ScriptParser();
      const parsed = await scriptParser.parseScript(
        req.query.script,
        user,
        params,
        req
      );
      const template = Handlebars.compile(parsed.script_html);
      // console.log('other_details', parsed.other_details)
      var html = template({
        data: parsed.data,
        page_count: parsed.page_count,
        other_details: parsed.other_details,
        sc_request: {
          base_url: req.baseUrl,
          hostname: req.hostname,
          ip: req.ip,
          original_url: req.originalUrl,
          path: req.path,
          query: req.query,
          xhr: req.xhr,
        },
      });
      // console.log('html', req.sc_request);
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


  /**
   * Validate Admin User Token Passed for Impersonation
   * Starts Member Auth By Using Session
   * Sets Impersonation Mode
   * @param {} req 
   * @param {*} res 
   */
  async validateImpersonation(req, res) {
    try {
      var token = req.query.hashKey || null;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.APP_SECRET)
          const member_id = decoded.member_id;
          const member = await Member.findOne({ where: { id: member_id } });
          if (!member) {
            throw new Error("Member Not Found or Soft Deleted")
          }
          req.session.member = member;
          req.session.impersonation = 1;
          return res.redirect('/dashboard');
        } catch (e) {
          throw new Error("Invalid hashKey");
        }
      } else {
        throw new Error("hashKey missing in the query");
      }
    } catch (e) {
      console.error('Impersonation error', e);
      return res.render('impersonation_error', { error: e.message });
    }
  }
}

module.exports = StaticPageController;
