const Cint = require('../../helpers/Cint');
const { Member, Country, SurveyProvider } = require('../../models');
class CintController {
  surveys = async (userId, params, req) => {
    if (!userId) {
      return {
        staus: false,
        message: 'Unauthorized!',
      };
    } else {
      try {
        // const ssi = 'ssi' in params ? params.ssi : '';
        const perPage = 'perpage' in params ? parseInt(params.perpage) : 100;
        // const where = 'where' in params ? JSON.parse(params.where) : '';
        const member = await Member.findOne({
          attributes: [
            'id',
            'username',
            'gender',
            'email',
            'zip_code',
            'dob',
            'country_id',
          ],
          where: {
            id: userId,
          },
          include: {
            model: Country,
            attributes: ['cint_country_code'],
          },
        });
        if (member) {
          let gender = member.gender === 'male' ? 'm' : 'f';
          let country =
            member.Country !== null && member.Country.cint_country_code
              ? member.Country.cint_country_code
              : null;
          const params = {
            basic: 1,
            limit: perPage,
            user_id: member.id,
            email: member.email,
            zip_code: member.zip_code.replace(/\s/g, ''),
            date_of_birth: member.dob,
            ip_address: req.ip,
            ssi: member.username,
            country,
            gender,
          };

          const provider = await SurveyProvider.findOne({
            attributes: ['currency_percent'],
            where: {
              name: 'Cint',
              status: 1,
            },
          });

          const queryString = new URLSearchParams(params).toString();
          const cintObj = new Cint();
          const partUrl = 'https://www.your-surveys.com/suppliers_api/surveys';
          const result = await cintObj.fetchAndReturnData(
            `${partUrl}?${queryString}`
          );
          const surveys = result.surveys;
          var survey_list = [];
          if (surveys.length) {
            for (let survey of surveys) {
              const entryLink = survey.entry_link;
              const rebuildEntryLink = entryLink.replace(
                'SUBID',
                member.username
              );
              let cpiValue = (+survey.cpi * +provider.currency_percent)/100;
              let temp_survey = {
                survey_number: '',
                name: survey.name,
                cpi: cpiValue.toFixed(2),
                // cpi: parseFloat(survey.conversion_rate).toFixed(2),
                loi: survey.loi,
                link: rebuildEntryLink,
              };
              survey_list.push(temp_survey);
            }
            return {
              status: true,
              message: 'Success',
              result: {
                surveys: survey_list,
                page_count: 1,
              },
            };
          } else {
            return {
              status: false,
              message: 'Sorry! you are not eligible.',
            };
          }
        } else {
          return {
            status: false,
            message: 'Member not found!',
          };
        }
      } catch (error) {
        const logger = require('../../helpers/Logger')(
          `cint-survey-errror.log`
        );
        logger.error(error);
        return {
          status: false,
          message: error.response
            ? error.response.data.messages
            : 'No Survey Found!',
        };
      }
    }
  };
}

module.exports = CintController;
