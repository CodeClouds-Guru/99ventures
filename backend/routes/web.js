const express = require('express');
const router = express.Router();
const PageParser = require('../helpers/PageParser');
const Lucid = require('../helpers/Lucid');
const Cint = require('../helpers/Cint');

const MemberAuthControllerClass = require("../controllers/frontend/MemberAuthController");
const MemberAuthController = new MemberAuthControllerClass();
const PureSpectrumControllerClass = require("../controllers/callback/PureSpectrumController");
const PureSpectrumController = new PureSpectrumControllerClass();

router.get('/purespectrum-survey', PureSpectrumController.survey);
// router.get('/purespectrum-question', PureSpectrumController.saveSurveyQuestions);


router.get('/cint/entry-link', async (req, res) => {
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
        tbodyData += `<tr>
            <td>
              <a href="${rebuildEntryLink}" target="_blank">${survey.name}</a>
              <table style="width:100%">
                  <tbody>
                    <tr>
                        <td style="">Conversion Rate <b>${survey.conversion_rate}</b>%</td>
                        <td style="">Avg Time <b>5 minutes</b></td>
                        <td style="">Remaining Completes: <b>${survey.remaining_completes}</b></td>
                    </tr>
                  </tbody>
              </table>
            </td>
        </tr>`
      }
    } else {
      tbodyData += `<tr><td>No records found!</td></tr>`
    }
    const htmlData = `<table style="width:100%">
          <tbody>
            ${tbodyData}
          </tbody>
        </table>`
    res.send(htmlData)
  }
  catch (error) {
    console.error(error);
    throw error;
  }
});

//ROUTES FOR FRONTEND
router.post("/login", MemberAuthController.login);
router.post("/signup", MemberAuthController.signup);

router.get('/:slug?', async (req, res) => {
  var pagePerser = new PageParser(req.params.slug || '/');
  console.log(req.session.flash)
  try {
    var page_content = await pagePerser.preview(req);
  } catch (e) {
    switch (e.statusCode) {
      case 404:
        res.redirect('/404');
        return;
      default:
        res.redirect('/500');
        console.error(e);
        return;
    }
    page_content = await pagePerser.preview();
  }
  res.render('page', { page_content });
});

module.exports = {
  prefix: '/',
  router,
};