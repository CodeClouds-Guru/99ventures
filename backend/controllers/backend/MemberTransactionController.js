const Controller = require('./Controller');
const { Op } = require('sequelize');
const { Member, MemberBalance } = require('../../models/index');
const moment = require('moment');
const eventBus = require('../../eventBus');
class MemberTransactionController extends Controller {
  constructor() {
    super('MemberTransaction');
  }
  // override list function
  async list(req, res) {
    var options = super.getQueryOptions(req);
    let company_portal_id = req.headers.site_id;
    var fields = Object.assign({}, this.model.fields);
    var query_where = req.query.where ? JSON.parse(req.query.where) : null;
    var option_where = options.where || {};
    var new_option = {};
    var and_query = {
      completed_at: {
        [Op.between]: query_where.completed_at ?? [
          moment().subtract(30, 'days').toISOString(),
          moment().toISOString(),
        ],
      },
    };

    if (Object.keys(query_where).length > 0) {
      new_option[Op.and] = {
        ...option_where,
        ...and_query,
      };
    }
    options.where = new_option;
    options.include = {
      model: Member,
      required: false,
      attributes: ['id', 'first_name', 'last_name', 'email', 'avatar'],
    };
    const { docs, pages, total } = await this.model.paginate(options);

    let transaction_list = [];
    docs.forEach(function (record, key) {
      if (
        record.dataValues.Member != null &&
        record.dataValues.Member.dataValues.avatar != ''
      ) {
        record.dataValues.Member.dataValues.avatar =
          process.env.S3_BUCKET_OBJECT_URL +
          record.dataValues.Member.dataValues.avatar;
      }
      if(record.dataValues.transaction_id === null){
        record.dataValues.transaction_id = 'N/A'
      }
      switch (record.dataValues.status) {
        case 1:
          record.dataValues.status = 'processing';
          break;
        case 2:
          record.dataValues.status = 'completed';
          break;
        case 3:
          record.dataValues.status = 'failed';
          break;
        case 4:
          record.dataValues.status = 'declined';
          break;
        case 5:
          record.dataValues.status = 'reverted';
          break;
        default:
          record.dataValues.status = 'initiated';
          break;
      }
      transaction_list.push(record.dataValues);
    });

    fields.transaction_id.listing = !(
      query_where &&
      'type' in query_where &&
      query_where.type === 'withdraw'
    );
    fields.note.listing = !(
      query_where &&
      'type' in query_where &&
      query_where.type === 'withdraw'
    );
    return {
      result: {
        data: transaction_list,
        pages: pages,
        total: total,
      },
      fields,
    };
  }

  // override update function
  async update(req, res) {
    let transaction_id = req.params.id || null;
    let member_id = req.body.member_id || null;
    let type = req.body.type || null;
    if (transaction_id) {
      if (type === 'revert') {
        try {
          let transaction = await this.model.findByPk(transaction_id);

          let member = await Member.findOne({
            where: { id: member_id },
            include: {
              model: MemberBalance,
              as: 'member_amounts',
              where: { amount_type: 'cash' },
            },
          });
          // console.log(member.member_amounts[0].amount);
          //current transaction
          await this.reverseTransactionUpdate({
            member_balance_amount: member.member_amounts[0].amount,
            transaction_amount: transaction.amount,
            member_id: member_id,
            transaction_id: transaction_id,
          });

          //Email for member
          let member_mail = await this.sendMailEvent({
            action: 'Transaction Reversed',
            data: {
              email: member.email,
              details: {
                members: member,
                transaction,
              },
            },
            req: req,
          });

          //referral transaction
          // if (transaction.parent_transaction_id) {
          let referral_transactions = await this.model.findOne({
            where: {
              parent_transaction_id: transaction_id,
              amount_action: 'referral',
            },
          });
          if (referral_transactions) {
            let referral_member = await Member.findOne({
              where: { id: referral_transactions.member_id },
              include: {
                model: MemberBalance,
                as: 'member_amounts',
                where: { amount_type: 'cash' },
              },
            });

            await this.reverseTransactionUpdate({
              member_balance_amount: referral_member.member_amounts[0].amount,
              transaction_amount: referral_transactions.amount,
              member_id: referral_transactions.member_id,
              transaction_id: referral_transactions.id,
            });

            //Email for referral member
            let referral_member_mail = await this.sendMailEvent({
              action: 'Transaction Reversed',
              data: {
                email: referral_member.email,
                details: {
                  members: referral_member,
                  transaction: referral_transactions,
                },
              },
              req: req,
            });
          }

          return {
            status: true,
            message: 'Record Updated',
          };
          // }
        } catch (e) {
          console.log(e);
          this.throwCustomError(e, 404);
        }
      }
    }
  }

  async reverseTransactionUpdate(data) {
    let updated_balance =
      parseFloat(data.member_balance_amount) -
      parseFloat(data.transaction_amount);

    await this.model.update(
      { status: 5 },
      {
        where: {
          id: data.transaction_id, //1
        },
      }
    );

    await this.model.insertTransaction({
      type: 'withdraw',
      amount: parseFloat(data.transaction_amount),
      note: 'Reverse transaction',
      member_id: data.member_id,
      amount_action: 'reversed_transaction',
      status: 5,
      modified_total_earnings: updated_balance,
      parent_transaction_id: data.transaction_id,
    });

    await this.model.updateMemberBalance({
      amount: updated_balance,
      member_id: data.member_id,
      action: 'reversed_transaction',
      transaction_amount: parseFloat(data.transaction_amount),
    });
    return true;
  }

  //send mail event call
  async sendMailEvent(mail_data) {
    return eventBus.emit('send_email', mail_data);
  }
}
module.exports = MemberTransactionController;
