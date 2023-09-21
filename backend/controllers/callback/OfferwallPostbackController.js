const {
  MemberTransaction,
  Member,
  OfferWall,
  CompanyPortal,
} = require('../../models');
const eventBus = require('../../eventBus');

class OfferwallPostbackController {
  constructor() {}
  async save(req, res) {
    // console.log(req.query);
    const logger1 = require('../../helpers/Logger')(
      `outcome-${req.params.offerwall}.log`
    );
    logger1.info(req.method);
    logger1.info(JSON.stringify(req.query));
    logger1.info(JSON.stringify(req.body));

    var status_arr = ['1', 'approved'];
    if (status_arr.includes(req.query.status)) {
      try {
        const offerwall_name = req.params.offerwall;
        let offerwall_details = await OfferWall.findOne({
          attributes: [
            'campaign_id_variable',
            'campaign_name_variable',
            'sub_id_variable',
            'postback_url',
            'currency_percent',
          ],
          where: { name: offerwall_name },
        });
        // console.log(offerwall_details);
        var currency_percent = offerwall_details.currency_percent || '100';
        currency_percent = parseFloat(currency_percent);
        // console.log(currency_percent);
        if (
          offerwall_details &&
          (offerwall_details.campaign_id_variable in req.query ||
            offerwall_details.campaign_id_variable in req.body)
        ) {
          let username = req.query[offerwall_details.campaign_id_variable]
            ? req.query[offerwall_details.campaign_id_variable]
            : req.body[offerwall_details.campaign_id_variable];

          let member = await Member.findOne({
            // attributes: ['id', 'username', 'company_id', 'company_portal_id'],
            where: {
              username: username,
            },
            include: {
              model: CompanyPortal,
              where: {
                domain: offerwall_details.postback_url,
              },
              required: true,
              attributes: ['id'],
            },
          });

          // console.log(member);
          if (member) {
            let payout_amount = 0;
            let note = '';
            if (
              offerwall_details.campaign_name_variable in req.query ||
              offerwall_details.campaign_name_variable in req.body
            ) {
              payout_amount = req.query[
                offerwall_details.campaign_name_variable
              ]
                ? parseFloat(
                    req.query[offerwall_details.campaign_name_variable]
                  )
                : parseFloat(
                    req.body[offerwall_details.campaign_name_variable]
                  );
            }

            if (
              offerwall_details.sub_id_variable in req.query ||
              offerwall_details.sub_id_variable in req.body
            ) {
              note = req.query[offerwall_details.sub_id_variable]
                ? req.query[offerwall_details.sub_id_variable]
                : req.body[offerwall_details.sub_id_variable];
            }
            payout_amount = (payout_amount * currency_percent) / 100;
            // console.log('payout_amount', payout_amount);
            payout_amount = payout_amount.toFixed(2);
            if(payout_amount <= 0){
              return res.send('1');
            }
            const transaction_obj = {
              member_id: member.id,
              amount: payout_amount,
              note: offerwall_name,
              type: 'credited',
              amount_action: 'offerwall',
              created_by: null,
              payload:
                req.body !== null && Object.keys(req.body).length
                  ? JSON.stringify(req.body)
                  : JSON.stringify(req.query),
              status: 2,
            };

            let result =
              await MemberTransaction.updateMemberTransactionAndBalance(
                transaction_obj
              );

            // return res.send(
            //   Object.keys(req.body).length
            //     ? JSON.stringify(req.body)
            //     : JSON.stringify(req.query)
            // );

            //event for shoutbox
            // console.log('eventBus', eventBus);
            eventBus.emit('happening_now', {
              action: 'survey-and-offer-completions',
              company_portal_id: member.company_portal_id,
              company_id: member.company_id,
              data: {
                members: member,
                amount: '$' + payout_amount,
                surveys: { name: offerwall_name },
              },
            });

            //event for email
            // eventBus.emit('send_email', {
            //   action: 'Survey Completed',
            //   data: {
            //     email: member.email,
            //     details: {
            //       members: {
            //         first_name: member.first_name,
            //       },
            //       survey: {
            //         amount: amount,
            //         survey_number: surveyNumber,
            //         provider: providerName,
            //       },
            //     },
            //   },
            //   req: {
            //     ...req,
            //     headers: {
            //       ...req.headers,
            //       company_id: member.company_id,
            //       site_id: member.company_portal_id,
            //     },
            //     user: member,
            //   },
            // });

            return res.send('1');
          }
        }
      } catch (err) {
        // console.log(err);
        const offerwallLog = require('../../helpers/Logger')(
          `offerwall-error.log`
        );
        offerwallLog.error('[' + req.params.offerwall + '] - ' + err);
        // res.status(500).json({
        //   status: false,
        //   errors: 'Unable to save data',
        // });
        return res.send('0');
      }
    } else {
      // res.send({
      //   status: true,
      //   message: 'Completed',
      // });
      return res.send('0');
    }
  }
}

module.exports = OfferwallPostbackController;
