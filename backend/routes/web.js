const express = require('express');
const router = express.Router();
const PageParser = require('../helpers/PageParser');
const Lucid = require('../helpers/Lucid');
const Cint = require('../helpers/Cint');
const PurespectrumHelper = require('../helpers/Purespectrum');
const { Survey, SurveyQuestion, SurveyQualification, SurveyAnswerPrecodes } = require('../models');


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

router.get('/pure-spectrum/surveys', async(req, res) => {
  // const memberAge = req.query.age;
  // const memberGender = req.query.gender;
  // const memberZip = req.query.zip;
  // const genderCode = (memberGender === 'male') ? 111 : 112;

  // const questions = await SurveyQuestion.findAll({
  //   attributes: ['id', 'survey_provider_question_id'],
  //   where: {
  //     name: ['Age', 'Gender', 'Zipcode']
  //   },
  //   include: {
  //     model: SurveyAnswerPrecodes,
  //     where: {
  //       option: [genderCode, memberAge]
  //     }
  //   }
  // });


  // const questions = await SurveyAnswerPrecodes.findAll({
  //   attributes: ['id', 'option', 'purespectrum_precode'],
  //   where: {
  //     option: [111, 30]
  //   },    
  //   include: [
  //     {
  //       model: SurveyQuestion,
  //       attributes: ['id', 'survey_provider_question_id'],
  //       where: {
  //         name: ['Age', 'Gender', 'Zipcode']
  //       }
  //     },
  //     {
  //       model: SurveyQualification
  //     }
  //   ]
  // });
  // res.send(questions);
  const Zipcode = 229;
  const genderCode = 111;
  const age = 30;

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
          option: [genderCode, age]
        },
        required: true,
        include: [
          {
            model: SurveyQuestion,
            attributes: ['id', 'survey_provider_question_id'],
            where: {
              name: ['Age', 'Gender', 'Zipcode']
            }
          }
        ],
      }
    }
  })

  var surveyHtml = '';
  for(let survey of surveys) {
    surveyHtml += `
      <div class="survey-box" style="width: 45%; padding: 10px; border: 1px solid #fff; background-color: #fff; margin-bottom: 1rem;margin-right: 1rem;">
        <h5>${survey.name} - ${survey.cpi}</h5>
        <a href="/pure-spectrum/entry-link?survey_number=${survey.survey_number}" target="_blank" style="border: 1px solid #33375f;background-color: #33375f;color: #fff;padding: 7px 36px;text-decoration: none;border-radius: 3px;">${survey.cpi}</a>
      </div>
    `
  }
  

  res.send(`<div style="width: 100%; display:flex; flex-wrap: wrap" class="survey-container">${surveyHtml}</div>`)


});

router.get('/pure-spectrum/entry-link', async(req, res) => {
  const psObj = new PurespectrumHelper;
  const data = await psObj.createData(`surveys/register/${req.query.survey_number}`);

  res.send(data)
  
})


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