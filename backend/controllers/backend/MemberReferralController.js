const Controller = require('./Controller');
const { Op } = require('sequelize');
const moment = require('moment');
const {
  Member,
  IpLog,
  MemberTransaction,
  sequelize,
  db,
} = require('../../models/index');

class MemberReferralController extends Controller {
  constructor() {
    super('MemberReferral');
  }
  //override list function
  async list(req, res) {
    var options = super.getQueryOptions(req);
    options.include = {
      model: Member,
      required: false,
      paranoid: false,
      // as: "referee",
      attributes: [
        'id',
        'first_name',
        'last_name',
        'email',
        'avatar',
        'username',
        'created_at',
      ],
      // where: {
      //   referral_id: {
      //     [Op.ne]: null,
      //   },
      // },
      include: {
        model: IpLog,
        attributes: ['ip', 'geo_location', 'isp', 'created_at'],
        order: [['id', 'DESC']],
        limit: 1,
      },
    };
    // options.subQuery = false;
    const { docs, pages, total } = await this.model.paginate(options);

    let ref_list = [];
    let temp_list = [];
    let date_group = '';
    let count = 0;
    docs.forEach(async function (record, key) {
      if (
        record.dataValues.Member != null &&
        record.dataValues.Member.dataValues.avatar != ''
      ) {
        record.dataValues.Member.dataValues.avatar =
          record.dataValues.Member.dataValues.avatar;
      }
      if (record.dataValues.join_date == '') {
        record.dataValues.status = 'Pending';
      } else if (record.dataValues.activity_date != '') {
        record.dataValues.status = 'Success';
      } else {
        record.dataValues.status = 'Accepted';
      }

      if (record.dataValues.Member != null) {
        record.dataValues['Member.username'] =
          record.dataValues.Member.username;
        // record.dataValues['member_id'] = record.dataValues.Member.id;
        record.dataValues.activity_date = record.dataValues.Member.IpLogs[0]
          ? record.dataValues.Member.IpLogs[0].created_at
          : '';
        record.dataValues.ip = record.dataValues.Member.IpLogs[0]
          ? record.dataValues.Member.IpLogs[0].ip
          : '';
        record.dataValues.geo_location = record.dataValues.Member.IpLogs[0]
          ? record.dataValues.Member.IpLogs[0].geo_location
          : '';
        record.dataValues.join_date = record.dataValues.Member.created_at;

        let total_earnings_credited = await sequelize.query(
          "SELECT IFNULL(SUM(amount), 0) as total FROM `member_transactions` WHERE type='credited' AND member_id=?",
          {
            replacements: [record.dataValues.Member.id],
            type: sequelize.QueryTypes.SELECT,
          }
        );
        let total_reversed = await sequelize.query(
          "SELECT IFNULL(SUM(amount), 0) as total FROM `member_transactions` WHERE type='withdraw' AND parent_transaction_id IS NOT NULL AND member_id=?",
          {
            replacements: [record.dataValues.Member.id],
            type: sequelize.QueryTypes.SELECT,
          }
        );
        // console.log(total_reversed, total_earnings_credited);
        var total_credited_minus_reversed =
          parseFloat(total_earnings_credited[0].total) -
          parseFloat(total_reversed[0].total);

        record.dataValues.cash = total_credited_minus_reversed.toFixed(2);
      }

      //this section is for grouping by month
      // if(date_group != moment(record.dataValues.created_at).format('YYYY-MM')){
      //   if(date_group != ''){
      //     ref_list[count]['data'] = temp_list
      //     count++
      //     temp_list = []
      //   }
      //   date_group = moment(record.dataValues.created_at).format('YYYY-MM')
      //   ref_list[count] = {
      //     date_group : moment(record.dataValues.created_at).format('MMMM YYYY'),
      //     data:[]
      //   }
      // }
      // temp_list.push(record.dataValues)
      // if(key == total - 1){
      //   ref_list[count]['data'] = temp_list
      // }
    });
    return {
      result: {
        data: docs,
        pages: pages,
        total: total,
      },
      fields: this.model.fields,
    };
  }
}
module.exports = MemberReferralController;
