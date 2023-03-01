const express = require('express');
const router = express.Router();
const PageParser = require('../helpers/PageParser');
const Lucid = require('../helpers/Lucid');
const Cint = require('../helpers/Cint');
const PurespectrumHelper = require('../helpers/Purespectrum');
const { 
  Survey, 
  SurveyProvider,
  SurveyQuestion, 
  SurveyQualification, 
  SurveyAnswerPrecodes, 
  MemberEligibilities 
} = require('../models');


const MemberAuthControllerClass = require("../controllers/frontend/MemberAuthController");
const MemberAuthController = new MemberAuthControllerClass();
const PureSpectrumControllerClass = require("../controllers/callback/PureSpectrumController");
const PureSpectrumController = new PureSpectrumControllerClass();
const SurveyControllerClass = require("../controllers/frontend/SurveyController");
const SurveyController = new SurveyControllerClass();

router.get('/purespectrum-survey', PureSpectrumController.survey);
router.get('/purespectrum-question', PureSpectrumController.saveSurveyQuestions);


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
        tbodyData += `
          <div style="display:flex; flex-direction: column;width: 45%;padding: 15px;border: 1px solid #fff;background-color: #fff;border-radius: 10px;
          margin: 0 8px 8px 0;">
            <a style="" href="${rebuildEntryLink}" target="_blank">
              <h3 style="margin: 8px 0;">${survey.name}</h3>
            </a>
            <div>
              <p style="margin: 8px 0;">Conversion Rate <b>${survey.conversion_rate}</b>%</p>
              <p style="margin: 8px 0;">Avg Time <b>5 minutes</b></p>
              <p style="margin: 8px 0;">Remaining Completes: <b>${survey.remaining_completes}</b></p>
            </div>
          </div>
        
        `
      }
    } else {
      tbodyData += `<p>No records found!</p>`
    }
    const htmlData = `<div style="width: 100%; display:flex; flex-wrap: wrap" class="survey-container">${tbodyData}</div>`
    res.send(htmlData)
  }
  catch (error) {
    console.error(error);
    throw error;
  }
});

router.get('/pure-spectrum/surveys', async(req, res) => {
  const memberId = req.query.user_id;
  const provider = await SurveyProvider.findOne({
    attributes: ['id'],
    where: {
      name: 'Purespectrum'
    }
  });
  if(!provider) {
    res.send('Survey Provider not found!');
    return;
  }
  const eligibilities = await MemberEligibilities.findAll({
    attributes: ['survey_question_id', 'precode_id', 'text'],
    where: {
      member_id: memberId
    },
    include: {
      model: SurveyQuestion,
      attributes: ['name', 'question_text', 'survey_provider_question_id', 'question_type'],
      where: {
        survey_provider_id: provider.id
      }
    }
  });
  if(eligibilities){
    const matchingQuestionCodes = eligibilities.map(eg => eg.SurveyQuestion.name);
    const matchingAnswerCodes = eligibilities
                                  .filter(eg => eg.SurveyQuestion.survey_provider_question_id !== 229) // Removed 229 (ZIP Code), beacuse this is open text question. We will not get the value from survey_answer_precodes
                                  .map(eg => eg.precode_id);

    if(matchingAnswerCodes.length && matchingQuestionCodes.length){
      const queryString = {};
      eligibilities.map(eg => {
        queryString[eg.SurveyQuestion.survey_provider_question_id] = eg.precode_id
      });
      const generateQueryString = new URLSearchParams(queryString).toString();

      const surveys = await Survey.findAll({
        attributes: ['id', 'survey_provider_id', 'loi', 'cpi', 'name', 'survey_number'],
        where: {
          survey_provider_id: 3,
          status: "live",
        },
        include: {
          model: SurveyQualification,
          attributes: ['id', 'survey_id', 'survey_question_id'],
          required: true,
          include: {
            model: SurveyAnswerPrecodes,
            attributes: ['id', 'option', 'purespectrum_precode'],
            where: {
              // option: [genderCode, age]
              option: matchingAnswerCodes
            },
            required: true,
            include: [
              {
                model: SurveyQuestion,
                attributes: ['id', 'survey_provider_question_id'],
                where: {
                  // name: ['Age', 'Gender', 'Zipcode']
                  name: matchingQuestionCodes
                }
              }
            ],
          }
        }
      })

      var surveyHtml = '';
      for(let survey of surveys) {
        let link = `/pure-spectrum/entry-link?survey_number=${survey.survey_number}${generateQueryString ? '&'+generateQueryString : ''}`;
        surveyHtml += `
          <div class="survey-box" style="width: 45%; padding: 20px 10px; border: 1px solid #fff; background-color: #fff; margin-bottom: 1rem;margin-right: 1rem; border-radius: 10px;">
            <h3 style="margin:0;">${survey.name} - ${survey.cpi}</h3>
            <div style="text-align: right; margin-top: 3rem;"><a href="${link}" target="_blank" style="border: 1px solid #33375f;background-color: #33375f;color: #fff;padding: 7px 36px;text-decoration: none;border-radius: 3px;    box-shadow: 0 2px 12px #33375f;">${survey.cpi}</a></div>
          </div>
        `
      }
      
      res.send(`<div style="width: 100%; display:flex; flex-wrap: wrap" class="survey-container">${surveyHtml}</div>`);
    } else {
      res.send('No surveys have been matched!');
    }
  } else {
    res.send('Member eiligibility not found!');
  }

});

router.get('/pure-spectrum/entry-link', async(req, res) => {
  const queryString = req.query;
  queryString.bsec = 'a70mx8';
  const psObj = new PurespectrumHelper;
  const data = await psObj.createData(`surveys/register/${queryString.survey_number}`);
  delete queryString['survey_number'];
  const generateQueryString = new URLSearchParams(queryString).toString();

  if(data.apiStatus === 'success' && data.survey_entry_url) {
    const entryLink = data.survey_entry_url +'&'+ generateQueryString;
    res.redirect(entryLink)
  } else {
    res.send(data)
  }
  
})

//socket call
router.get('/socket-connect', async (req, res) => {
  global.socket.emit("shoutbox", { name: 'Nandita', place: 'USA', message: 'Socket connected' });
  res.send("hello")
})
  
//ROUTES FOR FRONTEND
const checkIPMiddleware = require("../middlewares/checkIPMiddleware");
const checkMemberAuth = require("../middlewares/checkMemberAuth");
router.post("/login", MemberAuthController.login);
router.post("/signup", MemberAuthController.signup);
router.get("/email-verify", MemberAuthController.emailVerify);
router.get("/survey", SurveyController.getSurvey);

router.get('/404', async (req, res) => {
  var pagePerser = new PageParser('404');
  var page_content = await pagePerser.preview(req);
  res.render('page', { page_content });
});
router.get('/500', async (req, res) => {
  var pagePerser = new PageParser('500');
  var page_content = await pagePerser.preview(req);
  res.render('page', { page_content });
});

router.get('/:slug?', [checkMemberAuth], async (req, res) => {//checkIPMiddleware
  var pagePerser = new PageParser(req.params.slug || '/');
  try {
    var page_content = await pagePerser.preview(req);
  } catch (e) {
    switch (e.statusCode) {
      case 404:
        res.redirect('/404');
        return;
      case 401:
        res.redirect('/');
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
